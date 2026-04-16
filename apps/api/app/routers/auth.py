# Auth Router
# 认证相关 API

from fastapi import APIRouter, Depends, HTTPException, status, Request, Header
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.services.user import UserService
from app.utils.auth import verify_clerk_webhook, extract_clerk_user_data
from app.schemas.common import ErrorResponse

router = APIRouter()


class ClerkWebhookPayload(BaseModel):
    """Clerk Webhook 载荷"""
    data: dict
    object: str
    type: str


@router.post(
    "/webhook",
    summary="Clerk Webhook 接收端点",
    description="接收 Clerk 用户事件并同步到本地数据库",
    responses={
        200: {"description": "Webhook 处理成功"},
        400: {"model": ErrorResponse, "description": "无效请求"},
        401: {"model": ErrorResponse, "description": "签名验证失败"},
    },
)
async def clerk_webhook(
    payload: ClerkWebhookPayload,
    request: Request,
    svix_id: Optional[str] = Header(None, alias="svix-id"),
    svix_timestamp: Optional[str] = Header(None, alias="svix-timestamp"),
    svix_signature: Optional[str] = Header(None, alias="svix-signature"),
    db: AsyncSession = Depends(get_db),
):
    """
    处理 Clerk Webhook 事件

    事件类型:
    - user.created: 创建用户
    - user.updated: 更新用户
    - user.deleted: 删除用户
    """
    # 验证 webhook 签名
    is_valid = await verify_clerk_webhook(
        request,
        svix_id=svix_id,
        svix_timestamp=svix_timestamp,
        svix_signature=svix_signature,
    )
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid webhook signature",
        )

    # 只处理用户事件
    if not payload.type.startswith("user."):
        return {"status": "ignored", "type": payload.type}

    # 提取用户数据
    user_data = extract_clerk_user_data(payload.data)
    clerk_user_id = user_data["clerk_user_id"]
    email = user_data["email"]
    username = user_data["username"]

    # 同步用户
    user_service = UserService(db)
    try:
        user = await user_service.sync_from_clerk(
            clerk_user_id=clerk_user_id,
            email=email,
            username=username,
            event_type=payload.type,
        )
        await db.commit()

        return {
            "status": "success",
            "type": payload.type,
            "user_id": str(user.id) if user else None,
        }
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to sync user: {str(e)}",
        )
