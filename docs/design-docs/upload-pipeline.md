# 上传流水线设计

## 流程

```
前端申请签名 URL (POST /api/v1/uploads/sign)
  → 客户端直传对象存储 (R2/S3)
  → 通知服务端上传完成 (POST /api/v1/uploads/complete)
  → 创建 post
  → post 进入 processing 状态
  → worker 触发：
     1. 生成缩略图
     2. 运行内容审核
     3. 生成 embedding
     4. 刷新搜索索引
  → 状态最终变为 published / flagged
```

## 关键设计

### 两段式上传

1. **sign**：服务端生成预签名 URL，返回给前端
2. **complete**：前端上传完成后通知服务端，服务端验证并创建 asset 记录

### 幂等保证

- complete 接口幂等：重复调用返回相同结果
- object_key + uploader 归属校验

### 异步处理

上传完成后，以下任务异步执行：
- 缩略图生成
- 内容审核
- 向量嵌入
- 搜索索引刷新

### 清理机制

- worker 定时清理孤儿资源（上传但未 complete 的对象）
- 超时未 complete 的签名自动失效

## API

| 端点 | 说明 |
|------|------|
| `POST /api/v1/uploads/sign` | 申请上传签名 URL |
| `POST /api/v1/uploads/complete` | 通知上传完成 |
| `POST /api/v1/uploads/abort` | 取消上传/清理临时对象 |
