import type { ApiClient } from "./client";

/**
 * 上传签名响应
 */
export interface UploadSignResponse {
  uploadUrl: string;
  assetId: string;
  key: string;
  expiresIn: number;
}

/**
 * 上传 API 模块
 */
export class UploadsApi {
  constructor(private readonly client: ApiClient) {}

  /**
   * 获取上传签名
   */
  sign(data: {
    filename: string;
    contentType: string;
    size: number;
  }): Promise<UploadSignResponse> {
    return this.client.post<UploadSignResponse>("/api/v1/uploads/sign", data);
  }

  /**
   * 确认上传完成
   */
  confirm(assetId: string): Promise<{ assetId: string; url: string }> {
    return this.client.post<{ assetId: string; url: string }>(
      `/api/v1/uploads/${assetId}/confirm`
    );
  }
}

export function uploadsApi(client: ApiClient): UploadsApi {
  return new UploadsApi(client);
}
