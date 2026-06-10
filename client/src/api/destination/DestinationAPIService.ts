import type { IDestinationAPIService } from "./IDestinationAPIService";
import type { Destination } from "../../models/travel/Destination";
import type { CreateDestinationDto } from "../../dtos/destination/CreateDestinationDto";
import type { ServiceResult } from "../../types/common/ServiceResult";
import api from "../axiosInstance";

export const destinationApi: IDestinationAPIService = {
  async getAll(travelPlanId: number): Promise<Destination[]> {
    const response = await api.get<ServiceResult<Destination[]>>(
      `/travel/${travelPlanId}/destinations`
    );

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to fetch destinations");
    }

    return response.data.data || [];
  },

  async getById(travelPlanId: number, id: number): Promise<Destination> {
    const response = await api.get<ServiceResult<Destination>>(
      `/travel/${travelPlanId}/destinations/${id}`
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || "Destination not found");
    }

    return response.data.data;
  },

  async create(
    travelPlanId: number,
    data: CreateDestinationDto
  ): Promise<Destination> {
    const response = await api.post<ServiceResult<Destination>>(
      `/travel/${travelPlanId}/destinations`,
      data
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || "Failed to create destination");
    }

    return response.data.data;
  },

  async update(
    travelPlanId: number,
    id: number,
    data: CreateDestinationDto
  ): Promise<boolean> {
    const response = await api.put<ServiceResult<boolean>>(
      `/travel/${travelPlanId}/destinations/${id}`,
      data
    );

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to update destination");
    }

    return response.data.data;
  },

  async delete(travelPlanId: number, id: number): Promise<boolean> {
    const response = await api.delete<ServiceResult<boolean>>(
      `/travel/${travelPlanId}/destinations/${id}`
    );

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to delete destination");
    }

    return response.data.data;
  },
};