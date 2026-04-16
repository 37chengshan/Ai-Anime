# Auth Router
# 认证相关 API

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

router = APIRouter()


class ClerkWebhookPayload(BaseModel):
    """Clerk Webhook 载荷"""
    data: dict
    object: str
    type: str


@router.post("/webhook")
async def clerk_webhook(payload: ClerkWebhookPayload):
    """
    处理 Clerk Webhook 事件

    事件类型:
    - user.created: 创建用户
    - user.updated: 更新用户
    - user.deleted: 删除用户
    """
    # TODO: 实现用户数据同步
    # 1. 验证 webhook 签名
    # 2. 根据事件类型处理
    # 3. 同步到本地数据库
    return {"status": "received", "type": payload.type}


@router.get("/me")
async def get_current_user():
    """获取当前登录用户信息"""
    # TODO: 从 Clerk session 获取用户
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Not implemented"
    )