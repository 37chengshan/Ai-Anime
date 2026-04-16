import type { Tag, PaginatedResponse } from "@ai-anime/contracts";
import type { ApiClient } from "./client";

/**
 * 标签 API 模块
 */
export class TagsApi {
  constructor(private readonly client: ApiClient) {}

  /**
   * 获取标签列表
   */
  list(params?: {
    cursor?: string;
    limit?: number;
    search?: string;
  }): Promise<PaginatedResponse<Tag>> {
    return this.client.get<PaginatedResponse<Tag>>("/api/v1/tags", { params });
  }

  /**
   * 获取标签详情
   */
  getById(tagId: string): Promise<Tag> {
    return this.client.get<Tag>(`/api/v1/tags/${tagId}`);
  }

  /**
   * 获取标签下的作品
   */
  getPosts(
    tagId: string,
    params?: { cursor?: string; limit?: number }
  ): Promise<PaginatedResponse<import("@ai-anime/contracts").Post>> {
    return this.client.get<
      PaginatedResponse<import("@ai-anime/contracts").Post>
    >(`/api/v1/tags/${tagId}/posts`, { params });
  }
}

export function tagsApi(client: ApiClient): TagsApi {
  return new TagsApi(client);
}
