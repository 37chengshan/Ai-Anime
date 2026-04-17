from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

try:
    import sentry_sdk
    SENTRY_AVAILABLE = True
except ImportError:
    SENTRY_AVAILABLE = False

from app.core.config import settings
from app.core.logger import setup_logging

setup_logging()

if SENTRY_AVAILABLE and settings.SENTRY_DSN:
    sentry_sdk.init(
        dsn=settings.SENTRY_DSN,
        traces_sample_rate=0.1,
        profiles_sample_rate=0.1,
    )

app = FastAPI(
    title="AI 动漫社区 API",
    description="AI 动漫社区核心服务 API",
    version="0.1.0",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
from app.routers import (
    auth_router,
    users_router,
    me_router,
    creator_router,
    posts_router,
    comments_router,
    uploads_router,
    ai_router,
    subscriptions_router,
    tags_router,
)

app.include_router(auth_router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(me_router, prefix="/api/v1", tags=["me"])
app.include_router(users_router, prefix="/api/v1/users", tags=["users"])
app.include_router(creator_router, prefix="/api/v1/creators", tags=["creators"])
app.include_router(posts_router, prefix="/api/v1/posts", tags=["posts"])
app.include_router(comments_router, prefix="/api/v1", tags=["comments"])
app.include_router(uploads_router, prefix="/api/v1/uploads", tags=["uploads"])
app.include_router(ai_router, prefix="/api/v1/ai", tags=["ai"])
app.include_router(subscriptions_router, prefix="/api/v1/subscriptions", tags=["subscriptions"])
app.include_router(tags_router, prefix="/api/v1/tags", tags=["tags"])


@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "0.1.0"}