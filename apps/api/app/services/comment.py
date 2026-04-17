# Comment Service — 评论区业务逻辑层

from typing import Optional, Tuple, List
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.content import Comment, Post
from app.models.users import User
from app.repositories.comment import CommentRepository
from app.repositories.user import UserRepository


class CommentService:
    """评论服务层，处理评论相关的业务逻辑。"""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session
        self._repo = CommentRepository(session)
        self._user_repo = UserRepository(session)

    async def get_comments(
        self,
        post_id: UUID,
        page: int,
        limit: int,
        sort: str,
        current_user_id: Optional[UUID],
    ) -> Tuple[List[dict], int]:
        """
        获取作品评论列表。

        Args:
            post_id: 作品 ID
            page: 页码
            limit: 每页数量
            sort: 排序方式
            current_user_id: 当前用户 ID（可选）

        Returns:
            (评论字典列表, 总数)
        """
        comments, total = await self._repo.list_by_post(post_id, page, limit, sort)

        comment_dicts = []
        for comment in comments:
            # 获取作者信息
            author = await self._user_repo.get_by_id(comment.author_user_id)
            author_info = {
                "id": str(author.id) if author else str(comment.author_user_id),
                "username": author.username if author else "",
                "display_name": getattr(author, "display_name", None) if author else None,
                "avatar_url": getattr(author, "avatar_url", None) if author else None,
            }

            # 检查是否点赞
            is_liked = False
            if current_user_id:
                is_liked = await self._repo.is_liked(comment.id, current_user_id)

            comment_dicts.append({
                "id": comment.id,
                "post_id": comment.post_id,
                "author": author_info,
                "parent_comment_id": comment.parent_comment_id,
                "content": comment.content,
                "status": comment.status,
                "ai_assisted": comment.ai_assisted,
                "like_count": comment.like_count or 0,
                "is_liked": is_liked,
                "is_own": current_user_id == comment.author_user_id if current_user_id else False,
                "created_at": comment.created_at,
                "updated_at": comment.updated_at,
            })

        return (comment_dicts, total)

    async def create_comment(
        self,
        post_id: UUID,
        author_user_id: UUID,
        content: str,
        parent_comment_id: Optional[UUID],
        ai_assisted: bool,
    ) -> Comment:
        """
        创建评论。

        Args:
            post_id: 作品 ID
            author_user_id: 作者用户 ID
            content: 评论内容
            parent_comment_id: 父评论 ID（可选）
            ai_assisted: 是否 AI 辅助

        Returns:
            创建的评论
        """
        comment_data = {
            "post_id": post_id,
            "author_user_id": author_user_id,
            "content": content,
            "parent_comment_id": parent_comment_id,
            "ai_assisted": ai_assisted,
        }
        comment = await self._repo.create(comment_data)

        # 增加作品的评论数
        result = await self._session.execute(
            select(Post).where(Post.id == post_id)
        )
        post = result.scalar_one_or_none()
        if post:
            post.comment_count = (post.comment_count or 0) + 1
            await self._session.flush()

        return comment

    async def delete_comment(self, comment_id: UUID, user_id: UUID) -> bool:
        """
        删除评论。

        Args:
            comment_id: 评论 ID
            user_id: 用户 ID（用于验证所有权）

        Returns:
            是否成功

        Raises:
            ValueError: 评论不存在或用户无权删除
        """
        comment = await self._repo.get_by_id(comment_id)
        if not comment:
            raise ValueError("Comment not found")

        if comment.author_user_id != user_id:
            raise ValueError("Not authorized to delete this comment")

        # 获取作品以减少评论数
        result = await self._session.execute(
            select(Post).where(Post.id == comment.post_id)
        )
        post = result.scalar_one_or_none()

        success = await self._repo.delete(comment_id)

        if success and post:
            post.comment_count = max(0, (post.comment_count or 0) - 1)
            await self._session.flush()

        return success

    async def like_comment(self, comment_id: UUID, user_id: UUID):
        """
        点赞评论。

        Args:
            comment_id: 评论 ID
            user_id: 用户 ID

        Returns:
            CommentLike

        Raises:
            ValueError: 评论不存在
        """
        comment = await self._repo.get_by_id(comment_id)
        if not comment:
            raise ValueError("Comment not found")

        # 增加评论的点赞数
        comment.like_count = (comment.like_count or 0) + 1
        await self._session.flush()

        return await self._repo.add_like(comment_id, user_id)

    async def unlike_comment(self, comment_id: UUID, user_id: UUID) -> bool:
        """
        取消点赞评论。

        Args:
            comment_id: 评论 ID
            user_id: 用户 ID

        Returns:
            是否成功
        """
        success = await self._repo.remove_like(comment_id, user_id)

        if success:
            # 减少评论的点赞数
            comment = await self._repo.get_by_id(comment_id)
            if comment:
                comment.like_count = max(0, (comment.like_count or 0) - 1)
                await self._session.flush()

        return success
