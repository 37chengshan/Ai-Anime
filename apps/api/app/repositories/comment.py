# Comment Repository — SQLAlchemy 2.0 async 数据访问层

from typing import Optional, Tuple, List
from uuid import UUID

from sqlalchemy import select, delete, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.content import Comment, CommentLike


class CommentRepository:
    """评论数据仓库，封装所有 Comment / CommentLike 的数据库操作。"""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_by_id(self, comment_id: UUID) -> Optional[Comment]:
        """根据主键查找评论。"""
        result = await self._session.execute(
            select(Comment).where(Comment.id == comment_id)
        )
        return result.scalar_one_or_none()

    async def list_by_post(
        self,
        post_id: UUID,
        page: int,
        limit: int,
        sort: str,
    ) -> Tuple[List[Comment], int]:
        """
        根据作品 ID 获取评论列表。

        Args:
            post_id: 作品 ID
            page: 页码（从 1 开始）
            limit: 每页数量
            sort: 排序方式 (newest / oldest / popular)

        Returns:
            (评论列表, 总数)
        """
        # 构建基础查询
        query = select(Comment).where(
            Comment.post_id == post_id,
            Comment.status == "visible",
        )

        # 应用排序
        if sort == "newest":
            query = query.order_by(Comment.created_at.desc())
        elif sort == "oldest":
            query = query.order_by(Comment.created_at.asc())
        elif sort == "popular":
            # 需要通过 join 或子查询实现按点赞数排序
            # 暂时按 created_at desc 作为近似
            query = query.order_by(Comment.created_at.desc())

        # 获取总数
        count_query = select(func.count(Comment.id)).where(
            Comment.post_id == post_id,
            Comment.status == "visible",
        )
        count_result = await self._session.execute(count_query)
        total = count_result.scalar() or 0

        # 应用分页
        offset = (page - 1) * limit
        query = query.offset(offset).limit(limit)

        result = await self._session.execute(query)
        comments = list(result.scalars().all())

        return (comments, total)

    async def create(self, comment_data: dict) -> Comment:
        """创建新评论记录。"""
        comment = Comment(**comment_data)
        self._session.add(comment)
        await self._session.flush()
        await self._session.refresh(comment)
        return comment

    async def delete(self, comment_id: UUID) -> bool:
        """删除评论。返回是否成功。"""
        result = await self._session.execute(
            delete(Comment).where(Comment.id == comment_id)
        )
        await self._session.flush()
        return result.rowcount > 0

    async def get_like_count(self, comment_id: UUID) -> int:
        """获取评论的点赞数。"""
        result = await self._session.execute(
            select(func.count(CommentLike.id)).where(CommentLike.comment_id == comment_id)
        )
        return result.scalar() or 0

    async def add_like(self, comment_id: UUID, user_id: UUID) -> CommentLike:
        """为评论添加点赞。"""
        comment_like = CommentLike(comment_id=comment_id, user_id=user_id)
        self._session.add(comment_like)
        await self._session.flush()
        await self._session.refresh(comment_like)
        return comment_like

    async def remove_like(self, comment_id: UUID, user_id: UUID) -> bool:
        """移除评论点赞。返回是否成功。"""
        result = await self._session.execute(
            delete(CommentLike).where(
                CommentLike.comment_id == comment_id,
                CommentLike.user_id == user_id,
            )
        )
        await self._session.flush()
        return result.rowcount > 0

    async def is_liked(self, comment_id: UUID, user_id: UUID) -> bool:
        """检查用户是否已点赞评论。"""
        result = await self._session.execute(
            select(CommentLike).where(
                CommentLike.comment_id == comment_id,
                CommentLike.user_id == user_id,
            )
        )
        return result.scalar_one_or_none() is not None
