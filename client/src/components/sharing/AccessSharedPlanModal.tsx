import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface AccessSharedPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccessSharedPlanModal = ({
  isOpen,
  onClose,
}: AccessSharedPlanModalProps) => {
  const navigate = useNavigate();
  const [token, setToken] = useState("");

  const handleAccess = () => {
    if (!token.trim()) {
      alert("Please enter a sharing token");
      return;
    }

    navigate(`/shared/${token.trim()}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
        <div className="sticky top-0 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-6 rounded-t-3xl">
          <h2 className="text-2xl font-bold">Access Shared Plan</h2>
          <p className="text-white/80 text-sm mt-1">
            Enter the sharing token or link
          </p>
        </div>

        <div className="p-8 space-y-5">
          {/* Token Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sharing Token *
            </label>
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste token here..."
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl
                         focus:border-green-500 outline-none transition-colors"
            />
          </div>

          {/* Info */}
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
            <p className="text-sm text-green-700">
              💡 You can paste the full sharing link or just the token code
            </p>
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
              onClick={handleAccess}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500
                         hover:from-green-600 hover:to-emerald-600 text-white rounded-xl
                         font-semibold transition-all shadow-lg"
            >
              Access Plan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};