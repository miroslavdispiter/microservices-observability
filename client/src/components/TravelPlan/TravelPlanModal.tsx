import { useState, useEffect } from "react";
import type { TravelPlan, CreateTravelPlanDto } from "../../types/TravelTypes";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTravelPlanDto) => Promise<void>;
  editingPlan?: TravelPlan | null;
}

export const TravelPlanModal = ({ isOpen, onClose, onSubmit, editingPlan }: Props) => {
  const [form, setForm] = useState<CreateTravelPlanDto>({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    budget: 0,
    notes: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (editingPlan) {
      setForm({
        title: editingPlan.title,
        description: editingPlan.description,
        startDate: editingPlan.startDate.split("T")[0],
        endDate: editingPlan.endDate.split("T")[0],
        budget: editingPlan.budget,
        notes: editingPlan.notes,
      });
    } else {
      setForm({
        title: "",
        description: "",
        startDate: "",
        endDate: "",
        budget: 0,
        notes: "",
      });
    }
    setSubmitted(false);
  }, [editingPlan, isOpen]);

  const validate = () => {
    const errs: Partial<Record<keyof CreateTravelPlanDto, string>> = {};
    if (!form.title.trim()) errs.title = "Title is required.";
    if (!form.startDate) errs.startDate = "Start date is required.";
    if (!form.endDate) errs.endDate = "End date is required.";
    else if (new Date(form.endDate) < new Date(form.startDate))
      errs.endDate = "End date cannot be before start date.";
    if (form.budget < 0) errs.budget = "Budget cannot be negative.";
    return errs;
  };

  const errors = validate();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "budget" ? parseFloat(value) || 0 : value,
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
        <div className="sticky top-0 bg-gradient-to-r from-violet-500 to-indigo-500 text-white px-8 py-6 rounded-t-3xl">
          <h2 className="text-2xl font-bold">
            {editingPlan ? "Edit Travel Plan" : "Create New Travel Plan"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              name="title"
              type="text"
              value={form.title}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl
                         focus:border-indigo-500 outline-none transition-colors"
              placeholder="e.g., Summer Trip to Europe"
            />
            <span className={`${errorClass} ${submitted && errors.title ? "text-red-500" : "text-transparent"}`}>
              {errors.title || "\u200b"}
            </span>
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
                         focus:border-indigo-500 outline-none transition-colors resize-none"
              placeholder="Describe your travel plans..."
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date *
              </label>
              <input
                name="startDate"
                type="date"
                value={form.startDate}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl
                           focus:border-violet-500 outline-none transition-colors"
              />
              <span className={`${errorClass} ${submitted && errors.startDate ? "text-red-500" : "text-transparent"}`}>
                {errors.startDate || "\u200b"}
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date *
              </label>
              <input
                name="endDate"
                type="date"
                value={form.endDate}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl
                           focus:border-violet-500 outline-none transition-colors"
              />
              <span className={`${errorClass} ${submitted && errors.endDate ? "text-red-500" : "text-transparent"}`}>
                {errors.endDate || "\u200b"}
              </span>
            </div>
          </div>

          {/* Budget */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Budget
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">€</span>
              <input
                name="budget"
                type="number"
                step="0.01"
                min="0"
                value={form.budget}
                onChange={handleChange}
                className="w-full pl-8 pr-4 py-2.5 border-2 border-gray-200 rounded-xl
                           focus:border-emerald-500 outline-none transition-colors"
                placeholder="0.00"
              />
            </div>
            <span className={`${errorClass} ${submitted && errors.budget ? "text-red-500" : "text-transparent"}`}>
              {errors.budget || "\u200b"}
            </span>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl
                         focus:border-indigo-500 outline-none transition-colors resize-none"
              placeholder="Additional notes or reminders..."
            />
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
              className="flex-1 px-6 py-3 bg-gradient-to-r from-violet-500 to-indigo-500
                         hover:from-violet-600 hover:to-indigo-600 text-white rounded-xl
                         font-semibold transition-all transform hover:scale-[1.02]
                         disabled:opacity-70 disabled:cursor-not-allowed shadow-lg"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving...
                </span>
              ) : (
                editingPlan ? "Update Plan" : "Create Plan"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};