# ADR-002: Next.js + FastAPI 双运行时

## 状态

Accepted

## 背景

项目需要：
- 前台页面的 SEO 和良好用户体验
- 后台 API 的稳定性和性能
- AI 编排和异步任务处理

## 决策

采用双运行时架构：

- **Next.js (apps/web)**：前台页面 + BFF + Webhook 入口
- **FastAPI (apps/api)**：核心业务 API + AI 编排 + 服务层

## 理由

### Next.js 负责 Web

1. **SEO 优先**：App Router 支持服务端渲染
2. **BFF 模式**：Server Actions 可聚合后端调用
3. **Webhook 入口**：Clerk/Stripe webhook 需要公网可访问端点
4. **用户体验**：React 组件生态丰富

### FastAPI 负责 API

1. **性能**：Python 异步框架，适合 AI 编排
2. **生态**：SQLAlchemy、Pydantic、Alembic 完整工具链
3. **AI 库支持**：Python AI 库生态成熟
4. **异步任务**：Celery 集成成熟

## 影响

- 正面：各运行时职责清晰，技术栈匹配场景
- 负面：需要维护两套技术栈

## 通信方式

- Web → API：HTTP REST API
- Web ← Clerk/Stripe：Webhook
- API → Worker：Celery Queue

## 替代方案

### 全 Next.js

- 优点：单一技术栈
- 缺点：AI 编排在 Node.js 不成熟
- 结论：不适合 AI 场景

### 全 FastAPI

- 优点：单一技术栈
- 缺点：前端体验不如 Next.js，SEO 困难
- 结论：不适合前台场景