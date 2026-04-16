# AGENTS.md — 仓库入口与执行规则

> 面向 AI 代理与新成员的最小入口文件。

---

# 1. 系统事实源优先级

1. **运行中代码与最新 migration**
2. **最新 ADR** (`docs/adr/`)
3. **执行计划** (`docs/exec-plans/active/`)
4. **领域设计文档** (`docs/design-docs/`)
5. **API / DB 文档** (`docs/api/`, `docs/db/`)
6. **本文件**

> 详细规则见 [docs/design-docs/architecture-principles.md](docs/design-docs/architecture-principles.md)

---

# 2. 仓库导航

| 路径 | 职责 |
|---|---|
| `apps/web` | Next.js 主站 |
| `apps/api` | FastAPI 核心服务 |
| `apps/worker` | 异步任务消费者 |
| `packages/ui` | 共享 UI 组件库 |
| `packages/sdk` | TypeScript API SDK |
| `packages/contracts` | DTO / 类型契约 |
| `packages/prompts` | Prompt 模板 |
| `docs/` | 项目知识层 |

---

# 3. 必读入口

- `README.md` — 启动与运行
- `ARCHITECTURE.md` — 顶层架构
- `PROJECT.md` — 项目定位
- `docs/ROADMAP.md` — 当前 Phase 与里程碑
- `docs/exec-plans/active/` — 当前执行计划

---

# 4. 分支与 PR 工作流（强制）

**所有代码变更必须通过 PR 合并，禁止直接推送到 main。**

| 类型 | 分支格式 | 示例 |
|---|---|---|
| Phase | `phase/N-description` | `phase/1-community-mvp` |
| Bug | `fix/issue-N-description` | `fix/issue-42-login` |
| 功能 | `feat/description` | `feat/user-profile` |

**流程**: 创建分支 → 开发 → 推送 → 创建 PR → CI 通过 → 合并 → 删除分支

> 详细流程见 [docs/design-docs/development-workflow.md](docs/design-docs/development-workflow.md)

---

# 5. 分层规则（硬约束）

## 后端
```
router -> service -> repository -> model
```

## 前端
```
app/page -> features -> components/domain -> components/common -> components/ui
```

## 禁止
- ❌ router 中堆业务逻辑
- ❌ 页面直接拼接后端 URL
- ❌ 未建 migration 就改模型

> 详细规则见 [docs/design-docs/domain-boundaries.md](docs/design-docs/domain-boundaries.md)

---

# 6. 提交前检查清单

- [ ] 没有越层调用
- [ ] 没有敏感信息
- [ ] lint / typecheck / test 通过
- [ ] 文档已同步更新

---

# 7. 常用命令

```bash
pnpm install          # 安装依赖
pnpm dev              # 启动开发
pnpm lint && test && build  # 检查
cd apps/api && alembic upgrade head  # 数据库迁移
```

---

# 8. 相关文档索引

- [架构决策记录](docs/adr/)
- [API 索引](docs/api/api-index.md)
- [数据库 ERD](docs/db/erd-v1.md)
- [执行计划](docs/exec-plans/active/)
- [安全规范](docs/SECURITY.md)
- [可靠性规范](docs/RELIABILITY.md)
