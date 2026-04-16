# 上传流水线调试指南

## 常见问题

### 签名 URL 获取失败

1. 检查 R2/S3 密钥配置
2. 确认 bucket 存在且有写权限
3. 检查文件大小是否超限

### 上传失败

1. 检查签名 URL 是否过期（默认 15 分钟）
2. 确认 Content-Type 与签名时一致
3. 检查 CORS 配置

### Complete 回调失败

1. 确认 object_key 与签名时一致
2. 检查文件是否确实上传成功
3. 确认 uploader_user_id 与签名用户一致

## 调试步骤

### 1. 测试签名接口

```bash
curl -X POST http://localhost:8000/api/v1/uploads/sign \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"filename": "test.jpg", "content_type": "image/jpeg", "size": 1024}'
```

### 2. 测试上传

使用返回的签名 URL 直接上传文件：

```bash
curl -X PUT "<presigned_url>" \
  -H "Content-Type: image/jpeg" \
  --data-binary @test.jpg
```

### 3. 测试 Complete

```bash
curl -X POST http://localhost:8000/api/v1/uploads/complete \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"object_key": "...", "bucket": "..."}'
```

## 清理孤儿资源

Worker 定时任务会清理：
- 上传但未 complete 的对象（超过 24 小时）
- 签名但未上传的对象（超过 1 小时）

手动清理：

```bash
# 通过 API 触发清理
curl -X POST http://localhost:8000/api/v1/admin/cleanup/orphan-uploads \
  -H "Authorization: Bearer <admin_token>"
```
