import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { travelApi } from "../../api/travelPlan/TravelPlanAPIService";
import { Navbar } from "../../components/Navbar";
import type { TravelPlan } from "../../models/travel/TravelPlan";

export const TravelDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<TravelPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPlan = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        setError("");
        const data = await travelApi.getById(parseInt(id));
        setPlan(data);
      } catch (err: any) {
        setError(err?.message || "Failed to load travel plan.");
      } finally {
        setIsLoading(false);
      }
    };

    loadPlan();
  }, [id]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-indigo-50 to-purple-100">
        <Navbar />
        <div className="flex justify-center items-center py-20">
          <svg
            className="animate-spin h-12 w-12 text-indigo-500"
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
        </div>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-indigo-50 to-purple-100">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-700 mb-4">
            Travel Plan Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            {error || "The requested travel plan does not exist."}
          </p>
          <button
            onClick={() => navigate("/travels")}
            className="bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600
                       text-white px-6 py-3 rounded-xl font-semibold shadow-lg"
          >
            Back to Travel Plans
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-indigo-50 to-purple-100">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate("/travels")}
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-6 font-medium"
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Travels
        </button>

        {/* Main Card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-purple-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-violet-500 to-indigo-500 text-white px-8 py-8">
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
                <span>{formatDate(plan.startDate)}</span>
              </div>
              <span className="text-white/50">→</span>
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
                <span>{formatDate(plan.endDate)}</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 space-y-6">
            {/* Budget */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-200">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Budget</h3>
              <p className="text-3xl font-bold text-emerald-600">
                €{plan.budget.toLocaleString()}
              </p>
            </div>

            {/* Description */}
            {plan.description && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Description
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {plan.description}
                </p>
              </div>
            )}

            {/* Notes */}
            {plan.notes && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Notes
                </h3>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {plan.notes}
                  </p>
                </div>
              </div>
            )}

            {/* Placeholder sections */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <div className="bg-violet-50 rounded-xl p-6 text-center border border-violet-200">
                <div className="text-3xl mb-2">📍</div>
                <h4 className="font-semibold text-gray-700">Destinations</h4>
                <p className="text-sm text-gray-500 mt-1">Coming soon</p>
              </div>
              <div className="bg-indigo-50 rounded-xl p-6 text-center border border-indigo-200">
                <div className="text-3xl mb-2">🎯</div>
                <h4 className="font-semibold text-gray-700">Activities</h4>
                <p className="text-sm text-gray-500 mt-1">Coming soon</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-6 text-center border border-purple-200">
                <div className="text-3xl mb-2">💰</div>
                <h4 className="font-semibold text-gray-700">Expenses</h4>
                <p className="text-sm text-gray-500 mt-1">Coming soon</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};