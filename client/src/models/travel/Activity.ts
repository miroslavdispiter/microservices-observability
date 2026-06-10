export interface Activity {
  id: number;
  travelPlanId: number;
  name: string;
  date: string;
  time: string | null;
  location: string;
  description: string;
  estimatedCost: number;
  status: ActivityStatus;
}

export enum ActivityStatus {
  Planned = 0,
  Reserved = 1,
  Completed = 2,
  Cancelled = 3,
}

export const ActivityStatusLabels: Record<ActivityStatus, string> = {
  [ActivityStatus.Planned]: "Planned",
  [ActivityStatus.Reserved]: "Reserved",
  [ActivityStatus.Completed]: "Completed",
  [ActivityStatus.Cancelled]: "Cancelled",
};

export const ActivityStatusColors: Record<ActivityStatus, string> = {
  [ActivityStatus.Planned]: "bg-blue-100 text-blue-700 border-blue-200",
  [ActivityStatus.Reserved]: "bg-amber-100 text-amber-700 border-amber-200",
  [ActivityStatus.Completed]: "bg-green-100 text-green-700 border-green-200",
  [ActivityStatus.Cancelled]: "bg-red-100 text-red-700 border-red-200",
};