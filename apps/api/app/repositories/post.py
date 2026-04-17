# Post Repository — SQLAlchemy 2.0 async 数据访问层

from typing import Optional, List, Tuple
from uuid import UUID
from datetime import datetime, timezone

from sqlalchemy import select, func, and_, or_, desc
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.content import Post, PostAsset, Tag, PostTagRelation


class PostRepository:
    """作品数据仓库，封装所有 Post / PostAsset / Tag 的数据库操作。"""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def find_all(
        self,
        filters: dict,
        limit: int = 20,
        cursor: Optional[str] = None,
    ) -> Tuple[List[Post], Optional[str]]:
        """
        分页获取作品列表。

        Args:
            filters: 筛选条件，支持:
                - status: 作品状态
                - tag: 标签 slug
                - author_id: 作者 ID
                - search: 搜索关键词
                - following_user_ids: 关注用户 ID 列表（用于关注流）
            limit: 每页数量
            cursor: 游标（published_at 的 ISO 字符串）

        Returns:
            (作品列表, 下一游标)
        """
        conditions = []

        # 状态筛选
        if filters.get("status"):
            conditions.append(Post.status == filters["status"])

        # 标签筛选
        if filters.get("tag"):
            tag_slug = filters["tag"]
            tag_subquery = (
                select(PostTagRelation.post_id)
                .join(Tag, Tag.id == PostTagRelation.tag_id)
                .where(Tag.slug == tag_slug)
            )
            conditions.append(Post.id.in_(tag_subquery))

        # 作者筛选
        if filters.get("author_id"):
            conditions.append(Post.author_user_id == filters["author_id"])

        # 搜索筛选 (title 和 excerpt 的模糊匹配)
        if filters.get("search"):
            search_term = f"%{filters['search']}%"
            conditions.append(
                or_(
                    Post.title.ilike(search_term),
                    Post.excerpt.ilike(search_term),
                )
            )

        # 关注流筛选
        if filters.get("following_user_ids"):
            following_ids = filters["following_user_ids"]
            if following_ids:
                conditions.append(Post.author_user_id.in_(following_ids))
            else:
                # 没有关注任何人，返回空
                return [], None

        # 排序
        sort = filters.get("sort", "latest")
        if sort == "latest":
            order_col = desc(Post.published_at)
        elif sort == "popular":
            order_col = desc(Post.like_count)
        elif sort == "trending":
            # trending = like_count 降序（简化实现）
            order_col = desc(Post.like_count)
        else:
            order_col = desc(Post.published_at)

        # Cursor 分页
        if cursor:
            try:
                cursor_dt = datetime.fromisoformat(cursor.replace("Z", "+00:00"))
                conditions.append(Post.published_at < cursor_dt)
            except ValueError:
                pass

        # 构建查询
        query = (
            select(Post)
            .where(and_(*conditions) if conditions else True)
            .options(selectinload(Post.cover_asset))
            .order_by(order_col)
            .limit(limit + 1)  # 多查一条判断 has_more
        )

        result = await self._session.execute(query)
        posts = list(result.scalars().all())

        # 判断是否有更多
        has_more = len(posts) > limit
        if has_more:
            posts = posts[:limit]

        next_cursor = None
        if posts and has_more:
            last_post = posts[-1]
            if last_post.published_at:
                next_cursor = last_post.published_at.isoformat()

        return posts, next_cursor

    async def find_by_id(self, post_id: UUID) -> Optional[Post]:
        """根据 ID 查找已发布作品。"""
        result = await self._session.execute(
            select(Post)
            .where(Post.id == post_id)
            .options(
                selectinload(Post.cover_asset),
                selectinload(Post.assets),
                selectinload(Post.tags),
            )
        )
        return result.scalar_one_or_none()

    async def find_by_slug(self, slug: str) -> Optional[Post]:
        """根据 slug 查找已发布作品。"""
        result = await self._session.execute(
            select(Post)
            .where(Post.slug == slug)
            .options(
                selectinload(Post.cover_asset),
                selectinload(Post.assets),
                selectinload(Post.tags),
            )
        )
        return result.scalar_one_or_none()

    async def get_total_count(self, filters: dict) -> int:
        """获取符合筛选条件的作品总数。"""
        conditions = []

        if filters.get("status"):
            conditions.append(Post.status == filters["status"])

        if filters.get("tag"):
            tag_slug = filters["tag"]
            tag_subquery = (
                select(PostTagRelation.post_id)
                .join(Tag, Tag.id == PostTagRelation.tag_id)
                .where(Tag.slug == tag_slug)
            )
            conditions.append(Post.id.in_(tag_subquery))

        if filters.get("author_id"):
            conditions.append(Post.author_user_id == filters["author_id"])

        if filters.get("search"):
            search_term = f"%{filters['search']}%"
            conditions.append(
                or_(
                    Post.title.ilike(search_term),
                    Post.excerpt.ilike(search_term),
                )
            )

        query = select(func.count(Post.id)).where(
            and_(*conditions) if conditions else True
        )
        result = await self._session.execute(query)
        return result.scalar() or 0


class TagRepository:
    """标签数据仓库。"""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def find_all(self) -> List[Tag]:
        """获取所有标签。"""
        result = await self._session.execute(
            select(Tag).order_by(Tag.name)
        )
        return list(result.scalars().all())

    async def find_by_slug(self, slug: str) -> Optional[Tag]:
        """根据 slug 查找标签。"""
        result = await self._session.execute(
            select(Tag).where(Tag.slug == slug)
        )
        return result.scalar_one_or_none()

    async def get_tags_with_post_count(self) -> List[dict]:
        """获取所有标签及其作品数量。"""
        query = (
            select(
                Tag,
                func.count(PostTagRelation.id).label("post_count"),
            )
            .outerjoin(PostTagRelation, Tag.id == PostTagRelation.tag_id)
            .group_by(Tag.id)
            .order_by(func.count(PostTagRelation.id).desc())
        )
        result = await self._session.execute(query)
        return [
            {"tag": tag, "post_count": count}
            for tag, count in result.all()
        ]
