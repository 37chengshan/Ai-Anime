# 教程与会员订阅规格

## 教程系统

### 教程列表页

- URL: `/tutorials`
- 展示所有教程卡片
- 区分：免费 / 会员 / 高级会员

### 教程详情页

- URL: `/tutorial/[slug]`
- 教程标题 + 封面 + 简介
- 章节列表（带试看标识）
- 访问权限提示：
  - 免费：直接观看
  - 会员：需订阅会员
  - 高级会员：需高级会员订阅

### 试看机制

- 每个教程有部分章节可试看
- 试看章节不收费
- 完整内容需订阅

## 会员订阅

### 会员页

- URL: `/membership`
- 展示会员方案
- 方案对比表
- 购买按钮 → Stripe Checkout

### 方案内容

| 方案 | 价格 | 教程访问 | AI 配额 |
|------|------|----------|---------|
| Basic | ¥9/月 | 会员教程 | 100 次/月 |
| Pro | ¥29/月 | 全部教程 | 500 次/月 |

### 权益联动

- 订阅成功 → entitlements 更新 → quota_accounts 同步月额度
- 取消订阅 → 周期结束后权益失效

## API

| 端点 | 说明 |
|------|------|
| `GET /api/v1/tutorials` | 教程列表 |
| `GET /api/v1/tutorials/{slug}` | 教程详情 |
| `GET /api/v1/subscriptions/plans` | 会员方案 |
| `POST /api/v1/subscriptions/checkout` | 创建 Checkout |
| `GET /api/v1/subscriptions/current` | 当前订阅 |
| `POST /api/v1/subscriptions/portal` | Billing Portal |