# 数据库 Schema 词汇表

本文档详细说明各表的字段和用途。

## 用户与身份域

### users

用户账户表，与 Clerk 同步。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| clerk_user_id | varchar(128) | Clerk 用户 ID，唯一 |
| email | varchar(255) | 邮箱，唯一 |
| username | varchar(64) | 平台用户名，唯一 |
| status | varchar(32) | active / banned / deleted |
| role | varchar(32) | user / creator / admin |
| last_login_at | timestamptz | 最近登录时间 |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |

### user_profiles

用户资料表。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| user_id | uuid | FK users.id |
| display_name | varchar(100) | 展示名 |
| avatar_url | text | 头像 URL |
| bio | text | 简介 |
| website | text | 主页 |
| social_links | jsonb | 社交链接 |
| creator_badge | boolean | 是否创作者 |

### user_settings

用户设置表。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| user_id | uuid | FK |
| locale | varchar(16) | 语言 |
| theme | varchar(16) | 主题 |
| email_notifications | boolean | 邮件通知 |
| push_notifications | boolean | 推送通知 |
| content_filter_level | varchar(32) | 内容过滤等级 |

### user_follow_relations

用户关注关系表。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| follower_user_id | uuid | 关注者 |
| followee_user_id | uuid | 被关注者 |
| created_at | timestamptz | 创建时间 |

## 社区内容域

### posts

作品/帖子表。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| author_user_id | uuid | 作者 |
| title | varchar(200) | 标题 |
| slug | varchar(220) | SEO slug |
| content | text | 正文 |
| excerpt | varchar(500) | 摘要 |
| visibility | varchar(32) | public / followers / private |
| status | varchar(32) | draft / processing / published / flagged / archived |
| cover_asset_id | uuid | 封面资源 ID |
| ai_assisted | boolean | 是否使用 AI 辅助 |
| like_count | integer | 点赞数（冗余） |
| favorite_count | integer | 收藏数（冗余） |
| comment_count | integer | 评论数（冗余） |
| published_at | timestamptz | 发布时间 |

### post_assets

作品资源表（图片等）。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| post_id | uuid | FK posts.id |
| uploader_user_id | uuid | 上传用户 |
| kind | varchar(32) | original / thumbnail / webp / cover |
| bucket | varchar(100) | 存储桶 |
| object_key | text | 对象 key |
| mime_type | varchar(100) | 文件类型 |
| width | integer | 宽 |
| height | integer | 高 |
| size_bytes | bigint | 文件大小 |
| checksum | varchar(128) | 文件校验值 |
| status | varchar(32) | uploaded / processed / failed |
| moderation_status | varchar(32) | pending / passed / rejected |

### tags

标签表。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| name | varchar(50) | 标签名，唯一 |
| slug | varchar(60) | 唯一 slug |
| description | varchar(255) | 描述 |

### post_tag_relations

作品标签关系表。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| post_id | uuid | FK |
| tag_id | uuid | FK |
| created_at | timestamptz | 创建时间 |

### comments

评论表。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| post_id | uuid | FK posts.id |
| author_user_id | uuid | 评论作者 |
| parent_comment_id | uuid | 父评论 ID（嵌套回复） |
| content | text | 评论内容 |
| status | varchar(32) | visible / hidden / flagged |
| ai_assisted | boolean | 是否使用 AI 辅助 |

### post_likes

点赞表。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| post_id | uuid | FK |
| user_id | uuid | FK |
| created_at | timestamptz | 创建时间 |

### post_favorites

收藏表。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| post_id | uuid | FK |
| user_id | uuid | FK |
| created_at | timestamptz | 创建时间 |

## 教程与订阅域

### tutorials

教程表。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| author_user_id | uuid | 作者 |
| title | varchar(200) | 标题 |
| slug | varchar(220) | 唯一 slug |
| summary | varchar(500) | 摘要 |
| cover_asset_id | uuid | 封面 |
| access_level | varchar(32) | public / member / premium |
| status | varchar(32) | draft / published / archived |
| published_at | timestamptz | 发布时间 |

### tutorial_chapters

教程章节表。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| tutorial_id | uuid | FK |
| title | varchar(200) | 章节标题 |
| content | text | 正文 |
| position | integer | 排序 |
| is_preview | boolean | 是否可试看 |

### membership_plans

会员方案表。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| code | varchar(50) | basic_monthly / pro_monthly |
| name | varchar(100) | 方案名 |
| price_cents | integer | 金额（分） |
| currency | varchar(16) | 币种 |
| billing_interval | varchar(16) | month / year |
| ai_quota_monthly | integer | 每月 AI 配额 |
| tutorial_access_level | varchar(32) | member / premium |
| active | boolean | 是否启用 |

### subscriptions

订阅表。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| user_id | uuid | 订阅用户 |
| plan_id | uuid | 会员方案 |
| stripe_customer_id | varchar(128) | Stripe customer |
| stripe_subscription_id | varchar(128) | Stripe subscription |
| status | varchar(32) | trialing / active / past_due / canceled |
| current_period_start | timestamptz | 当前周期开始 |
| current_period_end | timestamptz | 当前周期结束 |
| cancel_at_period_end | boolean | 是否周期结束取消 |

