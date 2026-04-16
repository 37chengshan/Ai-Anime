# Subscriptions Router
# 订阅相关 API

from fastapi import APIRouter, HTTPException, status, Query
from pydantic import BaseModel, Field
from typing import Optional, List
from uuid import UUID

router = APIRouter()


class PlanResponse(BaseModel):
    """套餐响应"""
    id: UUID
    name: str
    price: float
    currency: str
    interval: str
    ai_quota_monthly: int
    tutorial_access: bool
    features: List[str]


class CheckoutRequest(BaseModel):
    """创建 Checkout 请求"""
    plan_id: UUID
    success_url: Optional[str] = None
    cancel_url: Optional[str] = None


class CheckoutResponse(BaseModel):
    """Checkout 响应"""
    session_url: str
    session_id: str


class SubscriptionResponse(BaseModel):
    """订阅响应"""
    id: UUID
    plan: PlanResponse
    status: str
    current_period_start: Optional[str]
    current_period_end: Optional[str]
    cancel_at_period_end: bool


@router.get("/plans", response_model=List[PlanResponse])
async def list_plans():
    """获取所有可用套餐"""
    # TODO: 实现套餐列表查询
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Not implemented"
    )


@router.post("/checkout", response_model=CheckoutResponse)
async def create_checkout(request: CheckoutRequest):
    """
    创建 Stripe Checkout Session

    返回 Stripe Checkout URL
    """
    # TODO: 实现 Checkout 创建
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Not implemented"
    )


@router.get("/current", response_model=Optional[SubscriptionResponse])
async def get_current_subscription():
    """获取当前用户订阅"""
    # TODO: 实现订阅查询
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Not implemented"
    )


@router.post("/cancel")
async def cancel_subscription():
    """取消订阅（期末生效）"""
    # TODO: 实现订阅取消
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Not implemented"
    )


@router.post("/webhook")
async def stripe_webhook():
    """
    处理 Stripe Webhook 事件

    事件类型:
    - checkout.session.completed
    - customer.subscription.created
    - customer.subscription.updated
    - customer.subscription.deleted
    - invoice.paid
    - invoice.payment_failed
    """
    # TODO: 实现 Webhook 处理
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Not implemented"
    )