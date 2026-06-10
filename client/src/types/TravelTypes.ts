export interface TravelPlan {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  budget: number;
  notes: string;
}

export interface CreateTravelPlanDto {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  budget: number;
  notes: string;
}

export interface ServiceResult<T> {
  success: boolean;
  data: T;
  message?: string;
}