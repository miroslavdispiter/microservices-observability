import type { CreateSharingTokenDto } from "../../dtos/sharing/CreateSharingTokenDto";
import type { ValidateSharingTokenDto } from "../../dtos/sharing/ValidateSharingTokenDto";
import type { SharingToken } from "../../models/sharing/SharingToken";

export interface ISharingAPIService {
  createSharingToken(data: CreateSharingTokenDto): Promise<SharingToken>;
  getSharingToken(token: string): Promise<SharingToken>;
  getMyTokens(): Promise<SharingToken[]>;
  revokeToken(token: string): Promise<boolean>;
  validateToken(data: ValidateSharingTokenDto): Promise<boolean>;
}