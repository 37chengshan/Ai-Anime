# EP-000: 项目骨架与基础设施搭建

> 版本：v1.1
> 更新时间：2026-04-16
> 状态：✅ 已完成

## 目标

把工程底盘搭起来，确保后续开发有统一规范。

## 任务拆解

### 0.1 Monorepo 初始化

- [x] 创建 `apps/web`
- [x] 创建 `apps/api`
- [x] 创建 `apps/worker`
- [x] 创建 `packages/ui`
- [x] 创建 `packages/sdk`
- [x] 创建 `packages/contracts`
- [x] 创建 `packages/prompts`
- [x] 创建 `packages/tooling`
- [x] 配置 `pnpm workspace`
- [x] 配置 `turbo.json`

### 0.2 仓库治理初始化

- [x] 创建 `AGENTS.md`
- [x] 创建 `ARCHITECTURE.md`
- [x] 初始化 `docs/design-docs/index.md`
- [x] 初始化 `docs/product-specs/index.md`
- [x] 初始化 `docs/exec-plans/active/EP-000-foundation-setup.md`
- [x] 初始化 `docs/PLANS.md`
- [x] 初始化 `docs/SECURITY.md`
- [x] 初始化 `docs/RELIABILITY.md`

### 0.3 工程规范

- [x] ESLint 配置
- [x] Prettier 配置
- [x] TypeScript base config
- [x] Python ruff / mypy / pytest
- [x] Husky + lint-staged
- [x] conventional commits (commitlint)

### 0.4 基础服务接通

- [x] PostgreSQL 连接配置
- [x] Redis 连接配置
- [x] R2/S3 SDK 接入（配置已定义）
- [x] Clerk 接入（配置已定义）
- [x] Stripe 测试环境接入（配置已定义）
- [x] Sentry 接入（配置已定义）
- [x] PostHog 接入（配置已定义）

### 0.5 数据库初始化

- [x] Alembic 初始化（目录结构已创建）
- [x] 建第一批基础表模型定义（users、profiles、posts、assets、comments等）
- [x] 建计费域模型（Subscription、Entitlement、PaymentEvent、QuotaAccount、QuotaTransaction）
- [x] 建基础索引（schema-glossary.md 中定义）
- [x] 写 `docs/db/migration-order.md`
- [x] 创建 `alembic.ini` 配置文件
- [x] 创建 `alembic/env.py` 异步环境配置
- [x] 创建 `alembic/script.py.mako` 模板

### 0.6 CI/CD

- [x] GitHub Actions：lint
- [x] GitHub Actions：typecheck
- [x] GitHub Actions：test
- [x] GitHub Actions：build
- [x] GitHub Actions：docs-check
- [ ] Preview 环境部署（需配置 Vercel/Railway）

### 0.7 API 基础设施

- [x] 创建 `app/models/__init__.py` 导出所有模型
- [x] 创建 `app/schemas/__init__.py` 导出所有 Pydantic 模型
- [x] 创建 `app/schemas/common.py` 通用响应模型
- [x] 创建 `app/schemas/users.py` 用户模型
- [x] 创建 `app/schemas/posts.py` 作品模型
- [x] 创建 `app/schemas/comments.py` 评论模型
- [x] 创建 `app/routers/__init__.py` 导出所有路由
- [x] 创建 `app/routers/auth.py` 认证路由骨架
- [x] 创建 `app/routers/users.py` 用户路由骨架
- [x] 创建 `app/routers/posts.py` 作品路由骨架
- [x] 创建 `app/routers/comments.py` 评论路由骨架
- [x] 创建 `app/routers/uploads.py` 上传路由骨架
- [x] 创建 `app/routers/ai.py` AI 路由骨架
- [x] 创建 `app/routers/subscriptions.py` 订阅路由骨架
- [x] 在 `main.py` 注册所有路由

### 0.8 Docker 支持

- [x] 创建 `apps/api/Dockerfile`
- [x] 创建 `apps/worker/Dockerfile`
- [x] 修复 `docker-compose.yml` Redis 端口错误
- [x] 在 `docker-compose.yml` 添加 API 服务
- [x] 在 `docker-compose.yml` 添加 Worker 服务

## 完成定义（DoD）

- [x] 三端（web / api / worker）本地可启动
- [x] CI 基础流水线通过
- [x] 基础文档入口已存在
- [x] 第一版 DB migration 配置已就绪
- [x] 团队可按文档独立完成本地环境搭建
- [ ] Preview 环境部署（待配置）

## 验收标准

1. ✅ 执行 `pnpm install` 无错误
2. ✅ 执行 `pnpm build` web 端可构建成功
3. ✅ 所有文档链接可访问
4. ✅ CI 流水线配置已就绪
5. ✅ FastAPI 应用可成功导入
6. ✅ Celery Worker 配置已就绪

## 下一步

1. 配置 Vercel/Railway Preview 环境
2. 运行首次数据库迁移 `alembic revision --autogenerate -m "initial"`
3. 开始 Phase 1: 社区 MVP 开发

---

*文档版本：v1.1*
*更新时间：2026-04-16*
*维护者：项目团队*