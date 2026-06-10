import api from "../axiosInstance";
import type { CreateTravelPlanDto, TravelPlan, ServiceResult } from "../../types/TravelTypes";

export const travelService = {
  getAll: () => 
    api.get<ServiceResult<TravelPlan[]>>("/travel"),
  
  getById: (id: number) => 
    api.get<ServiceResult<TravelPlan>>(`/travel/${id}`),
  
  create: (data: CreateTravelPlanDto) => 
    api.post<ServiceResult<TravelPlan>>("/travel", data),
  
  update: (id: number, data: CreateTravelPlanDto) => 
    api.put<ServiceResult<boolean>>(`/travel/${id}`, data),
  
  delete: (id: number) => 
    api.delete<ServiceResult<boolean>>(`/travel/${id}`),
};