# AI 动漫社区项目工程执行文档 v1.1（优化版）

> 版本：v1.1  
> 适用阶段：Greenfield / 1–3 人小团队 / Web 优先 / 先做社区闭环再做订阅与 AI 深化  
> 文档目标：在 v1 基础上，输出一份**可直接开工、可持续迭代、可被 AI/人类协作理解**的工程执行文档。  
> 本版重点优化：**仓库治理层、知识文档层、执行计划层、CI/规则约束层、交付定义、依赖顺序、验收标准**。

---

# 0. 如何使用这份文档

这不是“思路汇总”，而是项目执行基线。建议按下面方式使用：

- **产品/架构决策**：看第 1、2、3、4 章。
- **建仓与初始化**：先执行第 4、5、9、10 章。
- **数据库与接口开发**：看第 6、7、8、14 章。
- **项目排期与推进**：以第 11、12、13 章为准。
- **AI 协作开发**：让 AI 先读 `AGENTS.md`、`ARCHITECTURE.md`、`docs/exec-plans/active/*`，再执行任务。

## 0.1 使用规则

1. 这份文档是**执行基线**，不是聊天记录摘要。  
2. 新增重大设计决策时，不直接改口头结论，先补 `ADR`。  
3. 新需求进入开发前，先判断是否需要新增 `exec-plan`。  
4. 代码改动若影响架构、API、DB、运行手册，必须同步更新对应文档。  
5. 如果文档与代码冲突，以**代码现状 + 最新 ADR + 最新 migration** 为准，并立即修正文档。

---

# 1. 项目目标与边界

## 1.1 项目定位

AI 动漫社区项目不是单一论坛，也不是单一 AI 工具，而是一个复合型平台：

- 创作者发布 AI 动漫 / 漫画作品
- 用户浏览、点赞、收藏、评论、关注创作者
- 平台提供 AI 辅助写评论 / 发帖 / 站内问答
- 平台提供会员订阅与付费教程
- 后台支持内容审核、订阅管理、AI 使用看板

## 1.2 v1 核心闭环

v1 只追求先跑通如下闭环：

1. 用户注册 / 登录
2. 用户上传并发布作品
3. 其他用户浏览、评论、点赞、收藏
4. AI 辅助写评论 / 发帖
5. 部分教程可被会员访问
6. 会员可获得 AI 使用额度
7. 管理员可在后台审核内容与查看基础数据

## 1.3 v1 非目标

以下内容不纳入 v1 主交付范围：

- 微服务拆分
- Elasticsearch / OpenSearch
- 自研认证体系
- 原生 App
- 即时聊天 IM
- 复杂个性化推荐系统
- 多租户能力
- 复杂工作流引擎
- 过早引入 Kubernetes / Service Mesh

## 1.4 成功标准

达到以下状态，可判定 v1 架构方向正确：

- 社区主闭环可稳定使用
- AI 功能可真实提升发帖/评论效率
- 会员购买后，教程权限与 AI 额度同步正确
- 管理员可完成基础审核与问题定位
- 仓库结构足够清晰，后续扩展不需要大规模推翻

---

# 2. 技术拍板

## 2.1 总体技术栈

### 前端
- Next.js App Router
- TypeScript
- Tailwind CSS 4
- shadcn/ui + Radix UI
- TanStack Query
- Zustand
- React Hook Form + Zod
- Motion (Framer Motion)
- Lucide React (图标)

### 后端
- FastAPI
- SQLAlchemy 2.0
- Pydantic v2
- Alembic
- Redis
- Worker（Celery 或 Arq，v1 推荐 Celery）

### 数据与基础设施
- PostgreSQL
- Redis
- Cloudflare R2（S3 兼容）或 AWS S3
- Clerk
- Stripe
- Sentry
- PostHog

## 2.2 架构结论

采用：

- **Monorepo**
- **模块化单体**
- **双运行时**：Next.js（Web / BFF）+ FastAPI（AI / Core Service）

原因：

- 适合 1–3 人团队
- 结构清晰，但不引入过度复杂度
- 能平衡社区 SEO、后台 API、AI 编排、队列任务
- 后续可按热点模块逐步拆服务，而不是一开始就被微服务反噬

## 2.3 关键工程原则

1. **Web 层负责页面与 BFF，不承载重 AI 编排。**
2. **AI 能力统一经由 AI Gateway，不允许页面/组件直调模型。**
3. **上传必须走“sign -> upload -> complete -> async process”闭环。**
4. **支付事实源与权限执行源分离。**
5. **搜索先做 Postgres 混合检索，不急着上 ES。**
6. **复杂任务必须文档化为 exec-plan，而不是散落在聊天记录里。**
7. **仓库不仅有代码层，还必须有知识层、计划层、机械约束层。**

---

# 3. 仓库系统设计（优化重点）

> 这一章是本次优化的核心。原版目录主要覆盖”代码层”，但对于长期可维护项目，还必须显式建设：
>
> - **Code Layer**：代码运行体与共享包
> - **Knowledge Layer**：架构、产品、API、DB、运行手册
> - **Execution Layer**：执行计划、技术债跟踪、阶段产出
> - **Enforcement Layer**：CI、PR 模板、Codeowners、结构检查
>
> **前端参考资源**：`docs/前端参考/Document-based design implementation/` 包含 Figma 导出的设计实现，作为前端开发的起点。

## 3.1 四层仓库模型

### A. Code Layer
负责让系统能运行：
- `apps/*`
- `packages/*`
- `infra/*`
- `tests/*`

### B. Knowledge Layer
负责把“系统事实”放进仓库：
- `AGENTS.md`
- `ARCHITECTURE.md`
- `docs/design-docs/*`
- `docs/product-specs/*`
- `docs/db/*`
- `docs/api/*`
- `docs/runbooks/*`

### C. Execution Layer
负责把复杂任务显式结构化：
- `docs/exec-plans/active/*`
- `docs/exec-plans/completed/*`
- `docs/exec-plans/tech-debt-tracker.md`

### D. Enforcement Layer
负责机械约束，避免仓库退化：
- `.github/workflows/*`
- `.github/PULL_REQUEST_TEMPLATE.md`
- `.github/CODEOWNERS`
- `packages/tooling/*`
- `pre-commit / commit-msg hooks`

## 3.2 根目录文件职责

### `AGENTS.md`
给 AI 与新成员的最小入口文件，只负责：
- 仓库导航
- 任务执行规则
- 必读文档入口
- 禁止事项
- 改动时必须同步更新哪些文档

> 不要把全部知识塞进 `AGENTS.md`，否则会迅速腐烂并占满上下文。

### `ARCHITECTURE.md`
顶层架构说明，负责：
- 总体分层图
- 依赖方向
- 外部系统接入关系
- 运行时边界
- 核心状态机与关键链路入口

### `README.md`
面向人类的项目入口：
- 项目简介
- 如何本地启动
- 常用命令
- 目录说明
- 文档入口

---

# 4. 仓库目录（可执行版本）

## 4.1 顶层目录

