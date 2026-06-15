import { useNavigate } from "react-router-dom";
import type { Destination } from "../../models/travel/Destination";

interface DestinationOverviewProps {
  destinations: Destination[];
  travelPlanId: number;
  isLoading?: boolean;
  isReadOnly?: boolean;
}

export const DestinationOverview = ({
  destinations,
  travelPlanId,
  isLoading = false,
  isReadOnly = false,
}: DestinationOverviewProps) => {
  const navigate = useNavigate();

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const calculateDuration = (arrival: string, departure: string) => {
    const days = Math.ceil(
      (new Date(departure).getTime() - new Date(arrival).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    return days;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <svg
          className="animate-spin h-8 w-8 text-teal-500"
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

  if (destinations.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-5xl mb-3">📍</div>
        <p className="text-gray-500 mb-4">No destinations added yet</p>
        {!isReadOnly && (  // ← DODATO
          <button
            onClick={() => navigate(`/travels/${travelPlanId}/destinations`)}
            className="text-teal-600 hover:text-teal-700 font-medium text-sm"
          >
            Add your first destination →
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {destinations.map((destination, index) => (
        <div
          key={destination.id}
          className="flex items-center gap-4 p-4 bg-gradient-to-r from-teal-50 to-cyan-50 
                     rounded-xl border border-teal-200 hover:shadow-md transition-all"
        >
          <div className="flex-shrink-0 w-12 h-12 bg-teal-500 text-white rounded-full 
                          flex items-center justify-center font-bold text-lg">
            {index + 1}
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-800 text-lg truncate">
              {destination.name}
            </h4>
            <p className="text-sm text-gray-600 flex items-center gap-1">
              <svg
                className="w-3.5 h-3.5"
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
              {destination.location}
            </p>
          </div>

          <div className="flex-shrink-0 text-right">
            <p className="text-sm font-medium text-gray-700">
              {formatDate(destination.arrivalDate)} -{" "}
              {formatDate(destination.departureDate)}
            </p>
            <p className="text-xs text-gray-500">
              {calculateDuration(destination.arrivalDate, destination.departureDate)}{" "}
              {calculateDuration(destination.arrivalDate, destination.departureDate) === 1
                ? "day"
                : "days"}
            </p>
          </div>
        </div>
      ))}

      {!isReadOnly && (  // ← DODATO
        <button
          onClick={() => navigate(`/travels/${travelPlanId}/destinations`)}
          className="w-full py-3 text-teal-600 hover:text-teal-700 font-medium text-sm
                     hover:bg-teal-50 rounded-xl transition-colors border-2 border-dashed 
                     border-teal-300 hover:border-teal-400"
        >
          Manage Destinations →
        </button>
      )}
    </div>
  );
};