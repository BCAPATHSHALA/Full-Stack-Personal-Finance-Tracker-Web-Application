"use client";

import type React from "react";
import { useState, useEffect, useCallback } from "react";
import { AuthContext } from "./AuthContext";
import api from "@/lib/axios";
import { AxiosError } from "axios";

interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "USER" | "READ_ONLY";
  createdAt: string;
}

// This component provides the authentication context to its children
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  const handleError = (err: unknown): string => {
    if (err instanceof AxiosError) {
      if (err.response?.status === 401) {
        return "Authentication failed. Please check your credentials.";
      } else if (err.response?.data?.message) {
        return err.response.data.message;
      } else if (err.response?.data?.error) {
        return err.response.data.error;
      }
      return `Request failed: ${err.message}`;
    }
    return err instanceof Error ? err.message : "An unexpected error occurred";
  };

  const fetchCurrentUser = useCallback(async () => {
    if (initialized) return;

    try {
      const response = await api.get<{ success: boolean; user: User }>(
        "/auth/me"
      );
      if (response.data.success && response.data.user) {
        setUser(response.data.user);
      }
    } catch (error) {
      console.error("Error fetching current user:", error);
      // Do not set error state here, as it's a background check
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }, [initialized]);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await api.post<{ success: boolean; message: string }>(
        "/auth/login",
        { email, password }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Login failed");
      }

      // Fetch user data after successful login
      const userResponse = await api.get<{ success: boolean; user: User }>(
        "/auth/me"
      );

      if (userResponse.data.success && userResponse.data.user) {
        setUser(userResponse.data.user);
      }
    } catch (err) {
      const errorMessage = handleError(err);
      console.error("Login error:", err);
      throw new Error(errorMessage);
    }
  }, []);

  const register = useCallback(
    async (
      name: string,
      email: string,
      password: string,
      confirmPassword: string,
      role?: string
    ) => {
      try {
        const response = await api.post<{ success: boolean; message: string }>(
          "/auth/register",
          {
            name,
            email,
            password,
            confirmPassword,
            role,
          }
        );

        if (!response.data.success) {
          throw new Error(response.data.message || "Registration failed");
        }

        // Fetch user data after successful registration
        const userResponse = await api.get<{ success: boolean; user: User }>(
          "/auth/me"
        );

        if (userResponse.data.success && userResponse.data.user) {
          setUser(userResponse.data.user);
        }
      } catch (err) {
        const errorMessage = handleError(err);
        console.error("Registration error:", err);
        throw new Error(errorMessage);
      }
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setInitialized(false); // Reset initialized to refetch user on next load
    }
  }, []);

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
