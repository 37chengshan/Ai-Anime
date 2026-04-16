# AI Router
# AI 功能相关 API

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID

router = APIRouter()


class AIWritePostRequest(BaseModel):
    """AI 生成作品描述请求"""
    prompt: str = Field(..., min_length=10, max_length=1000)
    context: Optional[str] = Field(default=None, max_length=500)


class AIWriteCommentRequest(BaseModel):
    """AI 生成评论请求"""
    post_id: UUID
    prompt: Optional[str] = Field(default=None, max_length=500)


class AISiteSearchRequest(BaseModel):
    """AI 站内搜索请求"""
    query: str = Field(..., min_length=1, max_length=500)
    context: Optional[str] = Field(default=None, max_length=1000)


class AIResponse(BaseModel):
    """AI 响应"""
    content: str
    tokens_used: int
    remaining_quota: int


@router.post("/write-post", response_model=AIResponse)
async def ai_write_post(request: AIWritePostRequest):
    """
    AI 生成作品描述

    配额扣减: ai.write_post
    """
    # TODO: 实现 AI 生成
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Not implemented"
    )


@router.post("/write-comment", response_model=AIResponse)
async def ai_write_comment(request: AIWriteCommentRequest):
    """
    AI 生成评论

    配额扣减: ai.write_comment
    """
    # TODO: 实现 AI 生成
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Not implemented"
    )


@router.post("/site-search", response_model=AIResponse)
async def ai_site_search(request: AISiteSearchRequest):
    """
    AI 站内搜索问答

    配额扣减: ai.site_search
    """
    # TODO: 实现 AI 搜索
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Not implemented"
    )


@router.get("/quota")
async def get_ai_quota():
    """获取当前用户 AI 配额"""
    # TODO: 实现配额查询
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Not implemented"
    )