import logging
import sys

try:
    from loguru import logger
    LOGURU_AVAILABLE = True
except ImportError:
    LOGURU_AVAILABLE = False
    logger = logging.getLogger(__name__)


class InterceptHandler(logging.Handler):
    def emit(self, record: logging.LogRecord) -> None:
        if not LOGURU_AVAILABLE:
            return
        try:
            level = logger.level(record.levelname).name
        except ValueError:
            level = record.levelno

        frame, depth = logging.currentframe(), 2
        while frame.f_code.co_filename == logging.__file__:
            frame = frame.f_back
            depth += 1

        logger.opt(depth=depth, exception=record.exc_info).log(level, record.getMessage())


def setup_logging() -> None:
    logging.basicConfig(handlers=[InterceptHandler()], level=logging.INFO)

    if LOGURU_AVAILABLE:
        logger.configure(
            handlers=[
                {
                    "sink": sys.stdout,
                    "level": logging.INFO,
                    "format": "<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
                }
            ]
        )