```text
repo/
├─ .github/
│  ├─ workflows/
│  │  ├─ ci.yml
│  │  ├─ pr-check.yml
│  │  ├─ docs-check.yml
│  │  ├─ db-check.yml
│  │  └─ release.yml
│  ├─ ISSUE_TEMPLATE/
│  │  ├─ bug_report.md
│  │  ├─ feature_request.md
│  │  └─ architecture_change.md
│  ├─ PULL_REQUEST_TEMPLATE.md
│  └─ CODEOWNERS
│
├─ .husky/
│  ├─ pre-commit
│  └─ commit-msg
│
├─ apps/
│  ├─ web/                     # Next.js 主站（前台 + BFF）
│  ├─ api/                     # FastAPI 核心服务（AI/业务 API）
│  ├─ worker/                  # Celery/Arq worker，处理异步任务
│  └─ admin/                   # 可选；若不独立则并入 apps/web/app/admin
│
├─ packages/
│  ├─ ui/                      # 共享 UI 组件
│  ├─ sdk/                     # TS API SDK / fetch clients
│  ├─ contracts/               # DTO / 类型 / 事件契约
│  ├─ config/                  # eslint/prettier/tsconfig/tailwind 配置
│  ├─ prompts/                 # Prompt 模板与结构化输出 schema
│  ├─ observability/           # 埋点、日志辅助、错误上下文包装
│  └─ tooling/                 # repo lint / structure checks / doc tools
│
├─ infra/
│  ├─ docker/
│  ├─ scripts/
│  ├─ ci/
│  ├─ terraform/
│  └─ monitoring/
│
├─ docs/
│  ├─ design-docs/
│  │  ├─ index.md
│  │  ├─ core-beliefs.md
│  │  ├─ architecture-principles.md
│  │  ├─ domain-boundaries.md
│  │  ├─ ai-system-design.md
│  │  ├─ upload-pipeline.md
│  │  └─ search-and-ranking.md
│  │
│  ├─ product-specs/
│  │  ├─ index.md
│  │  ├─ feed.md
│  │  ├─ post-detail.md
│  │  ├─ creator-profile.md
│  │  ├─ tutorial-subscription.md
│  │  ├─ ai-assistant.md
│  │  └─ moderation-console.md
│  │
│  ├─ exec-plans/
│  │  ├─ active/
│  │  │  ├─ EP-001-foundation-setup.md
│  │  │  ├─ EP-002-community-mvp.md
│  │  │  └─ EP-003-ai-layer-v1.md
│  │  ├─ completed/
│  │  └─ tech-debt-tracker.md
│  │
│  ├─ adr/
│  │  ├─ ADR-001-monorepo.md
│  │  ├─ ADR-002-nextjs-fastapi-split.md
│  │  ├─ ADR-003-postgres-search-strategy.md
│  │  └─ ADR-004-stripe-entitlements.md
│  │
│  ├─ db/
│  │  ├─ erd-v1.md
│  │  ├─ schema-glossary.md
│  │  ├─ migration-order.md
│  │  └─ generated/
│  │
│  ├─ api/
│  │  ├─ api-index.md
│  │  ├─ auth.md
│  │  ├─ posts.md
│  │  ├─ tutorials.md
│  │  ├─ subscriptions.md
│  │  ├─ ai.md
│  │  └─ admin.md
│  │
│  ├─ references/
│  │  ├─ nextjs-notes.md
│  │  ├─ fastapi-notes.md
│  │  ├─ stripe-notes.md
│  │  ├─ clerk-notes.md
│  │  └─ postgres-search-notes.md
│  │
│  ├─ runbooks/
│  │  ├─ local-dev.md
│  │  ├─ deploy.md
│  │  ├─ webhook-debug.md
│  │  ├─ queue-failure-recovery.md
│  │  └─ prod-incident.md
│  │
│  ├─ generated/
│  │  ├─ route-map.md
│  │  ├─ dependency-graph.md
│  │  └─ db-schema.md
│  │
│  ├─ FRONTEND.md
│  ├─ BACKEND.md
│  ├─ DESIGN.md
│  ├─ PLANS.md
│  ├─ PRODUCT_SENSE.md
│  ├─ QUALITY_SCORE.md
│  ├─ RELIABILITY.md
│  └─ SECURITY.md
│
├─ tests/
│  ├─ e2e/
│  ├─ integration/
│  ├─ contract/
│  └─ smoke/
│
├─ AGENTS.md
├─ ARCHITECTURE.md
├─ README.md
├─ Makefile
├─ turbo.json
├─ pnpm-workspace.yaml
├─ package.json
├─ .env.example
├─ .editorconfig
├─ .gitignore
└─ .markdownlint.json
```

## 4.2 目录级约束

### `apps/`
只放运行体：
- `web`：页面、BFF、Webhook 入口、少量前端专属 API
- `api`：核心业务 API、AI 编排、业务服务
- `worker`：异步任务消费者
- `admin`：仅在后台复杂度明显上升时单独拆出

### `packages/`
只放共享能力：
- UI
- SDK
- 契约类型
- prompts
- 可观测性
- 结构检查工具

### `docs/`
必须是“系统事实源”，不是随手记笔记：
- 每个文件都必须有明确职责
- 每个目录都必须能被索引
- 必须交叉链接到对应代码、ADR、runbook 或 API 文档

### `tests/`
必须按测试层次组织：
- `smoke/`：冒烟
- `integration/`：接口与服务组合
- `contract/`：DTO / API / webhook 契约
- `e2e/`：用户全链路

---

# 5. 目录职责与开发约束

## 5.1 `apps/web` 目录建议

> **说明**：基于 `docs/前端参考/Document-based design implementation` 参考项目调整，将 Figma 导出的页面迁移到 Next.js App Router 结构。

```text
apps/web/
├─ src/
│  ├─ app/                         # Next.js App Router
│  │  ├─ (marketing)/              # 营销页（可选）
│  │  ├─ (feed)/
│  │  │  ├─ page.tsx               # 首页瀑布流 ← 参考: Home.tsx
│  │  │  ├─ following/             # 关注流（待开发）
│  │  │  ├─ trending/              # 热门流（待开发）
│  │  │  └─ tags/[slug]/           # 标签页（待开发）
│  │  ├─ post/[postId]/
│  │  │  └─ page.tsx               # 作品详情页 ← 参考: WorkDetail.tsx
│  │  ├─ creator/[handle]/
│  │  │  └─ page.tsx               # 创作者主页 ← 参考: Profile.tsx
│  │  ├─ tutorial/
│  │  │  ├─ page.tsx               # 教程列表页（待开发）
│  │  │  └─ [slug]/page.tsx        # 教程详情页（待开发）
│  │  ├─ member/
│  │  │  └─ page.tsx               # 会员订阅页 ← 参考: Pricing.tsx
│  │  ├─ studio/
│  │  │  ├─ page.tsx               # 发布台 ← 参考: Upload.tsx
│  │  │  └─ edit/[postId]/page.tsx # 编辑作品（待开发）
│  │  ├─ discover/
│  │  │  └─ page.tsx               # AI 策展/发现页 ← 参考: Discover.tsx
│  │  ├─ settings/
│  │  │  ├─ page.tsx               # 设置页（待开发）
│  │  │  ├─ profile/page.tsx       # 编辑个人资料（待开发）
│  │  │  └─ subscription/page.tsx  # 订阅管理（待开发）
│  │  ├─ search/
│  │  │  └─ page.tsx               # 搜索页（待开发）
│  │  ├─ admin/                    # 后台管理（待开发）
│  │  │  ├─ page.tsx               # 后台首页
│  │  │  ├─ reports/page.tsx       # 举报列表
│  │  │  ├─ moderation/page.tsx    # 审核任务
│  │  │  ├─ users/page.tsx         # 用户列表
│  │  │  └─ ai-usage/page.tsx      # AI 使用看板
│  │  ├─ auth/
│  │  │  ├─ sign-in/page.tsx       # Clerk 登录页（待开发）
│  │  │  └─ sign-up/page.tsx       # Clerk 注册页（待开发）
│  │  └─ api/
│  │     ├─ webhooks/
│  │     │  ├─ stripe/route.ts
│  │     │  └─ clerk/route.ts
│  │     ├─ uploads/sign/route.ts
│  │     └─ uploads/complete/route.ts
│  │
│  ├─ features/
│  │  ├─ auth/                     # 认证逻辑、Clerk 集成
│  │  ├─ feed/                     # 瀑布流、筛选逻辑
│  │  ├─ post/                     # 作品发布、编辑
│  │  ├─ comment/                  # 评论组件与逻辑
│  │  ├─ creator/                  # 创作者相关
│  │  ├─ tutorial/                 # 教程系统
│  │  ├─ subscription/             # 订阅与支付
│  │  ├─ ai-assistant/             # AI 辅助写作 ← 参考: AIChatPanel.tsx
│  │  └─ admin/                    # 后台管理功能
│  │
│  ├─ components/
│  │  ├─ ui/                       # shadcn/ui 基础组件 ← 参考: src/app/components/ui/
│  │  ├─ common/                   # 通用组件
│  │  │  ├─ Header.tsx             # 导航栏 ← 参考: Header.tsx
│  │  │  ├─ Layout.tsx             # 布局壳 ← 参考: Layout.tsx
│  │  │  └─ ImageWithFallback.tsx  # 图片容错 ← 参考: figma/ImageWithFallback.tsx
│  │  └─ domain/                   # 业务组件
│  │     ├─ WorkCard.tsx           # 作品卡片 ← 参考: WorkCard.tsx
│  │     ├─ CommentSection.tsx     # 评论组件 ← 参考: CommentSection.tsx
│  │     ├─ AIChatPanel.tsx        # AI 聊天面板 ← 参考: AIChatPanel.tsx
│  │     ├─ SubscriptionPlanCard.tsx
│  │     ├─ TutorialAccessGate.tsx
│  │     └─ AdminReportTable.tsx
│  │
│  ├─ lib/
│  │  ├─ api/                      # API SDK ← 参考: packages/sdk
│  │  ├─ auth/                     # Clerk 认证辅助
│  │  ├─ upload/                   # 上传 SDK
│  │  ├─ analytics/                # PostHog 埋点
│  │  ├─ env/                      # 环境变量
│  │  └─ utils/                    # 工具函数 ← 参考: utils.ts
│  │
│  ├─ hooks/                       # 自定义 hooks
│  ├─ styles/
│  │  ├─ fonts.css                 # 字体 ← 参考: fonts.css
│  │  ├─ theme.css                 # 主题变量 ← 参考: theme.css
│  │  └─ globals.css               # 全局样式
│  └─ types/                       # TypeScript 类型定义
├─ public/
└─ package.json
```

