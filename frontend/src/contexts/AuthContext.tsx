import { createContext, useContext } from "react";

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

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

// This hook allows components to access the authentication context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
