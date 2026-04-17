import type { Post, PaginatedResponse } from "@ai-anime/contracts";
import type { ApiClient } from "./client";

/**
 * 作品 API 模块
 */
export class PostsApi {
  constructor(private readonly client: ApiClient) {}

  /**
   * 获取作品列表（Feed）
   * @param params - 查询参数
   * @param params.cursor - 分页游标
   * @param params.limit - 每页数量
   * @param params.status - 作品状态筛选
   * @param params.tag - 标签 slug 筛选
   * @param params.authorId - 作者 ID 筛选
   * @param params.sort - 排序方式: latest/popular/trending
   * @param params.search - 搜索关键词
   * @param params.following - 是否只显示关注用户的作品
   */
  list(params?: {
    cursor?: string;
    limit?: number;
    status?: string;
    tag?: string;
    authorId?: string;
    sort?: "latest" | "popular" | "trending";
    search?: string;
    following?: boolean;
  }): Promise<PaginatedResponse<Post>> {
    // Map camelCase to snake_case for API
    const apiParams: Record<string, string | number | boolean | undefined> = {};
    if (params?.cursor) apiParams.cursor = params.cursor;
    if (params?.limit) apiParams.limit = params.limit;
    if (params?.status) apiParams.status = params.status;
    if (params?.tag) apiParams.tag = params.tag;
    if (params?.authorId) apiParams.author_id = params.authorId;
    if (params?.sort) apiParams.sort = params.sort;
    if (params?.search) apiParams.search = params.search;
    if (params?.following !== undefined) apiParams.following = params.following;

    return this.client.get<PaginatedResponse<Post>>("/api/v1/posts", {
      params: apiParams,
    });
  }

  /**
   * 获取作品详情
   */
  getById(postId: string): Promise<Post> {
    return this.client.get<Post>(`/api/v1/posts/${postId}`);
  }

  /**
   * 创建作品
   */
  create(data: {
    title: string;
    content?: string;
    excerpt?: string;
    visibility?: "public" | "followers" | "private";
    publish?: boolean;
    assetIds?: string[];
    tagIds?: string[];
  }): Promise<Post> {
    return this.client.post<Post>("/api/v1/posts", data);
  }

  /**
   * 更新作品
   */
  update(
    postId: string,
    data: Partial<{
      title: string;
      content: string;
      excerpt: string;
      visibility: "public" | "followers" | "private";
    }>
  ): Promise<Post> {
    return this.client.patch<Post>(`/api/v1/posts/${postId}`, data);
  }

  /**
   * 删除作品
   */
  delete(postId: string): Promise<void> {
    return this.client.delete<void>(`/api/v1/posts/${postId}`);
  }

  /**
   * 发布作品
   */
  publish(postId: string): Promise<Post> {
    return this.client.post<Post>(`/api/v1/posts/${postId}/publish`);
  }

  /**
   * 归档作品
   */
  archive(postId: string): Promise<Post> {
    return this.client.post<Post>(`/api/v1/posts/${postId}/archive`);
  }

  /**
   * 点赞
   */
  like(postId: string): Promise<void> {
    return this.client.post<void>(`/api/v1/posts/${postId}/like`);
  }

  /**
   * 取消点赞
   */
  unlike(postId: string): Promise<void> {
    return this.client.delete<void>(`/api/v1/posts/${postId}/like`);
  }

  /**
   * 收藏
   */
  favorite(postId: string): Promise<void> {
    return this.client.post<void>(`/api/v1/posts/${postId}/favorite`);
  }

  /**
   * 取消收藏
   */
  unfavorite(postId: string): Promise<void> {
    return this.client.delete<void>(`/api/v1/posts/${postId}/favorite`);
  }
}

export function postsApi(client: ApiClient): PostsApi {
  return new PostsApi(client);
}
