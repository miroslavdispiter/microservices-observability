import { createContext, useContext, useState, type ReactNode } from "react";
import type { AuthUser } from "../types/AuthTypes";

interface AuthContextType {
  user: AuthUser | null;
  login: (user: AuthUser) => void;
  logout: () => void;
  isAdmin: boolean;
  isUser: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    const email = localStorage.getItem("email");
    const role = localStorage.getItem("role");
    const firstName = localStorage.getItem("firstName");
    const lastName = localStorage.getItem("lastName");
    const username = localStorage.getItem("username");

    if (token && userId && email && role && firstName && lastName && username) {
      return { token, userId, email, role, firstName, lastName, username };
    }
    return null;
  });

  const login = (userData: AuthUser) => {
    localStorage.setItem("token", userData.token);
    localStorage.setItem("userId", userData.userId);
    localStorage.setItem("email", userData.email);
    localStorage.setItem("role", userData.role);
    localStorage.setItem("firstName", userData.firstName);
    localStorage.setItem("lastName", userData.lastName);
    localStorage.setItem("username", userData.username);
    setUser(userData);
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAdmin: user?.role === "Admin",
        isUser: user?.role === "User",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};