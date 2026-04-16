# AI 动漫社区项目

AI 动漫社区是一个复合型平台：创作者发布 AI 动漫/漫画作品，用户浏览互动，平台提供 AI 辅助功能和会员订阅服务。

## 快速开始

```bash
# 安装依赖
pnpm install

# 启动开发环境
pnpm dev

# 启动所有服务
pnpm dev:all
```

## 目录结构

```
├── apps/                   # 运行体
│   ├── web/               # Next.js 主站（前台 + BFF）
│   ├── api/               # FastAPI 核心服务（AI/业务 API）
│   └── worker/            # Celery worker，处理异步任务
├── packages/              # 共享能力
│   ├── ui/                # 共享 UI 组件
│   ├── sdk/               # TS API SDK
│   ├── contracts/         # DTO / 类型 / 事件契约
│   ├── prompts/           # Prompt 模板
│   └── tooling/           # repo lint / structure checks
├── docs/                  # 项目文档
│   ├── design-docs/       # 架构设计文档
│   ├── product-specs/     # 产品规格说明
│   ├── exec-plans/        # 执行计划
│   ├── adr/               # 架构决策记录
│   ├── db/                # 数据库设计
│   └── api/               # API 文档
├── infra/                 # 基础设施配置
└── tests/                 # 测试
```

## 文档入口

- [AGENTS.md](./AGENTS.md) — AI 与新成员入口
- [ARCHITECTURE.md](./ARCHITECTURE.md) — 架构说明
- [docs/design-docs/](./docs/design-docs/) — 设计文档
- [docs/exec-plans/active/](./docs/exec-plans/active/) — 执行计划

## 常用命令

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 启动开发服务器 |
| `pnpm build` | 构建所有项目 |
| `pnpm test` | 运行测试 |
| `pnpm lint` | 代码检查 |
| `pnpm db:migrate` | 数据库迁移 |

## 技术栈

- **前端**: Next.js 14 + TypeScript + Tailwind CSS + shadcn/ui
- **后端**: FastAPI + SQLAlchemy 2.0 + Pydantic v2 + Alembic
- **数据库**: PostgreSQL + Redis
- **存储**: Cloudflare R2 / AWS S3
- **认证**: Clerk
- **支付**: Stripe
- **监控**: Sentry + PostHog
