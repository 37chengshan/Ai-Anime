# Billing Domain Models
# 订阅、权益、支付、配额相关模型

from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, Integer, Numeric
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
import uuid

from app.core.db import Base


class SubscriptionPlan(Base):
    """订阅套餐配置"""
    __tablename__ = "subscription_plans"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(64), unique=True, nullable=False)  # basic_monthly, pro_monthly, etc.
    stripe_product_id = Column(String(128), unique=True, nullable=False)
    stripe_price_id = Column(String(128), unique=True, nullable=False)
    price = Column(Numeric(10, 2), nullable=False)  # 月费金额
    currency = Column(String(8), default="usd")
    interval = Column(String(16), default="month")  # month / year
    ai_quota_monthly = Column(Integer, default=0)  # 每月 AI 额度
    tutorial_access = Column(Boolean, default=False)  # 是否可访问付费教程
    features = Column(JSONB, default=list)  # 功能列表
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class Subscription(Base):
    """用户订阅"""
    __tablename__ = "subscriptions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    plan_id = Column(UUID(as_uuid=True), ForeignKey("subscription_plans.id"), nullable=False)
    stripe_subscription_id = Column(String(128), unique=True, nullable=True)
    stripe_customer_id = Column(String(128), nullable=True)
    status = Column(String(32), default="active")  # trialing / active / past_due / canceled / unpaid / expired
    current_period_start = Column(DateTime(timezone=True))
    current_period_end = Column(DateTime(timezone=True))
    cancel_at_period_end = Column(Boolean, default=False)
    canceled_at = Column(DateTime(timezone=True))
    trial_end = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class Entitlement(Base):
    """用户权益记录"""
    __tablename__ = "entitlements"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    subscription_id = Column(UUID(as_uuid=True), ForeignKey("subscriptions.id"))
    entitlement_type = Column(String(64), nullable=False)  # tutorial.member, ai.quota, etc.
    value = Column(JSONB, default=dict)  # 权益值（如配额数量）
    is_active = Column(Boolean, default=True)
    expires_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class PaymentEvent(Base):
    """支付事件日志（Stripe Webhook）"""
    __tablename__ = "payment_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    stripe_event_id = Column(String(128), unique=True, nullable=False)
    event_type = Column(String(64), nullable=False)  # invoice.paid, customer.subscription.updated, etc.
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    subscription_id = Column(UUID(as_uuid=True), ForeignKey("subscriptions.id"))
    payload = Column(JSONB, nullable=False)  # 原始事件数据
    processed = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class QuotaAccount(Base):
    """用户配额账户"""
    __tablename__ = "quota_accounts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False)
    balance = Column(Integer, default=0)  # 当前余额
    monthly_grant = Column(Integer, default=0)  # 每月发放额度
    last_grant_at = Column(DateTime(timezone=True))  # 上次发放时间
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class QuotaTransaction(Base):
    """配额交易记录"""
    __tablename__ = "quota_transactions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    account_id = Column(UUID(as_uuid=True), ForeignKey("quota_accounts.id"), nullable=False)
    amount = Column(Integer, nullable=False)  # 正数为增加，负数为扣减
    transaction_type = Column(String(32), nullable=False)  # grant / consume / refund / reset
    scene = Column(String(64))  # ai.write_post / ai.write_comment / ai.site_search / monthly_grant
    reference_id = Column(UUID(as_uuid=True))  # 关联的 AI 会话 ID 或订阅 ID
    balance_after = Column(Integer, nullable=False)  # 交易后余额
    created_at = Column(DateTime(timezone=True), server_default=func.now())