# 作品详情页规格

## 页面

- URL: `/post/[postId]`

## 内容展示

### 作品主体

- 作品图片画廊（支持多图）
- 作品标题
- 作者信息（头像、名字、简介、关注按钮）
- 作品描述（正文）
- 标签列表
- 发布时间
- 互动按钮（点赞、收藏、分享）

### 评论区域

- 评论列表（支持嵌套回复）
- 评论输入框（带 AI 辅助按钮）
- 每条评论：作者头像、名字、内容、时间、回复按钮

### 相关推荐

- 同作者其他作品
- 同标签热门作品

## 互动状态

- 点赞状态实时显示
- 收藏状态实时显示
- 关注状态实时显示

## API

| 端点 | 说明 |
|------|------|
| `GET /api/v1/posts/{postId}` | 作品详情 |
| `GET /api/v1/posts/{postId}/comments` | 评论列表 |
| `POST /api/v1/posts/{postId}/like` | 点赞 |
| `DELETE /api/v1/posts/{postId}/like` | 取消点赞 |
| `POST /api/v1/posts/{postId}/favorite` | 收藏 |
| `DELETE /api/v1/posts/{postId}/favorite` | 取消收藏 |