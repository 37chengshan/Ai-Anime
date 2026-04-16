# Users Router
# 用户相关 API

from fastapi import APIRouter, Depends, HTTPException, status
from typing import Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.services.user import UserService
from app.utils.auth import get_current_user_id, get_optional_user_id
from app.schemas.users import (
    UserProfileUpdate,
    UserProfileResponse,
    UserPublicResponse,
    UserSettingsResponse,
    CurrentUserResponse,
    CreatorPageResponse,
    CreatorStatsResponse,
    SubscriptionSummary,
    AIQuotaSummary,
)
from app.schemas.common import ErrorResponse

# --- Me Router (挂载在 /api/v1 下) ---
me_router = APIRouter()


@me_router.get(
    "/me",
    response_model=CurrentUserResponse,
    summary="获取当前用户信息",
    description="返回当前登录用户的完整信息，包括资料、设置、订阅和配额",
    responses={
        200: {"model": CurrentUserResponse, "description": "用户信息"},
        401: {"model": ErrorResponse, "description": "未认证"},
        404: {"model": ErrorResponse, "description": "用户不存在"},
    },
)
async def get_current_user_info(
    clerk_user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """
    获取当前登录用户信息。

    返回:
    - user: 用户基本信息
    - profile: 用户资料
    - settings: 用户设置
    - subscription: 订阅状态摘要
    - ai_quota: AI 配额摘要
    """
    user_service = UserService(db)
    user_data = await user_service.get_current_user(clerk_user_id)

    if not user_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    user = user_data["user"]
    profile = user_data["profile"]
    settings = user_data["settings"]

    # TODO: 从订阅服务获取订阅信息
    subscription = SubscriptionSummary(
        plan="free",
        status="active",
        expires_at=None,
    )

    # TODO: 从配额服务获取配额信息
    ai_quota = AIQuotaSummary(
        daily_limit=10,
        daily_used=0,
        remaining=10,
    )

    from app.schemas.users import UserResponse
    return CurrentUserResponse(
        user=UserResponse.model_validate(user),
        profile=UserProfileResponse.model_validate(profile) if profile else None,
        settings=UserSettingsResponse.model_validate(settings) if settings else None,
        subscription=subscription,
        ai_quota=ai_quota,
    )


@me_router.patch(
    "/me/profile",
    response_model=UserProfileResponse,
    summary="更新用户资料",
    description="更新当前用户的个人资料信息",
    responses={
        200: {"model": UserProfileResponse, "description": "更新成功"},
        401: {"model": ErrorResponse, "description": "未认证"},
        404: {"model": ErrorResponse, "description": "用户不存在"},
        422: {"description": "验证失败"},
    },
)
async def update_my_profile(
    body: UserProfileUpdate,
    clerk_user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """
    更新当前用户资料。

    可更新字段:
    - display_name: 显示名称
    - bio: 个人简介
    - website: 个人网站
    - social_links: 社交链接
    """
    user_service = UserService(db)
    user_data = await user_service.get_current_user(clerk_user_id)

    if not user_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    user = user_data["user"]

    # 检查是否有实际更新内容
    update_data = body.model_dump(exclude_unset=True)
    if not update_data:
        # 没有更新内容，返回当前资料
        profile = user_data["profile"]
        if profile:
            return UserProfileResponse.model_validate(profile)
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found",
        )

    updated_profile = await user_service.update_profile(user.id, update_data)
    await db.commit()

    if not updated_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found",
        )

    return UserProfileResponse.model_validate(updated_profile)


# --- Users Router (挂载在 /api/v1/users 下) ---
router = APIRouter()


@router.get(
    "/{user_id}",
    response_model=UserPublicResponse,
    summary="获取用户公开信息",
    description="根据用户 ID 获取用户的公开信息",
    responses={
        200: {"model": UserPublicResponse, "description": "用户公开信息"},
        404: {"model": ErrorResponse, "description": "用户不存在"},
    },
)
async def get_user(
    user_id: UUID,
    current_clerk_id: Optional[str] = Depends(get_optional_user_id),
    db: AsyncSession = Depends(get_db),
):
    """获取用户公开信息。"""
    user_service = UserService(db)
    user_data = await user_service.get_user_public_info(user_id)

    if not user_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    user = user_data["user"]
    profile = user_data["profile"]

    # 构建公开信息
    follower_count = await user_service.get_follower_count(user_id)
    following_count = await user_service.get_following_count(user_id)

    # 检查当前用户是否关注了该用户
    is_following = False
    if current_clerk_id:
        current_user_data = await user_service.get_current_user(current_clerk_id)
        if current_user_data:
            is_following = await user_service.is_following(
                current_user_data["user"].id, user_id
            )

    return UserPublicResponse(
        id=user.id,
        username=user.username,
        display_name=profile.display_name if profile else None,
        avatar_url=profile.avatar_url if profile else None,
        bio=profile.bio if profile else None,
        creator_badge=profile.creator_badge if profile else False,
        follower_count=follower_count,
        following_count=following_count,
        is_following=is_following,
    )


