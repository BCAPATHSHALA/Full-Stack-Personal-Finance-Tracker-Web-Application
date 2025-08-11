/* eslint-disable react-refresh/only-export-components */
import type React from "react";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "USER" | "READ_ONLY";
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    confirmPassword: string,
    role?: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  const apiBase =
    import.meta.env.MODE === "development"
      ? "/api"
      : `${import.meta.env.VITE_API_URL}/api`;

  const fetchCurrentUser = useCallback(async () => {
    if (initialized) return;

    try {
      const response = await fetch(`${apiBase}/auth/me`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          setUser(data.user);
        }
      }
    } catch (error) {
      console.error("Error fetching current user:", error);
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }, [initialized, apiBase]);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await fetch(`${apiBase}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Fetch user data after successful login
      const userResponse = await fetch(`${apiBase}/auth/me`, {
        credentials: "include",
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        if (userData.success && userData.user) {
          setUser(userData.user);
        }
      }
    },
    [apiBase]
  );

  const register = useCallback(
    async (
      name: string,
      email: string,
      password: string,
      confirmPassword: string,
      role?: string
    ) => {
      const response = await fetch(`${apiBase}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ name, email, password, confirmPassword, role }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      // Fetch user data after successful registration
      const userResponse = await fetch(`${apiBase}/auth/me`, {
        credentials: "include",
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        if (userData.success && userData.user) {
          setUser(userData.user);
        }
      }
    },
    [apiBase]
  );

  const logout = useCallback(async () => {
    try {
      await fetch(`${apiBase}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setInitialized(false);
    }
  }, [apiBase]);

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
