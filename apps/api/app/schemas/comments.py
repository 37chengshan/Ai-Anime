# Comment Schemas
# 评论相关 Pydantic 模型

from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field
from uuid import UUID


class CommentBase(BaseModel):
    """评论基础模型"""
    content: str = Field(..., min_length=1, max_length=2000)


class CommentCreate(CommentBase):
    """创建评论请求"""
    post_id: UUID
    parent_comment_id: Optional[UUID] = None
    ai_assisted: bool = Field(default=False)


class CommentAuthorResponse(BaseModel):
    """评论作者响应"""
    id: UUID
    username: str
    display_name: Optional[str]
    avatar_url: Optional[str]


class CommentResponse(BaseModel):
    """评论响应"""
    id: UUID
    post_id: UUID
    author: CommentAuthorResponse
    parent_comment_id: Optional[UUID]
    content: str
    status: str
    ai_assisted: bool
    like_count: int = Field(default=0)
    is_liked: bool = Field(default=False)
    is_own: bool = Field(default=False)
    replies: List["CommentResponse"] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CommentListResponse(BaseModel):
    """评论列表响应"""
    id: UUID
    author: CommentAuthorResponse
    content: str
    like_count: int = Field(default=0)
    created_at: datetime

    class Config:
        from_attributes = True


# 解决循环引用
CommentResponse.model_rebuild()


class CommentLikeResponse(BaseModel):
    """评论点赞响应"""
    id: UUID
    comment_id: UUID
    user_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


class PostLikeResponse(BaseModel):
    """作品点赞响应"""
    status: str = Field(default="liked", description="liked | already_liked")


class PostFavoriteResponse(BaseModel):
    """作品收藏响应"""
    status: str = Field(default="favorited", description="favorited | already_favorited")