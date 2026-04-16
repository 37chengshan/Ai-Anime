# Users Router
# 用户相关 API

from fastapi import APIRouter, Depends, HTTPException, status
from typing import Optional
from uuid import UUID
from pydantic import BaseModel

router = APIRouter()


@router.get("/{user_id}")
async def get_user(user_id: UUID):
    """获取用户信息"""
    # TODO: 实现用户查询
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Not implemented"
    )


@router.get("/{user_id}/profile")
async def get_user_profile(user_id: UUID):
    """获取用户资料"""
    # TODO: 实现用户资料查询
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Not implemented"
    )


@router.put("/{user_id}/profile")
async def update_user_profile(user_id: UUID):
    """更新用户资料"""
    # TODO: 实现用户资料更新
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Not implemented"
    )


@router.get("/{user_id}/posts")
async def get_user_posts(
    user_id: UUID,
    page: int = 1,
    limit: int = 20,
    status: Optional[str] = None
):
    """获取用户作品列表"""
    # TODO: 实现用户作品列表查询
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Not implemented"
    )


@router.post("/{user_id}/follow")
async def follow_user(user_id: UUID):
    """关注用户"""
    # TODO: 实现关注功能
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Not implemented"
    )


@router.delete("/{user_id}/follow")
async def unfollow_user(user_id: UUID):
    """取消关注"""
    # TODO: 实现取消关注
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Not implemented"
    )


@router.get("/{user_id}/followers")
async def get_user_followers(user_id: UUID, page: int = 1, limit: int = 20):
    """获取用户粉丝列表"""
    # TODO: 实现粉丝列表查询
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Not implemented"
    )


@router.get("/{user_id}/following")
async def get_user_following(user_id: UUID, page: int = 1, limit: int = 20):
    """获取用户关注列表"""
    # TODO: 实现关注列表查询
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Not implemented"
    )