### 前端约束

- `app/`：只放路由、布局、页面壳层、数据入口
- `features/`：放业务域逻辑、组装组件、hooks、actions
- `components/ui/`：只放纯 UI 基础组件
- `components/domain/`：放带业务语义的复合组件
- `lib/api/`：统一请求入口，不允许页面直接拼 URL
- `app/api/*`：只做 BFF、Webhook、上传签名、极少量聚合接口

### 前端禁止事项

- 不允许页面直接拼接后端 URL
- 不允许组件内散落模型调用逻辑
- 不允许把所有状态塞进 Zustand
- 不允许在 `page.tsx` 中写大量业务转换逻辑
- 不允许前端自行判断 Stripe 最终权限状态

## 5.2 `apps/api` 目录建议

```text
apps/api/
├─ app/
│  ├─ main.py
│  ├─ core/
│  │  ├─ config.py
│  │  ├─ db.py
│  │  ├─ redis.py
│  │  ├─ security.py
│  │  ├─ logger.py
│  │  └─ telemetry.py
│  │
│  ├─ routers/
│  │  ├─ auth.py
│  │  ├─ users.py
│  │  ├─ posts.py
│  │  ├─ comments.py
│  │  ├─ creators.py
│  │  ├─ tutorials.py
│  │  ├─ subscriptions.py
│  │  ├─ uploads.py
│  │  ├─ ai.py
│  │  ├─ search.py
│  │  ├─ moderation.py
│  │  └─ admin.py
│  │
│  ├─ schemas/
│  ├─ models/
│  ├─ repositories/
│  ├─ services/
│  │  ├─ user_service.py
│  │  ├─ post_service.py
│  │  ├─ comment_service.py
│  │  ├─ tutorial_service.py
│  │  ├─ subscription_service.py
│  │  ├─ upload_service.py
│  │  ├─ quota_service.py
│  │  ├─ search_service.py
│  │  ├─ moderation_service.py
│  │  └─ analytics_service.py
│  │
│  ├─ ai/
│  │  ├─ gateway/
│  │  ├─ prompts/
│  │  ├─ tools/
│  │  ├─ retrieval/
│  │  ├─ safety/
│  │  └─ eval/
│  │
│  ├─ tasks/
│  │  ├─ assets.py
│  │  ├─ search.py
│  │  ├─ moderation.py
│  │  ├─ billing.py
│  │  └─ notifications.py
│  │
│  └─ utils/
├─ alembic/
├─ tests/
└─ pyproject.toml
```

### 后端分层约束

- `router`：协议层，不写大业务逻辑
- `service`：主业务逻辑与事务边界
- `repository`：数据库访问
- `ai/`：模型编排与检索系统
- `tasks/`：异步任务入口

### 后端禁止事项

- 不允许 router 直接操作多个 repository 拼业务
- 不允许 service 直接写原始 SQL 散落在业务里
- 不允许 webhook 处理逻辑直接写在路由函数里
- 不允许 AI provider 逻辑散落在多个 service

## 5.3 `apps/worker` 目录建议

```text
apps/worker/
├─ worker/
│  ├─ main.py
│  ├─ tasks/
│  │  ├─ asset_processing.py
│  │  ├─ generate_thumbnail.py
│  │  ├─ run_content_safety.py
│  │  ├─ build_embeddings.py
│  │  ├─ refresh_search_docs.py
│  │  ├─ sync_subscription_state.py
│  │  └─ cleanup_temp_uploads.py
│  └─ utils/
└─ pyproject.toml
```

### Worker 职责

只做异步与重任务：

- 图片衍生图生成
- 内容审核
- 向量生成
- 搜索索引刷新
- 订阅补偿同步
- 清理任务

---

# 6. 数据库表草案（按业务域）

> 说明：以下为 v1 草案，字段不是最终 SQL，但已达到可建模程度。  
> 建议统一使用 UUID 主键；金额统一使用分；核心状态使用受控字符串枚举。

## 6.1 公共字段约定

所有核心表统一包含：

- `id`
- `created_at`
- `updated_at`
- `deleted_at`（如采用软删）

通用约定：

- 金额统一使用 `integer`（分）
- 时间统一使用 `timestamptz`
- 大文本字段按实际需要建，不要过度 JSON 化
- 所有 webhook/外部事件表必须保留原始 payload

## 6.2 用户与身份域

### `users`

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| clerk_user_id | varchar(128) | Clerk 用户 ID，唯一 |
| email | varchar(255) | 邮箱，唯一 |
| username | varchar(64) | 平台用户名，唯一 |
| status | varchar(32) | active / banned / deleted |
| role | varchar(32) | user / creator / admin |
| last_login_at | timestamptz | 最近登录时间 |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |

索引：
- unique(`clerk_user_id`)
- unique(`email`)
- unique(`username`)

### `user_profiles`

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| user_id | uuid | FK users.id |
| display_name | varchar(100) | 展示名 |
| avatar_url | text | 头像 |
| bio | text | 简介 |
| website | text | 主页 |
| social_links | jsonb | 社交链接 |
| creator_badge | boolean | 是否创作者 |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |

### `user_settings`

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| user_id | uuid | FK |
| locale | varchar(16) | 语言 |
| theme | varchar(16) | 主题 |
| email_notifications | boolean | 邮件通知 |
| push_notifications | boolean | 推送通知 |
| content_filter_level | varchar(32) | 内容过滤等级 |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |

### `user_follow_relations`

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| follower_user_id | uuid | 关注者 |
| followee_user_id | uuid | 被关注者 |
| created_at | timestamptz | 创建时间 |

约束：
- unique(`follower_user_id`, `followee_user_id`)

## 6.3 社区内容域

### `posts`

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| author_user_id | uuid | 作者 |
| title | varchar(200) | 标题 |
| slug | varchar(220) | 可选 SEO slug |
| content | text | 帖子正文 / 作品描述 |
| excerpt | varchar(500) | 摘要 |
| visibility | varchar(32) | public / followers / private |
| status | varchar(32) | draft / processing / published / flagged / archived |
| cover_asset_id | uuid | 封面资源 ID |
| ai_assisted | boolean | 是否使用 AI 辅助 |
| like_count | integer | 冗余计数，可选 |
| favorite_count | integer | 冗余计数，可选 |
| comment_count | integer | 冗余计数，可选 |
| published_at | timestamptz | 发布时间 |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |

索引：
- index(`author_user_id`, `published_at desc`)
- index(`status`, `published_at desc`)
- unique(`slug`) 可选

### `post_assets`

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| post_id | uuid | FK posts.id |
| uploader_user_id | uuid | 上传用户 |
| kind | varchar(32) | original / thumbnail / webp / cover |
| bucket | varchar(100) | 存储桶 |
| object_key | text | 对象 key |
| mime_type | varchar(100) | 文件类型 |
| width | integer | 宽 |
| height | integer | 高 |
| size_bytes | bigint | 文件大小 |
| checksum | varchar(128) | 文件校验值 |
| status | varchar(32) | uploaded / processed / failed / rejected |
| moderation_status | varchar(32) | pending / passed / rejected / review |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |

