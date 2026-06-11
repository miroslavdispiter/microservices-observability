import { useNavigate } from "react-router-dom";
import type { ChecklistItem } from "../../models/travel/ChecklistItem";

interface ChecklistOverviewProps {
  items: ChecklistItem[];
  travelPlanId: number;
  isLoading?: boolean;
}

export const ChecklistOverview = ({
  items,
  travelPlanId,
  isLoading = false,
}: ChecklistOverviewProps) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <svg
          className="animate-spin h-8 w-8 text-orange-500"
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

  if (items.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-5xl mb-3">📋</div>
        <p className="text-gray-500 mb-4">No checklist items yet</p>
        <button
          onClick={() => navigate(`/travels/${travelPlanId}/checklist`)}
          className="text-orange-600 hover:text-orange-700 font-medium text-sm"
        >
          Create your packing list →
        </button>
      </div>
    );
  }

  const completedCount = items.filter((item) => item.isCompleted).length;
  const totalCount = items.length;
  const completionPercentage = (completedCount / totalCount) * 100;

  return (
    <div className="space-y-4">
      {/* Progress Summary */}
      <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-5 border-2 border-orange-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-800">Progress</h3>
          <span className="text-2xl font-bold text-orange-600">
            {completedCount}/{totalCount}
          </span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden mb-2">
          <div
            className="h-full bg-gradient-to-r from-orange-400 to-red-500 transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>

        <p className="text-sm text-gray-600">
          {completionPercentage === 100 ? (
            <span className="text-green-600 font-semibold">
              ✅ All items completed!
            </span>
          ) : (
            <span>
              {completionPercentage.toFixed(0)}% complete
            </span>
          )}
        </p>
      </div>

      {/* Recent Items */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">
          Recent Items
        </h3>
        <div className="space-y-2">
          {items.slice(0, 5).map((item) => (
            <div
              key={item.id}
              className={`flex items-center gap-2 p-3 rounded-lg border ${
                item.isCompleted
                  ? "bg-green-50 border-green-200"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${
                  item.isCompleted
                    ? "bg-green-500 border-green-500"
                    : "border-gray-300"
                }`}
              >
                {item.isCompleted && (
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
              <span
                className={`text-sm flex-1 ${
                  item.isCompleted
                    ? "text-gray-500 line-through"
                    : "text-gray-700 font-medium"
                }`}
              >
                {item.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => navigate(`/travels/${travelPlanId}/checklist`)}
        className="w-full py-3 text-orange-600 hover:text-orange-700 font-medium text-sm
                   hover:bg-orange-50 rounded-xl transition-colors border-2 border-dashed 
                   border-orange-300 hover:border-orange-400"
      >
        Manage Checklist →
      </button>
    </div>
  );
};