# Post Schemas
# 作品相关 Pydantic 模型

from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field
from uuid import UUID


class PostBase(BaseModel):
    """作品基础模型"""
    title: str = Field(..., min_length=1, max_length=200)
    content: Optional[str] = Field(default=None)
    excerpt: Optional[str] = Field(default=None, max_length=500)
    visibility: str = Field(default="public", pattern="^(public|followers|private)$")


class PostCreate(PostBase):
    """创建作品请求"""
    cover_asset_id: Optional[UUID] = None
    asset_ids: List[UUID] = Field(default_factory=list)
    tag_ids: List[UUID] = Field(default_factory=list)
    ai_assisted: bool = Field(default=False)


class PostUpdate(BaseModel):
    """更新作品请求"""
    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    content: Optional[str] = None
    excerpt: Optional[str] = Field(default=None, max_length=500)
    visibility: Optional[str] = Field(default=None, pattern="^(public|followers|private)$")
    cover_asset_id: Optional[UUID] = None
    asset_ids: Optional[List[UUID]] = None
    tag_ids: Optional[List[UUID]] = None


class PostAuthorResponse(BaseModel):
    """作品作者响应"""
    id: UUID
    username: str
    display_name: Optional[str]
    avatar_url: Optional[str]
    creator_badge: bool = False


class PostAssetResponse(BaseModel):
    """作品资源响应"""
    id: UUID
    kind: str
    url: str
    width: Optional[int]
    height: Optional[int]
    mime_type: Optional[str]


class TagResponse(BaseModel):
    """标签响应"""
    id: UUID
    name: str
    slug: str


class PostResponse(BaseModel):
    """作品响应"""
    id: UUID
    author: PostAuthorResponse
    title: str
    slug: Optional[str]
    content: Optional[str]
    excerpt: Optional[str]
    visibility: str
    status: str
    cover_asset: Optional[PostAssetResponse]
    assets: List[PostAssetResponse] = Field(default_factory=list)
    tags: List[TagResponse] = Field(default_factory=list)
    ai_assisted: bool
    like_count: int
    favorite_count: int
    comment_count: int
    is_liked: bool = False
    is_favorited: bool = False
    published_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PostListResponse(BaseModel):
    """作品列表响应"""
    id: UUID
    author: PostAuthorResponse
    title: str
    slug: Optional[str]
    excerpt: Optional[str]
    cover_url: Optional[str]
    tags: List[TagResponse] = Field(default_factory=list)
    like_count: int
    favorite_count: int
    comment_count: int
    is_liked: bool = False
    is_favorited: bool = False
    published_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True