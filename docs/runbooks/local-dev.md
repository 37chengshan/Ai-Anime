# 本地开发指南

## 前置条件

- Node.js >= 20.0.0
- pnpm >= 9.0.0
- Python >= 3.11
- Docker & Docker Compose
- PostgreSQL >= 15
- Redis >= 7

## 快速开始

### 1. 克隆仓库

```bash
git clone <repo-url>
cd ai-anime-community
```

### 2. 安装依赖

```bash
# 前端依赖
pnpm install

# 后端依赖
cd apps/api
pip install -e ".[dev]"
```

### 3. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 填入实际值
```

### 4. 启动基础设施

```bash
docker compose up -d postgres redis
```

### 5. 初始化数据库

```bash
cd apps/api
alembic upgrade head
```

### 6. 启动开发服务器

```bash
# 在项目根目录
pnpm dev:all
```

## 服务端口

| 服务 | 端口 | URL |
|------|------|-----|
| Web (Next.js) | 3000 | http://localhost:3000 |
| API (FastAPI) | 8000 | http://localhost:8000 |
| PostgreSQL | 5432 | localhost:5432 |
| Redis | 6379 | localhost:6379 |
| Celery Flower | 5555 | http://localhost:5555 |

## 常用命令

```bash
# 启动单个服务
pnpm dev:web     # 只启动 Web
pnpm dev:api     # 只启动 API

# 数据库操作
pnpm db:migrate  # 创建 migration
pnpm db:upgrade  # 执行 migration

# 代码检查
pnpm lint        # ESLint + ruff
pnpm format      # Prettier + ruff format

# 测试
pnpm test        # 运行所有测试
```

## 环境变量说明

详见 `.env.example` 文件。

### 必需变量

- `DATABASE_URL` - PostgreSQL 连接字符串
- `REDIS_URL` - Redis 连接字符串
- `CLERK_SECRET_KEY` - Clerk 服务端密钥
- `CLERK_PUBLISHABLE_KEY` - Clerk 客户端密钥
- `STRIPE_SECRET_KEY` - Stripe 服务端密钥
- `STRIPE_WEBHOOK_SECRET` - Stripe Webhook 签名密钥

### 可选变量

- `SENTRY_DSN` - Sentry DSN
- `POSTHOG_KEY` - PostHog API Key
- `R2_ACCESS_KEY` - Cloudflare R2 Access Key
- `R2_SECRET_KEY` - Cloudflare R2 Secret Key
- `R2_BUCKET` - Cloudflare R2 Bucket
- `OPENAI_API_KEY` - OpenAI API Key
