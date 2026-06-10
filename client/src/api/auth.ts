import api from "./axiosInstance";
import type { LoginRequest, RegisterRequest, AuthServiceResult } from "../types/AuthTypes";

export const login = (data: LoginRequest) =>
  api.post<AuthServiceResult>("/auth/login", data);

export const register = (data: RegisterRequest) =>
  api.post<AuthServiceResult>("/auth/register", data);