import { QRCodeSVG } from "qrcode.react";
import type { SharingToken } from "../../models/sharing/SharingToken";

interface QRCodeDisplayProps {
  token: SharingToken;
  sharingUrl: string;
  onClose: () => void;
}

export const QRCodeDisplay = ({
  token,
  sharingUrl,
  onClose,
}: QRCodeDisplayProps) => {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(sharingUrl);
    alert("Link copied to clipboard!");
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Never";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Success Message */}
      <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <svg
            className="w-6 h-6 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <h3 className="font-semibold text-green-800">Sharing Link Created!</h3>
            <p className="text-sm text-green-600">
              Access: {token.accessType} | Expires: {formatDate(token.expiresAt)}
            </p>
          </div>
        </div>
      </div>

      {/* QR Code */}
      <div className="flex justify-center">
        <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-gray-200">
          <QRCodeSVG value={sharingUrl} size={256} level="H" />
        </div>
      </div>

      {/* Sharing URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sharing Link
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={sharingUrl}
            readOnly
            className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl
                       bg-gray-50 text-gray-600 text-sm"
          />
          <button
            onClick={copyToClipboard}
            className="px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl
                       font-medium transition-colors flex items-center gap-2"
          >
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
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            Copy
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
        <h4 className="font-semibold text-blue-800 mb-2">How to share:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Scan the QR code with a mobile device</li>
          <li>• Or copy and send the link above</li>
          <li>• Recipients can access the plan without login</li>
        </ul>
      </div>

      {/* Close Button */}
      <button
        onClick={onClose}
        className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500
                   hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl
                   font-semibold transition-all shadow-lg"
      >
        Done
      </button>
    </div>
  );
};