import type { Post, PaginatedResponse } from "@ai-anime/contracts";
import type { ApiClient } from "./client";

/**
 * 作品 API 模块
 */
export class PostsApi {
  constructor(private readonly client: ApiClient) {}

  /**
   * 获取作品列表（Feed）
   */
  list(params?: {
    cursor?: string;
    limit?: number;
    tag?: string;
    author?: string;
  }): Promise<PaginatedResponse<Post>> {
    return this.client.get<PaginatedResponse<Post>>("/api/v1/posts", {
      params,
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
