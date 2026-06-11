import type { IExpenseAPIService } from "./IExpenseAPIService";
import type { Expense } from "../../models/travel/Expense";
import type { BudgetSummary } from "../../models/travel/BudgetSummary";
import type { CreateExpenseDto } from "../../dtos/expense/CreateExpenseDto";
import type { ServiceResult } from "../../types/common/ServiceResult";
import api from "../axiosInstance";

export const expenseApi: IExpenseAPIService = {
  async getAll(travelPlanId: number): Promise<Expense[]> {
    const response = await api.get<ServiceResult<Expense[]>>(
      `/travel/${travelPlanId}/expenses`
    );

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to fetch expenses");
    }

    return response.data.data || [];
  },

  async getById(travelPlanId: number, id: number): Promise<Expense> {
    const response = await api.get<ServiceResult<Expense>>(
      `/travel/${travelPlanId}/expenses/${id}`
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || "Expense not found");
    }

    return response.data.data;
  },

  async getByCategory(travelPlanId: number, category: number): Promise<Expense[]> {
    const response = await api.get<ServiceResult<Expense[]>>(
      `/travel/${travelPlanId}/expenses/category/${category}`
    );

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to fetch expenses by category");
    }

    return response.data.data || [];
  },

  async getBudgetSummary(travelPlanId: number): Promise<BudgetSummary> {
    const response = await api.get<ServiceResult<BudgetSummary>>(
      `/travel/${travelPlanId}/expenses/budget-summary`
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || "Failed to fetch budget summary");
    }

    return response.data.data;
  },

  async create(travelPlanId: number, data: CreateExpenseDto): Promise<Expense> {
    const response = await api.post<ServiceResult<Expense>>(
      `/travel/${travelPlanId}/expenses`,
      data
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || "Failed to create expense");
    }

    return response.data.data;
  },

  async update(
    travelPlanId: number,
    id: number,
    data: CreateExpenseDto
  ): Promise<boolean> {
    const response = await api.put<ServiceResult<boolean>>(
      `/travel/${travelPlanId}/expenses/${id}`,
      data
    );

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to update expense");
    }

    return response.data.data;
  },

  async delete(travelPlanId: number, id: number): Promise<boolean> {
    const response = await api.delete<ServiceResult<boolean>>(
      `/travel/${travelPlanId}/expenses/${id}`
    );

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to delete expense");
    }

    return response.data.data;
  },
};