# 领域边界划分

## 用户域 (User Domain)

**聚合根**: `User`

**实体**:
- `User` - 用户账户
- `UserProfile` - 用户资料
- `UserSettings` - 用户设置
- `UserFollowRelation` - 关注关系

**服务**:
- `UserService` - 用户管理
- `AuthService` - 认证（委托给 Clerk）

## 内容域 (Content Domain)

**聚合根**: `Post`

**实体**:
- `Post` - 作品/帖子
- `PostAsset` - 作品资源（图片等）
- `Tag` - 标签
- `PostTagRelation` - 作品标签关系
- `Comment` - 评论
- `PostLike` - 点赞
- `PostFavorite` - 收藏

**服务**:
- `PostService` - 作品管理
- `CommentService` - 评论管理
- `UploadService` - 上传管理

## 教程域 (Tutorial Domain)

**聚合根**: `Tutorial`

**实体**:
- `Tutorial` - 教程
- `TutorialChapter` - 教程章节

**服务**:
- `TutorialService` - 教程管理

## 订阅域 (Subscription Domain)

**聚合根**: `Subscription`

**实体**:
- `MembershipPlan` - 会员方案
- `Subscription` - 订阅
- `Order` - 订单
- `PaymentEvent` - 支付事件
- `Entitlement` - 权益

**服务**:
- `SubscriptionService` - 订阅管理
- `BillingService` - 账单管理

## AI 域 (AI Domain)

**聚合根**: `AIConversation`

**实体**:
- `AIConversation` - AI 会话
- `AIMessage` - AI 消息
- `QuotaAccount` - 配额账户
- `QuotaTransaction` - 配额交易
- `AIUsageLog` - AI 使用日志

**服务**:
- `AIGateway` - AI 调用网关
- `QuotaService` - 配额管理

## 搜索域 (Search Domain)

**聚合根**: `SearchDocument`

**实体**:
- `SearchDocument` - 搜索文档
- `SearchEmbedding` - 向量嵌入

**服务**:
- `SearchService` - 搜索服务

## 审核域 (Moderation Domain)

**聚合根**: `ModerationCase`

**实体**:
- `Report` - 举报
- `ModerationCase` - 审核案例
- `ModerationAction` - 审核动作
- `AuditLog` - 审计日志

**服务**:
- `ModerationService` - 审核管理
