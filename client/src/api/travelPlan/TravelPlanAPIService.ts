import type { ITravelPlanAPIService } from "./ITravelPlanAPIService";
import type { TravelPlan } from "../../models/travel/TravelPlan";
import type { CreateTravelPlanDto } from "../../dtos/travelPlan/CreateTravelPlanDto";
import type { ServiceResult } from "../../types/common/ServiceResult";
import api from "../axiosInstance";

export const travelApi: ITravelPlanAPIService = {
  async getAll(): Promise<TravelPlan[]> {
    const response = await api.get<ServiceResult<TravelPlan[]>>("/travel");

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to fetch travel plans");
    }

    return response.data.data || [];
  },

  async getById(id: number): Promise<TravelPlan> {
    const response = await api.get<ServiceResult<TravelPlan>>(
      `/travel/${id}`
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || "Travel plan not found");
    }

    return response.data.data;
  },

  async create(data: CreateTravelPlanDto): Promise<TravelPlan> {
    const response = await api.post<ServiceResult<TravelPlan>>(
      "/travel",
      data
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || "Failed to create travel plan");
    }

    return response.data.data;
  },

  async update(id: number, data: CreateTravelPlanDto): Promise<boolean> {
    const response = await api.put<ServiceResult<boolean>>(
      `/travel/${id}`,
      data
    );

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to update travel plan");
    }

    return response.data.data;
  },

  async delete(id: number): Promise<boolean> {
    const response = await api.delete<ServiceResult<boolean>>(
      `/travel/${id}`
    );

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to delete travel plan");
    }

    return response.data.data;
  },
};