索引：
- index(`post_id`)
- unique(`bucket`, `object_key`)

### `tags`

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| name | varchar(50) | 标签名，唯一 |
| slug | varchar(60) | 唯一 slug |
| description | varchar(255) | 描述 |
| created_at | timestamptz | 创建时间 |

### `post_tag_relations`

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| post_id | uuid | FK |
| tag_id | uuid | FK |
| created_at | timestamptz | 创建时间 |

约束：
- unique(`post_id`, `tag_id`)

### `comments`

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| post_id | uuid | FK posts.id |
| author_user_id | uuid | 评论作者 |
| parent_comment_id | uuid | 顶层为空，回复时指向父评论 |
| content | text | 评论内容 |
| status | varchar(32) | visible / hidden / flagged |
| ai_assisted | boolean | 是否使用 AI 辅助 |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |

索引：
- index(`post_id`, `created_at asc`)
- index(`author_user_id`, `created_at desc`)

### `post_likes`

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| post_id | uuid | FK |
| user_id | uuid | FK |
| created_at | timestamptz | 创建时间 |

约束：
- unique(`post_id`, `user_id`)

### `post_favorites`

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| post_id | uuid | FK |
| user_id | uuid | FK |
| created_at | timestamptz | 创建时间 |

约束：
- unique(`post_id`, `user_id`)

## 6.4 教程与订阅域

### `tutorials`

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| author_user_id | uuid | 作者 |
| title | varchar(200) | 标题 |
| slug | varchar(220) | 唯一 slug |
| summary | varchar(500) | 摘要 |
| cover_asset_id | uuid | 封面 |
| access_level | varchar(32) | public / member / premium |
| status | varchar(32) | draft / published / archived |
| published_at | timestamptz | 发布时间 |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |

### `tutorial_chapters`

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| tutorial_id | uuid | FK tutorials.id |
| title | varchar(200) | 章节标题 |
| content | text | 正文 |
| position | integer | 排序 |
| is_preview | boolean | 是否可试看 |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |

### `membership_plans`

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| code | varchar(50) | basic_monthly / pro_monthly |
| name | varchar(100) | 方案名 |
| price_cents | integer | 金额（分） |
| currency | varchar(16) | 币种 |
| billing_interval | varchar(16) | month / year |
| ai_quota_monthly | integer | 每月 AI 配额 |
| tutorial_access_level | varchar(32) | member / premium |
| active | boolean | 是否启用 |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |

### `subscriptions`

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| user_id | uuid | 订阅用户 |
| plan_id | uuid | 会员方案 |
| stripe_customer_id | varchar(128) | Stripe customer |
| stripe_subscription_id | varchar(128) | Stripe subscription |
| status | varchar(32) | trialing / active / past_due / canceled / unpaid |
| current_period_start | timestamptz | 当前周期开始 |
| current_period_end | timestamptz | 当前周期结束 |
| cancel_at_period_end | boolean | 是否周期结束取消 |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |

索引：
- unique(`stripe_subscription_id`)
- index(`user_id`, `status`)

### `orders`

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| user_id | uuid | 用户 |
| type | varchar(32) | subscription / credits |
| amount_cents | integer | 金额 |
| currency | varchar(16) | 币种 |
| status | varchar(32) | pending / paid / failed / refunded |
| stripe_invoice_id | varchar(128) | Stripe 发票 ID |
| stripe_payment_intent_id | varchar(128) | 支付 ID |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |

### `payment_events`

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| provider | varchar(32) | stripe |
| event_id | varchar(128) | 外部事件 ID |
| event_type | varchar(100) | 事件类型 |
| payload | jsonb | 原始事件 |
| processed | boolean | 是否处理完成 |
| processed_at | timestamptz | 处理时间 |
| created_at | timestamptz | 创建时间 |

约束：
- unique(`provider`, `event_id`)

### `entitlements`

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| user_id | uuid | 用户 |
| source_type | varchar(32) | subscription / admin_grant |
| source_id | uuid | 来源 ID |
| entitlement_key | varchar(64) | tutorial.member / ai.monthly |
| value | integer | 数值型权益 |
| status | varchar(32) | active / expired |
| starts_at | timestamptz | 开始时间 |
| ends_at | timestamptz | 结束时间 |
| created_at | timestamptz | 创建时间 |

## 6.5 AI 与配额域

### `ai_conversations`

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| user_id | uuid | 所属用户 |
| scene | varchar(32) | write_post / write_comment / site_search |
| title | varchar(200) | 会话标题 |
| status | varchar(32) | active / archived |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |

### `ai_messages`

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| conversation_id | uuid | FK |
| role | varchar(16) | system / user / assistant / tool |
| content | text | 内容 |
| token_count | integer | token 数 |
| model | varchar(64) | 使用模型 |
| created_at | timestamptz | 创建时间 |

### `quota_accounts`

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| user_id | uuid | 用户 |
| balance | integer | 当前总余额 |
| monthly_quota | integer | 月额度 |
| bonus_quota | integer | 奖励额度 |
| extra_purchased_quota | integer | 额外购买额度 |
| current_period_start | timestamptz | 周期开始 |
| current_period_end | timestamptz | 周期结束 |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |

约束：
- unique(`user_id`)

### `quota_transactions`

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| account_id | uuid | 账户 |
| user_id | uuid | 用户 |
| type | varchar(32) | consume / grant / reset / refund |
| scene | varchar(32) | write_post / write_comment / site_search |
| delta | integer | 变化量，可正可负 |
| balance_after | integer | 变更后余额 |
| reference_type | varchar(32) | ai_usage / subscription / admin |
| reference_id | uuid | 来源 |
| created_at | timestamptz | 创建时间 |

### `ai_usage_logs`

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| user_id | uuid | 用户 |
| scene | varchar(32) | 调用场景 |
| provider | varchar(32) | openai-compatible |
| model | varchar(64) | 模型名 |
| input_tokens | integer | 输入 token |
| output_tokens | integer | 输出 token |
| latency_ms | integer | 延迟 |
| status | varchar(32) | success / failed / blocked |
| error_code | varchar(64) | 错误码 |
| request_id | varchar(128) | 请求流水 |
| created_at | timestamptz | 创建时间 |

索引：
- index(`user_id`, `created_at desc`)
- index(`scene`, `created_at desc`)

## 6.6 搜索与发现域

### `search_documents`

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| source_type | varchar(32) | post / tutorial / creator |
| source_id | uuid | 源对象 ID |
| title | text | 标题 |
| body | text | 主体摘要 |
| tags_text | text | 标签聚合文本 |
| tsv | tsvector | 全文索引列 |
| status | varchar(32) | active / archived |
| updated_at | timestamptz | 更新时间 |
| created_at | timestamptz | 创建时间 |

索引：
- GIN(`tsv`)
- unique(`source_type`, `source_id`)

### `search_embeddings`

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| source_type | varchar(32) | post / tutorial / creator |
| source_id | uuid | 源对象 ID |
| chunk_index | integer | 分片序号 |
| content | text | 分片文本 |
| embedding | vector | pgvector 向量 |
| model | varchar(64) | embedding 模型 |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |

## 6.7 审核与运营域

### `reports`

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| reporter_user_id | uuid | 举报人 |
| target_type | varchar(32) | post / comment / user |
| target_id | uuid | 目标 ID |
| reason_code | varchar(32) | spam / nsfw / abuse |
| description | text | 补充说明 |
| status | varchar(32) | open / reviewing / resolved / rejected |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |

### `moderation_cases`

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| source_type | varchar(32) | asset / post / comment / report |
| source_id | uuid | 来源 |
| risk_score | numeric(5,2) | 风险分 |
| decision | varchar(32) | pending / passed / rejected / manual_review |
| reviewer_user_id | uuid | 审核员 |
| notes | text | 备注 |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |

### `moderation_actions`

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| case_id | uuid | FK |
| action_type | varchar(32) | hide_post / delete_comment / ban_user |
| operator_user_id | uuid | 执行人 |
| metadata | jsonb | 附加信息 |
| created_at | timestamptz | 创建时间 |

