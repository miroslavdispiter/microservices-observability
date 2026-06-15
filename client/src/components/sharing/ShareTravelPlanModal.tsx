import { useState } from "react";
import type { CreateSharingTokenDto } from "../../dtos/sharing/CreateSharingTokenDto";
import type { SharingToken } from "../../models/sharing/SharingToken";
import { QRCodeDisplay } from "./QRCodeDisplay";

interface ShareTravelPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (data: CreateSharingTokenDto) => Promise<SharingToken>;
  travelPlanId: number;
  travelPlanTitle: string;
}

export const ShareTravelPlanModal = ({
  isOpen,
  onClose,
  onGenerate,
  travelPlanId,
  travelPlanTitle,
}: ShareTravelPlanModalProps) => {
  const [accessType, setAccessType] = useState<"VIEW" | "EDIT">("VIEW");
  const [expiresInDays, setExpiresInDays] = useState<number | null>(7);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedToken, setGeneratedToken] = useState<SharingToken | null>(null);

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const token = await onGenerate({
        travelPlanId,
        accessType,
        expiresInDays,
      });
      setGeneratedToken(token);
    } catch (error: any) {
      alert(error?.message || "Failed to generate sharing link");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setGeneratedToken(null);
    setAccessType("VIEW");
    setExpiresInDays(7);
    onClose();
  };

  const getSharingUrl = () => {
    if (!generatedToken) return "";
    return `${window.location.origin}/shared/${generatedToken.token}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-8 py-6 rounded-t-3xl">
          <h2 className="text-2xl font-bold">Share Travel Plan</h2>
          <p className="text-white/80 text-sm mt-1">{travelPlanTitle}</p>
        </div>

        <div className="p-8">
          {!generatedToken ? (
            <div className="space-y-5">
              {/* Access Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Access Level *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAccessType("VIEW")}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      accessType === "VIEW"
                        ? "border-blue-500 bg-blue-50 shadow-md"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          accessType === "VIEW"
                            ? "border-blue-500 bg-blue-500"
                            : "border-gray-300"
                        }`}
                      >
                        {accessType === "VIEW" && (
                          <div className="w-2 h-2 bg-white rounded-full" />
                        )}
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-gray-800">👁️ View Only</div>
                        <div className="text-xs text-gray-500">Can only view the plan</div>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAccessType("EDIT")}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      accessType === "EDIT"
                        ? "border-blue-500 bg-blue-50 shadow-md"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          accessType === "EDIT"
                            ? "border-blue-500 bg-blue-500"
                            : "border-gray-300"
                        }`}
                      >
                        {accessType === "EDIT" && (
                          <div className="w-2 h-2 bg-white rounded-full" />
                        )}
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-gray-800">✏️ Edit Access</div>
                        <div className="text-xs text-gray-500">Can view and edit</div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Expiration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link Expiration
                </label>
                <select
                  value={expiresInDays || "never"}
                  onChange={(e) =>
                    setExpiresInDays(
                      e.target.value === "never" ? null : parseInt(e.target.value)
                    )
                  }
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl
                             focus:border-blue-500 outline-none transition-colors"
                >
                  <option value="1">1 day</option>
                  <option value="7">7 days</option>
                  <option value="30">30 days</option>
                  <option value="never">Never expires</option>
                </select>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500
                           hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl
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
                    Generating...
                  </span>
                ) : (
                  "Generate Sharing Link"
                )}
              </button>
            </div>
          ) : (
            <QRCodeDisplay
              token={generatedToken}
              sharingUrl={getSharingUrl()}
              onClose={handleClose}
            />
          )}

          {!generatedToken && (
            <div className="flex gap-3 pt-4 mt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl
                           hover:bg-gray-50 font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};