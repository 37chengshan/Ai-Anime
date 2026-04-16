# AGENTS.md — 仓库入口与执行规则

> 面向 AI 代理与新成员的最小入口文件。  
> 目标：在**最少上下文**下，快速理解仓库结构、事实源、执行顺序、分层约束、变更流程与完成标准。

---

# 1. 本文件的作用

本文件只负责四件事：

1. 指出**系统事实源**在哪里
2. 说明**该按什么顺序工作**
3. 规定**代码与文档的硬约束**
4. 给出**提交前最低检查清单**

本文件**不是**完整设计文档。不要把所有知识继续堆进本文件；详细规则放入 `docs/`，本文件只保留导航与强约束。

---

# 2. 系统事实源与优先级

当信息冲突时，按以下优先级判断：

1. **运行中代码与最新 migration**
2. **最新 ADR（架构决策记录）**
3. **执行计划（docs/exec-plans/active）**
4. **领域设计文档（docs/design-docs/）**
5. **API / DB 文档**
6. **本文件**

处理规则：

- 若文档落后于代码：先确认代码是否正确，再修正文档
- 若代码与 ADR 冲突：优先确认是否应补新的 ADR，而不是默默偏离
- 若缺少文档：先补最小文档，再继续实现

---

# 3. 仓库导航

| 路径 | 职责 | 备注 |
|---|---|---|
| `apps/web` | Next.js 主站（前台页面 + BFF） | 页面、Server Components、前端 API 接入 |
| `apps/api` | FastAPI 核心服务 | 业务 API、AI 编排、权限与配额 |
| `apps/worker` | 异步任务消费者 | 资源处理、审核、索引、补偿任务 |
| `packages/ui` | 共享 UI 组件库 | 纯 UI 与通用复合组件 |
| `packages/sdk` | TypeScript API SDK | 前端统一调用入口 |
| `packages/contracts` | DTO / 类型 / 事件契约 | 前后端共享协议 |
| `packages/prompts` | Prompt 模板与输出 schema | AI 场景模板资产 |
| `packages/observability` | 埋点、日志、错误包装 | 可观测性辅助 |
| `docs/` | 项目知识层 | 设计、规格、DB、API、运行手册 |
| `infra/` | 基础设施配置 | Docker、CI、部署脚本 |
| `.github/` | 自动化与协作约束 | workflow、PR 模板、CODEOWNERS |

---

# 4. 必读入口

开始任何较大改动前，至少阅读下列入口：

- `README.md` — 仓库启动与本地运行
- `ARCHITECTURE.md` — 顶层架构与依赖方向
- `PROJECT.md` — 项目定位、里程碑与范围
- `docs/ROADMAP.md` — 当前 Phase、优先级与里程碑状态
- `docs/design-docs/index.md` — 设计文档索引
- `docs/db/erd-v1.md` — 数据库关系图
- `docs/db/schema-glossary.md` — 关键表语义说明
- `docs/api/api-index.md` — 接口索引
- `docs/exec-plans/active/` — 当前正在执行的计划

---

# 5. 标准工作顺序

## 5.1 开发新功能

```text
1. 查看 docs/ROADMAP.md，确认当前 Phase 与优先级
2. 查看是否已有对应 EP（execution plan）
3. 阅读相关 docs/design-docs/、docs/product-specs/、docs/adr/
4. 明确改动影响：前端 / API / DB / worker / docs
5. 先改 contracts 与文档，再实现代码
6. 先写或补测试，再完成实现
7. 本地自检：lint / typecheck / test / build
8. 同步更新文档与计划状态
9. 提交 PR
```

## 5.2 修复 Bug

```text
1. 复现问题并记录最小复现路径
2. 判断影响层：web / api / worker / db / external webhook
3. 先写失败测试或最小复现脚本
4. 修复时遵守原有分层，不跨层“就近修”
5. 回归关键路径
6. 更新 runbook / 文档（如有必要）
7. 提交 fix
```

