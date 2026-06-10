import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { travelApi } from "../../api/travelPlan/TravelPlanAPIService";
import { activityApi } from "../../api/activity/ActivityAPIService";
import { Navbar } from "../../components/Navbar";
import { ActivityModal } from "../../components/activity/ActivityModal";
import { ActivityCalendar } from "../../components/activity/ActivityCalendar";
import type { TravelPlan } from "../../models/travel/TravelPlan";
import type { Activity } from "../../models/travel/Activity";
import type { CreateActivityDto } from "../../dtos/activity/CreateActivityDto";
import {
  ActivityStatusLabels,
  ActivityStatusColors,
} from "../../models/travel/Activity";

export const ActivitiesPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<TravelPlan | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActivitiesLoading, setIsActivitiesLoading] = useState(false);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(
    null
  );
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");

  useEffect(() => {
    loadPlan();
  }, [id]);

  useEffect(() => {
    if (plan) {
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

  const loadActivities = async () => {
    if (!id) return;

    try {
      setIsActivitiesLoading(true);
      const data = await activityApi.getAll(parseInt(id));
      setActivities(data);
    } catch (err: any) {
      setError(err?.message || "Failed to load activities.");
    } finally {
      setIsActivitiesLoading(false);
    }
  };

  const handleCreate = async (data: CreateActivityDto) => {
    if (!id) return;
    await activityApi.create(parseInt(id), data);
    await loadActivities();
  };

  const handleUpdate = async (data: CreateActivityDto) => {
    if (!id || !editingActivity) return;
    await activityApi.update(parseInt(id), editingActivity.id, data);
    await loadActivities();
    setEditingActivity(null);
  };

  const handleDelete = async (activityId: number) => {
    if (!id) return;

    try {
      await activityApi.delete(parseInt(id), activityId);
      await loadActivities();
    } catch (err: any) {
      alert(err?.message || "Failed to delete activity.");
    }
  };

  const openCreateModal = (date?: string) => {
    setEditingActivity(null);
    setSelectedDate(date || null);
    setIsModalOpen(true);
  };

  const openEditModal = (activity: Activity) => {
    setEditingActivity(activity);
    setIsModalOpen(true);
  };

  const handleDateClick = (date: string) => {
    openCreateModal(date);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return "All day";
    return timeStr.substring(0, 5);
  };

  // Group activities by date for list view
  const groupedActivities = activities.reduce((acc, activity) => {
    const date = activity.date.split("T")[0];
    if (!acc[date]) acc[date] = [];
    acc[date].push(activity);
    return acc;
  }, {} as Record<string, Activity[]>);

  const sortedDates = Object.keys(groupedActivities).sort();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-100">
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

  if (error && !plan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-100">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-700 mb-4">
            Travel Plan Not Found
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate("/travels")}
            className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600
                       text-white px-6 py-3 rounded-xl font-semibold shadow-lg"
          >
            Back to Travel Plans
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-100">
      <Navbar activeTravelPlanId={parseInt(id!)} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-6">
          <button
            onClick={() => navigate("/travels")}
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            My Travels
          </button>
          <svg
            className="w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
          <button
            onClick={() => navigate(`/travels/${id}`)}
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            {plan?.title}
          </button>
          <svg
            className="w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
          <span className="text-gray-600">Activities</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              Activities & Schedule
            </h1>
            <p className="text-gray-600 mt-2">
              Plan your daily activities for{" "}
              <span className="font-semibold">{plan?.title}</span>
            </p>
          </div>
          <button
            onClick={() => openCreateModal()}
            className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600
                       text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl
                       transition-all transform hover:scale-105 flex items-center gap-2"
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Activity
          </button>
        </div>

        {/* View Toggle */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setViewMode("calendar")}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              viewMode === "calendar"
                ? "bg-indigo-500 text-white shadow-md"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            📅 Calendar View
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              viewMode === "list"
                ? "bg-indigo-500 text-white shadow-md"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            📋 List View
          </button>
        </div>

        {/* Error Message */}
        {error && plan && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* Content */}
        {viewMode === "calendar" ? (
          /* Calendar View */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {plan && (
                <ActivityCalendar
                  activities={activities}
                  onDateClick={handleDateClick}
                  travelPlanStartDate={plan.startDate}
                  travelPlanEndDate={plan.endDate}
                />
              )}
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-2xl border-2 border-indigo-100 p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  Quick Stats
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Activities</span>
                    <span className="font-bold text-indigo-600">
                      {activities.length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Planned</span>
                    <span className="font-semibold text-blue-600">
                      {activities.filter((a) => a.status === 0).length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Reserved</span>
                    <span className="font-semibold text-amber-600">
                      {activities.filter((a) => a.status === 1).length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Completed</span>
                    <span className="font-semibold text-green-600">
                      {activities.filter((a) => a.status === 2).length}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border-2 border-indigo-200 p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  💡 Tip
                </h3>
                <p className="text-sm text-gray-600">
                  Click on any date in the calendar to quickly add an activity
                  for that day!
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* List View */
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-indigo-100 overflow-hidden">
            <div className="p-8">
              {isActivitiesLoading ? (
                <div className="flex justify-center items-center py-12">
                  <svg
                    className="animate-spin h-10 w-10 text-indigo-500"
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
              ) : activities.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🎯</div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    No activities yet
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Start planning your daily activities!
                  </p>
                  <button
                    onClick={() => openCreateModal()}
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600
                               text-white px-6 py-3 rounded-xl font-semibold shadow-lg inline-flex items-center gap-2"
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
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Add Your First Activity
                  </button>
                </div>
              ) : (
                <div className="space-y-8">
                  {sortedDates.map((date) => (
                    <div key={date}>
                      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                        <svg
                          className="w-6 h-6 text-indigo-500"
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
                        {formatDate(date)}
                      </h3>

                      <div className="space-y-3">
                        {groupedActivities[date].map((activity) => (
                          <div
                            key={activity.id}
                            className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 
                                       rounded-2xl p-5 hover:shadow-lg transition-all"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-start gap-3 mb-3">
                                  <div className="flex-shrink-0 w-16 text-center">
                                    <div className="text-lg font-bold text-indigo-600">
                                      {formatTime(activity.time)}
                                    </div>
                                  </div>

                                  <div className="flex-1">
                                    <h4 className="text-lg font-bold text-gray-800 mb-1">
                                      {activity.name}
                                    </h4>

                                    {activity.location && (
                                      <p className="text-sm text-gray-600 flex items-center gap-1 mb-2">
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
                                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                          />
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                          />
                                        </svg>
                                        {activity.location}
                                      </p>
                                    )}

                                    {activity.description && (
                                      <p className="text-sm text-gray-600 mb-3">
                                        {activity.description}
                                      </p>
                                    )}

                                    <div className="flex items-center gap-3">
                                      <span
                                        className={`text-xs px-3 py-1 rounded-lg font-medium border ${
                                          ActivityStatusColors[activity.status]
                                        }`}
                                      >
                                        {ActivityStatusLabels[activity.status]}
                                      </span>

                                      {activity.estimatedCost > 0 && (
                                        <span className="text-sm font-semibold text-emerald-600">
                                          €{activity.estimatedCost.toFixed(2)}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="flex gap-2">
                                <button
                                  onClick={() => openEditModal(activity)}
                                  className="p-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-600 
                                             rounded-lg transition-colors"
                                  title="Edit"
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
                                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                    />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => {
                                    if (
                                      window.confirm(
                                        `Are you sure you want to delete "${activity.name}"?`
                                      )
                                    ) {
                                      handleDelete(activity.id);
                                    }
                                  }}
                                  className="p-2 bg-red-100 hover:bg-red-200 text-red-600 
                                             rounded-lg transition-colors"
                                  title="Delete"
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
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Back to Overview */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate(`/travels/${id}`)}
            className="text-indigo-600 hover:text-indigo-700 font-medium inline-flex items-center gap-2"
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
            Back to Travel Plan Overview
          </button>
        </div>
      </div>

      {/* Modal */}
      <ActivityModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingActivity(null);
          setSelectedDate(null);
        }}
        onSubmit={editingActivity ? handleUpdate : handleCreate}
        editingActivity={editingActivity}
        travelPlanStartDate={plan?.startDate}
        travelPlanEndDate={plan?.endDate}
        preselectedDate={selectedDate || undefined}
      />
    </div>
  );
};