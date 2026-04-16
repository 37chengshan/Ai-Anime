import type { ApiError } from "@ai-anime/contracts";

/**
 * API 客户端配置
 */
export interface ApiClientConfig {
  /** API 基础 URL */
  baseUrl: string;
  /** 获取认证 token 的函数 */
  getToken?: () => Promise<string | null>;
  /** 默认请求头 */
  defaultHeaders?: Record<string, string>;
  /** 请求超时时间（毫秒） */
  timeout?: number;
}

/**
 * 请求选项
 */
export interface RequestOptions extends Omit<RequestInit, "headers" | "body"> {
  /** 查询参数 */
  params?: Record<string, string | number | boolean | undefined>;
  /** 请求体 */
  body?: unknown;
  /** 自定义请求头 */
  headers?: Record<string, string>;
  /** 超时覆盖 */
  timeout?: number;
}

/**
 * API 错误响应
 */
export class ApiClientError extends Error {
  public readonly status: number;
  public readonly error: ApiError;

  constructor(error: ApiError) {
    super(error.title);
    this.name = "ApiClientError";
    this.status = error.status;
    this.error = error;
  }
}
