import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { sharingApi } from "../../api/sharing/SharingAPIService";
import { travelApi } from "../../api/travelPlan/TravelPlanAPIService";
import type { SharingToken } from "../../models/sharing/SharingToken";
import type { TravelPlan } from "../../models/travel/TravelPlan";

export const SharedPlanPage = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [sharingToken, setSharingToken] = useState<SharingToken | null>(null);
  const [plan, setPlan] = useState<TravelPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadSharedPlan();
  }, [token]);

  const loadSharedPlan = async () => {
    if (!token) {
      setError("Invalid sharing token");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      // 1. Get sharing token info
      const tokenData = await sharingApi.getSharingToken(token);
      setSharingToken(tokenData);

      // 2. Validate token
      await sharingApi.validateToken({
        token,
        travelPlanId: tokenData.travelPlanId,
      });

      // 3. Get travel plan
      const planData = await travelApi.getById(tokenData.travelPlanId);
      setPlan(planData);
    } catch (err: any) {
      setError(err?.message || "Failed to load shared plan");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-100 flex items-center justify-center">
        <div className="text-center">
          <svg
            className="animate-spin h-12 w-12 text-blue-500 mx-auto mb-4"
            viewBox="0 0 24 24"
          >
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
          <p className="text-gray-600">Loading shared travel plan...</p>
        </div>
      </div>
    );
  }

  if (error || !plan || !sharingToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-6">
            {error || "This sharing link is invalid or has expired."}
          </p>
          <button
            onClick={() => navigate("/login")}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600
                       text-white px-6 py-3 rounded-xl font-semibold shadow-lg"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-blue-100 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-8 py-8">
            <div className="flex items-center gap-3 mb-4">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
              <span className="text-sm font-medium">
                Shared Travel Plan ({sharingToken.accessType})
              </span>
            </div>
            <h1 className="text-4xl font-bold mb-4">{plan.title}</h1>
            <div className="flex flex-wrap gap-4 text-white/90">
              <div className="flex items-center gap-2">
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
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span>
                  {formatDate(plan.startDate)} - {formatDate(plan.endDate)}
                </span>
              </div>
            </div>
          </div>

          <div className="p-8">
            {sharingToken.accessType === "VIEW" && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-3">
                  <svg
                    className="w-6 h-6 text-blue-600"
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
                  <p className="text-blue-700 font-medium">
                    You have <strong>VIEW-ONLY</strong> access to this travel plan
                  </p>
                </div>
              </div>
            )}

            {plan.description && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Description
                </h3>
                <p className="text-gray-600">{plan.description}</p>
              </div>
            )}

            {plan.notes && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Notes</h3>
                <p className="text-gray-600 whitespace-pre-wrap">{plan.notes}</p>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() =>
                  navigate(
                    `/travels/${plan.id}?token=${token}&access=${sharingToken.accessType}`
                  )
                }
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500
                           hover:from-blue-600 hover:to-cyan-600 text-white py-3 rounded-xl
                           font-semibold shadow-lg"
              >
                View Full Travel Plan
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};