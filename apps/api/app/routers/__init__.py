# Routers Package
# API 路由模块

from app.routers.auth import router as auth_router
from app.routers.users import router as users_router
from app.routers.posts import router as posts_router
from app.routers.comments import router as comments_router
from app.routers.uploads import router as uploads_router
from app.routers.ai import router as ai_router
from app.routers.subscriptions import router as subscriptions_router

__all__ = [
    "auth_router",
    "users_router",
    "posts_router",
    "comments_router",
    "uploads_router",
    "ai_router",
    "subscriptions_router",
]