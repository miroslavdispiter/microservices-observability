import type { BudgetSummary as BudgetSummaryModel } from "../../models/travel/BudgetSummary";
import { ExpenseCategoryIcons } from "../../models/travel/Expense";

interface BudgetSummaryProps {
  summary: BudgetSummaryModel | null;
  isLoading?: boolean;
}

export const BudgetSummary = ({
  summary,
  isLoading = false,
}: BudgetSummaryProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <svg
          className="animate-spin h-8 w-8 text-emerald-500"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No budget data available</p>
      </div>
    );
  }

  const budgetPercentage = summary.plannedBudget > 0
    ? (summary.totalExpenses / summary.plannedBudget) * 100
    : 0;

  const isOverBudget = summary.remainingBudget < 0;

  const categoryIcons: Record<string, string> = {
    Transportation: "🚗",
    Accommodation: "🏨",
    Food: "🍽️",
    Tickets: "🎫",
    Shopping: "🛍️",
    Other: "📦",
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Main Budget Cards */}
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-700 mb-1">
              Planned Budget
            </p>
            <svg
              className="w-5 h-5 text-blue-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
          </div>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {formatCurrency(summary.plannedBudget)}
          </p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 border-2 border-orange-200">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-700 mb-1">
              Total Expenses
            </p>
            <svg
              className="w-5 h-5 text-orange-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <p className="text-3xl font-bold text-orange-600 mt-2">
            {formatCurrency(summary.totalExpenses)}
          </p>
        </div>

        <div
          className={`bg-gradient-to-br rounded-2xl p-6 border-2 ${
            isOverBudget
              ? "from-red-50 to-pink-50 border-red-200"
              : "from-emerald-50 to-green-50 border-emerald-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-700 mb-1">
              Remaining Budget
            </p>
            <svg
              className={`w-5 h-5 ${isOverBudget ? "text-red-500" : "text-emerald-500"}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p
            className={`text-3xl font-bold mt-2 ${
              isOverBudget ? "text-red-600" : "text-emerald-600"
            }`}
          >
            {formatCurrency(summary.remainingBudget)}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            Budget Usage
          </span>
          <span className="text-sm font-semibold text-gray-800">
            {budgetPercentage.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              budgetPercentage > 100
                ? "bg-gradient-to-r from-red-500 to-red-600"
                : budgetPercentage > 80
                ? "bg-gradient-to-r from-orange-400 to-orange-500"
                : "bg-gradient-to-r from-emerald-400 to-emerald-500"
            }`}
            style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
          />
        </div>
        {isOverBudget && (
          <p className="text-xs text-red-600 mt-2 font-medium">
            ⚠️ You've exceeded your budget by {formatCurrency(Math.abs(summary.remainingBudget))}
          </p>
        )}
      </div>

      {/* Expenses by Category */}
      {Object.keys(summary.expensesByCategory).length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <svg
              className="w-5 h-5 text-emerald-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            Expenses by Category
          </h3>
          <div className="space-y-2">
            {Object.entries(summary.expensesByCategory)
              .sort(([, a], [, b]) => b - a)
              .map(([category, amount]) => (
                <div
                  key={category}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl
                             hover:bg-gray-100 transition-colors border border-gray-100"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {categoryIcons[category] || "📦"}
                    </span>
                    <span className="font-semibold text-gray-700">
                      {category}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-800 text-lg">
                      {formatCurrency(amount)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {summary.totalExpenses > 0
                        ? ((amount / summary.totalExpenses) * 100).toFixed(1)
                        : 0}
                      % of total
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};