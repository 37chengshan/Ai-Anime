# Tags Router
# 标签相关 API

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.core.db import get_db
from app.services.post import TagService
from app.schemas.posts import TagResponse

router = APIRouter()


@router.get("", response_model=List[TagResponse])
async def list_tags(
    db: AsyncSession = Depends(get_db),
):
    """
    获取所有标签列表。

    Returns:
        标签列表
    """
    tag_service = TagService(db)
    return await tag_service.list_tags()