### `audit_logs`

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| actor_user_id | uuid | 操作人 |
| action | varchar(100) | 操作名 |
| target_type | varchar(32) | 目标类型 |
| target_id | uuid | 目标 ID |
| metadata | jsonb | 变更上下文 |
| created_at | timestamptz | 创建时间 |

---

# 7. 核心索引、约束与建模原则

## 7.1 必做索引

### 高频查询索引
- `posts(status, published_at desc)`
- `posts(author_user_id, published_at desc)`
- `comments(post_id, created_at asc)`
- `subscriptions(user_id, status)`
- `ai_usage_logs(user_id, created_at desc)`
- `search_documents(tsv)` GIN

## 7.2 必做唯一约束

- `users.email`
- `users.username`
- `users.clerk_user_id`
- `subscriptions.stripe_subscription_id`
- `payment_events(provider, event_id)`
- `post_likes(post_id, user_id)`
- `post_favorites(post_id, user_id)`
- `post_tag_relations(post_id, tag_id)`

## 7.3 建模原则

- 状态机必须显式存在，不要用“字段是否为空”替代状态
- 冗余计数字段只能作为读优化，事实源仍是关系表
- 外部系统 ID 要单独建唯一约束
- 所有异步处理链路必须有可追踪的状态或日志

---

# 8. API 清单（v1 拍板版）

> 原则：
> - 对外统一 `/api/v1/*`
> - 前台页面优先通过 Next.js Server Components / BFF 获取数据
> - AI 场景单独拆接口，不设计万能 `/complete`
> - Webhook 端点必须验签与幂等

## 8.1 认证与用户

### `GET /api/v1/me`
获取当前登录用户信息

响应重点：
- 用户基础信息
- profile
- 当前订阅简要状态
- 当前 AI 配额摘要

### `PATCH /api/v1/me/profile`
更新用户资料

### `POST /api/v1/users/{userId}/follow`
关注用户

### `DELETE /api/v1/users/{userId}/follow`
取消关注

### `GET /api/v1/creators/{handle}`
创作者主页详情

返回：
- profile
- 作品列表
- 粉丝数 / 关注数 / 收藏数等摘要

## 8.2 上传与资源

### `POST /api/v1/uploads/sign`
申请上传签名 URL

### `POST /api/v1/uploads/complete`
通知服务端上传完成

响应：
- `asset_id`
- 当前资源状态

### `POST /api/v1/uploads/abort`
取消上传 / 清理临时对象

## 8.3 作品与内容

### `POST /api/v1/posts`
创建作品 / 帖子

业务规则：
- 若 `publish=true`，则进入发布流
- 必须校验资源归属
- 发帖成功后投递搜索索引与审核任务

### `GET /api/v1/posts`
作品流列表

支持参数：
- `cursor`
- `limit`
- `sort=latest|trending`
- `tag`
- `author_user_id`

### `GET /api/v1/posts/{postId}`
作品详情

### `PATCH /api/v1/posts/{postId}`
编辑作品

### `DELETE /api/v1/posts/{postId}`
删除 / 归档作品

### `POST /api/v1/posts/{postId}/like`
点赞

### `DELETE /api/v1/posts/{postId}/like`
取消点赞

### `POST /api/v1/posts/{postId}/favorite`
收藏

### `DELETE /api/v1/posts/{postId}/favorite`
取消收藏

## 8.4 评论

### `GET /api/v1/posts/{postId}/comments`
评论列表

### `POST /api/v1/posts/{postId}/comments`
发表评论

### `PATCH /api/v1/comments/{commentId}`
编辑评论

### `DELETE /api/v1/comments/{commentId}`
删除评论

## 8.5 教程与会员内容

### `GET /api/v1/tutorials`
教程列表

### `GET /api/v1/tutorials/{slug}`
教程详情

要求：
- 服务端必须附带当前用户是否可访问完整内容
- 返回可试看章节
- 返回升级提示信息

### `POST /api/v1/tutorials`
创建教程（后台或创作者后台）

### `PATCH /api/v1/tutorials/{tutorialId}`
编辑教程

## 8.6 订阅与账单

### `GET /api/v1/subscriptions/plans`
查询所有会员方案

### `POST /api/v1/subscriptions/checkout`
创建 Stripe Checkout Session

### `GET /api/v1/subscriptions/current`
当前订阅信息

### `POST /api/v1/subscriptions/portal`
进入 Stripe Billing Portal

### `POST /api/v1/webhooks/stripe`
Stripe Webhook

要求：
- 验签
- 幂等
- 原始事件入库
- 成功后同步或异步驱动状态同步

## 8.7 AI 能力

### `POST /api/v1/ai/write-post`
AI 辅助写帖子

### `POST /api/v1/ai/write-comment`
AI 辅助评论

### `POST /api/v1/ai/site-search`
站内 AI 问答

### `GET /api/v1/ai/quota`
查询当前 AI 配额

### `GET /api/v1/ai/usage`
查询 AI 调用记录

## 8.8 搜索与发现

### `GET /api/v1/search`
统一搜索接口

支持参数：
- `q`
- `type=all|post|tutorial|creator|tag`
- `cursor`
- `limit`

### `GET /api/v1/tags/{slug}`
标签详情页数据

### `GET /api/v1/feed/trending`
热门流

### `GET /api/v1/feed/following`
关注流

## 8.9 举报与审核

### `POST /api/v1/reports`
提交举报

### `GET /api/v1/admin/reports`
后台查看举报列表

### `GET /api/v1/admin/moderation/cases`
后台查看审核任务

### `POST /api/v1/admin/moderation/cases/{caseId}/decide`
后台处理审核任务

---

# 9. 关键业务流程

## 9.1 作品发布流程

```text
前端申请签名 URL
 -> 客户端直传对象存储
 -> complete 接口确认资源
 -> 创建 post
 -> post 进入 processing 或 published
 -> worker 触发：
    1. 生成缩略图
    2. 运行内容审核
    3. 生成 embedding
    4. 刷新搜索索引
 -> 状态最终变为 published / flagged
```

## 9.2 AI 辅助写作流程

```text
前端调用 ai/write-post 或 ai/write-comment
 -> quota_service 检查余额
 -> AI Gateway 调模型
 -> 返回草稿
 -> 记录 ai_usage_logs
 -> 写 quota_transactions
 -> 用户确认后再发到 posts/comments
```

## 9.3 订阅开通流程

```text
前端发起 checkout
 -> Stripe Checkout
 -> Stripe webhook
 -> payment_events 入库
 -> subscription_service 同步本地 subscriptions
 -> entitlements 更新
 -> quota_accounts 同步月额度
```

## 9.4 站内 AI 问答流程

```text
接收问题
 -> query rewrite（可选）
 -> lexical search + vector recall
 -> rerank
 -> top-k 结果喂给 LLM
 -> 返回回答 + 引用对象卡片
 -> 扣减 quota
```

---

# 10. `.github` 与规则文档（新增）

## 10.1 `.github/workflows` 至少需要这些

### `ci.yml`
- lint
- typecheck
- unit test
- build

### `pr-check.yml`
- PR 标题规范
- 是否更新 docs/ADR
- 目录越界检查
- 受影响模块检查

### `docs-check.yml`
- 文档死链检查
- 索引完整性检查
- `AGENTS.md` 链接有效性
- `exec-plans` 模板校验

### `db-check.yml`
- migration 顺序检查
- schema diff
- ORM 与 migration 一致性检查

### `release.yml`
- staging/prod 部署
- release note 生成

## 10.2 必备模板与治理文件

- `.github/PULL_REQUEST_TEMPLATE.md`
- `.github/CODEOWNERS`
- `.github/ISSUE_TEMPLATE/bug_report.md`
- `.github/ISSUE_TEMPLATE/feature_request.md`
- `.github/ISSUE_TEMPLATE/architecture_change.md`

## 10.3 必备规则型 Markdown

- `docs/FRONTEND.md`
- `docs/BACKEND.md`
- `docs/DESIGN.md`
- `docs/PLANS.md`
- `docs/PRODUCT_SENSE.md`
- `docs/QUALITY_SCORE.md`
- `docs/RELIABILITY.md`
- `docs/SECURITY.md`

---

# 11. 迭代任务拆解（按阶段）

## Phase 0：项目骨架与基础设施

