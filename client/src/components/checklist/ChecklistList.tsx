import type { ChecklistItem } from "../../models/travel/ChecklistItem";
import {
  ChecklistPriorityLabels,
  ChecklistPriorityColors,
  ChecklistPriorityIcons,
} from "../../models/travel/ChecklistItem";

interface ChecklistListProps {
  items: ChecklistItem[];
  onEdit: (item: ChecklistItem) => void;
  onDelete: (id: number) => void;
  onToggle: (id: number) => void;
  isLoading?: boolean;
}

export const ChecklistList = ({
  items,
  onEdit,
  onDelete,
  onToggle,
  isLoading = false,
}: ChecklistListProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <svg
          className="animate-spin h-10 w-10 text-orange-500"
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
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📋</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          No items yet
        </h3>
        <p className="text-gray-500">
          Start building your packing list!
        </p>
      </div>
    );
  }

  const incompleteItems = items.filter(item => !item.isCompleted);
  const completedItems = items.filter(item => item.isCompleted);

  const renderItem = (item: ChecklistItem) => (
    <div
      key={item.id}
      className={`bg-white border-2 rounded-xl p-4 hover:shadow-md transition-all duration-300 ${
        item.isCompleted 
          ? "border-green-200 bg-green-50/50" 
          : "border-orange-100 hover:border-orange-300"
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={() => onToggle(item.id)}
          className={`flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center
                     transition-all ${
                       item.isCompleted
                         ? "bg-green-500 border-green-500"
                         : "border-gray-300 hover:border-orange-500"
                     }`}
        >
          {item.isCompleted && (
            <svg
              className="w-4 h-4 text-white"
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
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3
              className={`text-base font-bold ${
                item.isCompleted
                  ? "text-gray-500 line-through"
                  : "text-gray-800"
              }`}
            >
              {item.name}
            </h3>
            <span
              className={`flex-shrink-0 px-2 py-1 rounded-lg text-xs font-medium border ${
                ChecklistPriorityColors[item.priority]
              }`}
            >
              {ChecklistPriorityIcons[item.priority]}{" "}
              {ChecklistPriorityLabels[item.priority]}
            </span>
          </div>

          {item.description && (
            <p
              className={`text-sm mb-3 ${
                item.isCompleted ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {item.description}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(item)}
              className="bg-orange-50 hover:bg-orange-100 text-orange-600 px-3 py-1.5 rounded-lg
                         font-medium transition-colors text-sm flex items-center gap-1"
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
                    `Are you sure you want to delete "${item.name}"?`
                  )
                ) {
                  onDelete(item.id);
                }
              }}
              className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg
                         font-medium transition-colors text-sm flex items-center gap-1"
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
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Incomplete Items */}
      {incompleteItems.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <svg
              className="w-5 h-5 text-orange-500"
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
            To Do ({incompleteItems.length})
          </h3>
          <div className="space-y-3">
            {incompleteItems.map(renderItem)}
          </div>
        </div>
      )}

      {/* Completed Items */}
      {completedItems.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <svg
              className="w-5 h-5 text-green-500"
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
            Completed ({completedItems.length})
          </h3>
          <div className="space-y-3">
            {completedItems.map(renderItem)}
          </div>
        </div>
      )}
    </div>
  );
};