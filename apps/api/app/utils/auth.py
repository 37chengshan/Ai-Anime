# Auth Utils
# Clerk 认证相关工具函数

import json
import hmac
import hashlib
from typing import Optional
from datetime import datetime

from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.config import settings

# Bearer token security scheme
security = HTTPBearer(auto_error=False)


async def get_current_user_id(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> str:
    """
    从请求头获取 Clerk 用户 ID。

    在生产环境中，应该验证 JWT token 并从中提取用户 ID。
    这里简化处理，假设前端已经通过 Clerk 认证，
    token 中包含用户信息。

    Args:
        credentials: Bearer token

    Returns:
        Clerk 用户 ID

    Raises:
        HTTPException: 未认证时抛出 401
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials

    # TODO: 在生产环境中验证 JWT token
    # 这里简化处理，假设 token 就是 clerk_user_id
    # 实际应该解析 JWT 并验证签名
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return token


async def get_optional_user_id(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> Optional[str]:
    """
    可选的用户 ID 获取，用于公开接口。

    Args:
        credentials: Bearer token

    Returns:
        Clerk 用户 ID 或 None
    """
    if not credentials:
        return None
    return credentials.credentials


async def verify_clerk_webhook(
    request: Request,
    svix_id: Optional[str] = None,
    svix_timestamp: Optional[str] = None,
    svix_signature: Optional[str] = None,
) -> bool:
    """
    验证 Clerk Webhook 签名。

    Clerk 使用 Svix 发送 webhook，需要验证签名以确保请求来自 Clerk。

    Args:
        request: FastAPI 请求对象
        svix_id: Svix 消息 ID (来自 header)
        svix_timestamp: Svix 时间戳 (来自 header)
        svix_signature: Svix 签名 (来自 header)

    Returns:
        验证是否通过

    Note:
        当前为简化实现，生产环境需要完整的签名验证。
    """
    # TODO: 实现完整的 Svix 签名验证
    # 参考: https://docs.svix.com/receiving/verifying-payloads/how
    #
    # 简化实现：如果有 CLERK_SECRET_KEY 则认为有效
    if settings.CLERK_SECRET_KEY:
        return True
    return True  # 开发环境跳过验证


def extract_clerk_user_data(data: dict) -> dict:
    """
    从 Clerk webhook data 中提取用户信息。

    Args:
        data: Clerk webhook data 字段

    Returns:
        包含 email, username, clerk_user_id 的字典
    """
    clerk_user_id = data.get("id", "")
    email_addresses = data.get("email_addresses", [])
    primary_email_id = data.get("primary_email_address_id", "")

    # 查找主邮箱
    email = ""
    for email_obj in email_addresses:
        if email_obj.get("id") == primary_email_id:
            email = email_obj.get("email_address", "")
            break

    # 如果没找到主邮箱，使用第一个
    if not email and email_addresses:
        email = email_addresses[0].get("email_address", "")

    # 用户名优先使用 username，其次使用 email 前缀
    username = data.get("username") or ""
    if not username and email:
        username = email.split("@")[0]

    # 确保用户名有效
    if not username:
        username = f"user_{clerk_user_id[:8]}"

    return {
        "clerk_user_id": clerk_user_id,
        "email": email,
        "username": username,
    }
