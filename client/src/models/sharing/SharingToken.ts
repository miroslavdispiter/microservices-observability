export interface SharingToken {
  token: string;
  travelPlanId: number;
  accessType: "VIEW" | "EDIT";
  createdAt: string;
  expiresAt: string | null;
  isExpired: boolean;
}