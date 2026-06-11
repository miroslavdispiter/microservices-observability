export interface Expense {
  id: number;
  travelPlanId: number;
  name: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  description: string;
}

export enum ExpenseCategory {
  Transportation = 0,
  Accommodation = 1,
  Food = 2,
  Tickets = 3,
  Shopping = 4,
  Other = 5,
}

export const ExpenseCategoryLabels: Record<ExpenseCategory, string> = {
  [ExpenseCategory.Transportation]: "Transportation",
  [ExpenseCategory.Accommodation]: "Accommodation",
  [ExpenseCategory.Food]: "Food",
  [ExpenseCategory.Tickets]: "Tickets",
  [ExpenseCategory.Shopping]: "Shopping",
  [ExpenseCategory.Other]: "Other",
};

export const ExpenseCategoryIcons: Record<ExpenseCategory, string> = {
  [ExpenseCategory.Transportation]: "🚗",
  [ExpenseCategory.Accommodation]: "🏨",
  [ExpenseCategory.Food]: "🍽️",
  [ExpenseCategory.Tickets]: "🎫",
  [ExpenseCategory.Shopping]: "🛍️",
  [ExpenseCategory.Other]: "📦",
};

export const ExpenseCategoryColors: Record<ExpenseCategory, string> = {
  [ExpenseCategory.Transportation]: "bg-blue-100 text-blue-700 border-blue-200",
  [ExpenseCategory.Accommodation]: "bg-purple-100 text-purple-700 border-purple-200",
  [ExpenseCategory.Food]: "bg-orange-100 text-orange-700 border-orange-200",
  [ExpenseCategory.Tickets]: "bg-pink-100 text-pink-700 border-pink-200",
  [ExpenseCategory.Shopping]: "bg-green-100 text-green-700 border-green-200",
  [ExpenseCategory.Other]: "bg-gray-100 text-gray-700 border-gray-200",
};