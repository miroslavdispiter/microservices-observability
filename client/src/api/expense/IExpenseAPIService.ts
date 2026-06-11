import type { Expense } from "../../models/travel/Expense";
import type { BudgetSummary } from "../../models/travel/BudgetSummary";
import type { CreateExpenseDto } from "../../dtos/expense/CreateExpenseDto";

export interface IExpenseAPIService {
  getAll(travelPlanId: number): Promise<Expense[]>;
  getById(travelPlanId: number, id: number): Promise<Expense>;
  getByCategory(travelPlanId: number, category: number): Promise<Expense[]>;
  getBudgetSummary(travelPlanId: number): Promise<BudgetSummary>;
  create(travelPlanId: number, data: CreateExpenseDto): Promise<Expense>;
  update(travelPlanId: number, id: number, data: CreateExpenseDto): Promise<boolean>;
  delete(travelPlanId: number, id: number): Promise<boolean>;
}