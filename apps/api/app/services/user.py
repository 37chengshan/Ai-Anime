# User Service - Business logic for user operations

from typing import Optional, Any
from uuid import UUID
from datetime import datetime

from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.users import User, UserProfile, UserSettings, UserFollowRelation
from app.repositories.user import UserRepository


class UserService:
    """用户服务层，处理用户相关的业务逻辑。"""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session
        self._repo = UserRepository(session)

    async def sync_from_clerk(
        self,
        clerk_user_id: str,
        email: str,
        username: str,
        event_type: str,
    ) -> User:
        """
        从 Clerk 事件同步用户数据。

        Args:
            clerk_user_id: Clerk 用户 ID
            email: 用户邮箱
            username: 用户名
            event_type: 事件类型 (user.created / user.updated / user.deleted)

        Returns:
            同步后的用户实例
        """
        if event_type == "user.deleted":
            existing = await self._repo.get_by_clerk_id(clerk_user_id)
            if existing:
                await self._repo.delete(existing.id)
            return existing

        existing = await self._repo.get_by_clerk_id(clerk_user_id)

        if event_type == "user.created":
            if existing:
                # 用户已存在，执行更新
                return await self._repo.update(
                    existing.id,
                    {"email": email, "username": username, "status": "active"},
                )

            # 创建新用户
            user = await self._repo.create({
                "clerk_user_id": clerk_user_id,
                "email": email,
                "username": username,
                "status": "active",
                "role": "user",
            })
            # 同时创建 profile 和 settings
            await self._repo.create_profile({"user_id": user.id})
            await self._repo.create_settings({"user_id": user.id})
            return user

        if event_type == "user.updated":
            if not existing:
                # 用户不存在则创建
                user = await self._repo.create({
                    "clerk_user_id": clerk_user_id,
                    "email": email,
                    "username": username,
                    "status": "active",
                    "role": "user",
                })
                await self._repo.create_profile({"user_id": user.id})
                await self._repo.create_settings({"user_id": user.id})
                return user
            return await self._repo.update(
                existing.id,
                {"email": email, "username": username},
            )

        return existing

    async def get_current_user(self, clerk_user_id: str) -> Optional[dict[str, Any]]:
        """
        获取当前用户完整信息，包括 profile 和 settings。

        Args:
            clerk_user_id: Clerk 用户 ID

        Returns:
            包含 user, profile, settings 的字典，或 None
        """
        user = await self._repo.get_by_clerk_id(clerk_user_id)
        if not user:
            return None

        profile = await self._repo.get_profile_by_user_id(user.id)
        settings = await self._repo.get_settings_by_user_id(user.id)

        return {
            "user": user,
            "profile": profile,
            "settings": settings,
        }

    async def update_profile(
        self, user_id: UUID, profile_data: dict
    ) -> Optional[UserProfile]:
        """
        更新用户资料。

        Args:
            user_id: 用户 ID
            profile_data: 要更新的字段

        Returns:
            更新后的 profile
        """
        # 过滤空值
        update_data = {k: v for k, v in profile_data.items() if v is not None}
        return await self._repo.update_profile(user_id, update_data)

    async def get_user_public_info(self, user_id: UUID) -> Optional[dict[str, Any]]:
        """
        获取用户公开信息。

        Args:
            user_id: 用户 ID

        Returns:
            包含 user 和 profile 的字典
        """
        user = await self._repo.get_by_id(user_id)
        if not user or user.status == "deleted":
            return None

        profile = await self._repo.get_profile_by_user_id(user_id)
        return {
            "user": user,
            "profile": profile,
        }

    async def follow_user(
        self, follower_id: UUID, followee_id: UUID
    ) -> bool:
        """
        关注用户。

        Args:
            follower_id: 关注者 ID
            followee_id: 被关注者 ID

        Returns:
            是否成功
        """
        if follower_id == followee_id:
            return False

        # 检查是否已关注
        existing = await self._session.execute(
            select(UserFollowRelation).where(
                and_(
                    UserFollowRelation.follower_user_id == follower_id,
                    UserFollowRelation.followee_user_id == followee_id,
                )
            )
        )
        if existing.scalar_one_or_none():
            return True  # 已关注

        # 创建关注关系
        follow = UserFollowRelation(
            follower_user_id=follower_id,
            followee_user_id=followee_id,
        )
        self._session.add(follow)
        await self._session.flush()
        return True

    async def unfollow_user(
        self, follower_id: UUID, followee_id: UUID
    ) -> bool:
        """
        取消关注。

        Args:
            follower_id: 关注者 ID
            followee_id: 被关注者 ID

        Returns:
            是否成功
        """
        result = await self._session.execute(
            select(UserFollowRelation).where(
                and_(
                    UserFollowRelation.follower_user_id == follower_id,
                    UserFollowRelation.followee_user_id == followee_id,
                )
            )
        )
        follow = result.scalar_one_or_none()
        if not follow:
            return False

        await self._session.delete(follow)
        await self._session.flush()
        return True

    async def is_following(
        self, follower_id: UUID, followee_id: UUID
    ) -> bool:
        """
        检查是否关注了用户。

        Args:
            follower_id: 关注者 ID
            followee_id: 被关注者 ID

        Returns:
            是否已关注
        """
        result = await self._session.execute(
            select(UserFollowRelation).where(
                and_(
                    UserFollowRelation.follower_user_id == follower_id,
                    UserFollowRelation.followee_user_id == followee_id,
                )
            )
        )
        return result.scalar_one_or_none() is not None

    async def get_follower_count(self, user_id: UUID) -> int:
        """获取粉丝数。"""
        result = await self._session.execute(
            select(func.count(UserFollowRelation.id)).where(
                UserFollowRelation.followee_user_id == user_id
            )
        )
        return result.scalar() or 0

    async def get_following_count(self, user_id: UUID) -> int:
        """获取关注数。"""
        result = await self._session.execute(
            select(func.count(UserFollowRelation.id)).where(
                UserFollowRelation.follower_user_id == user_id
            )
        )
        return result.scalar() or 0

    async def get_creator_by_handle(self, handle: str) -> Optional[dict[str, Any]]:
        """
        根据用户名获取创作者主页数据。

        Args:
            handle: 用户名

        Returns:
            包含 profile 和统计数据
        """
        user = await self._repo.get_by_username(handle)
        if not user or user.status != "active":
            return None

        profile = await self._repo.get_profile_by_user_id(user.id)
        follower_count = await self.get_follower_count(user.id)
        following_count = await self.get_following_count(user.id)

        return {
            "user": user,
            "profile": profile,
            "stats": {
                "follower_count": follower_count,
                "following_count": following_count,
            },
        }
