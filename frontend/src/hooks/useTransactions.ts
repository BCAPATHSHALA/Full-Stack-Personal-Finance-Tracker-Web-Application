import { useState, useCallback } from "react";
import api from "@/lib/axios";
import { AxiosError } from "axios";

interface Transaction {
  id: string;
  type: "INCOME" | "EXPENSE";
  amount: number;
  category: string;
  date: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

interface TransactionFilters {
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

interface TransactionResponse {
  transactions: Transaction[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalTransactions: number;
    hasNext: boolean;
    hasPrev: boolean;
    limit: number;
  };
  success: boolean;
  message: string;
}

// Helper function to handle errors
const handleError = (err: unknown): string => {
  if (err instanceof AxiosError) {
    if (err.response?.status === 401) {
      return "You are not authorized. Please log in again.";
    } else if (err.response?.status === 403) {
      return "You don't have permission to perform this action.";
    } else if (err.response?.status === 404) {
      return "Resource not found.";
    } else if (err.response?.data?.message) {
      return err.response.data.message;
    } else if (err.response?.data?.error) {
      return err.response.data.error;
    }
    return `Request failed: ${err.message}`;
  }
  return err instanceof Error ? err.message : "An unexpected error occurred";
};

interface UseTransactionsReturn {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalTransactions: number;
    hasNext: boolean;
    hasPrev: boolean;
    limit: number;
  };
  fetchTransactions: (filters?: TransactionFilters) => Promise<void>;
  addTransaction: (
    transaction: Omit<Transaction, "id" | "updatedAt" | "user">
  ) => Promise<void>;
  updateTransaction: (
    id: string,
    transaction: Partial<Omit<Transaction, "id" | "updatedAt" | "user">>
  ) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  refreshTransactions: () => Promise<void>;
  clearError: () => void;
}

// Custom hook to manage transactions
export const useTransactions = (): UseTransactionsReturn => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalTransactions: 0,
    hasNext: false,
    hasPrev: false,
    limit: 10,
  });
  const [lastFilters, setLastFilters] = useState<TransactionFilters>({});

  const fetchTransactions = useCallback(
    async (filters: TransactionFilters = {}) => {
      setLoading(true);
      setError(null);
      setLastFilters(filters);

      try {
        const params = new URLSearchParams();

        // Add filters to query params
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== "") {
            params.append(key, value.toString());
          }
        });

        const response = await api.get<TransactionResponse>(
          `/transactions?${params}`
        );

        if (!response.data.success) {
          throw new Error(
            response.data.message || "Failed to fetch transactions"
          );
        }

        setTransactions(response.data.transactions);
        setPagination(response.data.pagination);
      } catch (err) {
        const errorMessage = handleError(err);
        setError(errorMessage);
        console.error("Error fetching transactions:", err);
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError, setLastFilters, setTransactions, setPagination]
  );

  const addTransaction = useCallback(
    async (transaction: Omit<Transaction, "id" | "updatedAt" | "user">) => {
      setError(null);
      try {
        const response = await api.post("/transactions", transaction);
        if (!response.data.success) {
          throw new Error(response.data.message || "Failed to add transaction");
        }
        await fetchTransactions(lastFilters); // Refresh with last known filters
      } catch (err) {
        const errorMessage = handleError(err);
        setError(errorMessage);
        console.error("Error adding transaction:", err);
        throw new Error(errorMessage);
      }
    },
    [fetchTransactions, lastFilters] // Depends on fetchTransactions and lastFilters
  );

  const updateTransaction = useCallback(
    async (
      id: string,
      transaction: Partial<Omit<Transaction, "id" | "updatedAt" | "user">>
    ) => {
      setError(null);
      try {
        const response = await api.put(`/transactions/${id}`, transaction);
        if (!response.data.success) {
          throw new Error(
            response.data.message || "Failed to update transaction"
          );
        }
        await fetchTransactions(lastFilters); // Refresh with last known filters
      } catch (err) {
        const errorMessage = handleError(err);
        setError(errorMessage);
        console.error("Error updating transaction:", err);
        throw new Error(errorMessage);
      }
    },
    [fetchTransactions, lastFilters] // Depends on fetchTransactions and lastFilters
  );

  const deleteTransaction = useCallback(
    async (id: string) => {
      setError(null);
      try {
        const response = await api.delete(`/transactions/${id}`);
        if (!response.data.success) {
          throw new Error(
            response.data.message || "Failed to delete transaction"
          );
        }
        await fetchTransactions(lastFilters); // Refresh with last known filters
      } catch (err) {
        const errorMessage = handleError(err);
        setError(errorMessage);
        console.error("Error deleting transaction:", err);
        throw new Error(errorMessage);
      }
    },
    [fetchTransactions, lastFilters] // Depends on fetchTransactions and lastFilters
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    transactions,
    loading,
    error,
    pagination,
    fetchTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    refreshTransactions: () => fetchTransactions(lastFilters),
    clearError,
  };
};

