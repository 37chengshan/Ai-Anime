# 开发工作流详细规范

> 本文档是 `AGENTS.md` 中工作流规则的详细展开。

---

# 1. 分支与 PR 工作流

## 1.1 Phase 开发流程

```text
1. 从 main 创建分支：git checkout -b phase/N-description
2. 按任务拆解进行开发，每个子任务可独立提交
3. 开发完成后，确保本地测试通过
4. 推送分支：git push -u origin phase/N-description
5. 创建 PR，标题格式：Phase N: 简短描述
6. PR 描述中关联执行计划 EP
7. 等待 CI 通过后合并
8. 合并后删除分支
```

## 1.2 Bug 修复流程

```text
1. 从 main 创建分支：git checkout -b fix/issue-N-description
2. 编写修复代码与测试
3. 推送分支：git push -u origin fix/issue-N-description
4. 创建 PR，标题格式：fix: 简短描述
5. PR 描述中说明问题原因与修复方案
6. 等待 CI 通过后合并
```

## 1.3 分支命名规范

| 类型 | 格式 | 示例 |
|---|---|---|
| Phase 开发 | `phase/N-description` | `phase/1-community-mvp` |
| Bug 修复 | `fix/issue-N-description` | `fix/issue-42-login-error` |
| 功能开发 | `feat/description` | `feat/user-profile` |
| 重构 | `refactor/description` | `refactor/auth-module` |
| 文档 | `docs/description` | `docs/api-guide` |

## 1.4 PR 标题规范

```text
Phase N: 描述          # Phase 开发
fix: 描述              # Bug 修复
feat: 描述             # 新功能
refactor: 描述         # 重构
docs: 描述             # 文档更新
```

## 1.5 PR 合并条件

- [ ] CI 检查通过（lint / typecheck / test / build）
- [ ] 至少 1 人 Review 通过（个人项目可自审）
- [ ] 无未解决的讨论
- [ ] 关联的 EP 状态已更新

## 1.6 PR 描述模板

```markdown
## 改动内容
- ...

## 为什么改
- ...

## 影响范围
- 目录 / 域

## 是否涉及
- [ ] DB 变更
- [ ] API 变更
- [ ] 权限 / 支付 / AI
- [ ] 文档更新

## 验证方式
- ...
```

## 1.7 PR 工作流总览

```text
main (受保护)
  │
  ├── phase/1-community-mvp     → PR → 合并 → 删除分支
  ├── phase/2-ai-features       → PR → 合并 → 删除分支
  ├── fix/issue-42-login-error  → PR → 合并 → 删除分支
  └── feat/user-profile         → PR → 合并 → 删除分支
```

---

# 2. 标准工作顺序

## 2.1 开发新功能

```text
1. 查看 docs/ROADMAP.md，确认当前 Phase 与优先级
2. 查看是否已有对应 EP（execution plan）
3. 阅读相关 docs/design-docs/、docs/product-specs/、docs/adr/
4. 明确改动影响：前端 / API / DB / worker / docs
5. 先改 contracts 与文档，再实现代码
6. 先写或补测试，再完成实现
7. 本地自检：lint / typecheck / test / build
8. 同步更新文档与计划状态
9. 创建 PR
```

## 2.2 修复 Bug

```text
1. 复现问题并记录最小复现路径
2. 判断影响层：web / api / worker / db / external webhook
3. 先写失败测试或最小复现脚本
4. 修复时遵守原有分层，不跨层"就近修"
5. 回归关键路径
6. 更新 runbook / 文档（如有必要）
7. 创建 PR
```

## 2.3 数据库变更

```text
1. 先更新 docs/db/erd-v1.md 或 schema-glossary.md
2. 新建 migration
3. 检查 upgrade / downgrade
4. 同步更新 ORM 模型、repository、schema
5. 若接口受影响，同步更新 docs/api/ 与 contracts
6. 补 migration 相关测试或回归说明
```

## 2.4 API 变更

```text
1. 先更新 docs/api/
2. 更新 packages/contracts/
3. 后端实现：router -> service -> repository
4. 前端更新：packages/sdk -> features
5. 补集成测试 / 契约测试
6. 更新调用方文档
```

## 2.5 执行计划（EP）变更

```text
1. 大任务先检查 docs/exec-plans/active/ 是否已有计划
2. 若无，则先创建 EP，写明目标、范围、依赖、风险、验收标准
3. 实现过程中持续更新状态，不要只改代码不改计划
4. 完成后移入 docs/exec-plans/completed/
```

---

# 3. 什么时候必须先写执行计划（EP）

满足以下任一条件，必须先写 `docs/exec-plans/active/EP-*.md`：

- 改动跨 **2 个以上运行时**（如 web + api，或 api + worker）
- 改动涉及 **数据库 schema**
- 改动涉及 **支付、权限、AI 配额、审核** 等高风险域
- 改动预计超过 **1 天**
- 改动会影响多个页面、多个 API 或多个表
- 需要分阶段上线或有迁移步骤

小修复、小样式调整、纯文案改动通常不需要 EP。

---

# 4. 变更影响矩阵

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

# 5. 文档同步规则

| 改动类型 | 至少更新 |
|---|---|
| 新增接口 / 字段 | `docs/api/` + `packages/contracts/` |
| 新增表 / 字段 / 索引 | `docs/db/` + migration |
| 调整架构边界 | `ARCHITECTURE.md` + `docs/adr/` |
| 改变产品流程 | `docs/design-docs/` 或 `docs/product-specs/` |
| 新增长任务 | `docs/exec-plans/active/` |
| Phase 进度变化 | `docs/ROADMAP.md` |

---

# 6. 测试与完成标准

## 6.1 最低测试要求

- 新功能：至少覆盖主路径
- Bug 修复：必须有失败测试或稳定复现说明
- API 变更：至少有集成测试或契约测试
- DB 变更：至少验证 migration 可升级/回滚
- 高风险域（支付 / AI 配额 / 审核）：必须有关键路径测试

## 6.2 完成定义（DoD）

- [ ] 代码实现完成
- [ ] 测试通过
- [ ] lint / typecheck 通过
- [ ] 文档同步更新
- [ ] 关键日志 / 埋点已补
- [ ] 若涉及用户路径，已做最小回归验证
- [ ] 若涉及计划项，EP 状态已更新

---

# 7. Commit 规范

```text
<type>: <description>
```

类型：`feat` | `fix` | `refactor` | `docs` | `test` | `chore` | `perf` | `ci`

---

# 8. 禁止事项

- ❌ 直接在页面里调用后端裸 URL
- ❌ 在多个 service 各自维护 AI provider client
- ❌ 将业务逻辑塞进 router 或 webhook handler
- ❌ 未建 migration 就直接改模型
- ❌ 未更新 contracts 就修改 API 请求/响应结构
- ❌ 让前端直接以 Stripe 返回值作为最终权限事实源
- ❌ 把临时脚本混入正式代码路径
- ❌ 未写任何测试就提交高风险域改动
- ❌ 直接推送到 main 分支

---

# 9. 快速决策规则

1. **先保证边界清晰，再追求省事**
2. **先保证主路径稳定，再补"高级能力"**
3. **先补最小文档，再继续扩展实现**
4. **优先复用已有模式，不引入第二套做法**
5. **涉及支付、权限、AI 配额时，优先保守而可审计**
