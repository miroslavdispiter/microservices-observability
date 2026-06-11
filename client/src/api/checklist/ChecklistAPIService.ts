import type { IChecklistAPIService } from "./IChecklistAPIService";
import type { ChecklistItem } from "../../models/travel/ChecklistItem";
import type { CreateChecklistItemDto } from "../../dtos/checklist/CreateChecklistItemDto";
import type { ServiceResult } from "../../types/common/ServiceResult";
import api from "../axiosInstance";

export const checklistApi: IChecklistAPIService = {
  async getAll(travelPlanId: number): Promise<ChecklistItem[]> {
    const response = await api.get<ServiceResult<ChecklistItem[]>>(
      `/travel/${travelPlanId}/checklist`
    );

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to fetch checklist items");
    }

    return response.data.data || [];
  },

  async getById(travelPlanId: number, id: number): Promise<ChecklistItem> {
    const response = await api.get<ServiceResult<ChecklistItem>>(
      `/travel/${travelPlanId}/checklist/${id}`
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || "Checklist item not found");
    }

    return response.data.data;
  },

  async getCompletedCount(travelPlanId: number): Promise<number> {
    const response = await api.get<ServiceResult<number>>(
      `/travel/${travelPlanId}/checklist/completed-count`
    );

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to fetch completed count");
    }

    return response.data.data || 0;
  },

  async create(travelPlanId: number, data: CreateChecklistItemDto): Promise<ChecklistItem> {
    const response = await api.post<ServiceResult<ChecklistItem>>(
      `/travel/${travelPlanId}/checklist`,
      data
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || "Failed to create checklist item");
    }

    return response.data.data;
  },

  async update(
    travelPlanId: number,
    id: number,
    data: CreateChecklistItemDto
  ): Promise<boolean> {
    const response = await api.put<ServiceResult<boolean>>(
      `/travel/${travelPlanId}/checklist/${id}`,
      data
    );

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to update checklist item");
    }

    return response.data.data;
  },

  async toggle(travelPlanId: number, id: number): Promise<boolean> {
    const response = await api.patch<ServiceResult<boolean>>(
      `/travel/${travelPlanId}/checklist/${id}/toggle`
    );

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to toggle checklist item");
    }

    return response.data.data;
  },

  async delete(travelPlanId: number, id: number): Promise<boolean> {
    const response = await api.delete<ServiceResult<boolean>>(
      `/travel/${travelPlanId}/checklist/${id}`
    );

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to delete checklist item");
    }

    return response.data.data;
  },
};