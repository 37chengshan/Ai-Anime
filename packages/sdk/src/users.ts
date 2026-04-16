import type { User, UserProfile, PaginatedResponse } from "@ai-anime/contracts";
import type { ApiClient } from "./client";

/**
 * 用户 API 模块
 */
export class UsersApi {
  constructor(private readonly client: ApiClient) {}

  /**
   * 获取当前用户信息
   */
  getMe(): Promise<User> {
    return this.client.get<User>("/api/v1/users/me");
  }

  /**
   * 获取用户公开资料
   */
  getById(userId: string): Promise<User> {
    return this.client.get<User>(`/api/v1/users/${userId}`);
  }

  /**
   * 获取用户资料
   */
  getProfile(userId: string): Promise<UserProfile> {
    return this.client.get<UserProfile>(`/api/v1/users/${userId}/profile`);
  }

  /**
   * 更新当前用户资料
   */
  updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    return this.client.patch<UserProfile>("/api/v1/users/me/profile", data);
  }

  /**
   * 获取用户的作品列表
   */
  getPosts(
    userId: string,
    params?: { cursor?: string; limit?: number }
  ): Promise<PaginatedResponse<Post>> {
    return this.client.get<PaginatedResponse<Post>>(
      `/api/v1/users/${userId}/posts`,
      { params }
    );
  }

  /**
   * 关注用户
   */
  follow(userId: string): Promise<void> {
    return this.client.post<void>(`/api/v1/users/${userId}/follow`);
  }

  /**
   * 取消关注
   */
  unfollow(userId: string): Promise<void> {
    return this.client.delete<void>(`/api/v1/users/${userId}/follow`);
  }

  /**
   * 获取关注者列表
   */
  getFollowers(
    userId: string,
    params?: { cursor?: string; limit?: number }
  ): Promise<PaginatedResponse<User>> {
    return this.client.get<PaginatedResponse<User>>(
      `/api/v1/users/${userId}/followers`,
      { params }
    );
  }

  /**
   * 获取关注列表
   */
  getFollowing(
    userId: string,
    params?: { cursor?: string; limit?: number }
  ): Promise<PaginatedResponse<User>> {
    return this.client.get<PaginatedResponse<User>>(
      `/api/v1/users/${userId}/following`,
      { params }
    );
  }
}

/**
 * 创建用户 API 实例
 */
export function createUsersApi(client: ApiClient): UsersApi {
  return new UsersApi(client);
}

// 导出单例创建函数，供 index.ts 使用
import type { Post } from "@ai-anime/contracts";

export function usersApi(client: ApiClient): UsersApi {
  return new UsersApi(client);
}