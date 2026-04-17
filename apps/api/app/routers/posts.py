# Posts Router
# 作品相关 API

import re
from datetime import datetime, timezone
from uuid import uuid4, UUID

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, delete
from sqlalchemy.orm import selectinload
from typing import Optional, List

from app.core.db import get_db
from app.models.content import Post, PostAsset, Tag, PostTagRelation, PostLike, PostFavorite
from app.models.users import User, UserFollowRelation
from app.schemas.posts import PostCreate, PostUpdate, PostResponse, PostListResponse
from app.schemas.posts import PostAuthorResponse, PostAssetResponse, TagResponse
from app.schemas.common import PaginatedResponse
from app.services.post import PostService
from app.utils.auth import get_current_user_id, get_optional_user_id


def make_slug(text: str) -> str:
    """将文本转换为 URL-safe slug"""
    slug = text.lower()
    slug = re.sub(r'[^a-z0-9]+', '-', slug)
    slug = slug.strip('-')
    return slug

router = APIRouter()


@router.get("", response_model=PaginatedResponse[PostListResponse])
async def list_posts(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    cursor: Optional[str] = None,
    post_status: Optional[str] = Query(default="published", alias="status"),
    tag: Optional[str] = None,
    author_id: Optional[UUID] = None,
    sort: str = Query(default="latest", pattern="^(latest|popular|trending)$"),
    search: Optional[str] = None,
    following: bool = Query(default=False),
    db: AsyncSession = Depends(get_db),
    current_clerk_id: Optional[str] = Depends(get_optional_user_id),
):
    """
    获取作品列表

    - status: 筛选状态 (published / all)
    - tag: 筛选标签 slug
    - author_id: 筛选作者
    - sort: 排序方式 (latest / popular / trending)
    - search: 搜索关键词 (匹配 title 和 excerpt)
    - following: 是否只显示关注用户的作品
    """
    post_service = PostService(db)

    # 获取当前用户 ID
    current_user_id = None
    following_user_ids = None

    if current_clerk_id and following:
        from app.repositories.user import UserRepository
        user_repo = UserRepository(db)
        current_user = await user_repo.get_by_clerk_id(current_clerk_id)
        if current_user:
            current_user_id = current_user.id
            # 获取关注用户列表
            result = await db.execute(
                select(UserFollowRelation.followee_user_id).where(
                    UserFollowRelation.follower_user_id == current_user.id
                )
            )
            following_user_ids = [r[0] for r in result.all()]

    posts, total, next_cursor = await post_service.list_posts(
        status=post_status,
        tag=tag,
        author_id=author_id,
        sort=sort,
        limit=limit,
        cursor=cursor,
        search=search,
        following_user_ids=following_user_ids,
        current_user_id=current_user_id,
    )

    return PaginatedResponse(
        items=posts,
        total=total,
        page=page,
        limit=limit,
        has_more=next_cursor is not None,
        next_cursor=next_cursor,
    )


@router.post("", response_model=PostResponse, status_code=status.HTTP_201_CREATED)
async def create_post(
    post: PostCreate,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """
    创建作品

    - 验证 cover_asset_id 存在且属于当前用户
    - 创建 Post 记录 (status=published, published_at=now)
    - 关联资源
    - 关联标签
    - 生成 slug
    """
    user_uuid = UUID(user_id)

    # 验证封面资源
    cover_asset = None
    if post.cover_asset_id:
        result = await db.execute(
            select(PostAsset).where(
                PostAsset.id == post.cover_asset_id,
                PostAsset.uploader_user_id == user_uuid,
            )
        )
        cover_asset = result.scalar_one_or_none()
        if not cover_asset:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cover asset not found or not owned by user",
            )

    # 验证资源所有权
    if post.asset_ids:
        result = await db.execute(
            select(PostAsset).where(
                PostAsset.id.in_(post.asset_ids),
                PostAsset.uploader_user_id != user_uuid,
            )
        )
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Some assets not owned by user",
            )

    # 生成唯一 slug
    base_slug = make_slug(post.title)[:200]
    slug = f"{base_slug}-{uuid4().hex[:8]}"

    # 创建 Post (status=processing，等待审核)
    now = datetime.now(timezone.utc)
    db_post = Post(
        author_user_id=user_uuid,
        title=post.title,
        slug=slug,
        content=post.content,
        excerpt=post.excerpt or (post.content[:497] + "..." if post.content and len(post.content) > 500 else post.content),
        visibility=post.visibility,
        status="processing",
        cover_asset_id=post.cover_asset_id,
        ai_assisted=post.ai_assisted,
        published_at=now,
    )
    db.add(db_post)
    await db.flush()

    # 关联资源
    if post.asset_ids:
        result = await db.execute(
            select(PostAsset).where(PostAsset.id.in_(post.asset_ids))
        )
        assets = result.scalars().all()
        for asset in assets:
            asset.post_id = db_post.id

    # 关联标签
    if post.tag_ids:
        for tag_id in post.tag_ids:
            relation = PostTagRelation(post_id=db_post.id, tag_id=tag_id)
            db.add(relation)

    await db.commit()
    await db.refresh(db_post)

    # 触发内容审核（异步处理，Phase 4 实现完整逻辑）
    from app.services.moderation import process_post_moderation
    await process_post_moderation(db_post.id)

    # 构建响应
    return await _build_post_response(db, db_post)


