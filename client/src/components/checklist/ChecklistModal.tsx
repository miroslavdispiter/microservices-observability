import { useState, useEffect } from "react";
import type { ChecklistItem } from "../../models/travel/ChecklistItem";
import type { CreateChecklistItemDto } from "../../dtos/checklist/CreateChecklistItemDto";

interface ChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateChecklistItemDto) => Promise<void>;
  editingItem?: ChecklistItem | null;
}

const priorityOptions: { value: number; label: string; icon: string }[] = [
  { value: 2, label: "High Priority", icon: "⬆️" },
  { value: 1, label: "Medium Priority", icon: "➡️" },
  { value: 0, label: "Low Priority", icon: "⬇️" },
];

export const ChecklistModal = ({
  isOpen,
  onClose,
  onSubmit,
  editingItem,
}: ChecklistModalProps) => {
  const [form, setForm] = useState<CreateChecklistItemDto>({
    name: "",
    description: "",
    priority: 1,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (editingItem) {
      setForm({
        name: editingItem.name,
        description: editingItem.description,
        priority: editingItem.priority,
      });
    } else {
      setForm({
        name: "",
        description: "",
        priority: 1,
      });
    }
    setSubmitted(false);
  }, [editingItem, isOpen]);

  const validate = () => {
    const errs: Partial<Record<keyof CreateChecklistItemDto, string>> = {};

    if (!form.name.trim()) {
      errs.name = "Name is required.";
    } else if (form.name.length < 2) {
      errs.name = "Name must be at least 2 characters.";
    } else if (form.name.length > 200) {
      errs.name = "Name cannot exceed 200 characters.";
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
      [name]: name === "priority" ? parseInt(value) : value,
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
        <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-6 rounded-t-3xl">
          <h2 className="text-2xl font-bold">
            {editingItem ? "Edit Checklist Item" : "Add New Checklist Item"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Item Name *
            </label>
            <input
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl
                         focus:border-orange-500 outline-none transition-colors"
              placeholder="e.g., Pack passport, Book accommodation"
            />
            <span
              className={`${errorClass} ${
                submitted && errors.name ? "text-red-500" : "text-transparent"
              }`}
            >
              {errors.name || "\u200b"}
            </span>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority *
            </label>
            <select
              name="priority"
              value={form.priority}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl
                         focus:border-orange-500 outline-none transition-colors"
            >
              {priorityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.icon} {option.label}
                </option>
              ))}
            </select>
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
                         focus:border-orange-500 outline-none transition-colors resize-none"
              placeholder="Additional notes or details..."
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
              className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500
                         hover:from-orange-600 hover:to-red-600 text-white rounded-xl
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
              ) : editingItem ? (
                "Update Item"
              ) : (
                "Add Item"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};