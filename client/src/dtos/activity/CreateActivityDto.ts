export interface CreateActivityDto {
  name: string;
  date: string;
  time: string | null;
  location: string;
  description: string;
  estimatedCost: number;
  status: number;
}