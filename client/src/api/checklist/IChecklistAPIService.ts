import type { ChecklistItem } from "../../models/travel/ChecklistItem";
import type { CreateChecklistItemDto } from "../../dtos/checklist/CreateChecklistItemDto";

export interface IChecklistAPIService {
  getAll(travelPlanId: number): Promise<ChecklistItem[]>;
  getById(travelPlanId: number, id: number): Promise<ChecklistItem>;
  getCompletedCount(travelPlanId: number): Promise<number>;
  create(travelPlanId: number, data: CreateChecklistItemDto): Promise<ChecklistItem>;
  update(travelPlanId: number, id: number, data: CreateChecklistItemDto): Promise<boolean>;
  toggle(travelPlanId: number, id: number): Promise<boolean>;
  delete(travelPlanId: number, id: number): Promise<boolean>;
}