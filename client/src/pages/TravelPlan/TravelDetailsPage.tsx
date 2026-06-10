import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { travelApi } from "../../api/travelPlan/TravelPlanAPIService";
import { destinationApi } from "../../api/destination/DestinationAPIService";
import { activityApi } from "../../api/activity/ActivityAPIService";
import { Navbar } from "../../components/Navbar";
import { DestinationOverview } from "../../components/destination/DestinationOverview";
import { ActivityOverview } from "../../components/activity/ActivityOverview";
import type { TravelPlan } from "../../models/travel/TravelPlan";
import type { Destination } from "../../models/travel/Destination";
import type { Activity } from "../../models/travel/Activity";

export const TravelDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<TravelPlan | null>(null);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDestinationsLoading, setIsDestinationsLoading] = useState(false);
  const [isActivitiesLoading, setIsActivitiesLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadPlan();
  }, [id]);

  useEffect(() => {
    if (plan) {
      loadDestinations();
      loadActivities();
    }
  }, [plan]);

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

  const loadDestinations = async () => {
    if (!id) return;

    try {
      setIsDestinationsLoading(true);
      const data = await destinationApi.getAll(parseInt(id));
      setDestinations(data);
    } catch (err: any) {
      console.error("Failed to load destinations:", err);
    } finally {
      setIsDestinationsLoading(false);
    }
  };

  const loadActivities = async () => {
    if (!id) return;

    try {
      setIsActivitiesLoading(true);
      const data = await activityApi.getAll(parseInt(id));
      setActivities(data);
    } catch (err: any) {
      console.error("Failed to load activities:", err);
    } finally {
      setIsActivitiesLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const calculateTripDuration = (start: string, end: string) => {
    const days = Math.ceil(
      (new Date(end).getTime() - new Date(start).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    return days;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-indigo-50 to-purple-100">
        <Navbar activeTravelPlanId={parseInt(id!)} />
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
        <Navbar activeTravelPlanId={parseInt(id!)} />
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
      <Navbar activeTravelPlanId={parseInt(id!)} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        {/* Header Section */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-purple-100 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-violet-500 to-indigo-500 text-white px-8 py-8">
            <h1 className="text-4xl font-bold mb-4">{plan.title}</h1>
            <div className="flex flex-wrap gap-6 text-white/90">
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
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>
                  {calculateTripDuration(plan.startDate, plan.endDate)} days
                </span>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Budget Card */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border-2 border-emerald-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-white"
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
                  </div>
                  <h3 className="text-sm font-medium text-gray-600">
                    Total Budget
                  </h3>
                </div>
                <p className="text-3xl font-bold text-emerald-600">
                  €{plan.budget.toLocaleString()}
                </p>
              </div>

              {/* Destinations Count */}
              <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-6 border-2 border-teal-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-sm font-medium text-gray-600">
                    Destinations
                  </h3>
                </div>
                <p className="text-3xl font-bold text-teal-600">
                  {destinations.length}
                </p>
              </div>

              {/* Activities Count */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border-2 border-indigo-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                  </div>
                  <h3 className="text-sm font-medium text-gray-600">
                    Activities
                  </h3>
                </div>
                <p className="text-3xl font-bold text-indigo-600">
                  {activities.length}
                </p>
              </div>
            </div>

            {/* Description */}
            {plan.description && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-indigo-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h7"
                    />
                  </svg>
                  Description
                </h3>
                <p className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl">
                  {plan.description}
                </p>
              </div>
            )}

            {/* Notes */}
            {plan.notes && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-amber-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Notes
                </h3>
                <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {plan.notes}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content Sections Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Destinations Section */}
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl border border-teal-100 overflow-hidden">
            <div className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-6 py-5">
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
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Destinations
              </h2>
              <p className="text-white/80 text-sm mt-1">
                Places you'll visit
              </p>
            </div>
            <div className="p-6">
              <DestinationOverview
                destinations={destinations}
                travelPlanId={parseInt(id!)}
                isLoading={isDestinationsLoading}
              />
            </div>
          </div>

          {/* Activities Section */}
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl border border-indigo-100 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-5">
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
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                Activities
              </h2>
              <p className="text-white/80 text-sm mt-1">
                Daily schedule & plans
              </p>
            </div>
            <div className="p-6">
              <ActivityOverview
                activities={activities}
                travelPlanId={parseInt(id!)}
                isLoading={isActivitiesLoading}
              />
            </div>
          </div>

          {/* Expenses Section (Placeholder) */}
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl border border-purple-100 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-5">
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
                    d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                Expenses
              </h2>
              <p className="text-white/80 text-sm mt-1">
                Track your spending
              </p>
            </div>
            <div className="p-6">
              <div className="text-center py-12">
                <div className="text-6xl mb-4">💰</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Expenses Coming Soon
                </h3>
                <p className="text-gray-500">
                  Keep track of all your travel expenses
                </p>
              </div>
            </div>
          </div>

          {/* Checklist Section (Placeholder) */}
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl border border-orange-100 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-5">
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
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                </svg>
                Packing List
              </h2>
              <p className="text-white/80 text-sm mt-1">What to bring</p>
            </div>
            <div className="p-6">
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎒</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Packing List Coming Soon
                </h3>
                <p className="text-gray-500">Create your packing checklist</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};