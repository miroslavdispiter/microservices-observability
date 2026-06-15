import type { ServiceResult } from "../../types/common/ServiceResult";
import type { User } from "../../models/user/User";
import type { UpdateUserDto } from "../../dtos/user/UpdateUserDto";
import type { ChangePasswordDto } from "../../dtos/user/ChangePasswordDto";
import type { TravelPlan } from "../../models/travel/TravelPlan";
import api from "../axiosInstance";
import type { IAdminAPIService } from "./IAdminAPIService";

export const adminApi: IAdminAPIService = {
  async getAllUsers(): Promise<User[]> {
    const response = await api.get<ServiceResult<User[]>>("/admin/users");

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to fetch users");
    }

    return response.data.data || [];
  },

  async getUserById(id: number): Promise<User> {
    const response = await api.get<ServiceResult<User>>(`/admin/users/${id}`);

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || "User not found");
    }

    return response.data.data;
  },

  async updateUser(id: number, data: UpdateUserDto): Promise<boolean> {
    const response = await api.put<ServiceResult<boolean>>(
      `/admin/users/${id}`,
      data
    );

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to update user");
    }

    return response.data.data;
  },

  async deleteUser(id: number): Promise<boolean> {
    const response = await api.delete<ServiceResult<boolean>>(
      `/admin/users/${id}`
    );

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to delete user");
    }

    return response.data.data;
  },

  async changeUserPassword(
    id: number,
    data: ChangePasswordDto
  ): Promise<boolean> {
    const response = await api.patch<ServiceResult<boolean>>(
      `/admin/users/${id}/change-password`,
      data
    );

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to change password");
    }

    return response.data.data;
  },

  async getAllTravelPlans(): Promise<TravelPlan[]> {
    const response = await api.get<ServiceResult<TravelPlan[]>>(
      "/admin/travel-plans"
    );

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to fetch travel plans");
    }

    return response.data.data || [];
  },
};