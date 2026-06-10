import { useState, useEffect } from "react";
import type { Destination } from "../../models/travel/Destination";
import type { CreateDestinationDto } from "../../dtos/destination/CreateDestinationDto";

interface DestinationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateDestinationDto) => Promise<void>;
  editingDestination?: Destination | null;
  travelPlanStartDate?: string;
  travelPlanEndDate?: string;
}

export const DestinationModal = ({
  isOpen,
  onClose,
  onSubmit,
  editingDestination,
  travelPlanStartDate,
  travelPlanEndDate,
}: DestinationModalProps) => {
  const [form, setForm] = useState<CreateDestinationDto>({
    name: "",
    location: "",
    arrivalDate: "",
    departureDate: "",
    description: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (editingDestination) {
      setForm({
        name: editingDestination.name,
        location: editingDestination.location,
        arrivalDate: editingDestination.arrivalDate.split("T")[0],
        departureDate: editingDestination.departureDate.split("T")[0],
        description: editingDestination.description,
      });
    } else {
      setForm({
        name: "",
        location: "",
        arrivalDate: "",
        departureDate: "",
        description: "",
      });
    }
    setSubmitted(false);
  }, [editingDestination, isOpen]);

  const validate = () => {
    const errs: Partial<Record<keyof CreateDestinationDto, string>> = {};

    if (!form.name.trim()) errs.name = "Name is required.";
    else if (form.name.length < 2) errs.name = "Name must be at least 2 characters.";
    else if (form.name.length > 200) errs.name = "Name cannot exceed 200 characters.";

    if (!form.location.trim()) errs.location = "Location is required.";
    else if (form.location.length > 300)
      errs.location = "Location cannot exceed 300 characters.";

    if (!form.arrivalDate) errs.arrivalDate = "Arrival date is required.";
    if (!form.departureDate) errs.departureDate = "Departure date is required.";
    else if (new Date(form.departureDate) < new Date(form.arrivalDate))
      errs.departureDate = "Departure date cannot be before arrival date.";

    if (travelPlanStartDate && new Date(form.arrivalDate) < new Date(travelPlanStartDate))
      errs.arrivalDate = "Arrival date cannot be before travel plan start date.";

    if (travelPlanEndDate && new Date(form.departureDate) > new Date(travelPlanEndDate))
      errs.departureDate = "Departure date cannot be after travel plan end date.";

    if (form.description && form.description.length > 1000)
      errs.description = "Description cannot exceed 1000 characters.";

    return errs;
  };

  const errors = validate();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
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
        <div className="sticky top-0 bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-8 py-6 rounded-t-3xl">
          <h2 className="text-2xl font-bold">
            {editingDestination ? "Edit Destination" : "Add New Destination"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Destination Name *
            </label>
            <input
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl
                         focus:border-teal-500 outline-none transition-colors"
              placeholder="e.g., Paris, Rome, Tokyo"
            />
            <span
              className={`${errorClass} ${
                submitted && errors.name ? "text-red-500" : "text-transparent"
              }`}
            >
              {errors.name || "\u200b"}
            </span>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location *
            </label>
            <input
              name="location"
              type="text"
              value={form.location}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl
                         focus:border-teal-500 outline-none transition-colors"
              placeholder="e.g., Paris, France"
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

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Arrival Date *
              </label>
              <input
                name="arrivalDate"
                type="date"
                value={form.arrivalDate}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl
                           focus:border-teal-500 outline-none transition-colors"
              />
              <span
                className={`${errorClass} ${
                  submitted && errors.arrivalDate
                    ? "text-red-500"
                    : "text-transparent"
                }`}
              >
                {errors.arrivalDate || "\u200b"}
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Departure Date *
              </label>
              <input
                name="departureDate"
                type="date"
                value={form.departureDate}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl
                           focus:border-teal-500 outline-none transition-colors"
              />
              <span
                className={`${errorClass} ${
                  submitted && errors.departureDate
                    ? "text-red-500"
                    : "text-transparent"
                }`}
              >
                {errors.departureDate || "\u200b"}
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
                         focus:border-teal-500 outline-none transition-colors resize-none"
              placeholder="What do you plan to do here?"
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
              className="flex-1 px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500
                         hover:from-teal-600 hover:to-cyan-600 text-white rounded-xl
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
              ) : editingDestination ? (
                "Update Destination"
              ) : (
                "Add Destination"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};