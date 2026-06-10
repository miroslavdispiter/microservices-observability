import type { Destination } from "../../models/travel/Destination";
import type { CreateDestinationDto } from "../../dtos/destination/CreateDestinationDto";

export interface IDestinationAPIService {
  getAll(travelPlanId: number): Promise<Destination[]>;
  getById(travelPlanId: number, id: number): Promise<Destination>;
  create(travelPlanId: number, data: CreateDestinationDto): Promise<Destination>;
  update(
    travelPlanId: number,
    id: number,
    data: CreateDestinationDto
  ): Promise<boolean>;
  delete(travelPlanId: number, id: number): Promise<boolean>;
}