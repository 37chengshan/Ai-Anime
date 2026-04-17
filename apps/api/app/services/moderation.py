# Basic Moderation Service
# Phase 1.5 - Simplified moderation for MVP

from enum import Enum
from uuid import UUID
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class ModerationAction(str, Enum):
    PASS = "pass"
    FLAG = "flag"
    REJECT = "reject"


async def process_post_moderation(post_id: UUID) -> ModerationAction:
    """
    Placeholder moderation task for newly created posts.

    In Phase 4 this will call actual content moderation APIs.
    For now, auto-passes all content as published.

    Args:
        post_id: The post UUID to moderate

    Returns:
        ModerationAction indicating the result
    """
    logger.info(f"[MODERATION] Processing post {post_id}")

    # TODO (Phase 4): Integrate actual moderation API
    # - Check for prohibited content
    # - Run AI-based content classification
    # - Apply community rules

    # Placeholder: auto-pass all content for MVP
    return ModerationAction.PASS


async def flag_content(post_id: UUID, reason: str) -> None:
    """
    Mark content as flagged for manual review.

    Args:
        post_id: The post UUID to flag
        reason: Reason for flagging
    """
    logger.warning(f"[MODERATION] Content {post_id} flagged: {reason}")
    # TODO (Phase 4): Update post status to flagged in DB
    pass


# ---------------------------------------------------------------------------
# Worker Placeholder Tasks (Phase 4)
# ---------------------------------------------------------------------------
#
# The following tasks are TODO placeholders for Phase 4 moderation worker:
#
# 1. async def scheduled_moderation_batch():
#    - Runs every N minutes via cron
#    - Fetches posts with status='processing'
#    - Calls process_post_moderation() for each
#    - Updates status to 'published' or 'flagged'
#
# 2. async def cleanup_orphaned_assets():
#    - Runs daily
#    - Finds PostAssets with status='uploaded' older than 24h
#    - Marks as 'failed' and schedules cleanup
#
# 3. async def auto_expire_drafts():
#    - Runs weekly
#    - Marks drafts older than 90 days as 'archived'
#
# See EP-005 for Phase 4 full moderation system implementation.
