export interface ChecklistItem {
  id: number;
  travelPlanId: number;
  name: string;
  description: string;
  isCompleted: boolean;
  priority: ChecklistPriority;
}

export enum ChecklistPriority {
  Low = 0,
  Medium = 1,
  High = 2,
}

export const ChecklistPriorityLabels: Record<ChecklistPriority, string> = {
  [ChecklistPriority.Low]: "Low",
  [ChecklistPriority.Medium]: "Medium",
  [ChecklistPriority.High]: "High",
};

export const ChecklistPriorityColors: Record<ChecklistPriority, string> = {
  [ChecklistPriority.Low]: "bg-gray-100 text-gray-700 border-gray-200",
  [ChecklistPriority.Medium]: "bg-yellow-100 text-yellow-700 border-yellow-200",
  [ChecklistPriority.High]: "bg-red-100 text-red-700 border-red-200",
};

export const ChecklistPriorityIcons: Record<ChecklistPriority, string> = {
  [ChecklistPriority.Low]: "⬇️",
  [ChecklistPriority.Medium]: "➡️",
  [ChecklistPriority.High]: "⬆️",
};