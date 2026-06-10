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

const parseToken = (token: string): User | null => {
  try {
    const decoded = jwtDecode<JwtPayload>(token);

    if (decoded.exp * 1000 < Date.now()) {
      removeItem("token");
      return null;
    }

    return {
      id: decoded[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
      ],
      firstName: "",
      lastName: "",
      username:
        decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"],
      email:
        decoded[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
        ],
      role: decoded[
        "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
      ] as "User" | "Admin",
    };
  } catch {
    return null;
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
    const token = readItem("token");
    if (token) {
      const user = parseToken(token);
      setState({
        user,
        token: user ? token : null,
        isAuthenticated: !!user,
        isLoading: false,
      });
    } else {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = async (data: LoginRequest) => {
    const response = await authApi.login(data);
    const user = parseToken(response.token);

    saveItem("token", response.token);

    setState({
      user,
      token: response.token,
      isAuthenticated: true,
      isLoading: false,
    });
  };

  const register = async (data: RegisterRequest) => {
    const response = await authApi.register(data);
    const user = parseToken(response.token);

    saveItem("token", response.token);

    setState({
      user,
      token: response.token,
      isAuthenticated: true,
      isLoading: false,
    });
  };

  const logout = () => {
    authApi.logout();

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