@router.post(
    "/{user_id}/follow",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="关注用户",
    description="关注指定用户",
    responses={
        204: {"description": "关注成功"},
        401: {"model": ErrorResponse, "description": "未认证"},
        404: {"model": ErrorResponse, "description": "用户不存在"},
        409: {"model": ErrorResponse, "description": "不能关注自己"},
    },
)
async def follow_user(
    user_id: UUID,
    clerk_user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """关注用户。"""
    user_service = UserService(db)

    # 获取当前用户
    current_user_data = await user_service.get_current_user(clerk_user_id)
    if not current_user_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Current user not found",
        )

    # 检查目标用户是否存在
    target_data = await user_service.get_user_public_info(user_id)
    if not target_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Target user not found",
        )

    current_user_id = current_user_data["user"].id

    # 检查不能关注自己
    if current_user_id == user_id:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot follow yourself",
        )

    success = await user_service.follow_user(current_user_id, user_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Already following this user",
        )

    await db.commit()
    return None


@router.delete(
    "/{user_id}/follow",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="取消关注",
    description="取消关注指定用户",
    responses={
        204: {"description": "取消关注成功"},
        401: {"model": ErrorResponse, "description": "未认证"},
        404: {"model": ErrorResponse, "description": "未关注该用户"},
    },
)
async def unfollow_user(
    user_id: UUID,
    clerk_user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """取消关注用户。"""
    user_service = UserService(db)

    # 获取当前用户
    current_user_data = await user_service.get_current_user(clerk_user_id)
    if not current_user_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Current user not found",
        )

    current_user_id = current_user_data["user"].id
    success = await user_service.unfollow_user(current_user_id, user_id)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Not following this user",
        )

    await db.commit()
    return None


# --- Creator Router (挂载在 /api/v1/creators 下) ---
creator_router = APIRouter()


@creator_router.get(
    "/{handle}",
    response_model=CreatorPageResponse,
    summary="获取创作者主页数据",
    description="根据用户名获取创作者的公开主页数据，包括资料、作品和统计",
    responses={
        200: {"model": CreatorPageResponse, "description": "创作者数据"},
        404: {"model": ErrorResponse, "description": "创作者不存在"},
    },
)
async def get_creator_page(
    handle: str,
    current_clerk_id: Optional[str] = Depends(get_optional_user_id),
    db: AsyncSession = Depends(get_db),
):
    """
    获取创作者主页数据。

    返回:
    - user: 创作者公开信息
    - stats: 粉丝和关注统计
    - posts: 创作者的作品列表 (待作品模块完成后实现)
    """
    user_service = UserService(db)
    creator_data = await user_service.get_creator_by_handle(handle)

    if not creator_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Creator not found",
        )

    user = creator_data["user"]
    profile = creator_data["profile"]
    stats = creator_data["stats"]

    # 检查当前用户是否关注了该创作者
    is_following = False
    if current_clerk_id:
        current_user_data = await user_service.get_current_user(current_clerk_id)
        if current_user_data:
            is_following = await user_service.is_following(
                current_user_data["user"].id, user.id
            )

    public_user = UserPublicResponse(
        id=user.id,
        username=user.username,
        display_name=profile.display_name if profile else None,
        avatar_url=profile.avatar_url if profile else None,
        bio=profile.bio if profile else None,
        creator_badge=profile.creator_badge if profile else False,
        follower_count=stats["follower_count"],
        following_count=stats["following_count"],
        is_following=is_following,
    )

    creator_stats = CreatorStatsResponse(
        follower_count=stats["follower_count"],
        following_count=stats["following_count"],
    )

    # TODO: 从作品服务获取作品列表
    posts: list = []

    return CreatorPageResponse(
        user=public_user,
        stats=creator_stats,
        posts=posts,
    )
