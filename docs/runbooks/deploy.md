# 部署指南

## 部署架构

```
┌─────────────────────────────────────────────────────────┐
│                    Cloudflare / CDN                       │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│                  Vercel (apps/web)                        │
│  Next.js SSR + ISR + Edge Functions                     │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│              Railway / Render (apps/api)                  │
│  FastAPI + Celery Worker                                 │
└──────────────────────────┬──────────────────────────────┘
                           │
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│   Supabase      │ │   Upstash      │ │   Cloudflare    │
│  (PostgreSQL)   │ │   (Redis)      │ │   R2 (Storage)  │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

## 部署流程

### Web (Vercel)

1. 连接 GitHub 仓库
2. 设置 Root Directory: `apps/web`
3. 配置环境变量
4. 自动部署：push to main → production，PR → preview

### API (Railway/Render)

1. 连接 GitHub 仓库
2. 设置 Root Directory: `apps/api`
3. 配置 Dockerfile
4. 配置环境变量

### Worker

1. 与 API 共享同一服务
2. 启动命令：`celery -A worker.main worker`

## 环境配置

### Staging

- 用于测试和预览
- 使用测试 Stripe 密钥
- 使用测试 Clerk 实例

### Production

- 正式环境
- 使用生产 Stripe 密钥
- 使用生产 Clerk 实例
- 启用 Sentry 和 PostHog

## 回滚

### Vercel

```bash
vercel rollback
```

### Railway

```bash
railway rollback
```
