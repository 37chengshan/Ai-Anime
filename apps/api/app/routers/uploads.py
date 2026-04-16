# Uploads Router
# 文件上传相关 API

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from uuid import UUID

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


@router.post("/sign", response_model=UploadSignResponse)
async def sign_upload(request: UploadSignRequest):
    """
    获取上传签名 URL

    流程:
    1. 客户端请求签名 URL
    2. 客户端直传 S3/R2
    3. 客户端调用 /complete 确认上传
    """
    # TODO: 实现签名 URL 生成
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Not implemented"
    )


@router.post("/complete", response_model=UploadCompleteResponse)
async def complete_upload(request: UploadCompleteRequest):
    """
    确认上传完成

    更新资源状态为 uploaded
    """
    # TODO: 实现上传完成确认
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Not implemented"
    )