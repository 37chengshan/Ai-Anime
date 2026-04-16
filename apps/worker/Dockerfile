# AI 动漫社区 Celery Worker
FROM python:3.11-slim

WORKDIR /app

# 安装系统依赖
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# 安装 Poetry
RUN pip install poetry

# 复制依赖文件
COPY pyproject.toml ./

# 安装依赖 (不安装开发依赖)
RUN poetry config virtualenvs.create false \
    && poetry install --no-dev --no-interaction --no-ansi

# 复制应用代码
COPY worker ./worker

# 创建非 root 用户
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# 启动命令
CMD ["celery", "-A", "worker.main", "worker", "--loglevel=info"]
