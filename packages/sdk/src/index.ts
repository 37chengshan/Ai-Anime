/**
 * @ai-anime/sdk - API SDK for Ai-Anim
 *
 * 用于 Web 层调用 API 层的 SDK，遵循架构原则：
 * - Web 层不直接访问数据库
 * - 所有数据通过 HTTP API 获取
 */

export type { ApiClientConfig, RequestOptions } from "./types";
export { ApiClient, createApiClient, ApiClientError } from "./client";

// Domain APIs
export { usersApi } from "./users";
export { postsApi } from "./posts";
export { commentsApi } from "./comments";
export { tagsApi } from "./tags";
export { uploadsApi } from "./uploads";
export { subscriptionsApi } from "./subscriptions";

// Re-export types from contracts
export type {
  User,
  UserProfile,
  Post,
  Comment,
  Tag,
  PaginatedResponse,
  ApiError,
} from "@ai-anime/contracts";
