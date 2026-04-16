from celery import Celery
import os

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

app = Celery(
    "ai_anime_worker",
    broker=REDIS_URL,
    backend=REDIS_URL,
    include=[
        "worker.tasks.asset_processing",
        "worker.tasks.generate_thumbnail",
        "worker.tasks.run_content_safety",
        "worker.tasks.build_embeddings",
        "worker.tasks.refresh_search_docs",
        "worker.tasks.sync_subscription_state",
        "worker.tasks.cleanup_temp_uploads",
    ],
)

app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Shanghai",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=30 * 60,  # 30 minutes
    task_soft_time_limit=25 * 60,  # 25 minutes
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=1000,
)

# Queue configuration
app.conf.task_queues = {
    "default": {
        "exchange": "default",
        "routing_key": "default",
    },
    "moderation": {
        "exchange": "moderation",
        "routing_key": "moderation",
    },
    "ai": {
        "exchange": "ai",
        "routing_key": "ai",
    },
    "search": {
        "exchange": "search",
        "routing_key": "search",
    },
    "billing": {
        "exchange": "billing",
        "routing_key": "billing",
    },
    "maintenance": {
        "exchange": "maintenance",
        "routing_key": "maintenance",
    },
}