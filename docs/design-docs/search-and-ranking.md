# 搜索与排序设计

## v1 策略：PostgreSQL 混合检索

不引入 Elasticsearch，使用 Postgres 原生能力：

### 词法检索 (Lexical Search)

- 使用 `tsvector` + GIN 索引
- 支持中文分词（需配置 zhparser 或 jieba）
- 适合精确关键词匹配

### 语义检索 (Semantic Search)

- 使用 `pgvector` 扩展
- embedding 模型：text-embedding-3-small
- 适合语义相似度匹配

### 混合排序

```
final_score = α * lexical_score + (1 - α) * semantic_score
```

- α 参数可按场景调整
- 默认 α = 0.5

## 搜索文档维护

- `search_documents` 表存储可搜索的文档
- 内容变更时异步刷新搜索索引
- embedding 变更时异步刷新向量

## 热门流

- 基于时间衰减的评分函数
- 定时快照任务计算热门度
- `GET /api/v1/feed/trending` 返回热门内容

## 关注流

- 基于关注关系过滤
- `GET /api/v1/feed/following` 返回关注用户的最新内容
