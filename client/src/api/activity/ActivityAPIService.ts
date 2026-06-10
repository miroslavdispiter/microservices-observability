import type { IActivityAPIService } from "./IActivityAPIService";
import type { Activity } from "../../models/travel/Activity";
import type { CreateActivityDto } from "../../dtos/activity/CreateActivityDto";
import type { ServiceResult } from "../../types/common/ServiceResult";
import api from "../axiosInstance";

const formatTimeForBackend = (time: string | null): string | null => {
  if (!time || time.trim() === "") return null;
  return time.includes(":") && time.split(":").length === 2 
    ? `${time}:00` 
    : time;
};

export const activityApi: IActivityAPIService = {
  async getAll(travelPlanId: number): Promise<Activity[]> {
    const response = await api.get<ServiceResult<Activity[]>>(
      `/travel/${travelPlanId}/activities`
    );

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to fetch activities");
    }

    return response.data.data || [];
  },

  async getById(travelPlanId: number, id: number): Promise<Activity> {
    const response = await api.get<ServiceResult<Activity>>(
      `/travel/${travelPlanId}/activities/${id}`
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || "Activity not found");
    }

    return response.data.data;
  },

  async getByDate(travelPlanId: number, date: string): Promise<Activity[]> {
    const response = await api.get<ServiceResult<Activity[]>>(
      `/travel/${travelPlanId}/activities/date/${date}`
    );

    if (!response.data.success) {
      throw new Error(
        response.data.message || "Failed to fetch activities by date"
      );
    }

    return response.data.data || [];
  },

  async getByDateRange(
    travelPlanId: number,
    startDate: string,
    endDate: string
  ): Promise<Activity[]> {
    const response = await api.get<ServiceResult<Activity[]>>(
      `/travel/${travelPlanId}/activities/range`,
      {
        params: { startDate, endDate },
      }
    );

    if (!response.data.success) {
      throw new Error(
        response.data.message || "Failed to fetch activities by date range"
      );
    }

    return response.data.data || [];
  },

  async create(
    travelPlanId: number,
    data: CreateActivityDto
  ): Promise<Activity> {
    const payload = {
      ...data,
      time: formatTimeForBackend(data.time),
    };

    const response = await api.post<ServiceResult<Activity>>(
      `/travel/${travelPlanId}/activities`,
      payload
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || "Failed to create activity");
    }

    return response.data.data;
  },

  async update(
    travelPlanId: number,
    id: number,
    data: CreateActivityDto
  ): Promise<boolean> {
    const payload = {
      ...data,
      time: formatTimeForBackend(data.time),
    };

    const response = await api.put<ServiceResult<boolean>>(
      `/travel/${travelPlanId}/activities/${id}`,
      payload
    );

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to update activity");
    }

    return response.data.data;
  },

  async delete(travelPlanId: number, id: number): Promise<boolean> {
    const response = await api.delete<ServiceResult<boolean>>(
      `/travel/${travelPlanId}/activities/${id}`
    );

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to delete activity");
    }

    return response.data.data;
  },
};