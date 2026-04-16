# Posts Router
# 作品相关 API

from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import Optional, List
from uuid import UUID

from app.schemas.posts import PostCreate, PostUpdate, PostResponse, PostListResponse
from app.schemas.common import PaginatedResponse

router = APIRouter()


@router.get("", response_model=PaginatedResponse[PostListResponse])
async def list_posts(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    cursor: Optional[str] = None,
    status: Optional[str] = Query(default="published"),
    tag: Optional[str] = None,
    author_id: Optional[UUID] = None,
    sort: str = Query(default="latest", pattern="^(latest|popular|trending)$"),
):
    """
    获取作品列表

    - status: 筛选状态 (published / all)
    - tag: 筛选标签 slug
    - author_id: 筛选作者
    - sort: 排序方式 (latest / popular / trending)
    """
    # TODO: 实现作品列表查询
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Not implemented"
    )


@router.post("", response_model=PostResponse, status_code=status.HTTP_201_CREATED)
async def create_post(post: PostCreate):
    """创建作品"""
    # TODO: 实现作品创建
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Not implemented"
    )


@router.get("/{post_id}", response_model=PostResponse)
async def get_post(post_id: UUID):
    """获取作品详情"""
    # TODO: 实现作品详情查询
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Not implemented"
    )


@router.put("/{post_id}", response_model=PostResponse)
async def update_post(post_id: UUID, post: PostUpdate):
    """更新作品"""
    # TODO: 实现作品更新
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Not implemented"
    )


@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_post(post_id: UUID):
    """删除作品"""
    # TODO: 实现作品删除
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Not implemented"
    )


@router.post("/{post_id}/like")
async def like_post(post_id: UUID):
    """点赞作品"""
    # TODO: 实现点赞功能
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Not implemented"
    )


@router.delete("/{post_id}/like", status_code=status.HTTP_204_NO_CONTENT)
async def unlike_post(post_id: UUID):
    """取消点赞"""
    # TODO: 实现取消点赞
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Not implemented"
    )


@router.post("/{post_id}/favorite")
async def favorite_post(post_id: UUID):
    """收藏作品"""
    # TODO: 实现收藏功能
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Not implemented"
    )


@router.delete("/{post_id}/favorite", status_code=status.HTTP_204_NO_CONTENT)
async def unfavorite_post(post_id: UUID):
    """取消收藏"""
    # TODO: 实现取消收藏
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Not implemented"
    )