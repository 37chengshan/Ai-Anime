# 计划管理指南

本文档说明如何管理项目计划。

## 计划层次

```
Roadmap (路线图) — docs/ROADMAP.md
   └── Phase (阶段) — 6 个 Phase (0-5)
         └── Plan (计划) — docs/exec-plans/active/*
               └── Task (任务) — Plan 文件中的任务列表
```

## 文档关系

| 文档 | 职责 | 位置 |
|------|------|------|
| **ROADMAP.md** | 路线图总览，Phase 规划，成功标准 | `docs/ROADMAP.md` |
| **PLANS.md** | 计划管理指南，模板规范 | `docs/PLANS.md` (本文档) |
| **EP-XXX.md** | 具体执行计划，任务拆解 | `docs/exec-plans/active/` |
| **ai_anime_community_execution_v1_optimized.md** | 详细工程执行文档 | `docs/design-docs/` |

## 路线图入口

**总览**: [ROADMAP.md](./ROADMAP.md) — 查看 Phase 0-5 的完整规划。

**当前进度**: 
- Phase 0: 🟡 进行中 → [EP-001-foundation-setup.md](./exec-plans/active/EP-001-foundation-setup.md)
- Phase 1-5: ⚪ 未开始

## 执行计划格式

每个执行计划存储在 `docs/exec-plans/` 目录：

```
docs/exec-plans/
├── active/           # 进行中的计划
│   └── EP-001-*.md
├── completed/        # 已完成的计划
│   └── EP-001-*.md
└── tech-debt-tracker.md  # 技术债跟踪
```

## 计划模板

```markdown
# EP-XXX: [计划名称]

## 目标
[一句话说明]

## 任务拆解
- [ ] 任务1
- [ ] 任务2
- [ ] 任务3

## 完成定义（DoD）
- [ ] 条件1
- [ ] 条件2

## 验收标准
1. 标准1
2. 标准2
```

## 状态流转

1. **新建**：创建计划文件在 `active/`
2. **进行中**：执行任务，更新复选框
3. **完成**：移动到 `completed/`，更新索引
4. **阻塞**：记录阻塞原因，创建后续任务

## 技术债跟踪

使用 `tech-debt-tracker.md` 记录：

- 妥协决策
- 原因
- 影响
- 后续处理计划
