import type { User } from "../../models/user/User";

export interface AuthResponseDto {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  token: string;
  role: string;
}

export interface BackendAuthResponse {
  success: boolean;
  message: string;
  data: AuthResponseDto;
}

export interface AuthResponse {
  token: string;
  user: User;
}