## 5.3 数据库变更

```text
1. 先更新 docs/db/erd-v1.md 或 schema-glossary.md
2. 新建 migration
3. 检查 upgrade / downgrade
4. 同步更新 ORM 模型、repository、schema
5. 若接口受影响，同步更新 docs/api/ 与 contracts
6. 补 migration 相关测试或回归说明
```

## 5.4 API 变更

```text
1. 先更新 docs/api/
2. 更新 packages/contracts/
3. 后端实现：router -> service -> repository
4. 前端更新：packages/sdk -> features
5. 补集成测试 / 契约测试
6. 更新调用方文档
```

## 5.5 执行计划（EP）变更

```text
1. 大任务先检查 docs/exec-plans/active/ 是否已有计划
2. 若无，则先创建 EP，写明目标、范围、依赖、风险、验收标准
3. 实现过程中持续更新状态，不要只改代码不改计划
4. 完成后移入 docs/exec-plans/completed/
```

---

# 6. 什么时候必须先写执行计划（EP）

满足以下任一条件，必须先写 `docs/exec-plans/active/EP-*.md`：

- 改动跨 **2 个以上运行时**（如 web + api，或 api + worker）
- 改动涉及 **数据库 schema**
- 改动涉及 **支付、权限、AI 配额、审核** 等高风险域
- 改动预计超过 **1 天**
- 改动会影响多个页面、多个 API 或多个表
- 需要分阶段上线或有迁移步骤

小修复、小样式调整、纯文案改动通常不需要 EP。

---

# 7. 分层规则（硬约束）

## 7.1 后端调用方向

```text
router -> service -> repository -> model
```

### 约束

- `router`：只处理 HTTP 协议、参数校验、认证授权、响应映射
- `service`：业务逻辑、事务边界、跨仓储编排、外部服务调用协调
- `repository`：ORM / SQL 访问、查询封装、持久化
- `model`：SQLAlchemy 模型定义

### 禁止

- `router` 中堆业务逻辑
- `service` 中散落原始 SQL
- `repository` 中写业务决策
- webhook 路由中直接写完整业务流

## 7.2 前端调用方向

```text
app/page -> features -> components/domain -> components/common -> components/ui
```

### 约束

- `app/`：页面壳层、路由、Server Component 数据入口
- `features/`：业务逻辑、hooks、actions、页面编排
- `components/domain/`：带业务语义的复合组件
- `components/common/`：跨 feature 可复用组件
- `components/ui/`：纯 UI 基础组件
- API 调用统一经 `packages/sdk`

### 禁止

- 页面直接拼接后端 URL
- 组件内部直接管理 AI provider 调用
- `page.tsx` 堆大量业务转换逻辑
- 把所有状态都塞进 Zustand
- 前端自行判断 Stripe 最终权限状态

## 7.3 AI 调用规则

- 所有 AI 调用统一走 **AI Gateway**
- Prompt 模板统一放入 `packages/prompts`
- AI 输出默认视为**草稿或建议**，除非业务明确允许，不直接落库
- token、耗时、状态必须进入日志与配额流水

---

# 8. 变更影响矩阵

| 若改动涉及 | 必须同步检查 / 更新 |
|---|---|
| 架构边界 | `ARCHITECTURE.md`、`docs/adr/` |
| API | `docs/api/`、`packages/contracts/`、`packages/sdk/` |
| 数据库 | `docs/db/`、migration、ORM、repository |
| UI / 页面结构 | `docs/FRONTEND.md`、相关 product spec |
| 业务流程 | `docs/design-docs/`、执行计划 |
| 支付 / 权限 | `docs/RELIABILITY.md`、`docs/SECURITY.md`、runbooks |
| AI 场景 | `packages/prompts/`、`docs/design-docs/ai-system-design.md` |
| Worker 任务 | runbooks、任务重试 / 补偿说明 |

---

# 9. 文档同步规则

