# 队列故障恢复指南

## 常见问题

### 队列积压

1. 检查 Worker 进程是否运行
2. 检查 Redis 内存是否足够
3. 检查任务执行时间是否异常

### 任务失败

1. 查看 Celery Flower 面板：http://localhost:5555
2. 检查失败任务日志
3. 确认重试次数未超限

### 死信队列

超过重试上限的任务进入死信队列，需要手动处理。

## 恢复步骤

### 1. 重启 Worker

```bash
# 停止 Worker
pkill -f "celery.*worker"

# 启动 Worker
cd apps/worker
celery -A worker.main worker --loglevel=info
```

### 2. 重试失败任务

```bash
# 通过 Celery 命令重试
celery -A worker.main purge  # 清空队列（谨慎使用）

# 或通过 API 重试特定任务
curl -X POST http://localhost:8000/api/v1/admin/tasks/{task_id}/retry
```

### 3. 检查队列状态

```bash
# 查看队列长度
redis-cli LLEN celery

# 查看队列内容
redis-cli LRANGE celery 0 10
```

## 关键任务

| 任务 | 队列 | 重试 | 超时 |
|------|------|------|------|
| asset_processing | default | 3 | 60s |
| generate_thumbnail | default | 3 | 30s |
| run_content_safety | moderation | 5 | 120s |
| build_embeddings | ai | 3 | 300s |
| refresh_search_docs | search | 3 | 60s |
| sync_subscription_state | billing | 5 | 30s |
| cleanup_temp_uploads | maintenance | 1 | 120s |
