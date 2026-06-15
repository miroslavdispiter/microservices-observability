import { useNavigate } from "react-router-dom";
import type { BudgetSummary } from "../../models/travel/BudgetSummary";

interface ExpenseOverviewProps {
  budgetSummary: BudgetSummary | null;
  travelPlanId: number;
  isLoading?: boolean;
  isReadOnly?: boolean;
}

export const ExpenseOverview = ({
  budgetSummary,
  travelPlanId,
  isLoading = false,
  isReadOnly = false,
}: ExpenseOverviewProps) => {
  const navigate = useNavigate();

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

  if (!budgetSummary || budgetSummary.totalExpenses === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-5xl mb-3">💰</div>
        <p className="text-gray-500 mb-4">No expenses tracked yet</p>
        {!isReadOnly && (  // ← DODATO
          <button
            onClick={() => navigate(`/travels/${travelPlanId}/expenses`)}
            className="text-emerald-600 hover:text-emerald-700 font-medium text-sm"
          >
            Start tracking expenses →
          </button>
        )}
      </div>
    );
  }

  const budgetPercentage = budgetSummary.plannedBudget > 0
    ? (budgetSummary.totalExpenses / budgetSummary.plannedBudget) * 100
    : 0;

  const isOverBudget = budgetSummary.remainingBudget < 0;

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
          <p className="text-xs font-medium text-gray-600 mb-1">Planned</p>
          <p className="text-xl font-bold text-blue-600">
            €{budgetSummary.plannedBudget.toFixed(2)}
          </p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 border border-orange-200">
          <p className="text-xs font-medium text-gray-600 mb-1">Spent</p>
          <p className="text-xl font-bold text-orange-600">
            €{budgetSummary.totalExpenses.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Remaining Budget */}
      <div
        className={`bg-gradient-to-br rounded-xl p-4 border ${
          isOverBudget
            ? "from-red-50 to-pink-50 border-red-200"
            : "from-emerald-50 to-green-50 border-emerald-200"
        }`}
      >
        <p className="text-xs font-medium text-gray-600 mb-1">Remaining</p>
        <p
          className={`text-2xl font-bold ${
            isOverBudget ? "text-red-600" : "text-emerald-600"
          }`}
        >
          €{budgetSummary.remainingBudget.toFixed(2)}
        </p>
      </div>

      {/* Progress Bar */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-medium text-gray-700">
            Budget Usage
          </span>
          <span className="text-xs font-semibold text-gray-800">
            {budgetPercentage.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
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
      </div>

      {/* Top Categories */}
      {Object.keys(budgetSummary.expensesByCategory).length > 0 && (
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">
            Top Spending
          </p>
          <div className="space-y-2">
            {Object.entries(budgetSummary.expensesByCategory)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 3)
              .map(([category, amount]) => (
                <div
                  key={category}
                  className="flex justify-between items-center text-sm"
                >
                  <span className="text-gray-600">{category}</span>
                  <span className="font-semibold text-gray-800">
                    €{amount.toFixed(2)}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {!isReadOnly && (  // ← DODATO
        <button
          onClick={() => navigate(`/travels/${travelPlanId}/expenses`)}
          className="w-full py-3 text-emerald-600 hover:text-emerald-700 font-medium text-sm
                     hover:bg-emerald-50 rounded-xl transition-colors border-2 border-dashed 
                     border-emerald-300 hover:border-emerald-400"
        >
          Manage Expenses →
        </button>
      )}
    </div>
  );
};