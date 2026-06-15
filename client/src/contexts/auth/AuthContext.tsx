import { createContext, useState, useEffect, type ReactNode } from "react";
import { jwtDecode } from "jwt-decode";
import type { AuthState } from "../../types/auth/AuthState";
import type { LoginRequest } from "../../dtos/auth/LoginRequest";
import type { RegisterRequest } from "../../dtos/auth/RegisterRequest";
import type { User } from "../../models/user/User";
import { authApi } from "../../api/auth/AuthAPIService";
import { readItem, removeItem, saveItem } from "../../helpers/local_storage";

interface JwtPayload {
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier": string;
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name": string;
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress": string;
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": string;
  exp: number;
}

export interface AuthContextType extends AuthState {
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    return decoded.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    // Učitaj token i user iz localStorage
    const token = readItem("token");
    const userJson = readItem("user");

    if (token && userJson) {
      // Proveri da li je token istekao
      if (isTokenExpired(token)) {
        removeItem("token");
        removeItem("user");
        setState((prev) => ({ ...prev, isLoading: false }));
        return;
      }

      try {
        const user: User = JSON.parse(userJson);
        setState({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch {
        removeItem("token");
        removeItem("user");
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    } else {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = async (data: LoginRequest) => {
    const response = await authApi.login(data);

    // Sačuvaj token i user u localStorage
    saveItem("token", response.token);
    saveItem("user", JSON.stringify(response.user));

    setState({
      user: response.user,
      token: response.token,
      isAuthenticated: true,
      isLoading: false,
    });
  };

  const register = async (data: RegisterRequest) => {
    const response = await authApi.register(data);

    // Sačuvaj token i user u localStorage
    saveItem("token", response.token);
    saveItem("user", JSON.stringify(response.user));

    setState({
      user: response.user,
      token: response.token,
      isAuthenticated: true,
      isLoading: false,
    });
  };

  const logout = () => {
    authApi.logout();
    removeItem("user");

    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};