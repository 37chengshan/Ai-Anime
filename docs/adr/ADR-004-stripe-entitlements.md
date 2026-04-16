# ADR-004: Stripe Entitlements 权益管理

## 状态

Accepted

## 背景

需要管理会员权益：
- 教程访问权限
- AI 配额额度
- 多种订阅方案

## 冈策

采用**支付事实源与权限执行源分离**模式：

- **Stripe**：支付事实源（订阅状态、付款记录）
- **本地 entitlements 表**：权限执行源（权益状态）
- **Webhook 驱动同步**：Stripe 事件触发本地权益更新

## 理由

1. **事实源唯一**：Stripe 是支付状态的权威来源
2. **本地控制**：权益执行不需要实时调用 Stripe API
3. **容错性**：Webhook 失败时可补偿同步
4. **灵活性**：可添加非 Stripe 来源的权益（如管理员授予）

## 权益类型

| entitlement_key | 说明 | value 类型 |
|-----------------|------|------------|
| `tutorial.member` | 会员教程访问权限 | 无（布尔型） |
| `tutorial.premium` | 高级教程访问权限 | 无（布尔型） |
| `ai.monthly` | AI 月度配额 | 数值型 |

## 同步流程

```
Stripe Webhook → payment_events 入库 → subscription_service 同步
                 → entitlements 更新 → quota_accounts 同步
```

## 影响

- 正面：权益查询快（本地数据库），支付状态权威（Stripe）
- 负面：需要维护同步逻辑，可能存在短暂不一致

## 补偿机制

- 定时任务：每小时核对活跃订阅与权益状态
- 手动触发：管理员可手动触发指定用户的权益同步