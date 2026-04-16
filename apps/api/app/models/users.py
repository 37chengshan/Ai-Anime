# User Domain Models

from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, Integer
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
import uuid

from app.core.db import Base


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    clerk_user_id = Column(String(128), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(64), unique=True, nullable=False, index=True)
    status = Column(String(32), default="active")  # active / banned / deleted
    role = Column(String(32), default="user")  # user / creator / admin
    last_login_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False)
    display_name = Column(String(100))
    avatar_url = Column(Text)
    bio = Column(Text)
    website = Column(Text)
    social_links = Column(JSONB, default=dict)
    creator_badge = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class UserSettings(Base):
    __tablename__ = "user_settings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False)
    locale = Column(String(16), default="zh-CN")
    theme = Column(String(16), default="light")
    email_notifications = Column(Boolean, default=True)
    push_notifications = Column(Boolean, default=False)
    content_filter_level = Column(String(32), default="standard")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class UserFollowRelation(Base):
    __tablename__ = "user_follow_relations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    follower_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    followee_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        {"unique_constraint": ("follower_user_id", "followee_user_id")},
    )