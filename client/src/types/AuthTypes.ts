export interface AuthUser {
  token: string;
  userId: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  username: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  token: string;
  role: string;
}