### orders

订单表。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| user_id | uuid | 用户 |
| type | varchar(32) | subscription / credits |
| amount_cents | integer | 金额 |
| currency | varchar(16) | 币种 |
| status | varchar(32) | pending / paid / failed / refunded |
| stripe_invoice_id | varchar(128) | Stripe 发票 ID |
| stripe_payment_intent_id | varchar(128) | 支付 ID |

### payment_events

支付事件表。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| provider | varchar(32) | stripe |
| event_id | varchar(128) | 外部事件 ID |
| event_type | varchar(100) | 事件类型 |
| payload | jsonb | 原始事件 |
| processed | boolean | 是否处理完成 |
| processed_at | timestamptz | 处理时间 |

### entitlements

权益表。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| user_id | uuid | 用户 |
| source_type | varchar(32) | subscription / admin_grant |
| source_id | uuid | 来源 ID |
| entitlement_key | varchar(64) | tutorial.member / ai.monthly |
| value | integer | 数值型权益 |
| status | varchar(32) | active / expired |
| starts_at | timestamptz | 开始时间 |
| ends_at | timestamptz | 结束时间 |

## AI 与配额域

### ai_conversations

AI 会话表。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| user_id | uuid | 所属用户 |
| scene | varchar(32) | write_post / write_comment / site_search |
| title | varchar(200) | 会话标题 |
| status | varchar(32) | active / archived |

### ai_messages

AI 消息表。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| conversation_id | uuid | FK |
| role | varchar(16) | system / user / assistant / tool |
| content | text | 内容 |
| token_count | integer | token 数 |
| model | varchar(64) | 使用模型 |

### quota_accounts

配额账户表。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| user_id | uuid | 用户 |
| balance | integer | 当前总余额 |
| monthly_quota | integer | 月额度 |
| bonus_quota | integer | 奖励额度 |
| extra_purchased_quota | integer | 额外购买额度 |
| current_period_start | timestamptz | 周期开始 |
| current_period_end | timestamptz | 周期结束 |

### quota_transactions

配额交易表。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| account_id | uuid | 账户 |
| user_id | uuid | 用户 |
| type | varchar(32) | consume / grant / reset / refund |
| scene | varchar(32) | write_post / write_comment / site_search |
| delta | integer | 变化量 |
| balance_after | integer | 变更后余额 |
| reference_type | varchar(32) | ai_usage / subscription / admin |
| reference_id | uuid | 来源 |

### ai_usage_logs

AI 使用日志表。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| user_id | uuid | 用户 |
| scene | varchar(32) | 调用场景 |
| provider | varchar(32) | openai-compatible |
| model | varchar(64) | 模型名 |
| input_tokens | integer | 输入 token |
| output_tokens | integer | 输出 token |
| latency_ms | integer | 延迟 |
| status | varchar(32) | success / failed / blocked |
| error_code | varchar(64) | 错误码 |
| request_id | varchar(128) | 请求流水 |

## 搜索与发现域

### search_documents

搜索文档表。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| source_type | varchar(32) | post / tutorial / creator |
| source_id | uuid | 源对象 ID |
| title | text | 标题 |
| body | text | 主体摘要 |
| tags_text | text | 标签聚合文本 |
| tsv | tsvector | 全文索引列 |
| status | varchar(32) | active / archived |

### search_embeddings

搜索向量表。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| source_type | varchar(32) | post / tutorial / creator |
| source_id | uuid | 源对象 ID |
| chunk_index | integer | 分片序号 |
| content | text | 分片文本 |
| embedding | vector | pgvector 向量 |
| model | varchar(64) | embedding 模型 |

## 审核与运营域

### reports

举报表。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| reporter_user_id | uuid | 举报人 |
| target_type | varchar(32) | post / comment / user |
| target_id | uuid | 目标 ID |
| reason_code | varchar(32) | spam / nsfw / abuse |
| description | text | 补充说明 |
| status | varchar(32) | open / reviewing / resolved / rejected |

### moderation_cases

审核案例表。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| source_type | varchar(32) | asset / post / comment / report |
| source_id | uuid | 来源 |
| risk_score | numeric(5,2) | 风险分 |
| decision | varchar(32) | pending / passed / rejected / manual_review |
| reviewer_user_id | uuid | 审核员 |
| notes | text | 备注 |

### moderation_actions

审核动作表。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| case_id | uuid | FK |
| action_type | varchar(32) | hide_post / delete_comment / ban_user |
| operator_user_id | uuid | 执行人 |
| metadata | jsonb | 附加信息 |

### audit_logs

审计日志表。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| actor_user_id | uuid | 操作人 |
| action | varchar(100) | 操作名 |
| target_type | varchar(32) | 目标类型 |
| target_id | uuid | 目标 ID |
| metadata | jsonb | 变更上下文 |
