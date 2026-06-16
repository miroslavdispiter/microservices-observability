import { useState, useEffect } from "react";
import type { Activity } from "../../models/travel/Activity";
import type { CreateActivityDto } from "../../dtos/activity/CreateActivityDto";

interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateActivityDto) => Promise<void>;
  editingActivity?: Activity | null;
  travelPlanStartDate?: string;
  travelPlanEndDate?: string;
  preselectedDate?: string;
}

export const ActivityModal = ({
  isOpen,
  onClose,
  onSubmit,
  editingActivity,
  travelPlanStartDate,
  travelPlanEndDate,
  preselectedDate,
}: ActivityModalProps) => {
  const [form, setForm] = useState<CreateActivityDto>({
    name: "",
    date: preselectedDate || "",
    time: null,  // Promenjeno sa "" na null
    location: "",
    description: "",
    estimatedCost: 0,
    status: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (editingActivity) {
      const timeValue = editingActivity.time
        ? editingActivity.time.substring(0, 5)
        : null;  // Promenjeno sa "" na null

      setForm({
        name: editingActivity.name,
        date: editingActivity.date.split("T")[0],
        time: timeValue,
        location: editingActivity.location,
        description: editingActivity.description,
        estimatedCost: editingActivity.estimatedCost,
        status: editingActivity.status,
      });
    } else {
      setForm({
        name: "",
        date: preselectedDate || "",
        time: null,  // Promenjeno sa "" na null
        location: "",
        description: "",
        estimatedCost: 0,
        status: 0,
      });
    }
    setSubmitted(false);
  }, [editingActivity, isOpen, preselectedDate]);

  const validate = () => {
    const errs: Partial<Record<keyof CreateActivityDto, string>> = {};

    if (!form.name.trim()) errs.name = "Name is required.";
    else if (form.name.length < 2)
      errs.name = "Name must be at least 2 characters.";
    else if (form.name.length > 200)
      errs.name = "Name cannot exceed 200 characters.";

    if (!form.date) errs.date = "Date is required.";

    if (
      travelPlanStartDate &&
      new Date(form.date) < new Date(travelPlanStartDate)
    )
      errs.date = "Activity date cannot be before travel plan start date.";

    if (travelPlanEndDate && new Date(form.date) > new Date(travelPlanEndDate))
      errs.date = "Activity date cannot be after travel plan end date.";

    if (form.location && form.location.length > 300)
      errs.location = "Location cannot exceed 300 characters.";

    if (form.description && form.description.length > 1000)
      errs.description = "Description cannot exceed 1000 characters.";

    if (form.estimatedCost < 0)
      errs.estimatedCost = "Estimated cost cannot be negative.";

    return errs;
  };

  const errors = validate();

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    
    let processedValue: any = value;
    
    if (name === "estimatedCost") {
      processedValue = parseFloat(value) || 0;
    } else if (name === "status") {
      processedValue = parseInt(value);
    } else if (name === "time") {
      // Ako je time prazan string, postavi na null
      processedValue = value.trim() === "" ? null : value;
    }

    setForm((prev) => ({
      ...prev,
      [name]: processedValue,
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
    } catch (error: any) {
      console.error("Failed to submit activity:", error);
      alert(error?.message || "Failed to save activity. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const errorClass = "block min-h-[1rem] text-xs mt-1";

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-8 py-6 rounded-t-3xl">
          <h2 className="text-2xl font-bold">
            {editingActivity ? "Edit Activity" : "Add New Activity"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Activity Name *
            </label>
            <input
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl
                         focus:border-indigo-500 outline-none transition-colors"
              placeholder="e.g., Visit Eiffel Tower, Lunch at..."
            />
            <span
              className={`${errorClass} ${
                submitted && errors.name ? "text-red-500" : "text-transparent"
              }`}
            >
              {errors.name || "\u200b"}
            </span>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                           focus:border-indigo-500 outline-none transition-colors"
              />
              <span
                className={`${errorClass} ${
                  submitted && errors.date ? "text-red-500" : "text-transparent"
                }`}
              >
                {errors.date || "\u200b"}
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time
              </label>
              <input
                name="time"
                type="time"
                value={form.time || ""}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl
                           focus:border-indigo-500 outline-none transition-colors"
              />
              <span className={`${errorClass} text-transparent`}>
                {"\u200b"}
              </span>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <input
              name="location"
              type="text"
              value={form.location}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl
                         focus:border-indigo-500 outline-none transition-colors"
              placeholder="Where will this activity take place?"
            />
            <span
              className={`${errorClass} ${
                submitted && errors.location
                  ? "text-red-500"
                  : "text-transparent"
              }`}
            >
              {errors.location || "\u200b"}
            </span>
          </div>

          {/* Status and Estimated Cost */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl
                           focus:border-indigo-500 outline-none transition-colors"
              >
                <option value={0}>Planned</option>
                <option value={1}>Reserved</option>
                <option value={2}>Completed</option>
                <option value={3}>Cancelled</option>
              </select>
              <span className={`${errorClass} text-transparent`}>
                {"\u200b"}
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Cost
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                  €
                </span>
                <input
                  name="estimatedCost"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.estimatedCost}
                  onChange={handleChange}
                  className="w-full pl-8 pr-4 py-2.5 border-2 border-gray-200 rounded-xl
                             focus:border-emerald-500 outline-none transition-colors"
                  placeholder="0.00"
                />
              </div>
              <span
                className={`${errorClass} ${
                  submitted && errors.estimatedCost
                    ? "text-red-500"
                    : "text-transparent"
                }`}
              >
                {errors.estimatedCost || "\u200b"}
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
              rows={4}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl
                         focus:border-indigo-500 outline-none transition-colors resize-none"
              placeholder="Additional details about this activity..."
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
              className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500
                         hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl
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
              ) : editingActivity ? (
                "Update Activity"
              ) : (
                "Add Activity"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};