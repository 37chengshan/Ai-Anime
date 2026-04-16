# API 文档索引

本目录包含所有 API 端点的详细文档。

## API 概览

- 基础路径：`/api/v1`
- 认证：Clerk JWT Token
- 分页：游标分页
- 错误格式：RFC 7807 Problem Details

## 端点分类

| 文档 | 说明 | 端点数 |
|------|------|--------|
| [auth.md](./auth.md) | 认证与用户 | 4 |
| [posts.md](./posts.md) | 作品与内容 | 7 |
| [tutorials.md](./tutorials.md) | 教程与会员 | 4 |
| [subscriptions.md](./subscriptions.md) | 订阅与账单 | 5 |
| [ai.md](./ai.md) | AI 能力 | 5 |
| [admin.md](./admin.md) | 举报与审核 | 5 |

## 通用响应格式

### 成功响应

```json
{
  "data": { ... },
  "meta": {
    "request_id": "uuid"
  }
}
```

### 分页响应

```json
{
  "data": [ ... ],
  "meta": {
    "cursor": "next_cursor",
    "has_more": true,
    "request_id": "uuid"
  }
}
```

### 错误响应

```json
{
  "type": "https://api.example.com/errors/validation",
  "title": "Validation Error",
  "status": 422,
  "detail": "Field 'title' is required",
  "instance": "/api/v1/posts"
}
```

## 认证

所有 API 请求需要 Clerk JWT Token：

```
Authorization: Bearer <clerk_jwt_token>
```

Webhook 端点使用签名验证而非 JWT。
