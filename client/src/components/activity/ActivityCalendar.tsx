import { useState } from "react";
import type { Activity } from "../../models/travel/Activity";

interface ActivityCalendarProps {
  activities: Activity[];
  onDateClick: (date: string) => void;
  travelPlanStartDate: string;
  travelPlanEndDate: string;
}

export const ActivityCalendar = ({
  activities,
  onDateClick,
  travelPlanStartDate,
  travelPlanEndDate,
}: ActivityCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(
    new Date(travelPlanStartDate)
  );

  const activitiesByDate = activities.reduce((acc, activity) => {
    const date = activity.date.split("T")[0];
    if (!acc[date]) acc[date] = [];
    acc[date].push(activity);
    return acc;
  }, {} as Record<string, Activity[]>);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    return { daysInMonth, startDayOfWeek, year, month };
  };

  const { daysInMonth, startDayOfWeek, year, month } =
    getDaysInMonth(currentMonth);

  const prevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const isDateInRange = (day: number) => {
    const date = new Date(year, month, day);
    const start = new Date(travelPlanStartDate);
    const end = new Date(travelPlanEndDate);
    return date >= start && date <= end;
  };

  const getDateString = (day: number) => {
    return new Date(year, month, day).toISOString().split("T")[0];
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="bg-white rounded-2xl border-2 border-indigo-100 p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={prevMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg
            className="w-5 h-5 text-gray-600"
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
        </button>

        <h3 className="text-xl font-bold text-gray-800">
          {monthNames[month]} {year}
        </h3>

        <button
          onClick={nextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg
            className="w-5 h-5 text-gray-600"
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
        </button>
      </div>

      {/* Day Names */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {dayNames.map((day) => (
          <div
            key={day}
            className="text-center text-sm font-semibold text-gray-600 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days */}
      <div className="grid grid-cols-7 gap-2">
        {/* Empty cells for days before month starts */}
        {Array.from({ length: startDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}

        {/* Days of the month */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = getDateString(day);
          const dayActivities = activitiesByDate[dateStr] || [];
          const inRange = isDateInRange(day);
          const isToday =
            new Date().toISOString().split("T")[0] === dateStr;

          return (
            <button
              key={day}
              onClick={() => inRange && onDateClick(dateStr)}
              disabled={!inRange}
              className={`aspect-square p-1 rounded-lg border-2 transition-all relative
                ${
                  inRange
                    ? "border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 cursor-pointer"
                    : "border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed"
                }
                ${isToday ? "border-indigo-500 bg-indigo-50" : ""}
              `}
            >
              <div className="text-sm font-semibold">{day}</div>
              {dayActivities.length > 0 && (
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                  {dayActivities.slice(0, 3).map((_activity, idx) => (
                    <div
                      key={idx}
                      className="w-1.5 h-1.5 rounded-full bg-indigo-500"
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-indigo-500" />
            <span>Has activities</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-6 h-6 rounded border-2 border-indigo-500" />
            <span>Today</span>
          </div>
        </div>
      </div>
    </div>
  );
};