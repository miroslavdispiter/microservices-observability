import type {
  AuthResponse,
  BackendAuthResponse,
} from "../../types/auth/AuthResponse";
import type { IAuthAPIService } from "./IAuthAPIService";
import type { LoginRequest } from "../../dtos/auth/LoginRequest";
import type { RegisterRequest } from "../../dtos/auth/RegisterRequest";
import api from "../axiosInstance";
import { removeItem } from "../../helpers/local_storage";

export const authApi: IAuthAPIService = {
  async login(loginData: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<BackendAuthResponse>(
      `/Auth/login`,
      loginData
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || "Login failed");
    }

    const dto = response.data.data;
    return {
      token: dto.token,
      user: {
        id: dto.id.toString(),
        firstName: dto.firstName,
        lastName: dto.lastName,
        username: dto.username,
        email: dto.email,
        role: dto.role as "User" | "Admin",
      },
    };
  },

  async register(registerData: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<BackendAuthResponse>(
      `/Auth/register`,
      registerData
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || "Registration failed");
    }

    const dto = response.data.data;
    return {
      token: dto.token,
      user: {
        id: dto.id.toString(),
        firstName: dto.firstName,
        lastName: dto.lastName,
        username: dto.username,
        email: dto.email,
        role: dto.role as "User" | "Admin",
      },
    };
  },

  logout() {
    removeItem("token");
  },
};