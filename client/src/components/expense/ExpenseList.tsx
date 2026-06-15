import type { Expense } from "../../models/travel/Expense";
import {
  ExpenseCategoryLabels,
  ExpenseCategoryIcons,
  ExpenseCategoryColors,
} from "../../models/travel/Expense";

interface ExpenseListProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: number) => void;
  isLoading?: boolean;
  isReadOnly?: boolean;
}

export const ExpenseList = ({
  expenses,
  onEdit,
  onDelete,
  isLoading = false,
  isReadOnly = false,
}: ExpenseListProps) => {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <svg
          className="animate-spin h-10 w-10 text-emerald-500"
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

  if (expenses.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">💰</div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          No expenses yet
        </h3>
        <p className="text-gray-500 text-sm">
          Start tracking expenses!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {expenses.map((expense) => (
        <div
          key={expense.id}
          className="bg-white border-2 border-emerald-100 rounded-xl p-4 hover:shadow-md
                     transition-all duration-300 hover:border-emerald-300"
        >
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <span
                  className={`inline-block px-2 py-1 rounded-lg text-xs font-medium border mb-2 ${
                    ExpenseCategoryColors[expense.category]
                  }`}
                >
                  {ExpenseCategoryIcons[expense.category]}{" "}
                  {ExpenseCategoryLabels[expense.category]}
                </span>
                <h3 className="text-base font-bold text-gray-800 truncate">
                  {expense.name}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {formatDate(expense.date)}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <p className="text-xl font-bold text-emerald-600">
                {formatCurrency(expense.amount)}
              </p>

              {!isReadOnly && (
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(expense)}
                    className="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 p-2 rounded-lg
                               transition-colors"
                    title="Edit"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          `Are you sure you want to delete "${expense.name}"?`
                        )
                      ) {
                        onDelete(expense.id);
                      }
                    }}
                    className="bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-lg
                               transition-colors"
                    title="Delete"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            {expense.description && (
              <p className="text-gray-600 text-xs line-clamp-2 pt-2 border-t border-gray-100">
                {expense.description}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};