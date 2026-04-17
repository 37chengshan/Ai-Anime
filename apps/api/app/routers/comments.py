# Comments Router
# 评论相关 API

from fastapi import APIRouter, HTTPException, status, Query, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from uuid import UUID

from app.core.db import get_db
from app.schemas.comments import CommentCreate, CommentResponse
from app.schemas.comments import CommentAuthorResponse
from app.schemas.common import PaginatedResponse
from app.services.comment import CommentService
from app.repositories.user import UserRepository
from app.utils.auth import get_current_user_id, get_optional_user_id

router = APIRouter()


@router.get("/posts/{post_id}/comments", response_model=PaginatedResponse[CommentResponse])
async def list_comments(
    post_id: UUID,
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    sort: str = Query(default="newest", pattern="^(newest|oldest|popular)$"),
    current_user_id: Optional[str] = Depends(get_optional_user_id),
    db: AsyncSession = Depends(get_db),
):
    """
    获取作品评论列表

    - sort: 排序方式 (newest / oldest / popular)
    """
    user_uuid = UUID(current_user_id) if current_user_id else None

    service = CommentService(db)
    comment_dicts, total = await service.get_comments(
        post_id, page, limit, sort, user_uuid
    )

    # 构建响应
    items = []
    for c in comment_dicts:
        author = CommentAuthorResponse(
            id=UUID(c["author"]["id"]),
            username=c["author"]["username"],
            display_name=c["author"]["display_name"],
            avatar_url=c["author"]["avatar_url"],
        )
        items.append(CommentResponse(
            id=c["id"],
            post_id=c["post_id"],
            author=author,
            parent_comment_id=c["parent_comment_id"],
            content=c["content"],
            status=c["status"],
            ai_assisted=c["ai_assisted"],
            like_count=c["like_count"],
            is_liked=c["is_liked"],
            is_own=c["is_own"],
            replies=[],
            created_at=c["created_at"],
            updated_at=c["updated_at"],
        ))

    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        limit=limit,
    )


@router.post("/posts/{post_id}/comments", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
async def create_comment(
    post_id: UUID,
    comment: CommentCreate,
    current_user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """创建评论"""
    user_uuid = UUID(current_user_id)

    # 解析作者信息
    user_repo = UserRepository(db)
    user = await user_repo.get_by_id(user_uuid)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    service = CommentService(db)
    db_comment = await service.create_comment(
        post_id=post_id,
        author_user_id=user_uuid,
        content=comment.content,
        parent_comment_id=comment.parent_comment_id,
        ai_assisted=comment.ai_assisted,
    )

    author = CommentAuthorResponse(
        id=user.id,
        username=user.username or "",
        display_name=getattr(user, "display_name", None),
        avatar_url=getattr(user, "avatar_url", None),
    )

    return CommentResponse(
        id=db_comment.id,
        post_id=db_comment.post_id,
        author=author,
        parent_comment_id=db_comment.parent_comment_id,
        content=db_comment.content,
        status=db_comment.status,
        ai_assisted=db_comment.ai_assisted,
        like_count=db_comment.like_count or 0,
        is_liked=False,
        is_own=True,
        replies=[],
        created_at=db_comment.created_at,
        updated_at=db_comment.updated_at,
    )


@router.delete("/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_comment(
    comment_id: UUID,
    current_user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """删除评论"""
    user_uuid = UUID(current_user_id)

    service = CommentService(db)
    try:
        await service.delete_comment(comment_id, user_uuid)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )

    await db.commit()
