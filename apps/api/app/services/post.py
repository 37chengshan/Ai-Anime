# Post Service - Business logic for post operations

from typing import Optional, List, Tuple, Any
from uuid import UUID
from datetime import datetime

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.content import Post, PostAsset, Tag, PostTagRelation
from app.models.users import User, UserFollowRelation
from app.repositories.post import PostRepository, TagRepository
from app.schemas.posts import PostResponse, PostListResponse
from app.schemas.posts import PostAuthorResponse, PostAssetResponse, TagResponse


class PostService:
    """作品服务层，处理作品相关的业务逻辑。"""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session
        self._repo = PostRepository(session)

    async def list_posts(
        self,
        status: str = "published",
        tag: Optional[str] = None,
        author_id: Optional[UUID] = None,
        sort: str = "latest",
        limit: int = 20,
        cursor: Optional[str] = None,
        search: Optional[str] = None,
        following_user_ids: Optional[List[UUID]] = None,
        current_user_id: Optional[UUID] = None,
    ) -> Tuple[List[PostListResponse], int, Optional[str]]:
        """
        获取作品列表。

        Returns:
            (作品列表, 总数, 下一游标)
        """
        filters = {
            "status": status,
            "tag": tag,
            "author_id": author_id,
            "sort": sort,
            "search": search,
            "following_user_ids": following_user_ids,
        }

        posts, next_cursor = await self._repo.find_all(filters, limit, cursor)
        total = await self._repo.get_total_count(filters)

        # 转换为响应模型
        post_responses = []
        for post in posts:
            post_responses.append(
                await self._build_post_list_response(post, current_user_id)
            )

        return post_responses, total, next_cursor

    async def get_post(
        self, post_id: UUID, current_user_id: Optional[UUID] = None
    ) -> Optional[PostResponse]:
        """获取作品详情。"""
        post = await self._repo.find_by_id(post_id)
        if not post or post.status != "published":
            return None

        return await self._build_post_response(post, current_user_id)

    async def get_post_by_slug(
        self, slug: str, current_user_id: Optional[UUID] = None
    ) -> Optional[PostResponse]:
        """根据 slug 获取作品详情。"""
        post = await self._repo.find_by_slug(slug)
        if not post or post.status != "published":
            return None

        return await self._build_post_response(post, current_user_id)

    async def _build_post_list_response(
        self, post: Post, current_user_id: Optional[UUID] = None
    ) -> PostListResponse:
        """构建作品列表响应。"""
        from app.repositories.user import UserRepository

        user_repo = UserRepository(self._session)
        author = await user_repo.get_by_id(post.author_user_id)

        # 获取标签
        tag_result = await self._session.execute(
            select(Tag, PostTagRelation)
            .join(PostTagRelation, Tag.id == PostTagRelation.tag_id)
            .where(PostTagRelation.post_id == post.id)
        )
        tags = [TagResponse(id=t.id, name=t.name, slug=t.slug) for t, _ in tag_result.all()]

        # 获取点赞/收藏状态
        is_liked = False
        is_favorited = False
        if current_user_id:
            is_liked = await self._check_if_liked(post.id, current_user_id)
            is_favorited = await self._check_if_favorited(post.id, current_user_id)

        cover_url = None
        if post.cover_asset:
            cover_url = f"{post.cover_asset.bucket}/{post.cover_asset.object_key}"

        author_response = PostAuthorResponse(
            id=author.id,
            username=author.username or "",
            display_name=author.display_name,
            avatar_url=author.avatar_url,
            creator_badge=author.creator_badge or False,
        ) if author else PostAuthorResponse(
            id=post.author_user_id,
            username="",
            display_name=None,
            avatar_url=None,
            creator_badge=False,
        )

        return PostListResponse(
            id=post.id,
            author=author_response,
            title=post.title,
            slug=post.slug,
            excerpt=post.excerpt,
            cover_url=cover_url,
            tags=tags,
            like_count=post.like_count or 0,
            favorite_count=post.favorite_count or 0,
            comment_count=post.comment_count or 0,
            published_at=post.published_at,
            created_at=post.created_at,
        )

    async def _build_post_response(
        self, post: Post, current_user_id: Optional[UUID] = None
    ) -> PostResponse:
        """构建作品详情响应。"""
        from app.repositories.user import UserRepository

        user_repo = UserRepository(self._session)
        author = await user_repo.get_by_id(post.author_user_id)

        # 获取标签
        tag_result = await self._session.execute(
            select(Tag, PostTagRelation)
            .join(PostTagRelation, Tag.id == PostTagRelation.tag_id)
            .where(PostTagRelation.post_id == post.id)
        )
        tags = [TagResponse(id=t.id, name=t.name, slug=t.slug) for t, _ in tag_result.all()]

        # 获取资源
        asset_result = await self._session.execute(
            select(PostAsset).where(PostAsset.post_id == post.id)
        )
        assets = list(asset_result.scalars().all())

        # 封面资源
        cover_asset_response = None
        if post.cover_asset:
            cover_asset_response = PostAssetResponse(
                id=post.cover_asset.id,
                kind=post.cover_asset.kind,
                url=f"{post.cover_asset.bucket}/{post.cover_asset.object_key}",
                width=post.cover_asset.width,
                height=post.cover_asset.height,
                mime_type=post.cover_asset.mime_type,
            )

        # 资源列表
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

        # 点赞/收藏状态
        is_liked = False
        is_favorited = False
        if current_user_id:
            is_liked = await self._check_if_liked(post.id, current_user_id)
            is_favorited = await self._check_if_favorited(post.id, current_user_id)

        author_response = PostAuthorResponse(
            id=author.id,
            username=author.username or "",
            display_name=author.display_name,
            avatar_url=author.avatar_url,
            creator_badge=author.creator_badge or False,
        ) if author else PostAuthorResponse(
            id=post.author_user_id,
            username="",
            display_name=None,
            avatar_url=None,
            creator_badge=False,
        )

        return PostResponse(
            id=post.id,
            author=author_response,
            title=post.title,
            slug=post.slug,
            content=post.content,
            excerpt=post.excerpt,
            visibility=post.visibility,
            status=post.status,
            cover_asset=cover_asset_response,
            assets=asset_responses,
            tags=tags,
            ai_assisted=post.ai_assisted,
            like_count=post.like_count or 0,
            favorite_count=post.favorite_count or 0,
            comment_count=post.comment_count or 0,
            is_liked=is_liked,
            is_favorited=is_favorited,
            published_at=post.published_at,
            created_at=post.created_at,
            updated_at=post.updated_at,
        )

    async def _check_if_liked(self, post_id: UUID, user_id: UUID) -> bool:
        """检查用户是否点赞了作品。"""
        from app.models.content import PostLike
        result = await self._session.execute(
            select(PostLike).where(
                PostLike.post_id == post_id,
                PostLike.user_id == user_id,
            )
        )
        return result.scalar_one_or_none() is not None

    async def _check_if_favorited(self, post_id: UUID, user_id: UUID) -> bool:
        """检查用户是否收藏了作品。"""
        from app.models.content import PostFavorite
        result = await self._session.execute(
            select(PostFavorite).where(
                PostFavorite.post_id == post_id,
                PostFavorite.user_id == user_id,
            )
        )
        return result.scalar_one_or_none() is not None


class TagService:
    """标签服务层。"""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session
        self._repo = TagRepository(session)

    async def list_tags(self) -> List[TagResponse]:
        """获取所有标签。"""
        tags = await self._repo.find_all()
        return [
            TagResponse(id=t.id, name=t.name, slug=t.slug)
            for t in tags
        ]

    async def get_tags_with_count(self) -> List[dict]:
        """获取所有标签及其作品数量。"""
        return await self._repo.get_tags_with_post_count()
