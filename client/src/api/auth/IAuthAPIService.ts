import type { LoginRequest } from "../../dtos/auth/LoginRequest";
import type { RegisterRequest } from "../../dtos/auth/RegisterRequest";
import type { AuthResponse } from "../../types/auth/AuthResponse";

export interface IAuthAPIService {
  login(loginData: LoginRequest): Promise<AuthResponse>;
  register(registerData: RegisterRequest): Promise<AuthResponse>;
  logout(): void;
}