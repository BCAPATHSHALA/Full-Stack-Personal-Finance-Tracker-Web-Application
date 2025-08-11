/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback, useEffect } from "react";
import api from "@/lib/axios";
import { AxiosError } from "axios";

interface AnalyticsUser {
  id: string;
  role: string;
  name: string;
  email: string;
  joinedDate: string;
  transactionCount: number;
  totalIncome: number;
  totalExpense: number;
  netAmount: number;
}

interface Transaction {
  id: string;
  date: string;
  updatedAt: string;
  amount: number;
  category: string;
  type: "INCOME" | "EXPENSE";
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalUsers: number;
  hasNext: boolean;
  hasPrev: boolean;
  limit: number;
}

interface UserAnalytics {
  user: AnalyticsUser;
  transactions: Transaction[];
  categories: string[];
  pagination: Pagination;
  success: boolean;
  message: string;
}

interface AnalyticsOverview {
  users: AnalyticsUser[];
  pagination: Pagination;
  success: boolean;
  message: string;
}

interface AnalyticsFilters {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

interface UserAnalyticsFilters {
  page?: number;
  limit?: number;
  category?: string;
  fromDate?: string;
  toDate?: string;
  transactionType?: "INCOME" | "EXPENSE" | "";
  transactionSearch?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

interface UseAnalyticsReturn {
  // Data
  analyticsOverview: AnalyticsOverview | null;
  userAnalytics: UserAnalytics | null;

  // Loading states
  loading: boolean;
  overviewLoading: boolean;
  userLoading: boolean;

  // Error states
  error: string | null;
  overviewError: string | null;
  userError: string | null;

  // Actions
  fetchAnalyticsOverview: (filters?: AnalyticsFilters) => Promise<void>;
  fetchUserAnalytics: (
    userId: string,
    filters?: UserAnalyticsFilters
  ) => Promise<void>;
  refreshAnalytics: () => Promise<void>;
  clearErrors: () => void;
  clearData: () => void;
}

export const useAnalytics = (): UseAnalyticsReturn => {
  // Data states
  const [analyticsOverview, setAnalyticsOverview] =
    useState<AnalyticsOverview | null>(null);
  const [userAnalytics, setUserAnalytics] = useState<UserAnalytics | null>(
    null
  );

  // Loading states
  const [overviewLoading, setOverviewLoading] = useState(false);
  const [userLoading, setUserLoading] = useState(false);

  // Error states
  const [overviewError, setOverviewError] = useState<string | null>(null);
  const [userError, setUserError] = useState<string | null>(null);

  // Cache for preventing duplicate requests
  const [lastOverviewFilters, setLastOverviewFilters] = useState<string>("");
  const [lastUserRequest, setLastUserRequest] = useState<string>("");

  // Computed loading state
  const loading = overviewLoading || userLoading;

  // Computed error state
  const error = overviewError || userError;

  // Helper function to handle errors
  const handleError = (err: unknown): string => {
    if (err instanceof AxiosError) {
      if (err.response?.status === 401) {
        return "You are not authorized to view this data. Please log in again.";
      } else if (err.response?.status === 403) {
        return "You don't have permission to view this user's analytics.";
      } else if (err.response?.status === 404) {
        return "User not found.";
      } else if (err.response?.data?.message) {
        return err.response.data.message;
      } else if (err.response?.data?.error) {
        return err.response.data.error;
      }
      return `Request failed: ${err.message}`;
    }
    return err instanceof Error ? err.message : "An unexpected error occurred";
  };

  // Fetch analytics overview for all users (Admin only)
  const fetchAnalyticsOverview = useCallback(
    async (filters: AnalyticsFilters = {}) => {
      // Create cache key to prevent duplicate requests
      const cacheKey = JSON.stringify(filters);
      if (cacheKey === lastOverviewFilters && overviewLoading) {
        return;
      }

      setOverviewLoading(true);
      setOverviewError(null);
      setLastOverviewFilters(cacheKey);

      try {
        const params = new URLSearchParams();

        // Add filters to query params
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== "" && value !== "all") {
            params.append(key, value.toString());
          }
        });

        const response = await api.get<AnalyticsOverview>(
          `/analytics?${params}`
        );

        if (!response.data.success) {
          throw new Error(
            response.data.message || "Failed to fetch analytics overview"
          );
        }

        setAnalyticsOverview(response.data);
        setOverviewError(null);
      } catch (err) {
        const errorMessage = handleError(err);
        setOverviewError(errorMessage);
        console.error("Error fetching analytics overview:", err);
      } finally {
        setOverviewLoading(false);
      }
    },
    [lastOverviewFilters, overviewLoading]
  );

  // Fetch user-specific analytics
  const fetchUserAnalytics = useCallback(
    async (userId: string, filters: UserAnalyticsFilters = {}) => {
      if (!userId) {
        setUserError("User ID is required");
        return;
      }

      // Create cache key to prevent duplicate requests
      const cacheKey = `${userId}:${JSON.stringify(filters)}`;
      if (cacheKey === lastUserRequest && userLoading) {
        return;
      }

      setUserLoading(true);
      setUserError(null);
      setLastUserRequest(cacheKey);

      try {
        const params = new URLSearchParams();

        // Add filters to query params
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== "") {
            params.append(key, value.toString());
          }
        });

        const response = await api.get<UserAnalytics>(
          `/analytics/user/${userId}?${params}`
        );

        if (!response.data.success) {
          throw new Error(
            response.data.message || "Failed to fetch user analytics"
          );
        }

        setUserAnalytics(response.data);
        setUserError(null);
      } catch (err) {
        const errorMessage = handleError(err);
        setUserError(errorMessage);
        console.error("Error fetching user analytics:", err);
      } finally {
        setUserLoading(false);
      }
    },
    [lastUserRequest, userLoading]
  );

  // Refresh all analytics data
  const refreshAnalytics = useCallback(async () => {
    const promises: Promise<void>[] = [];

    // Refresh overview if it exists
    if (analyticsOverview) {
      promises.push(fetchAnalyticsOverview());
    }

    // Refresh user analytics if it exists
    if (userAnalytics) {
      promises.push(fetchUserAnalytics(userAnalytics.user.id));
    }

    if (promises.length > 0) {
      await Promise.allSettled(promises);
    }
  }, [
    analyticsOverview,
    userAnalytics,
    fetchAnalyticsOverview,
    fetchUserAnalytics,
  ]);

  // Clear all error states
  const clearErrors = useCallback(() => {
    setOverviewError(null);
    setUserError(null);
  }, []);

  // Clear all data and reset state
  const clearData = useCallback(() => {
    setAnalyticsOverview(null);
    setUserAnalytics(null);
    setOverviewError(null);
    setUserError(null);
    setLastOverviewFilters("");
    setLastUserRequest("");
  }, []);

  return {
    // Data
    analyticsOverview,
    userAnalytics,

    // Loading states
    loading,
    overviewLoading,
    userLoading,

    // Error states
    error,
    overviewError,
    userError,

    // Actions
    fetchAnalyticsOverview,
    fetchUserAnalytics,
    refreshAnalytics,
    clearErrors,
    clearData,
  };
};

