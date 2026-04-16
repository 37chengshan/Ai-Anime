# Common Schemas
# 通用响应模型

from typing import Generic, TypeVar, Optional, List
from pydantic import BaseModel, Field

T = TypeVar("T")


class PaginationParams(BaseModel):
    """分页参数"""
    page: int = Field(default=1, ge=1, description="页码")
    limit: int = Field(default=20, ge=1, le=100, description="每页数量")
    cursor: Optional[str] = Field(default=None, description="游标（用于无限滚动）")


class PaginatedResponse(BaseModel, Generic[T]):
    """分页响应"""
    items: List[T]
    total: int = Field(description="总数")
    page: int = Field(description="当前页")
    limit: int = Field(description="每页数量")
    has_more: bool = Field(description="是否有更多")
    next_cursor: Optional[str] = Field(default=None, description="下一页游标")


class ErrorResponse(BaseModel):
    """错误响应"""
    error: str = Field(description="错误类型")
    message: str = Field(description="错误消息")
    detail: Optional[dict] = Field(default=None, description="详细错误信息")