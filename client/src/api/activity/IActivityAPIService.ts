import type { Activity } from "../../models/travel/Activity";
import type { CreateActivityDto } from "../../dtos/activity/CreateActivityDto";

export interface IActivityAPIService {
  getAll(travelPlanId: number): Promise<Activity[]>;
  getById(travelPlanId: number, id: number): Promise<Activity>;
  getByDate(travelPlanId: number, date: string): Promise<Activity[]>;
  getByDateRange(
    travelPlanId: number,
    startDate: string,
    endDate: string
  ): Promise<Activity[]>;
  create(travelPlanId: number, data: CreateActivityDto): Promise<Activity>;
  update(
    travelPlanId: number,
    id: number,
    data: CreateActivityDto
  ): Promise<boolean>;
  delete(travelPlanId: number, id: number): Promise<boolean>;
}