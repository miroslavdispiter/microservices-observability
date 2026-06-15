import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { adminApi } from "../../api/admin/AdminAPIService";
import { Navbar } from "../../components/Navbar";
import type { TravelPlan } from "../../models/travel/TravelPlan";

export const AdminTravelPlansPage = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<TravelPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setIsLoading(true);
      setError("");
      const data = await adminApi.getAllTravelPlans();
      setPlans(data);
    } catch (err: any) {
      setError(err?.message || "Failed to load travel plans.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const calculateDuration = (start: string, end: string) => {
    const days = Math.ceil(
      (new Date(end).getTime() - new Date(start).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    return days > 1 ? `${days} days` : `${days} day`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-indigo-50 to-purple-100">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-2">Manage users and system settings</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="px-6 py-3 bg-white text-gray-700 rounded-xl font-semibold 
                       hover:bg-gray-50 border-2 border-gray-200"
          >
            👥 Users
          </button>
          <button
            onClick={() => navigate("/admin/travel-plans")}
            className="px-6 py-3 bg-gradient-to-r from-violet-500 to-indigo-500 
                       text-white rounded-xl font-semibold shadow-md"
          >
            ✈️ Travel Plans
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* Travel Plans */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-purple-100 overflow-hidden">
          <div className="bg-gradient-to-r from-violet-500 to-indigo-500 text-white px-6 py-5">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              All Travel Plans
            </h2>
            <p className="text-white/80 text-sm mt-1">
              {plans.length} {plans.length === 1 ? "plan" : "plans"} in the system
            </p>
          </div>

          <div className="p-6">
            {isLoading ? (
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
            ) : plans.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">✈️</div>
                <h3 className="text-2xl font-semibold text-gray-700 mb-2">
                  No travel plans yet
                </h3>
                <p className="text-gray-500">
                  No users have created travel plans yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl
                               transition-all duration-300 overflow-hidden border border-purple-100
                               hover:scale-[1.02] cursor-pointer"
                    onClick={() => navigate(`/travels/${plan.id}`)}
                  >
                    <div className="bg-gradient-to-r from-violet-500 to-indigo-500 h-2" />

                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1">
                        {plan.title}
                      </h3>

                      {plan.description && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {plan.description}
                        </p>
                      )}

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <svg
                            className="w-4 h-4"
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
                            {formatDate(plan.startDate)} -{" "}
                            {formatDate(plan.endDate)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span>
                            {calculateDuration(plan.startDate, plan.endDate)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span className="font-semibold">
                            €{plan.budget.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/travels/${plan.id}`);
                        }}
                        className="w-full bg-gradient-to-r from-violet-500 to-indigo-500
                                   hover:from-violet-600 hover:to-indigo-600 text-white py-2 rounded-lg
                                   font-medium transition-all text-sm"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};