### 目标
把工程底盘搭起来，确保后续开发有统一规范。

### 任务拆解

#### 0.1 Monorepo 初始化
- [ ] 创建 `apps/web`
- [ ] 创建 `apps/api`
- [ ] 创建 `apps/worker`
- [ ] 创建 `packages/ui`
- [ ] 创建 `packages/sdk`
- [ ] 创建 `packages/contracts`
- [ ] 创建 `packages/prompts`
- [ ] 创建 `packages/tooling`
- [ ] 配置 `pnpm workspace`
- [ ] 配置 `turbo.json`

#### 0.1.1 前端参考项目迁移
- [ ] 复制 `docs/前端参考/.../components/ui/` 到 `apps/web/src/components/ui/`
- [ ] 复制 `docs/前端参考/.../styles/` 到 `apps/web/src/styles/`
- [ ] 复制 `docs/前端参考/.../data/mock.ts` 到 `apps/web/src/data/mock.ts`（开发用 mock）
- [ ] 将参考项目依赖添加到 `apps/web/package.json`（motion, lucide-react, react-responsive-masonry, sonner, clsx, tailwind-merge 等）
- [ ] 配置 Tailwind CSS 4 主题变量（editorial-title, editorial-caption, editorial-body, bg-texture-light 等）
- [ ] 验证迁移后的 UI 组件可正常渲染

#### 0.2 仓库治理初始化
- [ ] 创建 `AGENTS.md`
- [ ] 创建 `ARCHITECTURE.md`
- [ ] 初始化 `docs/design-docs/index.md`
- [ ] 初始化 `docs/product-specs/index.md`
- [ ] 初始化 `docs/exec-plans/active/EP-001-foundation-setup.md`
- [ ] 初始化 `docs/PLANS.md`
- [ ] 初始化 `docs/SECURITY.md`
- [ ] 初始化 `docs/RELIABILITY.md`

#### 0.3 工程规范
- [ ] ESLint
- [ ] Prettier
- [ ] TypeScript base config
- [ ] Python ruff / mypy / pytest
- [ ] Husky + lint-staged
- [ ] conventional commits（可选但推荐）

#### 0.4 基础服务接通
- [ ] PostgreSQL 连接
- [ ] Redis 连接
- [ ] R2/S3 SDK 接入
- [ ] Clerk 接入
- [ ] Stripe 测试环境接入
- [ ] Sentry 接入
- [ ] PostHog 接入

#### 0.5 数据库初始化
- [ ] Alembic 初始化
- [ ] 建第一批基础表：users、profiles、posts、assets、comments、plans、subscriptions、quota_accounts
- [ ] 建基础索引
- [ ] 写 `docs/db/migration-order.md`

#### 0.6 CI/CD
- [ ] GitHub Actions：lint
- [ ] GitHub Actions：typecheck
- [ ] GitHub Actions：test
- [ ] GitHub Actions：build
- [ ] GitHub Actions：docs-check
- [ ] Preview 环境部署

### Phase 0 完成定义（DoD）
- 三端（web / api / worker）本地可启动
- CI 基础流水线通过
- 基础文档入口已存在
- 第一版 DB migration 已提交
- 团队可按文档独立完成本地环境搭建

## Phase 1：社区 MVP

### 目标
跑通”注册 -> 发帖 -> 浏览 -> 评论 -> 互动”的社区主闭环。

### 前端参考资源
基于 `docs/前端参考/Document-based design implementation` 项目，需迁移并补充：

| 参考页面 | 文件 | 目标路由 | 状态 |
|---------|------|---------|------|
| 首页瀑布流 | `Home.tsx` | `/` | ✅ 已有，需迁移到 Next.js |
| 作品详情页 | `WorkDetail.tsx` | `/post/[postId]` | ✅ 已有，需迁移 |
| 创作者主页 | `Profile.tsx` | `/creator/[handle]` | ✅ 已有，需迁移 |
| 发布台 | `Upload.tsx` | `/studio` | ✅ 已有，需迁移 |
| 会员订阅页 | `Pricing.tsx` | `/member` | ✅ 已有，需迁移 |
| AI 策展页 | `Discover.tsx` | `/discover` | ✅ 已有，需迁移 |
| 登录注册页 | - | `/auth/sign-in`, `/auth/sign-up` | ❌ 待开发 |
| 设置页 | - | `/settings` | ❌ 待开发 |
| 标签页 | - | `/tags/[slug]` | ⚠️ Home 有筛选，需独立页 |
| 搜索页 | - | `/search` | ❌ 待开发 |

### 任务拆解

#### 1.0 前端迁移与基础设施
- [ ] 将参考项目的 `components/ui/` 迁移到 `apps/web/src/components/ui/`
- [ ] 将参考项目的 `styles/` 迁移到 `apps/web/src/styles/`
- [ ] 创建 `apps/web/src/components/common/` (Header, Layout, ImageWithFallback)
- [ ] 创建 `apps/web/src/components/domain/` (WorkCard, CommentSection, AIChatPanel)
- [ ] 配置 Tailwind CSS 4 + 主题变量 (theme.css)
- [ ] 配置 Motion 动画库
- [ ] 创建 `apps/web/src/lib/utils.ts` (cn 函数等)
- [ ] 创建 `apps/web/src/types/` (Work, User, Comment 等类型定义)

#### 1.1 用户体系
- [ ] Clerk 登录注册页面 `/auth/sign-in`, `/auth/sign-up`
- [ ] Clerk webhook -> 本地 users 同步
- [ ] `/me` 与 profile 更新接口
- [ ] 创作者主页基础信息页 ← 迁移 `Profile.tsx`
- [ ] 设置页 `/settings` (新增)
- [ ] 编辑个人资料 `/settings/profile` (新增)

#### 1.2 作品发布
- [ ] 上传签名接口
- [ ] 前端直传对象存储
- [ ] 上传完成回调
- [ ] 创建帖子接口
- [ ] 发帖表单页面 ← 迁移 `Upload.tsx`
- [ ] 标签选择 / 新建标签
- [ ] 编辑作品页 `/studio/edit/[postId]` (新增)

#### 1.3 作品展示
- [ ] 首页最新流 ← 迁移 `Home.tsx`
- [ ] 作品详情页 ← 迁移 `WorkDetail.tsx`
- [ ] 标签页 `/tags/[slug]` (新增独立页面)
- [ ] 创作者主页作品流 ← 迁移 `Profile.tsx`
- [ ] 搜索页 `/search` (新增)

#### 1.4 评论与互动
- [ ] 评论列表接口
- [ ] 发表评论接口
- [ ] 评论组件 ← 迁移 `CommentSection.tsx`
- [ ] 点赞 / 收藏接口
- [ ] 前端互动组件状态同步

#### 1.5 基础审核能力
- [ ] 发帖后进入 processing 状态
- [ ] Worker 占位任务：审核 / 缩略图
- [ ] flagged 内容不进入公开流

### Phase 1 完成定义（DoD）
- 用户可登录
- 用户可上传并发布作品
- 用户可浏览、评论、点赞、收藏
- 作品详情页与创作者主页可用
- 基础发布闭环跑通
- 所有参考页面已迁移到 Next.js App Router

## Phase 2：AI 工具层

### 目标
把 AI 做成真正的产品能力，而不是外挂聊天框。

### 前端参考资源

| 参考组件 | 文件 | 目标位置 | 状态 |
|---------|------|---------|------|
| AI 聊天面板 | `AIChatPanel.tsx` | `components/domain/AIChatPanel.tsx` | ✅ 已有，需迁移 |
| AI 策展页 | `Discover.tsx` | `/discover` | ✅ 已有，需对接后端 |
| 发帖页 AI 生成 | `Upload.tsx` 中 AI Copywriter 区块 | `/studio` | ✅ 已有，需对接后端 |

### 任务拆解

#### 2.1 AI Gateway
- [ ] Provider 抽象
- [ ] 模型配置中心
- [ ] 统一调用日志
- [ ] 超时 / 重试 / fallback

#### 2.2 Prompt 资产化
- [ ] `write_post` prompt 模板
- [ ] `write_comment` prompt 模板
- [ ] `site_search` prompt 模板
- [ ] 结构化输出 schema
- [ ] 初始 eval cases

