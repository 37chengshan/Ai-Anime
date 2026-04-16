# Stripe Webhook 调试指南

## 常见问题

### Webhook 未收到

1. 检查 Stripe Dashboard → Webhooks → 端点状态
2. 确认 URL 可公网访问
3. 检查 SSL 证书是否有效

### Webhook 签名验证失败

1. 确认 `STRIPE_WEBHOOK_SECRET` 与 Stripe Dashboard 一致
2. 检查请求体是否被中间件修改（如 body parser）
3. 确认使用原始请求体验证签名

### 事件处理失败

1. 检查 `payment_events` 表是否有记录
2. 查看 `processed` 字段是否为 false
3. 检查应用日志获取错误详情

## 调试步骤

### 1. 本地测试 Webhook

使用 Stripe CLI 转发 webhook 到本地：

```bash
stripe listen --forward-to localhost:8000/api/v1/webhooks/stripe
```

### 2. 触发测试事件

```bash
stripe trigger checkout.session.completed
stripe trigger customer.subscription.created
stripe trigger customer.subscription.updated
stripe trigger invoice.payment_succeeded
stripe trigger invoice.payment_failed
```

### 3. 查看事件日志

```bash
# Stripe CLI 日志
stripe logs

# 应用日志
# 查看 Sentry 或应用日志
```

### 4. 重试失败事件

在 Stripe Dashboard → Webhooks → 选择事件 → 重试

## 关键事件

| 事件类型 | 处理逻辑 |
|----------|----------|
| `checkout.session.completed` | 创建订阅记录 |
| `customer.subscription.updated` | 更新订阅状态 |
| `customer.subscription.deleted` | 取消订阅 |
| `invoice.payment_succeeded` | 确认付款 |
| `invoice.payment_failed` | 标记付款失败 |

## 幂等保证

- `payment_events(provider, event_id)` 唯一约束
- 重复事件不会重复处理
- 处理逻辑使用数据库事务保证原子性
