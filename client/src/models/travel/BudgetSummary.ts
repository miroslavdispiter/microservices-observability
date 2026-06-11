export interface BudgetSummary {
  plannedBudget: number;
  totalExpenses: number;
  remainingBudget: number;
  expensesByCategory: Record<string, number>;
}