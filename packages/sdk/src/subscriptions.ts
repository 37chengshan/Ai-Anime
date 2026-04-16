import type { ApiClient } from "./client";

/**
 * 订阅信息
 */
export interface Subscription {
  id: string;
  userId: string;
  status: "trialing" | "active" | "past_due" | "canceled" | "unpaid" | "expired";
  planId: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

/**
 * 配额信息
 */
export interface QuotaInfo {
  aiCreditsUsed: number;
  aiCreditsLimit: number;
  storageUsedBytes: number;
  storageLimitBytes: number;
  postsCreated: number;
  postsLimit: number;
}

/**
 * 订阅 API 模块
 */
export class SubscriptionsApi {
  constructor(private readonly client: ApiClient) {}

  /**
   * 获取当前用户订阅
   */
  getMySubscription(): Promise<Subscription | null> {
    return this.client.get<Subscription | null>("/api/v1/subscriptions/me");
  }

  /**
   * 获取配额信息
   */
  getMyQuota(): Promise<QuotaInfo> {
    return this.client.get<QuotaInfo>("/api/v1/subscriptions/me/quota");
  }

  /**
   * 创建订阅（Checkout Session）
   */
  createCheckoutSession(data: { planId: string }): Promise<{
    checkoutUrl: string;
    sessionId: string;
  }> {
    return this.client.post<{
      checkoutUrl: string;
      sessionId: string;
    }>("/api/v1/subscriptions/checkout", data);
  }

  /**
   * 取消订阅
   */
  cancel(): Promise<Subscription> {
    return this.client.post<Subscription>("/api/v1/subscriptions/me/cancel");
  }

  /**
   * 恢复订阅
   */
  resume(): Promise<Subscription> {
    return this.client.post<Subscription>("/api/v1/subscriptions/me/resume");
  }
}

export function subscriptionsApi(client: ApiClient): SubscriptionsApi {
  return new SubscriptionsApi(client);
}