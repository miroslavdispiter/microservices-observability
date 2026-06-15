import type { ServiceResult } from "../../types/common/ServiceResult";
import type { SharingToken } from "../../models/sharing/SharingToken";
import type { CreateSharingTokenDto } from "../../dtos/sharing/CreateSharingTokenDto";
import type { ValidateSharingTokenDto } from "../../dtos/sharing/ValidateSharingTokenDto";
import api from "../axiosInstance";
import type { ISharingAPIService } from "./ISharingAPIService";

export const sharingApi: ISharingAPIService = {
  async createSharingToken(data: CreateSharingTokenDto): Promise<SharingToken> {
    const response = await api.post<ServiceResult<SharingToken>>(
      "/sharing/create",
      data
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || "Failed to create sharing token");
    }

    return response.data.data;
  },

  async getSharingToken(token: string): Promise<SharingToken> {
    const response = await api.get<ServiceResult<SharingToken>>(
      `/sharing/token/${token}`
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || "Sharing token not found");
    }

    return response.data.data;
  },

  async getMyTokens(): Promise<SharingToken[]> {
    const response = await api.get<ServiceResult<SharingToken[]>>(
      "/sharing/my-tokens"
    );

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to fetch sharing tokens");
    }

    return response.data.data || [];
  },

  async revokeToken(token: string): Promise<boolean> {
    const response = await api.delete<ServiceResult<boolean>>(
      `/sharing/revoke/${token}`
    );

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to revoke token");
    }

    return response.data.data;
  },

  async validateToken(data: ValidateSharingTokenDto): Promise<boolean> {
    const response = await api.post<ServiceResult<boolean>>(
      "/sharing/validate",
      data
    );

    if (!response.data.success) {
      throw new Error(response.data.message || "Token validation failed");
    }

    return response.data.data;
  },
};