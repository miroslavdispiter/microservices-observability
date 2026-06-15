export interface CreateSharingTokenDto {
  travelPlanId: number;
  accessType: "VIEW" | "EDIT";
  expiresInDays: number | null;
}