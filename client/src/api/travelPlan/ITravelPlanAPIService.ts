import type { TravelPlan } from "../../models/travel/TravelPlan";
import type { CreateTravelPlanDto } from "../../dtos/travelPlan/CreateTravelPlanDto";

export interface ITravelPlanAPIService {
  getAll(): Promise<TravelPlan[]>;
  getById(id: number): Promise<TravelPlan>;
  create(data: CreateTravelPlanDto): Promise<TravelPlan>;
  update(id: number, data: CreateTravelPlanDto): Promise<boolean>;
  delete(id: number): Promise<boolean>;
}