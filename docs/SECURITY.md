# 安全规范

## 强制安全检查

提交代码前必须检查：

- [ ] 无硬编码密钥（API keys、密码、tokens）
- [ ] 所有用户输入已验证
- [ ] SQL 注入防护（使用参数化查询）
- [ ] XSS 防护（HTML 已清理）
- [ ] CSRF 防护已启用
- [ ] 认证/授权已验证
- [ ] 所有端点已限流
- [ ] 错误信息不泄露敏感数据

## 密钥管理

- **禁止**在源代码中硬编码密钥
- **必须**使用环境变量或密钥管理服务
- 启动时验证必需密钥存在
- 密钥泄露后立即轮换

## 安全响应流程

发现安全问题时：

1. **立即停止**
2. 使用 **security-reviewer** agent 审查
3. 修复 CRITICAL 问题后再继续
4. 轮换所有可能泄露的密钥
5. 审查整个代码库的类似问题

## 外部服务密钥

| 服务 | 环境变量 | 用途 |
|------|----------|------|
| Clerk | `CLERK_SECRET_KEY` | 认证服务 |
| Stripe | `STRIPE_SECRET_KEY` | 支付服务 |
| OpenAI | `OPENAI_API_KEY` | AI 服务 |
| R2/S3 | `R2_ACCESS_KEY`, `R2_SECRET_KEY` | 文件存储 |
| Sentry | `SENTRY_DSN` | 错误监控 |
| PostHog | `POSTHOG_KEY` | 产品分析 |
