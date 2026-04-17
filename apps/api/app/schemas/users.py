# User Schemas
# 用户相关 Pydantic 模型

from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field
from uuid import UUID


class UserBase(BaseModel):
    """用户基础模型"""
    username: str = Field(..., min_length=3, max_length=64)
    email: str = Field(..., pattern=r"^[\w\.-]+@[\w\.-]+\.\w+$")


class UserResponse(BaseModel):
    """用户响应"""
    id: UUID
    clerk_user_id: str
    email: str
    username: str
    status: str
    role: str
    created_at: datetime

    class Config:
        from_attributes = True


class UserProfileBase(BaseModel):
    """用户资料基础模型"""
    display_name: Optional[str] = Field(default=None, max_length=100)
    bio: Optional[str] = Field(default=None, max_length=500)
    website: Optional[str] = Field(default=None, max_length=255)
    social_links: Optional[dict] = Field(default=None)


class UserProfileResponse(BaseModel):
    """用户资料响应"""
    id: UUID
    user_id: UUID
    display_name: Optional[str]
    avatar_url: Optional[str]
    bio: Optional[str]
    website: Optional[str]
    social_links: Optional[dict]
    creator_badge: bool
    follower_count: int = Field(default=0)
    following_count: int = Field(default=0)
    created_at: datetime

    class Config:
        from_attributes = True


class UserProfileUpdate(BaseModel):
    """用户资料更新"""
    display_name: Optional[str] = Field(default=None, max_length=100)
    bio: Optional[str] = Field(default=None, max_length=500)
    website: Optional[str] = Field(default=None, max_length=255)
    social_links: Optional[dict] = Field(default=None)


class UserSettingsResponse(BaseModel):
    """用户设置响应"""
    id: UUID
    user_id: UUID
    locale: str
    theme: str
    email_notifications: bool
    push_notifications: bool
    content_filter_level: str

    class Config:
        from_attributes = True


# --- 新增响应模型 ---


class SubscriptionSummary(BaseModel):
    """订阅状态摘要"""
    plan: str = Field(default="free", description="当前套餐")
    status: str = Field(default="inactive", description="订阅状态")
    expires_at: Optional[datetime] = Field(default=None, description="到期时间")


class AIQuotaSummary(BaseModel):
    """AI 配额摘要"""
    daily_limit: int = Field(default=10, description="每日限额")
    daily_used: int = Field(default=0, description="已使用次数")
    remaining: int = Field(default=10, description="剩余次数")


class CurrentUserResponse(BaseModel):
    """当前用户完整信息响应"""
    user: UserResponse
    profile: Optional[UserProfileResponse] = None
    settings: Optional[UserSettingsResponse] = None
    subscription: SubscriptionSummary = Field(default_factory=SubscriptionSummary)
    ai_quota: AIQuotaSummary = Field(default_factory=AIQuotaSummary)


class UserPublicResponse(BaseModel):
    """用户公开信息响应"""
    id: UUID
    username: str
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    creator_badge: bool = False
    follower_count: int = 0
    following_count: int = 0
    is_following: bool = False


class CreatorStatsResponse(BaseModel):
    """创作者统计"""
    follower_count: int = 0
    following_count: int = 0


class CreatorPageResponse(BaseModel):
    """创作者主页数据响应"""
    user: UserPublicResponse
    stats: CreatorStatsResponse = Field(default_factory=CreatorStatsResponse)
    # posts 将在作品模块完成后填充
    posts: list = Field(default_factory=list)