# 创作者主页规格

## 页面

- URL: `/creator/[handle]`

## 内容展示

### 创作者信息卡片

- 头像
- 显示名称
- 用户名（@handle）
- 简介
- 网站/社交链接
- 创作者徽章
- 关注按钮
- 粉丝数 / 作品数 / 获赞数

### 作品流

- 创作者发布的所有作品
- 分页：游标分页
- 支持筛选：全部 / 最新 / 热门

## API

| 端点 | 说明 |
|------|------|
| `GET /api/v1/creators/{handle}` | 创作者主页详情 |
| `POST /api/v1/users/{userId}/follow` | 关注用户 |
| `DELETE /api/v1/users/{userId}/follow` | 取消关注 |