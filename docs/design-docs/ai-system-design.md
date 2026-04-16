# AI 系统设计

## 架构概览

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Frontend    │────►│  AI Router   │────►│  AI Gateway  │
│  (Web)       │     │  (FastAPI)   │     │              │
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                  │
                    ┌─────────────────────────────┼────────────────┐
                    │                             │                │
                    ▼                             ▼                ▼
             ┌──────────┐              ┌──────────────┐   ┌──────────┐
             │  Quota   │              │  Provider    │   │  Safety  │
             │  Check   │              │  (OpenAI等)  │   │  Filter  │
             └──────────┘              └──────────────┘   └──────────┘
```

## AI Gateway 职责

1. **配额前置检查**：调用前检查 quota_accounts 余额
2. **Provider 抽象**：统一接口调用不同 AI Provider
3. **超时/重试/fallback**：配置化的超时和重试策略
4. **安全过滤**：输入输出经过安全检查
5. **使用日志**：记录 ai_usage_logs 和 quota_transactions

## 场景配置

| 场景 | 模型 | 用途 | 配额消耗 |
|------|------|------|----------|
| write_post | gpt-4o-mini | 辅助写帖子描述 | 1 unit/call |
| write_comment | gpt-4o-mini | 辅助写评论 | 1 unit/call |
| site_search | gpt-4o | 站内 AI 问答 | 3 units/call |

## Prompt 资产化

Prompt 模板存储在 `packages/prompts/`，结构化输出 schema 与模板绑定：

```
packages/prompts/
├── write_post/
│   ├── system.md
│   ├── user_template.md
│   └── output_schema.json
├── write_comment/
│   ├── system.md
│   ├── user_template.md
│   └── output_schema.json
└── site_search/
    ├── system.md
    ├── user_template.md
    └── output_schema.json
```

## 配额系统

- 每月配额由订阅方案决定
- 调用 AI 前检查余额，余额不足返回 402
- 调用失败自动退款
- 配额变更记录 quota_transactions
