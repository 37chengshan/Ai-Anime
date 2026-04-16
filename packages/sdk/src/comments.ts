import type { Comment, PaginatedResponse } from "@ai-anime/contracts";
import type { ApiClient } from "./client";

/**
 * 评论 API 模块
 */
export class CommentsApi {
  constructor(private readonly client: ApiClient) {}

  /**
   * 获取作品评论列表
   */
  list(
    postId: string,
    params?: { cursor?: string; limit?: number }
  ): Promise<PaginatedResponse<Comment>> {
    return this.client.get<PaginatedResponse<Comment>>(
      `/api/v1/posts/${postId}/comments`,
      { params }
    );
  }

  /**
   * 创建评论
   */
  create(
    postId: string,
    data: { content: string; parentCommentId?: string }
  ): Promise<Comment> {
    return this.client.post<Comment>(`/api/v1/posts/${postId}/comments`, data);
  }

  /**
   * 删除评论
   */
  delete(postId: string, commentId: string): Promise<void> {
    return this.client.delete<void>(
      `/api/v1/posts/${postId}/comments/${commentId}`
    );
  }
}

export function commentsApi(client: ApiClient): CommentsApi {
  return new CommentsApi(client);
}
