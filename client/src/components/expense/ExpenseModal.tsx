import { useState, useEffect } from "react";
import type { Expense, ExpenseCategory, ExpenseCategoryLabels } from "../../models/travel/Expense";
import type { CreateExpenseDto } from "../../dtos/expense/CreateExpenseDto";

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateExpenseDto) => Promise<void>;
  editingExpense?: Expense | null;
  travelPlanStartDate?: string;
  travelPlanEndDate?: string;
}

const categoryOptions: { value: number; label: string; icon: string }[] = [
  { value: 0, label: "Transportation", icon: "🚗" },
  { value: 1, label: "Accommodation", icon: "🏨" },
  { value: 2, label: "Food", icon: "🍽️" },
  { value: 3, label: "Tickets", icon: "🎫" },
  { value: 4, label: "Shopping", icon: "🛍️" },
  { value: 5, label: "Other", icon: "📦" },
];

export const ExpenseModal = ({
  isOpen,
  onClose,
  onSubmit,
  editingExpense,
  travelPlanStartDate,
  travelPlanEndDate,
}: ExpenseModalProps) => {
  const [form, setForm] = useState<CreateExpenseDto>({
    name: "",
    category: 0,
    amount: 0,
    date: "",
    description: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (editingExpense) {
      setForm({
        name: editingExpense.name,
        category: editingExpense.category,
        amount: editingExpense.amount,
        date: editingExpense.date.split("T")[0],
        description: editingExpense.description,
      });
    } else {
      setForm({
        name: "",
        category: 0,
        amount: 0,
        date: "",
        description: "",
      });
    }
    setSubmitted(false);
  }, [editingExpense, isOpen]);

  const validate = () => {
    const errs: Partial<Record<keyof CreateExpenseDto, string>> = {};

    if (!form.name.trim()) {
      errs.name = "Name is required.";
    } else if (form.name.length < 2) {
      errs.name = "Name must be at least 2 characters.";
    } else if (form.name.length > 200) {
      errs.name = "Name cannot exceed 200 characters.";
    }

    if (!form.date) {
      errs.date = "Date is required.";
    } else if (travelPlanStartDate && travelPlanEndDate) {
      const expenseDate = new Date(form.date);
      const startDate = new Date(travelPlanStartDate);
      const endDate = new Date(travelPlanEndDate);

      if (expenseDate < startDate || expenseDate > endDate) {
        errs.date = "Date must be within travel plan dates.";
      }
    }

    if (form.amount <= 0) {
      errs.amount = "Amount must be greater than zero.";
    }

    if (form.description && form.description.length > 1000) {
      errs.description = "Description cannot exceed 1000 characters.";
    }

    return errs;
  };

  const errors = validate();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "amount"
          ? parseFloat(value) || 0
          : name === "category"
          ? parseInt(value)
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    if (Object.keys(errors).length > 0) return;

    setIsLoading(true);
    try {
      await onSubmit(form);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const errorClass = "block min-h-[1rem] text-xs mt-1";

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-emerald-500 to-green-500 text-white px-8 py-6 rounded-t-3xl">
          <h2 className="text-2xl font-bold">
            {editingExpense ? "Edit Expense" : "Add New Expense"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name *
            </label>
            <input
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl
                         focus:border-emerald-500 outline-none transition-colors"
              placeholder="e.g., Train tickets to Paris"
            />
            <span
              className={`${errorClass} ${
                submitted && errors.name ? "text-red-500" : "text-transparent"
              }`}
            >
              {errors.name || "\u200b"}
            </span>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl
                         focus:border-emerald-500 outline-none transition-colors"
            >
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.icon} {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Amount and Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                  €
                </span>
                <input
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.amount}
                  onChange={handleChange}
                  className="w-full pl-8 pr-4 py-2.5 border-2 border-gray-200 rounded-xl
                             focus:border-emerald-500 outline-none transition-colors"
                  placeholder="0.00"
                />
              </div>
              <span
                className={`${errorClass} ${
                  submitted && errors.amount
                    ? "text-red-500"
                    : "text-transparent"
                }`}
              >
                {errors.amount || "\u200b"}
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date *
              </label>
              <input
                name="date"
                type="date"
                value={form.date}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl
                           focus:border-emerald-500 outline-none transition-colors"
              />
              <span
                className={`${errorClass} ${
                  submitted && errors.date ? "text-red-500" : "text-transparent"
                }`}
              >
                {errors.date || "\u200b"}
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl
                         focus:border-emerald-500 outline-none transition-colors resize-none"
              placeholder="Additional details about this expense..."
            />
            <span
              className={`${errorClass} ${
                submitted && errors.description
                  ? "text-red-500"
                  : "text-transparent"
              }`}
            >
              {errors.description || "\u200b"}
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl
                         hover:bg-gray-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-500
                         hover:from-emerald-600 hover:to-green-600 text-white rounded-xl
                         font-semibold transition-all transform hover:scale-[1.02]
                         disabled:opacity-70 disabled:cursor-not-allowed shadow-lg"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
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
                  Saving...
                </span>
              ) : editingExpense ? (
                "Update Expense"
              ) : (
                "Add Expense"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};