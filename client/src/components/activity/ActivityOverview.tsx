import { useNavigate } from "react-router-dom";
import type { Activity } from "../../models/travel/Activity";
import {
  ActivityStatusLabels,
  ActivityStatusColors,
} from "../../models/travel/Activity";

interface ActivityOverviewProps {
  activities: Activity[];
  travelPlanId: number;
  isLoading?: boolean;
  isReadOnly?: boolean;
}

export const ActivityOverview = ({
  activities,
  travelPlanId,
  isLoading = false,
  isReadOnly = false, 
}: ActivityOverviewProps) => {
  const navigate = useNavigate();

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return "All day";
    return timeStr.substring(0, 5);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <svg
          className="animate-spin h-8 w-8 text-indigo-500"
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
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-5xl mb-3">🎯</div>
        <p className="text-gray-500 mb-4">No activities planned yet</p>
        {!isReadOnly && (  // ← DODATO
          <button
            onClick={() => navigate(`/travels/${travelPlanId}/activities`)}
            className="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
          >
            Plan your first activity →
          </button>
        )}
      </div>
    );
  }

  const groupedByDate = activities.reduce((acc, activity) => {
    const date = activity.date.split("T")[0];
    if (!acc[date]) acc[date] = [];
    acc[date].push(activity);
    return acc;
  }, {} as Record<string, Activity[]>);

  const sortedDates = Object.keys(groupedByDate).sort();
  const upcomingActivities = sortedDates.slice(0, 3);

  return (
    <div className="space-y-4">
      {upcomingActivities.map((date) => (
        <div key={date} className="space-y-2">
          <div className="text-sm font-semibold text-gray-600 px-2">
            {formatDate(date)}
          </div>
          {groupedByDate[date].map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 
                         rounded-xl border border-indigo-200 hover:shadow-md transition-all"
            >
              <div className="flex-shrink-0 w-14 text-center">
                <div className="text-xs font-semibold text-indigo-600">
                  {formatTime(activity.time)}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-800 text-sm truncate">
                  {activity.name}
                </h4>
                {activity.location && (
                  <p className="text-xs text-gray-600 flex items-center gap-1 mt-0.5">
                    <svg
                      className="w-3 h-3"
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
                    </svg>
                    {activity.location}
                  </p>
                )}
              </div>

              <div className="flex-shrink-0">
                <span
                  className={`text-xs px-2 py-1 rounded-lg font-medium border ${
                    ActivityStatusColors[activity.status]
                  }`}
                >
                  {ActivityStatusLabels[activity.status]}
                </span>
              </div>
            </div>
          ))}
        </div>
      ))}

      {sortedDates.length > 3 && (
        <p className="text-center text-sm text-gray-500 pt-2">
          +{activities.length - upcomingActivities.flatMap(d => groupedByDate[d]).length} more activities
        </p>
      )}

      {!isReadOnly && (
        <button
          onClick={() => navigate(`/travels/${travelPlanId}/activities`)}
          className="w-full py-3 text-indigo-600 hover:text-indigo-700 font-medium text-sm
                     hover:bg-indigo-50 rounded-xl transition-colors border-2 border-dashed 
                     border-indigo-300 hover:border-indigo-400"
        >
          Manage Activities →
        </button>
      )}
    </div>
  );
};