# Comments Router
# 评论相关 API

from fastapi import APIRouter, HTTPException, status, Query
from typing import Optional
from uuid import UUID

from app.schemas.comments import CommentCreate, CommentResponse
from app.schemas.common import PaginatedResponse

router = APIRouter()


@router.get("/posts/{post_id}/comments", response_model=PaginatedResponse[CommentResponse])
async def list_comments(
    post_id: UUID,
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    sort: str = Query(default="newest", pattern="^(newest|oldest|popular)$"),
):
    """
    获取作品评论列表

    - sort: 排序方式 (newest / oldest / popular)
    """
    # TODO: 实现评论列表查询
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Not implemented"
    )


@router.post("/posts/{post_id}/comments", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
async def create_comment(post_id: UUID, comment: CommentCreate):
    """创建评论"""
    # TODO: 实现评论创建
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Not implemented"
    )


@router.delete("/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_comment(comment_id: UUID):
    """删除评论"""
    # TODO: 实现评论删除
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Not implemented"
    )