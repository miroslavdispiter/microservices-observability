import { useState, useEffect } from "react";
import type { User } from "../../models/user/User";
import type { ChangePasswordDto } from "../../dtos/user/ChangePasswordDto";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ChangePasswordDto) => Promise<void>;
  user: User | null;
}

export const ChangePasswordModal = ({
  isOpen,
  onClose,
  onSubmit,
  user,
}: ChangePasswordModalProps) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setNewPassword("");
    setConfirmPassword("");
    setSubmitted(false);
    setShowPassword(false);
  }, [isOpen]);

  const validate = () => {
    const errs: { newPassword?: string; confirmPassword?: string } = {};

    if (!newPassword) {
      errs.newPassword = "New password is required.";
    } else if (newPassword.length < 6) {
      errs.newPassword = "Password must be at least 6 characters.";
    } else if (newPassword.length > 100) {
      errs.newPassword = "Password cannot exceed 100 characters.";
    }

    if (!confirmPassword) {
      errs.confirmPassword = "Please confirm the password.";
    } else if (newPassword !== confirmPassword) {
      errs.confirmPassword = "Passwords do not match.";
    }

    return errs;
  };

  const errors = validate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    if (Object.keys(errors).length > 0) return;

    setIsLoading(true);
    try {
      await onSubmit({ newPassword });
      onClose();
    } catch (error: any) {
      console.error("Failed to change password:", error);
      alert(error?.message || "Failed to change password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const errorClass = "block min-h-[1rem] text-xs mt-1";

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
        <div className="sticky top-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-8 py-6 rounded-t-3xl">
          <h2 className="text-2xl font-bold">Change Password</h2>
          <p className="text-white/80 text-sm mt-1">
            for {user?.username}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password *
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl
                           focus:border-amber-500 outline-none transition-colors pr-12"
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 
                           hover:text-gray-700"
              >
                {showPassword ? (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            </div>
            <span
              className={`${errorClass} ${
                submitted && errors.newPassword
                  ? "text-red-500"
                  : "text-transparent"
              }`}
            >
              {errors.newPassword || "\u200b"}
            </span>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password *
            </label>
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl
                         focus:border-amber-500 outline-none transition-colors"
              placeholder="Confirm new password"
            />
            <span
              className={`${errorClass} ${
                submitted && errors.confirmPassword
                  ? "text-red-500"
                  : "text-transparent"
              }`}
            >
              {errors.confirmPassword || "\u200b"}
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
              className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500
                         hover:from-amber-600 hover:to-orange-600 text-white rounded-xl
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
                  Changing...
                </span>
              ) : (
                "Change Password"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};