@router.get("/{post_id}", response_model=PostResponse)
async def get_post(
    post_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_clerk_id: Optional[str] = Depends(get_optional_user_id),
):
    """获取作品详情"""
    post_service = PostService(db)

    # 获取当前用户 ID
    current_user_id = None
    if current_clerk_id:
        from app.repositories.user import UserRepository
        user_repo = UserRepository(db)
        current_user = await user_repo.get_by_clerk_id(current_clerk_id)
        if current_user:
            current_user_id = current_user.id

    post = await post_service.get_post(post_id, current_user_id)

    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found",
        )

    return post


@router.put("/{post_id}", response_model=PostResponse)
async def update_post(
    post_id: UUID,
    post: PostUpdate,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """
    更新作品

    - 验证作品存在且作者为当前用户
    - 更新 Post 字段
    - 替换资源和标签关联
    - 重新生成 slug（如标题变化）
    """
    user_uuid = UUID(user_id)

    result = await db.execute(
        select(Post).where(Post.id == post_id)
    )
    db_post = result.scalar_one_or_none()

    if not db_post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found",
        )

    if db_post.author_user_id != user_uuid:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this post",
        )

    # 更新字段
    if post.title is not None:
        db_post.title = post.title
        # 重新生成 slug
        base_slug = make_slug(post.title)[:200]
        db_post.slug = f"{base_slug}-{uuid4().hex[:8]}"

    if post.content is not None:
        db_post.content = post.content
        if post.excerpt is None and len(post.content) > 500:
            db_post.excerpt = post.content[:497] + "..."

    if post.excerpt is not None:
        db_post.excerpt = post.excerpt

    if post.visibility is not None:
        db_post.visibility = post.visibility

    if post.cover_asset_id is not None:
        # 验证新封面
        result = await db.execute(
            select(PostAsset).where(
                PostAsset.id == post.cover_asset_id,
                PostAsset.uploader_user_id == user_uuid,
            )
        )
        cover_asset = result.scalar_one_or_none()
        if not cover_asset:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cover asset not found or not owned by user",
            )
        db_post.cover_asset_id = post.cover_asset_id

    # 替换资源关联
    if post.asset_ids is not None:
        result = await db.execute(
            select(PostAsset).where(
                PostAsset.id.in_(post.asset_ids),
                PostAsset.uploader_user_id != user_uuid,
            )
        )
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Some assets not owned by user",
            )

        # 清除旧关联
        result = await db.execute(
            select(PostAsset).where(PostAsset.post_id == post_id)
        )
        old_assets = result.scalars().all()
        for asset in old_assets:
            asset.post_id = None

        # 建立新关联
        if post.asset_ids:
            result = await db.execute(
                select(PostAsset).where(PostAsset.id.in_(post.asset_ids))
            )
            new_assets = result.scalars().all()
            for asset in new_assets:
                asset.post_id = post_id

    # 替换标签关联
    if post.tag_ids is not None:
        result = await db.execute(
            select(PostTagRelation).where(PostTagRelation.post_id == post_id)
        )
        old_relations = result.scalars().all()
        for relation in old_relations:
            await db.delete(relation)

        for tag_id in post.tag_ids:
            relation = PostTagRelation(post_id=post_id, tag_id=tag_id)
            db.add(relation)

    await db.commit()
    await db.refresh(db_post)

    return await _build_post_response(db, db_post)


@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_post(
    post_id: UUID,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """删除作品"""
    user_uuid = UUID(user_id)

    result = await db.execute(
        select(Post).where(Post.id == post_id)
    )
    db_post = result.scalar_one_or_none()

    if not db_post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found",
        )

    if db_post.author_user_id != user_uuid:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this post",
        )

    await db.delete(db_post)
    await db.commit()


@router.post("/{post_id}/flag", status_code=status.HTTP_202_ACCEPTED)
async def flag_post(post_id: UUID, reason: str = Query(..., min_length=1, max_length=500)):
    """标记内容为待审核状态"""
    from app.services.moderation import flag_content

    # TODO (Phase 1.2): 替换为真实数据库操作
    # 1. 验证 post 存在
    # 2. 调用 flag_content(post_id, reason)
    # 3. 更新 post status 为 'flagged'

    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Not implemented"
    )


@router.post("/{post_id}/like")
async def like_post(
    post_id: UUID,
    current_user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """点赞作品"""
    user_uuid = UUID(current_user_id)

    # 验证作品存在
    result = await db.execute(select(Post).where(Post.id == post_id))
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found",
        )

    # 检查是否已点赞
    result = await db.execute(
        select(PostLike).where(
            PostLike.post_id == post_id,
            PostLike.user_id == user_uuid,
        )
    )
    existing = result.scalar_one_or_none()
    if existing:
        return {"status": "already_liked"}

    # 创建点赞
    new_like = PostLike(post_id=post_id, user_id=user_uuid)
    db.add(new_like)
    post.like_count = (post.like_count or 0) + 1
    await db.flush()
    await db.commit()

    return {"status": "liked"}


