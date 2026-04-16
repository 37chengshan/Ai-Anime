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