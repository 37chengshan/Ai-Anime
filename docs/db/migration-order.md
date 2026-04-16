# Migration 顺序

本文档记录数据库 migration 的执行顺序和依赖关系。

## Migration 命名规范

```
{序号}_{描述}.py

例：001_initial_schema.py
```

## 执行顺序

### 第一批：基础表（必须）

| 序号 | 文件名 | 说明 | 依赖 |
|------|--------|------|------|
| 001 | 001_create_users.py | 用户表 | 无 |
| 002 | 002_create_user_profiles.py | 用户资料表 | 001 |
| 003 | 003_create_user_settings.py | 用户设置表 | 001 |
| 004 | 004_create_tags.py | 标签表 | 无 |
| 005 | 005_create_posts.py | 作品表 | 001 |
| 006 | 006_create_post_assets.py | 作品资源表 | 005 |
| 007 | 007_create_post_tag_relations.py | 作品标签关系表 | 005, 004 |
| 008 | 008_create_comments.py | 评论表 | 005, 001 |
| 009 | 009_create_post_likes.py | 点赞表 | 005, 001 |
| 010 | 010_create_post_favorites.py | 收藏表 | 005, 001 |
| 011 | 011_create_user_follow_relations.py | 关注关系表 | 001 |

### 第二批：AI / 订阅基础

| 序号 | 文件名 | 说明 | 依赖 |
|------|--------|------|------|
| 012 | 012_create_membership_plans.py | 会员方案表 | 无 |
| 013 | 013_create_subscriptions.py | 订阅表 | 001, 012 |
| 014 | 014_create_orders.py | 订单表 | 001 |
| 015 | 015_create_payment_events.py | 支付事件表 | 无 |
| 016 | 016_create_entitlements.py | 权益表 | 001 |
| 017 | 017_create_quota_accounts.py | 配额账户表 | 001 |
| 018 | 018_create_quota_transactions.py | 配额交易表 | 017 |
| 019 | 019_create_ai_conversations.py | AI 会话表 | 001 |
| 020 | 020_create_ai_messages.py | AI 消息表 | 019 |
| 021 | 021_create_ai_usage_logs.py | AI 使用日志表 | 001 |

### 第三批：教程系统

| 序号 | 文件名 | 说明 | 依赖 |
|------|--------|------|------|
| 022 | 022_create_tutorials.py | 教程表 | 001 |
| 023 | 023_create_tutorial_chapters.py | 教程章节表 | 022 |

### 第四批：搜索 / 审核

| 序号 | 文件名 | 说明 | 依赖 |
|------|--------|------|------|
| 024 | 024_create_search_documents.py | 搜索文档表 | 无 |
| 025 | 025_create_search_embeddings.py | 搜索向量表 | 无 |
| 026 | 026_create_reports.py | 举报表 | 001 |
| 027 | 027_create_moderation_cases.py | 审核案例表 | 无 |
| 028 | 028_create_moderation_actions.py | 审核动作表 | 027 |
| 029 | 029_create_audit_logs.py | 审计日志表 | 001 |

### 第五批：索引

| 序号 | 文件名 | 说明 | 依赖 |
|------|--------|------|------|
| 030 | 030_create_indexes.py | 创建所有索引 | 001-029 |
| 031 | 031_enable_extensions.py | 启用扩展（pgvector等） | 无 |

## 索引清单

### 高频查询索引

```sql
-- 作品索引
CREATE INDEX idx_posts_status_published ON posts(status, published_at DESC);
CREATE INDEX idx_posts_author ON posts(author_user_id, published_at DESC);

-- 评论索引
CREATE INDEX idx_comments_post ON comments(post_id, created_at ASC);
CREATE INDEX idx_comments_author ON comments(author_user_id, created_at DESC);

-- 订阅索引
CREATE INDEX idx_subscriptions_user_status ON subscriptions(user_id, status);

-- AI 使用日志索引
CREATE INDEX idx_ai_usage_logs_user ON ai_usage_logs(user_id, created_at DESC);
CREATE INDEX idx_ai_usage_logs_scene ON ai_usage_logs(scene, created_at DESC);

-- 搜索索引
CREATE INDEX idx_search_documents_tsv ON search_documents USING GIN(tsv);
```

### 唯一约束

```sql
-- 用户
ALTER TABLE users ADD CONSTRAINT uk_users_clerk_id UNIQUE (clerk_user_id);
ALTER TABLE users ADD CONSTRAINT uk_users_email UNIQUE (email);
ALTER TABLE users ADD CONSTRAINT uk_users_username UNIQUE (username);

-- 订阅
ALTER TABLE subscriptions ADD CONSTRAINT uk_subscriptions_stripe_id UNIQUE (stripe_subscription_id);

-- 支付事件
ALTER TABLE payment_events ADD CONSTRAINT uk_payment_events_provider_event UNIQUE (provider, event_id);

-- 互动
ALTER TABLE post_likes ADD CONSTRAINT uk_post_likes UNIQUE (post_id, user_id);
ALTER TABLE post_favorites ADD CONSTRAINT uk_post_favorites UNIQUE (post_id, user_id);
ALTER TABLE post_tag_relations ADD CONSTRAINT uk_post_tag_relations UNIQUE (post_id, tag_id);

-- 关注
ALTER TABLE user_follow_relations ADD CONSTRAINT uk_user_follow UNIQUE (follower_user_id, followee_user_id);

-- 配额
ALTER TABLE quota_accounts ADD CONSTRAINT uk_quota_accounts_user UNIQUE (user_id);

-- 搜索
ALTER TABLE search_documents ADD CONSTRAINT uk_search_documents_source UNIQUE (source_type, source_id);
```
