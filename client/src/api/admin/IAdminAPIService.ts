import type { TravelPlan } from "../../models/travel/TravelPlan";
import type { User } from "../../models/user/User";

export interface IAdminAPIService {
  getAllUsers(): Promise<User[]>;
  getUserById(id: number): Promise<User>;
  updateUser(id: number, data: UpdateUserDto): Promise<boolean>;
  deleteUser(id: number): Promise<boolean>;
  changeUserPassword(id: number, data: ChangePasswordDto): Promise<boolean>;
  
  getAllTravelPlans(): Promise<TravelPlan[]>;
}