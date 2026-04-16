# 架构原则

## 分层原则

### 前端分层

```
app/           → 路由、布局、页面壳层、数据入口
features/      → 业务域逻辑、组装组件、hooks、actions
components/ui/ → 纯 UI 基础组件
lib/api/       → 统一请求入口
```

**禁止**：
- 页面直接拼接后端 URL
- 组件内散落模型调用逻辑
- 把所有状态塞进 Zustand

### 后端分层

```
routers/    → 协议层，不写大业务逻辑
services/   → 主业务逻辑与事务边界
repositories/ → 数据库访问
ai/         → 模型编排与检索系统
tasks/      → 异步任务入口
```

**禁止**：
- router 直接操作多个 repository 拼业务
- service 直接写原始 SQL 散落在业务里
- webhook 处理逻辑直接写在路由函数里

## 依赖原则

1. **单向依赖**：上层依赖下层，下层不依赖上层
2. **接口隔离**：层与层之间通过接口（或类型）通信
3. **共享包最小化**：packages/ 只放真正需要共享的代码

## 数据原则

1. **事实源唯一**：支付事实源是 Stripe，权限执行源是本地 entitlements 表
2. **冗余计数只做优化**：like_count 等冗余字段只做读优化，事实源仍是关系表
3. **外部 ID 单独约束**：clerk_user_id、stripe_subscription_id 等外部 ID 必须有唯一约束

## AI 原则

1. **Gateway 统一入口**：所有 AI 调用必须经过 AI Gateway
2. **场景配置化**：不同场景使用不同模型配置
3. **配额前置检查**：调用 AI 前必须检查配额
4. **失败不扣减**：AI 调用失败自动退款