@router.delete("/{post_id}/like", status_code=status.HTTP_204_NO_CONTENT)
async def unlike_post(
    post_id: UUID,
    current_user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """取消点赞"""
    user_uuid = UUID(current_user_id)

    # 验证作品存在
    result = await db.execute(select(Post).where(Post.id == post_id))
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found",
        )

    # 删除点赞
    result = await db.execute(
        delete(PostLike).where(
            PostLike.post_id == post_id,
            PostLike.user_id == user_uuid,
        )
    )
    if result.rowcount > 0:
        post.like_count = max(0, (post.like_count or 0) - 1)
    await db.flush()
    await db.commit()


@router.post("/{post_id}/favorite")
async def favorite_post(
    post_id: UUID,
    current_user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """收藏作品"""
    user_uuid = UUID(current_user_id)

    # 验证作品存在
    result = await db.execute(select(Post).where(Post.id == post_id))
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found",
        )

    # 检查是否已收藏
    result = await db.execute(
        select(PostFavorite).where(
            PostFavorite.post_id == post_id,
            PostFavorite.user_id == user_uuid,
        )
    )
    existing = result.scalar_one_or_none()
    if existing:
        return {"status": "already_favorited"}

    # 创建收藏
    new_favorite = PostFavorite(post_id=post_id, user_id=user_uuid)
    db.add(new_favorite)
    post.favorite_count = (post.favorite_count or 0) + 1
    await db.flush()
    await db.commit()

    return {"status": "favorited"}


@router.delete("/{post_id}/favorite", status_code=status.HTTP_204_NO_CONTENT)
async def unfavorite_post(
    post_id: UUID,
    current_user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """取消收藏"""
    user_uuid = UUID(current_user_id)

    # 验证作品存在
    result = await db.execute(select(Post).where(Post.id == post_id))
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found",
        )

    # 删除收藏
    result = await db.execute(
        delete(PostFavorite).where(
            PostFavorite.post_id == post_id,
            PostFavorite.user_id == user_uuid,
        )
    )
    if result.rowcount > 0:
        post.favorite_count = max(0, (post.favorite_count or 0) - 1)
    await db.flush()
    await db.commit()


async def _build_post_response(db: AsyncSession, db_post: Post) -> PostResponse:
    """构建作品响应"""
    from app.models.users import User

    # 获取作者信息
    result = await db.execute(
        select(User).where(User.id == db_post.author_user_id)
    )
    author = result.scalar_one_or_none()

    author_response = PostAuthorResponse(
        id=author.id,
        username=author.username or "",
        display_name=author.display_name,
        avatar_url=author.avatar_url,
        creator_badge=author.creator_badge or False,
    ) if author else PostAuthorResponse(
        id=db_post.author_user_id,
        username="",
        display_name=None,
        avatar_url=None,
        creator_badge=False,
    )

    # 封面资源
    cover_asset_response = None
    if db_post.cover_asset_id:
        result = await db.execute(
            select(PostAsset).where(PostAsset.id == db_post.cover_asset_id)
        )
        cover_asset = result.scalar_one_or_none()
        if cover_asset:
            cover_asset_response = PostAssetResponse(
                id=cover_asset.id,
                kind=cover_asset.kind,
                url=f"{cover_asset.bucket}/{cover_asset.object_key}",
                width=cover_asset.width,
                height=cover_asset.height,
                mime_type=cover_asset.mime_type,
            )

    # 资源列表
    result = await db.execute(
        select(PostAsset).where(PostAsset.post_id == db_post.id)
    )
    assets = result.scalars().all()
    asset_responses = [
        PostAssetResponse(
            id=a.id,
            kind=a.kind,
            url=f"{a.bucket}/{a.object_key}",
            width=a.width,
            height=a.height,
            mime_type=a.mime_type,
        )
        for a in assets
    ]

    # 标签
    result = await db.execute(
        select(Tag, PostTagRelation)
        .join(PostTagRelation, Tag.id == PostTagRelation.tag_id)
        .where(PostTagRelation.post_id == db_post.id)
    )
    tag_rows = result.all()
    tag_responses = [
        TagResponse(id=tag.id, name=tag.name, slug=tag.slug)
        for tag, _ in tag_rows
    ]

    return PostResponse(
        id=db_post.id,
        author=author_response,
        title=db_post.title,
        slug=db_post.slug,
        content=db_post.content,
        excerpt=db_post.excerpt,
        visibility=db_post.visibility,
        status=db_post.status,
        cover_asset=cover_asset_response,
        assets=asset_responses,
        tags=tag_responses,
        ai_assisted=db_post.ai_assisted,
        like_count=db_post.like_count or 0,
        favorite_count=db_post.favorite_count or 0,
        comment_count=db_post.comment_count or 0,
        is_liked=False,
        is_favorited=False,
        published_at=db_post.published_at,
        created_at=db_post.created_at,
        updated_at=db_post.updated_at,
    )