代码不是唯一事实源；对外部不可见的知识若不写进仓库，默认等于不存在。

## 必须同步更新的情况

| 改动类型 | 至少更新 |
|---|---|
| 新增接口 / 字段 | `docs/api/` + `packages/contracts/` |
| 新增表 / 字段 / 索引 | `docs/db/` + migration |
| 调整架构边界 | `ARCHITECTURE.md` + `docs/adr/` |
| 改变产品流程 | `docs/design-docs/` 或 `docs/product-specs/` |
| 新增长任务 | `docs/exec-plans/active/` |
| Phase 进度变化 | `docs/ROADMAP.md` |

---

# 10. 测试与完成标准

## 10.1 最低测试要求

- 新功能：至少覆盖主路径
- Bug 修复：必须有失败测试或稳定复现说明
- API 变更：至少有集成测试或契约测试
- DB 变更：至少验证 migration 可升级/回滚
- 高风险域（支付 / AI 配额 / 审核）：必须有关键路径测试

## 10.2 完成定义（DoD）

一个任务只有同时满足以下条件才算完成：

- [ ] 代码实现完成
- [ ] 测试通过
- [ ] lint / typecheck 通过
- [ ] 文档同步更新
- [ ] 关键日志 / 埋点已补
- [ ] 若涉及用户路径，已做最小回归验证
- [ ] 若涉及计划项，EP 状态已更新

---

# 11. 提交前检查清单

提交前至少确认：

- [ ] 没有越层调用
- [ ] 没有把临时调试逻辑留在代码里
- [ ] 没有破坏 `packages/contracts` 与实现一致性
- [ ] 没有遗漏 migration / schema 文档
- [ ] 没有把敏感信息写入代码或日志
- [ ] 本地命令 `lint` / `test` / `build` 已通过

---

# 12. 禁止事项

- ❌ 直接在页面里调用后端裸 URL
- ❌ 在多个 service 各自维护 AI provider client
- ❌ 将业务逻辑塞进 router 或 webhook handler
- ❌ 未建 migration 就直接改模型假定数据库会自动同步
- ❌ 未更新 contracts 就修改 API 请求/响应结构
- ❌ 让前端直接以 Stripe 返回值作为最终权限事实源
- ❌ 把临时脚本、一次性逻辑混入正式代码路径
- ❌ 未写任何测试就提交高风险域改动

---

# 13. Commit 与 PR 规范

## Commit 格式

```text
<type>: <description>
```

允许类型：
- `feat`
- `fix`
- `refactor`
- `docs`
- `test`
- `chore`
- `perf`
- `ci`

## PR 最低要求

PR 描述中应说明：

1. 改了什么
2. 为什么改
3. 影响哪些目录 / 域
4. 是否涉及 DB / API / 权限 / 支付 / AI
5. 是否更新文档
6. 如何验证

---

# 14. 常用命令

```bash
# 安装依赖
pnpm install

# 启动开发环境
pnpm dev

# 前端检查
pnpm lint
pnpm test
pnpm build

# 后端迁移
cd apps/api && alembic upgrade head

# 后端测试
cd apps/api && pytest
```

---

# 15. 快速决策规则

遇到不确定情况时，优先按以下原则决策：

1. **先保证边界清晰，再追求省事**
2. **先保证主路径稳定，再补“高级能力”**
3. **先补最小文档，再继续扩展实现**
4. **优先复用已有模式，不引入第二套做法**
5. **涉及支付、权限、AI 配额时，优先保守而可审计**

---

# 16. 相关文档索引

- `README.md`
- `ARCHITECTURE.md`
- `PROJECT.md`
- `docs/ROADMAP.md`
- `docs/design-docs/index.md`
- `docs/db/erd-v1.md`
- `docs/db/schema-glossary.md`
- `docs/api/api-index.md`
- `docs/exec-plans/active/`
- `docs/RELIABILITY.md`
- `docs/SECURITY.md`

