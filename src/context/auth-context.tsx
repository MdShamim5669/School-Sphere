"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api, { getErrorMessage } from "@/lib/api";
import { ApiResponse, AuthUser, LoginResponseData } from "@/types";

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (
    credentials: { username: string; password: string },
    preferredRole?: "admin" | "teacher" | "student" | "parent"
  ) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("school_sphere_token");
      const storedUser = localStorage.getItem("school_sphere_user");
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch {
      localStorage.removeItem("school_sphere_token");
      localStorage.removeItem("school_sphere_user");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (
    credentials: { username: string; password: string },
    preferredRole?: "admin" | "teacher" | "student" | "parent"
  ) => {
    try {
      const res = await api.post<ApiResponse<LoginResponseData>>(
        "/auth/login",
        credentials
      );
      const { accessToken, user: authUser } = res.data.data;
      setToken(accessToken);
      setUser(authUser);
      localStorage.setItem("school_sphere_token", accessToken);
      localStorage.setItem("school_sphere_user", JSON.stringify(authUser));

      // Role-based routing
      const targetRole = preferredRole?.toUpperCase() || (authUser?.role || "").toUpperCase();
      if (targetRole === "TEACHER") {
        router.push("/teacher/dashboard");
      } else if (targetRole === "STUDENT") {
        router.push("/student/dashboard");
      } else if (targetRole === "PARENT") {
        router.push("/parent/dashboard");
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("school_sphere_token");
    localStorage.removeItem("school_sphere_user");
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
