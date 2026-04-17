# User Repository — SQLAlchemy 2.0 async 数据访问层

from typing import Optional
from uuid import UUID

from sqlalchemy import select, update, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.users import User, UserProfile, UserSettings


class UserRepository:
    """用户数据仓库，封装所有 User / UserProfile / UserSettings 的数据库操作。"""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    # ------------------------------------------------------------------
    # User CRUD
    # ------------------------------------------------------------------

    async def get_by_id(self, user_id: UUID) -> Optional[User]:
        """根据主键查找用户。"""
        result = await self._session.execute(
            select(User).where(User.id == user_id)
        )
        return result.scalar_one_or_none()

    async def get_by_clerk_id(self, clerk_user_id: str) -> Optional[User]:
        """根据 Clerk 外部 ID 查找用户。"""
        result = await self._session.execute(
            select(User).where(User.clerk_user_id == clerk_user_id)
        )
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> Optional[User]:
        """根据邮箱查找用户。"""
        result = await self._session.execute(
            select(User).where(User.email == email)
        )
        return result.scalar_one_or_none()

    async def get_by_username(self, username: str) -> Optional[User]:
        """根据用户名查找用户。"""
        result = await self._session.execute(
            select(User).where(User.username == username)
        )
        return result.scalar_one_or_none()

    async def create(self, user_data: dict) -> User:
        """创建新用户记录。"""
        user = User(**user_data)
        self._session.add(user)
        await self._session.flush()
        await self._session.refresh(user)
        return user

    async def update(self, user_id: UUID, user_data: dict) -> Optional[User]:
        """更新用户字段，返回更新后的实例。"""
        if not user_data:
            return await self.get_by_id(user_id)

        await self._session.execute(
            update(User).where(User.id == user_id).values(**user_data)
        )
        await self._session.flush()
        return await self.get_by_id(user_id)

    async def delete(self, user_id: UUID) -> bool:
        """软删除：将 status 设为 'deleted'。返回是否成功。"""
        result = await self._session.execute(
            update(User)
            .where(User.id == user_id)
            .where(User.status != "deleted")
            .values(status="deleted")
        )
        await self._session.flush()
        return result.rowcount > 0

    # ------------------------------------------------------------------
    # UserProfile
    # ------------------------------------------------------------------

    async def get_profile_by_user_id(self, user_id: UUID) -> Optional[UserProfile]:
        """获取用户资料。"""
        result = await self._session.execute(
            select(UserProfile).where(UserProfile.user_id == user_id)
        )
        return result.scalar_one_or_none()

    async def create_profile(self, profile_data: dict) -> UserProfile:
        """创建用户资料。"""
        profile = UserProfile(**profile_data)
        self._session.add(profile)
        await self._session.flush()
        await self._session.refresh(profile)
        return profile

    async def update_profile(
        self, user_id: UUID, profile_data: dict
    ) -> Optional[UserProfile]:
        """更新用户资料。"""
        if not profile_data:
            return await self.get_profile_by_user_id(user_id)

        await self._session.execute(
            update(UserProfile)
            .where(UserProfile.user_id == user_id)
            .values(**profile_data)
        )
        await self._session.flush()
        return await self.get_profile_by_user_id(user_id)

    # ------------------------------------------------------------------
    # UserSettings
    # ------------------------------------------------------------------

    async def get_settings_by_user_id(self, user_id: UUID) -> Optional[UserSettings]:
        """获取用户设置。"""
        result = await self._session.execute(
            select(UserSettings).where(UserSettings.user_id == user_id)
        )
        return result.scalar_one_or_none()

    async def create_settings(self, settings_data: dict) -> UserSettings:
        """创建用户设置。"""
        settings = UserSettings(**settings_data)
        self._session.add(settings)
        await self._session.flush()
        await self._session.refresh(settings)
        return settings

    async def update_settings(
        self, user_id: UUID, settings_data: dict
    ) -> Optional[UserSettings]:
        """更新用户设置。"""
        if not settings_data:
            return await self.get_settings_by_user_id(user_id)

        await self._session.execute(
            update(UserSettings)
            .where(UserSettings.user_id == user_id)
            .values(**settings_data)
        )
        await self._session.flush()
        return await self.get_settings_by_user_id(user_id)
