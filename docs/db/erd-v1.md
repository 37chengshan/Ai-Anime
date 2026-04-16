# 数据库 ER 图 v1

## 概述

v1 数据库设计包含以下领域：
- 用户与身份域
- 社区内容域
- 教程与订阅域
- AI 与配额域
- 搜索与发现域
- 审核与运营域

## ER 图

```mermaid
erDiagram
    %% 用户与身份域
    users ||--o{ user_profiles : "has"
    users ||--o| user_settings : "has"
    users ||--o{ user_follow_relations : "follows"
    users ||--o{ posts : "authors"
    users ||--o{ comments : "writes"
    users ||--o{ subscriptions : "subscribes"
    users ||--o{ quota_accounts : "has"
    
    users {
        uuid id PK
        varchar clerk_user_id UK
        varchar email UK
        varchar username UK
        varchar status
        varchar role
        timestamptz last_login_at
        timestamptz created_at
        timestamptz updated_at
    }
    
    user_profiles {
        uuid id PK
        uuid user_id FK
        varchar display_name
        text avatar_url
        text bio
        text website
        jsonb social_links
        boolean creator_badge
    }
    
    %% 社区内容域
    posts ||--o{ post_assets : "has"
    posts ||--o{ post_tag_relations : "tagged"
    posts ||--o{ comments : "has"
    posts ||--o{ post_likes : "liked"
    posts ||--o{ post_favorites : "favorited"
    
    posts {
        uuid id PK
        uuid author_user_id FK
        varchar title
        varchar slug UK
        text content
        varchar visibility
        varchar status
        uuid cover_asset_id FK
        boolean ai_assisted
        integer like_count
        integer favorite_count
        integer comment_count
        timestamptz published_at
    }
    
    post_assets {
        uuid id PK
        uuid post_id FK
        uuid uploader_user_id FK
        varchar kind
        varchar bucket
        text object_key
        varchar mime_type
        integer width
        integer height
        bigint size_bytes
        varchar checksum
        varchar status
        varchar moderation_status
    }
    
    %% 教程与订阅域
    tutorials ||--o{ tutorial_chapters : "contains"
    membership_plans ||--o{ subscriptions : "subscribed"
    
    tutorials {
        uuid id PK
        uuid author_user_id FK
        varchar title
        varchar slug UK
        varchar summary
        uuid cover_asset_id FK
        varchar access_level
        varchar status
        timestamptz published_at
    }
    
    subscriptions {
        uuid id PK
        uuid user_id FK
        uuid plan_id FK
        varchar stripe_customer_id
        varchar stripe_subscription_id UK
        varchar status
        timestamptz current_period_start
        timestamptz current_period_end
        boolean cancel_at_period_end
    }
    
    %% AI 与配额域
    ai_conversations ||--o{ ai_messages : "contains"
    quota_accounts ||--o{ quota_transactions : "records"
    
    quota_accounts {
        uuid id PK
        uuid user_id FK
        integer balance
        integer monthly_quota
        integer bonus_quota
        integer extra_purchased_quota
        timestamptz current_period_start
        timestamptz current_period_end
    }
```

## 表数量统计

| 领域 | 表数量 |
|------|--------|
| 用户与身份域 | 4 |
| 社区内容域 | 8 |
| 教程与订阅域 | 6 |
| AI 与配额域 | 5 |
| 搜索与发现域 | 2 |
| 审核与运营域 | 4 |
| **总计** | **29** |

## 详细设计

详见 [schema-glossary.md](./schema-glossary.md)
