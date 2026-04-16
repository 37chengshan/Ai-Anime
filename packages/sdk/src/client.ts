import type { ApiError } from "@ai-anime/contracts";
import type { ApiClientConfig, RequestOptions } from "./types";
import { ApiClientError } from "./types";

const DEFAULT_TIMEOUT = 30_000;

/**
 * 构建 URL 查询参数
 */
function buildQueryString(
  params?: Record<string, string | number | boolean | undefined>
): string {
  if (!params) return "";

  const entries = Object.entries(params).filter(
    (entry): entry is [string, string | number | boolean] =>
      entry[1] !== undefined
  );

  if (entries.length === 0) return "";

  const searchParams = new URLSearchParams();
  for (const [key, value] of entries) {
    searchParams.set(key, String(value));
  }

  return `?${searchParams.toString()}`;
}

/**
 * 创建带超时的 AbortController
 */
function createTimeoutController(timeout: number): {
  controller: AbortController;
  timerId: ReturnType<typeof setTimeout>;
} {
  const controller = new AbortController();
  const timerId = setTimeout(() => controller.abort(), timeout);
  return { controller, timerId };
}

/**
 * API 客户端 - 封装所有与后端 API 的 HTTP 通信
 */
export class ApiClient {
  private readonly config: Required<Pick<ApiClientConfig, "baseUrl" | "timeout">> &
    Pick<ApiClientConfig, "getToken" | "defaultHeaders">;

  constructor(config: ApiClientConfig) {
    this.config = {
      baseUrl: config.baseUrl.replace(/\/$/, ""),
      timeout: config.timeout ?? DEFAULT_TIMEOUT,
      getToken: config.getToken,
      defaultHeaders: config.defaultHeaders,
    };
  }

  private async buildHeaders(
    customHeaders?: Record<string, string>
  ): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...this.config.defaultHeaders,
      ...customHeaders,
    };

    const token = await this.config.getToken?.();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
  }

  private async request<T>(path: string, options: RequestOptions): Promise<T> {
    const { params, body, timeout, headers: customHeaders, ...fetchOptions } = options;

    const url = `${this.config.baseUrl}${path}${buildQueryString(params)}`;
    const headers = await this.buildHeaders(customHeaders);
    const effectiveTimeout = timeout ?? this.config.timeout;

    const { controller, timerId } = createTimeoutController(effectiveTimeout);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorBody = await this.parseErrorBody(response);
        throw new ApiClientError(errorBody);
      }

      if (response.status === 204) {
        return undefined as T;
      }

      return (await response.json()) as T;
    } finally {
      clearTimeout(timerId);
    }
  }

  private async parseErrorBody(response: Response): Promise<ApiError> {
    try {
      return (await response.json()) as ApiError;
    } catch {
      return {
        type: "about:blank",
        title: response.statusText || "Request failed",
        status: response.status,
        detail: `HTTP ${response.status}`,
        instance: response.url,
      };
    }
  }

  /** GET 请求 */
  get<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: "GET" });
  }

  /** POST 请求 */
  post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: "POST", body });
  }

  /** PATCH 请求 */
  patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: "PATCH", body });
  }

  /** PUT 请求 */
  put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: "PUT", body });
  }

  /** DELETE 请求 */
  delete<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: "DELETE" });
  }
}

/**
 * 创建 API 客户端实例
 */
export function createApiClient(config: ApiClientConfig): ApiClient {
  return new ApiClient(config);
}

// 重新导出 ApiClientError 以便使用
export { ApiClientError };