// Hook for analytics overview only (Admin users)
export const useAnalyticsOverview = () => {
  const {
    analyticsOverview,
    overviewLoading,
    overviewError,
    fetchAnalyticsOverview,
    clearErrors,
  } = useAnalytics();

  return {
    data: analyticsOverview,
    loading: overviewLoading,
    error: overviewError,
    fetchData: fetchAnalyticsOverview,
    clearError: clearErrors,
  };
};

// Hook for user analytics only
export const useUserAnalytics = (userId?: string) => {
  const {
    userAnalytics,
    userLoading,
    userError,
    fetchUserAnalytics,
    clearErrors,
  } = useAnalytics();

  const fetchData = useCallback(
    (filters?: UserAnalyticsFilters) => {
      if (userId) {
        return fetchUserAnalytics(userId, filters);
      }
      return Promise.reject(new Error("User ID is required"));
    },
    [userId, fetchUserAnalytics]
  );

  return {
    data: userAnalytics,
    loading: userLoading,
    error: userError,
    fetchData,
    clearError: clearErrors,
  };
};

// Hook for analytics statistics calculations
export const useAnalyticsStats = (
  data: AnalyticsOverview | UserAnalytics | null
) => {
  const [stats, setStats] = useState<any>(null);

  const calculateStats = useCallback(() => {
    if (!data) {
      setStats(null);
      return;
    }

    if ("users" in data) {
      // Analytics Overview stats
      const users = data.users;
      const totalUsers = users.length;
      const totalIncome = users.reduce(
        (sum, user) => sum + user.totalIncome,
        0
      );
      const totalExpense = users.reduce(
        (sum, user) => sum + user.totalExpense,
        0
      );
      const totalTransactions = users.reduce(
        (sum, user) => sum + user.transactionCount,
        0
      );
      const netAmount = totalIncome - totalExpense;

      // Role distribution
      const roleDistribution = users.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Top users by transaction count
      const topUsers = [...users]
        .sort((a, b) => b.transactionCount - a.transactionCount)
        .slice(0, 5);

      // Average transactions per user
      const avgTransactionsPerUser =
        totalUsers > 0 ? totalTransactions / totalUsers : 0;

      setStats({
        type: "overview",
        totalUsers,
        totalIncome,
        totalExpense,
        totalTransactions,
        netAmount,
        avgTransactionsPerUser,
        roleDistribution,
        topUsers,
      });
    } else {
      // User Analytics stats
      const user = data.user;
      const transactions = data.transactions;

      // Monthly breakdown
      const monthlyData = transactions.reduce((acc, t) => {
        const month = new Date(t.date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
        });
        if (!acc[month]) {
          acc[month] = { month, income: 0, expense: 0, count: 0 };
        }
        if (t.type === "INCOME") {
          acc[month].income += t.amount;
        } else {
          acc[month].expense += t.amount;
        }
        acc[month].count += 1;
        return acc;
      }, {} as Record<string, { month: string; income: number; expense: number; count: number }>);

      // Category breakdown
      const categoryData = transactions
        .filter((t) => t.type === "EXPENSE")
        .reduce((acc, t) => {
          acc[t.category] = (acc[t.category] || 0) + t.amount;
          return acc;
        }, {} as Record<string, number>);

      // Recent activity
      const recentTransactions = transactions
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);

      setStats({
        type: "user",
        user,
        monthlyData: Object.values(monthlyData),
        categoryData,
        recentTransactions,
        totalCategories: Object.keys(categoryData).length,
      });
    }
  }, [data]);

  // Recalculate stats when data changes
  useEffect(() => {
    calculateStats();
  }, [calculateStats]);

  return stats;
};