#### 2.3 配额系统
- [ ] quota_accounts 表接入
- [ ] quota_transactions 入账逻辑
- [ ] 场景级扣减规则
- [ ] `/ai/quota` 接口

#### 2.4 AI 功能实现
- [ ] `POST /ai/write-post`
- [ ] `POST /ai/write-comment`
- [ ] `POST /ai/site-search`
- [ ] AI 会话与消息日志入库

#### 2.5 前端集成
- [ ] 发帖页 AI 生成描述
- [ ] 评论框 AI 生成评论
- [ ] 站内搜索 AI 问答入口
- [ ] AI 使用结果可复制 / 回填

### Phase 2 完成定义（DoD）
- 三个 AI 接口可用
- 用户可在前台直接调用 AI 能力
- token 与配额可追踪
- AI 日志可在后台查看基础记录

## Phase 3：教程与订阅系统

### 目标
把”付费教程 + 会员 + AI 额度”真正打通。

### 前端参考资源

| 参考页面 | 文件 | 目标路由 | 状态 |
|---------|------|---------|------|
| 会员订阅页 | `Pricing.tsx` | `/member` | ✅ 已有，需对接 Stripe |
| 教程列表页 | - | `/tutorial` | ❌ 待开发 |
| 教程详情页 | - | `/tutorial/[slug]` | ❌ 待开发 |
| 订阅管理页 | - | `/settings/subscription` | ❌ 待开发 |

### 任务拆解

#### 3.1 教程系统
- [ ] tutorials 表与 chapters 表落地
- [ ] 教程创建 / 编辑 / 发布接口
- [ ] 教程详情页
- [ ] 试看章节逻辑

#### 3.2 会员系统
- [ ] membership_plans 配置
- [ ] 会员页展示套餐
- [ ] checkout 创建接口
- [ ] 当前订阅接口

#### 3.3 Stripe 接入
- [ ] Stripe product / price 初始化
- [ ] webhook 验签
- [ ] payment_events 入库
- [ ] subscriptions 状态同步
- [ ] entitlements 更新

#### 3.4 AI 额度联动
- [ ] 订阅开通时重置 monthly quota
- [ ] 不同 plan 绑定不同额度
- [ ] 取消订阅后的周期处理逻辑

### Phase 3 完成定义（DoD）
- 教程内容发布与展示可用
- 会员购买流程可用
- webhook 驱动的订阅状态同步可用
- 会员教程访问权限和 AI 额度联动生效

## Phase 4：后台与审核

### 目标
为运营提供基本可用的后台能力。

### 前端页面（全部待开发）

| 页面 | 路由 | 说明 |
|------|------|------|
| 后台首页 | `/admin` | 概览仪表盘 |
| 举报列表 | `/admin/reports` | 举报管理与流转 |
| 审核任务 | `/admin/moderation` | 内容审核队列 |
| 用户列表 | `/admin/users` | 用户管理与封禁 |
| AI 使用看板 | `/admin/ai-usage` | AI 调用统计与监控 |

### 任务拆解

#### 4.1 举报系统
- [ ] 举报接口
- [ ] 举报列表
- [ ] 举报详情
- [ ] 状态流转

#### 4.2 审核系统
- [ ] moderation_cases 列表
- [ ] 决策接口
- [ ] 处置动作记录
- [ ] audit_logs 写入

#### 4.3 后台管理台
- [ ] 管理员登录校验
- [ ] 用户列表
- [ ] 内容列表
- [ ] 订单 / 订阅查看
- [ ] AI 使用摘要看板

### Phase 4 完成定义（DoD）
- 管理员可查看举报与审核内容
- 管理员可对违规内容执行基本处置
- 可查看基础订阅与 AI 使用情况

## Phase 5：搜索优化与体验增强

### 目标
提升内容发现效率和整体可用性。

### 任务拆解

#### 5.1 搜索优化
- [ ] search_documents 全量生成
- [ ] tsvector 检索接入
- [ ] pgvector 召回接入
- [ ] lexical + semantic 合并排序

#### 5.2 热门流与关注流
- [ ] 热门度快照任务
- [ ] trending 接口
- [ ] following feed 接口优化

#### 5.3 产品体验
- [ ] 图片懒加载与压缩
- [ ] skeleton / loading states
- [ ] AI 结果流式展示（可选）
- [ ] SEO metadata 完善

### Phase 5 完成定义（DoD）
- 搜索质量明显提升
- 热门流、关注流更稳定
- 首页与详情页体验优化完成

---

# 12. 具体交付清单（按产物划分）

## 12.1 工程文档类交付

- [ ] `AGENTS.md`
- [ ] `ARCHITECTURE.md`
- [ ] `docs/design-docs/core-beliefs.md`
- [ ] `docs/design-docs/domain-boundaries.md`
- [ ] `docs/db/erd-v1.md`
- [ ] `docs/db/schema-glossary.md`
- [ ] `docs/api/api-index.md`
- [ ] `docs/runbooks/local-dev.md`
- [ ] `docs/runbooks/deploy.md`
- [ ] `docs/runbooks/stripe-webhook.md`
- [ ] `docs/runbooks/upload-pipeline.md`
- [ ] `docs/adr/ADR-001-monorepo.md`
- [ ] `docs/adr/ADR-002-next-fastapi-split.md`
- [ ] `docs/adr/ADR-003-postgres-hybrid-search.md`

## 12.2 前端交付

### 页面（按来源分类）

**从参考项目迁移：**
- [ ] 首页 `/` ← `Home.tsx`
- [ ] 作品详情页 `/post/[postId]` ← `WorkDetail.tsx`
- [ ] 创作者主页 `/creator/[handle]` ← `Profile.tsx`
- [ ] 发布台 `/studio` ← `Upload.tsx`
- [ ] 会员订阅页 `/member` ← `Pricing.tsx`
- [ ] AI 策展页 `/discover` ← `Discover.tsx`

**新增页面：**
- [ ] 登录页 `/auth/sign-in`
- [ ] 注册页 `/auth/sign-up`
- [ ] 设置页 `/settings`
- [ ] 编辑个人资料 `/settings/profile`
- [ ] 订阅管理 `/settings/subscription`
- [ ] 标签页 `/tags/[slug]`
- [ ] 搜索页 `/search`
- [ ] 教程列表页 `/tutorial`
- [ ] 教程详情页 `/tutorial/[slug]`
- [ ] 编辑作品页 `/studio/edit/[postId]`
- [ ] 后台首页 `/admin`
- [ ] 后台举报列表 `/admin/reports`
- [ ] 后台审核任务 `/admin/moderation`
- [ ] 后台用户列表 `/admin/users`
- [ ] 后台 AI 使用看板 `/admin/ai-usage`

### 组件

**从参考项目迁移：**
- [ ] `Header.tsx` → `components/common/Header.tsx`
- [ ] `Layout.tsx` → `components/common/Layout.tsx`
- [ ] `WorkCard.tsx` → `components/domain/WorkCard.tsx`
- [ ] `CommentSection.tsx` → `components/domain/CommentSection.tsx`
- [ ] `AIChatPanel.tsx` → `components/domain/AIChatPanel.tsx`
- [ ] `ImageWithFallback.tsx` → `components/common/ImageWithFallback.tsx`
- [ ] `components/ui/*` → `components/ui/*` (48 个 shadcn/ui 组件)

**新增组件：**
- [ ] `SubscriptionPlanCard.tsx`
- [ ] `TutorialAccessGate.tsx`
- [ ] `AdminReportTable.tsx`
- [ ] `AdminModerationQueue.tsx`
- [ ] `UserAvatar.tsx`
- [ ] `TagBadge.tsx`
- [ ] `SearchInput.tsx`
- [ ] `InfiniteScroll.tsx`

### 状态与 SDK
- [ ] `packages/sdk` 初版
- [ ] React Query hooks 初版
- [ ] 上传 SDK 初版
- [ ] Zustand stores (用户、订阅、配额)

## 12.3 后端交付

### 数据模型
- [ ] Phase 0/1 核心 migration
- [ ] 订阅与 AI 表 migration
- [ ] 搜索与审核表 migration

### API
- [ ] auth / users / posts / comments API
- [ ] uploads API
- [ ] tutorials / subscriptions API
- [ ] ai / search API
- [ ] admin / moderation API

