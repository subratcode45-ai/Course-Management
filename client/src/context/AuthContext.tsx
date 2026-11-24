import { createContext, useContext, useState, type ReactNode } from "react";
import api from "../api/axios";
import type { AuthResponse, User } from "../types";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<User>; // changed
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const getStoredUser = (): User | null => {
  try {
    const raw = localStorage.getItem("user");
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(getStoredUser);

  const saveAuth = (data: AuthResponse) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
  };

  const login = async (email: string, password: string) => {
    const { data } = await api.post<AuthResponse>("/auth/login", {
      email,
      password,
    });
    saveAuth(data);
    return data.user; // added
  };    

  const register = async (name: string, email: string, password: string) => {
    const { data } = await api.post<AuthResponse>("/auth/register", {
      name,
      email,
      password,
    });
    saveAuth(data);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