//  Custom hook to manage user-specific transactions
export const useUserTransactions = (userId?: string) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalTransactions: 0,
    hasNext: false,
    hasPrev: false,
    limit: 10,
  });
  const [lastFilters, setLastFilters] = useState<TransactionFilters>({});

  const fetchUserTransactions = useCallback(
    async (filters: TransactionFilters = {}) => {
      if (!userId) {
        setError("User ID is required to fetch user-specific transactions.");
        return;
      }

      setLoading(true);
      setError(null);
      setLastFilters(filters);

      try {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== "") {
            params.append(key, value.toString());
          }
        });

        const response = await api.get<TransactionResponse>(
          `/transactions/user/${userId}?${params}`
        );

        if (!response.data.success) {
          throw new Error(
            response.data.message || "Failed to fetch user transactions"
          );
        }

        setTransactions(response.data.transactions);
        setPagination(response.data.pagination);
      } catch (err) {
        const errorMessage = handleError(err);
        setError(errorMessage);
        console.error("Error fetching user transactions:", err);
      } finally {
        setLoading(false);
      }
    },
    [
      userId,
      setLoading,
      setError,
      setLastFilters,
      setTransactions,
      setPagination,
    ]
  );

  const addTransaction = useCallback(
    async (transaction: Omit<Transaction, "id" | "updatedAt" | "user">) => {
      setError(null);
      if (!userId) {
        setError("User ID is required to add a transaction.");
        return;
      }
      try {
        const response = await api.post("/transactions", {
          ...transaction,
          userId,
        }); // Ensure userId is sent
        if (!response.data.success) {
          throw new Error(response.data.message || "Failed to add transaction");
        }
        await fetchUserTransactions(lastFilters);
      } catch (err) {
        const errorMessage = handleError(err);
        setError(errorMessage);
        console.error("Error adding transaction:", err);
        throw new Error(errorMessage);
      }
    },
    [userId, fetchUserTransactions, lastFilters]
  );

  const updateTransaction = useCallback(
    async (
      id: string,
      transaction: Partial<Omit<Transaction, "id" | "updatedAt" | "user">>
    ) => {
      setError(null);
      if (!userId) {
        setError("User ID is required to update a transaction.");
        return;
      }
      try {
        const response = await api.put(`/transactions/${id}`, transaction);
        if (!response.data.success) {
          throw new Error(
            response.data.message || "Failed to update transaction"
          );
        }
        await fetchUserTransactions(lastFilters); // Refresh with last known filters
      } catch (err) {
        const errorMessage = handleError(err);
        setError(errorMessage);
        console.error("Error updating transaction:", err);
        throw new Error(errorMessage);
      }
    },
    [userId, fetchUserTransactions, lastFilters]
  );

  const deleteTransaction = useCallback(
    async (id: string) => {
      setError(null);
      if (!userId) {
        setError("User ID is required to delete a transaction.");
        return;
      }
      try {
        const response = await api.delete(`/transactions/${id}`);
        if (!response.data.success) {
          throw new Error(
            response.data.message || "Failed to delete transaction"
          );
        }
        await fetchUserTransactions(lastFilters);
      } catch (err) {
        const errorMessage = handleError(err);
        setError(errorMessage);
        console.error("Error deleting transaction:", err);
        throw new Error(errorMessage);
      }
    },
    [userId, fetchUserTransactions, lastFilters]
  );

  const refreshTransactions = useCallback(async () => {
    await fetchUserTransactions(lastFilters);
  }, [fetchUserTransactions, lastFilters]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    transactions,
    loading,
    error,
    pagination,
    fetchTransactions: fetchUserTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    refreshTransactions,
    clearError,
  };
};
