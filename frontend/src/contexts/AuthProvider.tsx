import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { AuthContext } from "./AuthContext";
import type { User } from "./AuthContext";
import type { AuthContextType } from "./AuthContext";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Create an axios instance for API calls
  const api = axios.create({
    baseURL: "/api/auth",
    withCredentials: true, // send cookies with requests
  });

  // Fetch the current user from the API
  const fetchCurrentUser = useCallback(async () => {
    try {
      const { data } = await api.get("/me");
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  // Login
  const login = useCallback(
    async (email: string, password: string) => {
      await api.post("/login", { email, password });
      await fetchCurrentUser();
    },
    [fetchCurrentUser, api]
  );

  // Register
  const register = useCallback(
    async (
      name: string,
      email: string,
      password: string,
      confirmPassword: string,
      role?: string
    ) => {
      await api.post("/register", {
        name,
        email,
        password,
        confirmPassword,
        role,
      });
      await fetchCurrentUser();
    },
    [fetchCurrentUser, api]
  );

  // Logout
  const logout = useCallback(async () => {
    await api.post("/logout");
    setUser(null);
  }, [api]);

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
