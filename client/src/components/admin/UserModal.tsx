import { useState, useEffect } from "react";
import type { User } from "../../models/user/User";
import type { UpdateUserDto } from "../../dtos/user/UpdateUserDto";

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UpdateUserDto) => Promise<void>;
  editingUser: User | null;
}

export const UserModal = ({
  isOpen,
  onClose,
  onSubmit,
  editingUser,
}: UserModalProps) => {
  const [form, setForm] = useState<UpdateUserDto>({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    role: "User",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (editingUser) {
      setForm({
        firstName: editingUser.firstName,
        lastName: editingUser.lastName,
        username: editingUser.username,
        email: editingUser.email,
        role: editingUser.role,
      });
    }
    setSubmitted(false);
  }, [editingUser, isOpen]);

  const validate = () => {
    const errs: Partial<Record<keyof UpdateUserDto, string>> = {};

    if (!form.firstName.trim()) {
      errs.firstName = "First name is required.";
    } else if (form.firstName.length < 2) {
      errs.firstName = "First name must be at least 2 characters.";
    } else if (form.firstName.length > 100) {
      errs.firstName = "First name cannot exceed 100 characters.";
    }

    if (!form.lastName.trim()) {
      errs.lastName = "Last name is required.";
    } else if (form.lastName.length < 2) {
      errs.lastName = "Last name must be at least 2 characters.";
    } else if (form.lastName.length > 100) {
      errs.lastName = "Last name cannot exceed 100 characters.";
    }

    if (!form.username.trim()) {
      errs.username = "Username is required.";
    } else if (form.username.length < 3) {
      errs.username = "Username must be at least 3 characters.";
    } else if (form.username.length > 50) {
      errs.username = "Username cannot exceed 50 characters.";
    }

    if (!form.email.trim()) {
      errs.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = "Invalid email format.";
    } else if (form.email.length > 255) {
      errs.email = "Email cannot exceed 255 characters.";
    }

    return errs;
  };

  const errors = validate();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
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
    } catch (error: any) {
      console.error("Failed to update user:", error);
      alert(error?.message || "Failed to update user. Please try again.");
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
          <h2 className="text-2xl font-bold">Edit User</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {/* First Name and Last Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name *
              </label>
              <input
                name="firstName"
                type="text"
                value={form.firstName}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl
                           focus:border-violet-500 outline-none transition-colors"
                placeholder="John"
              />
              <span
                className={`${errorClass} ${
                  submitted && errors.firstName
                    ? "text-red-500"
                    : "text-transparent"
                }`}
              >
                {errors.firstName || "\u200b"}
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name *
              </label>
              <input
                name="lastName"
                type="text"
                value={form.lastName}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl
                           focus:border-violet-500 outline-none transition-colors"
                placeholder="Doe"
              />
              <span
                className={`${errorClass} ${
                  submitted && errors.lastName
                    ? "text-red-500"
                    : "text-transparent"
                }`}
              >
                {errors.lastName || "\u200b"}
              </span>
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username *
            </label>
            <input
              name="username"
              type="text"
              value={form.username}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl
                         focus:border-violet-500 outline-none transition-colors"
              placeholder="johndoe"
            />
            <span
              className={`${errorClass} ${
                submitted && errors.username
                  ? "text-red-500"
                  : "text-transparent"
              }`}
            >
              {errors.username || "\u200b"}
            </span>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl
                         focus:border-violet-500 outline-none transition-colors"
              placeholder="john@example.com"
            />
            <span
              className={`${errorClass} ${
                submitted && errors.email ? "text-red-500" : "text-transparent"
              }`}
            >
              {errors.email || "\u200b"}
            </span>
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role *
            </label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl
                         focus:border-violet-500 outline-none transition-colors"
            >
              <option value="User">User</option>
              <option value="Admin">Admin</option>
            </select>
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
              ) : (
                "Update User"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};