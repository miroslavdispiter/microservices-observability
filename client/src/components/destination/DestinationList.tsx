import type { Destination } from "../../models/travel/Destination";

interface DestinationListProps {
  destinations: Destination[];
  onEdit: (destination: Destination) => void;
  onDelete: (id: number) => void;
  isLoading?: boolean;
}

export const DestinationList = ({
  destinations,
  onEdit,
  onDelete,
  isLoading = false,
}: DestinationListProps) => {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const calculateDuration = (arrival: string, departure: string) => {
    const days = Math.ceil(
      (new Date(departure).getTime() - new Date(arrival).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    return days > 1 ? `${days} days` : `${days} day`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <svg className="animate-spin h-10 w-10 text-teal-500" viewBox="0 0 24 24">
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
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📍</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          No destinations yet
        </h3>
        <p className="text-gray-500">
          Add your first destination to start planning your trip!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {destinations.map((destination) => (
        <div
          key={destination.id}
          className="bg-white border-2 border-teal-100 rounded-2xl p-6 hover:shadow-lg
                     transition-all duration-300 hover:border-teal-300"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-800 mb-1">
                {destination.name}
              </h3>
              <p className="text-gray-600 text-sm flex items-center gap-1">
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
                {destination.location}
              </p>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <svg
                className="w-4 h-4 text-teal-500"
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
                {formatDate(destination.arrivalDate)} -{" "}
                {formatDate(destination.departureDate)}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <svg
                className="w-4 h-4 text-teal-500"
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
                {calculateDuration(
                  destination.arrivalDate,
                  destination.departureDate
                )}
              </span>
            </div>
          </div>

          {destination.description && (
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {destination.description}
            </p>
          )}

          <div className="flex gap-2 pt-4 border-t border-gray-100">
            <button
              onClick={() => onEdit(destination)}
              className="flex-1 bg-teal-50 hover:bg-teal-100 text-teal-600 py-2 rounded-lg
                         font-medium transition-colors text-sm flex items-center justify-center gap-1"
            >
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
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Edit
            </button>
            <button
              onClick={() => {
                if (
                  window.confirm(
                    `Are you sure you want to delete "${destination.name}"?`
                  )
                ) {
                  onDelete(destination.id);
                }
              }}
              className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-2 rounded-lg
                         font-medium transition-colors text-sm flex items-center justify-center gap-1"
            >
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
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};