### 服务层
- [ ] `post_service`
- [ ] `upload_service`
- [ ] `subscription_service`
- [ ] `quota_service`
- [ ] `search_service`
- [ ] `moderation_service`

## 12.4 Worker 交付

- [ ] `asset_processing` task
- [ ] `thumbnail_generation` task
- [ ] `moderation` task
- [ ] `embedding_generation` task
- [ ] `search_refresh` task
- [ ] `subscription_sync` task

## 12.5 基础设施交付

- [ ] Dockerfile（web / api / worker）
- [ ] `docker-compose.yml` 本地开发版
- [ ] `.env.example`
- [ ] GitHub Actions workflow
- [ ] staging 环境配置
- [ ] production 环境变量清单

## 12.6 可观测性交付

- [ ] Sentry for web
- [ ] Sentry for api
- [ ] Sentry for worker
- [ ] PostHog base events
- [ ] 核心漏斗埋点

---

# 13. 推荐开发顺序

## 13.1 正确顺序

1. 工程骨架
2. 仓库知识层与规则层
3. 数据库基础表
4. 用户与登录
5. 上传闭环
6. 发帖闭环
7. 浏览与评论闭环
8. AI 辅助写作
9. 教程系统
10. 订阅系统
11. 后台与审核
12. 搜索与体验优化

## 13.2 错误顺序

- 一上来先做推荐系统
- 一上来先做复杂 AI Agent
- 一上来先开后台大而全
- 在上传闭环没通之前就设计复杂作品编辑器
- 在订阅状态没打通之前就上付费墙
- 在缺少文档与 CI 约束时同时多人并行大改目录

---

# 14. 推荐首批建表顺序与接口顺序

## 14.1 首批建表顺序

### 第一批（必须）
- `users`
- `user_profiles`
- `posts`
- `post_assets`
- `tags`
- `post_tag_relations`
- `comments`
- `post_likes`
- `post_favorites`

### 第二批（AI / 订阅基础）
- `membership_plans`
- `subscriptions`
- `payment_events`
- `quota_accounts`
- `quota_transactions`
- `ai_usage_logs`

### 第三批（搜索 / 审核）
- `search_documents`
- `search_embeddings`
- `reports`
- `moderation_cases`
- `moderation_actions`
- `audit_logs`

## 14.2 首批接口实现顺序

### 第一批
- `GET /me`
- `PATCH /me/profile`
- `POST /uploads/sign`
- `POST /uploads/complete`
- `POST /posts`
- `GET /posts`
- `GET /posts/{postId}`
- `GET /posts/{postId}/comments`
- `POST /posts/{postId}/comments`
- `POST /posts/{postId}/like`
- `POST /posts/{postId}/favorite`

### 第二批
- `POST /ai/write-post`
- `POST /ai/write-comment`
- `GET /ai/quota`
- `GET /tutorials`
- `GET /tutorials/{slug}`
- `GET /subscriptions/plans`
- `POST /subscriptions/checkout`
- `GET /subscriptions/current`

### 第三批
- `POST /ai/site-search`
- `GET /search`
- `POST /reports`
- `GET /admin/reports`
- `GET /admin/moderation/cases`
- `POST /admin/moderation/cases/{caseId}/decide`

---

# 15. MVP 验收标准

## 15.1 社区侧
- [ ] 用户可正常注册登录
- [ ] 用户可上传图片并发布作品
- [ ] 首页可展示作品流
- [ ] 作品详情页可浏览与评论
- [ ] 点赞 / 收藏功能可用

## 15.2 AI 侧
- [ ] AI 可辅助写评论
- [ ] AI 可辅助写帖子介绍
- [ ] AI 可进行站内内容问答
- [ ] 配额消耗正确入账

## 15.3 订阅侧
- [ ] 用户可购买会员
- [ ] 会员可访问付费教程
- [ ] 会员可获得 AI 月额度
- [ ] Stripe webhook 可稳定同步状态

## 15.4 运营侧
- [ ] 举报可提交流转
- [ ] 管理员可审核内容
- [ ] 基础日志与异常监控可用

---

# 16. 风险点与预防措施

## 16.1 上传状态不一致

### 风险
- 文件传上去了但数据库没记录
- 数据库有记录但对象不存在
- 用户重复提交导致脏数据

### 预防
- sign / complete 两段式上传
- object key + uploader 归属校验
- complete 接口幂等
- worker 定时清理孤儿资源

## 16.2 支付状态错乱

### 风险
- Checkout 成功但本地权限没开通
- 重复 webhook 导致重复记账

### 预防
- `payment_events` 原始入库
- 事件幂等唯一约束
- 订阅状态只由 service 更新
- 增加补偿任务

## 16.3 AI 成本失控

### 风险
- 前端接口被滥用
- 调用失败仍扣减
- 高价模型误用到所有场景

### 预防
- quota check 前置
- 失败不扣减或自动 refund
- 按场景配置模型
- user-level 限流

## 16.4 搜索质量差

### 风险
- 只做关键词导致召回差
- 只做向量导致结果飘

### 预防
- v1 直接做 lexical + semantic hybrid
- 引入简单 rerank
- 搜索日志沉淀供后续调优

## 16.5 仓库知识腐烂

### 风险
- 文档长期不更新
- AI 读到旧规则
- 新成员无法分辨哪个文件是事实源

### 预防
- 关键目录设置 CODEOWNERS
- PR 模板要求说明是否更新 docs
- docs-check 校验索引与链接
- 重大变更必须补 ADR / exec-plan

---

# 17. 团队协作建议（1–3 人）

## 方案 A：1 人开发

优先级：
- 先全栈打通闭环
- 不追求后台完备
- 所有高级功能都以最小可用实现
- 每周至少更新一次 exec-plan 与技术债清单

## 方案 B：2 人开发

### 人员 1
- 前端主站
- 发布台
- 教程页
- 会员页

### 人员 2
- FastAPI
- DB migration
- Worker
- Stripe / AI / 搜索

## 方案 C：3 人开发

### 人员 1
- Web UI / 交互

### 人员 2
- API / DB / 上传 / 订阅

### 人员 3
- AI / 搜索 / 审核 / 可观测性

---

# 18. 启动周清单（可直接执行）

## 第 1 周
- [ ] 建仓
- [ ] 配好 Monorepo
- [ ] 起 Web / API / Worker 三端
- [ ] 建 `.github/workflows/ci.yml`
- [ ] 写 `AGENTS.md`
- [ ] 写 `ARCHITECTURE.md`
- [ ] 初始化 `docs/exec-plans/active/EP-001-foundation-setup.md`
- [ ] 接通 Postgres / Redis / Clerk

## 第 2 周
- [ ] 完成首批 migration
- [ ] 完成上传 sign/complete
- [ ] 完成 `/me`、`/posts` 基础接口
- [ ] 完成首页流与发帖页壳层
- [ ] 打通作品发布闭环

## 第 3 周
- [ ] 完成评论 / 点赞 / 收藏
- [ ] 完成创作者主页
- [ ] 完成基本审核占位任务
- [ ] 进入 Phase 1 验收

---

# 19. 最终执行结论

这份优化版执行文档的核心含义不是“功能罗列”，而是明确项目必须按下面方式推进：

- 架构上：Next.js + FastAPI 双运行时，模块化单体，不上微服务
- 代码组织上：Monorepo + apps/packages 分层
- 治理上：补齐知识层、计划层、机械约束层
- 数据上：PostgreSQL 作为主库，Redis 负责缓存和任务协助
- 产品上：先社区闭环，再 AI 工具层，再订阅，再后台，再搜索优化
- 工程上：所有高风险点都提前用状态机、幂等、异步任务、日志进行兜底

如果严格按这份文档执行，你得到的不会只是一个“能跑的站”，而是一个：

- 对人类开发者清晰
- 对 AI 代理可读
- 对后续迭代可持续
- 对上线风险可控制

的工程底盘。

---

# 20. 下一步建议

建议立刻补齐四份配套文件：

1. `AGENTS.md` 初版
2. `ARCHITECTURE.md` 初版
3. `docs/exec-plans/active/EP-001-foundation-setup.md`
4. `docs/db/erd-v1.md`

这四份一补齐，就可以正式进入建仓与第一阶段开发。
