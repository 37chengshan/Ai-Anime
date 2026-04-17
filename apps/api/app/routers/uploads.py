# Uploads Router
# 文件上传相关 API

import boto3
from botocore.config import Config
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID

from app.core.config import settings
from app.core.db import get_db
from app.models.content import PostAsset
from app.utils.auth import get_current_user_id

router = APIRouter()


class UploadSignRequest(BaseModel):
    """上传签名请求"""
    filename: str = Field(..., min_length=1, max_length=255)
    content_type: str = Field(..., pattern=r"^image/(jpeg|png|webp|gif)$")
    size_bytes: int = Field(..., gt=0, le=20 * 1024 * 1024)  # 最大 20MB


class UploadSignResponse(BaseModel):
    """上传签名响应"""
    signed_url: str
    asset_id: UUID
    object_key: str


class UploadCompleteRequest(BaseModel):
    """上传完成确认"""
    asset_id: UUID


class UploadCompleteResponse(BaseModel):
    """上传完成响应"""
    asset_id: UUID
    status: str


def get_r2_client():
    """创建 R2/S3 客户端"""
    return boto3.client(
        "s3",
        endpoint_url=settings.R2_ENDPOINT,
        aws_access_key_id=settings.R2_ACCESS_KEY,
        aws_secret_access_key=settings.R2_SECRET_KEY,
        config=Config(signature_version="s3v4"),
    )


@router.post("/sign", response_model=UploadSignResponse)
async def sign_upload(
    request: UploadSignRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """
    获取上传签名 URL

    流程:
    1. 客户端请求签名 URL
    2. 客户端直传 S3/R2
    3. 客户端调用 /complete 确认上传
    """
    asset_id = uuid4()
    object_key = f"uploads/{asset_id}/{request.filename}"

    s3 = get_r2_client()
    signed_url = s3.generate_presigned_url(
        ClientMethod="put_object",
        Params={
            "Bucket": settings.R2_BUCKET,
            "Key": object_key,
            "ContentType": request.content_type,
        },
        ExpiresIn=3600,
    )

    post_asset = PostAsset(
        id=asset_id,
        uploader_user_id=UUID(user_id),
        bucket=settings.R2_BUCKET,
        object_key=object_key,
        mime_type=request.content_type,
        size_bytes=request.size_bytes,
        status="pending",
    )
    db.add(post_asset)
    await db.commit()

    return UploadSignResponse(
        signed_url=signed_url,
        asset_id=asset_id,
        object_key=object_key,
    )


@router.post("/complete", response_model=UploadCompleteResponse)
async def complete_upload(
    request: UploadCompleteRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    确认上传完成

    更新资源状态为 uploaded
    """
    result = await db.execute(
        select(PostAsset).where(PostAsset.id == request.asset_id)
    )
    post_asset = result.scalar_one_or_none()

    if not post_asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asset not found",
        )

    post_asset.status = "uploaded"
    await db.commit()

    return UploadCompleteResponse(
        asset_id=request.asset_id,
        status="uploaded",
    )
