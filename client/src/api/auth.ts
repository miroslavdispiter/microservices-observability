import api from "./axiosInstance";
import type { LoginRequest, RegisterRequest } from "../types/AuthTypes";

export const login = (data: LoginRequest) =>
  api.post("/auth/login", data);

export const register = (data: RegisterRequest) =>
  api.post("/auth/register", data);