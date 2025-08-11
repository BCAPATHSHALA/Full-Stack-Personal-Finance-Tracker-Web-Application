/* eslint-disable @typescript-eslint/no-explicit-any */
import type React from "react";
import { useEffect, useState, useCallback, useRef } from "react"; // Import useRef
import { useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useUserTransactions } from "../hooks/useTransactions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TransactionTable } from "@/components/transactions/TransactionTable";
import {
  TransactionFilters,
  type FiltersType,
} from "@/components/transactions/TransactionFilters";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

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

export const UserTransactionsPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuth();
  const { transactions, loading, error, pagination, fetchTransactions } =
    useUserTransactions(userId);

  const [filters, setFilters] = useState<FiltersType>({
    page: 1,
    limit: 10,
    category: "",
    fromDate: "",
    toDate: "",
    transactionType: "ALL",
    transactionSearch: "",
    sortBy: "date",
    sortOrder: "desc",
  });

  // A user can modify their own transactions, or an ADMIN can modify any user's transactions
  const canModify = currentUser?.role === "ADMIN" || currentUser?.id === userId;

  // Debounce ref
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced fetch function for user-specific transactions
  const debouncedFetchUserTransactions = useCallback(
    (newFilters: FiltersType) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        const apiFilters = {
          ...newFilters,
          transactionType: (newFilters.transactionType === "ALL"
            ? ""
            : newFilters.transactionType) as "INCOME" | "EXPENSE" | "",
        };
        fetchTransactions(apiFilters);
      }, 300);
    },
    [fetchTransactions]
  );

  useEffect(() => {
    if (userId) {
      debouncedFetchUserTransactions(filters);
    }
    // Cleanup on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [filters, userId, debouncedFetchUserTransactions]);

  const handleFilterChange = (key: keyof FiltersType, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key !== "page" ? 1 : value,
    }));
  };


  // Todo: Implement actual edit and delete functionality
  const handleEdit = async (transaction: Transaction) => {
    console.log("Editing transaction:", transaction);
  };
  const handleDelete = async (id: string) => {
    console.log("Deleting transaction with ID:", id);
  };

  if (!userId) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold">User ID Missing</h1>
        <p className="text-muted-foreground">
          Please provide a user ID to view transactions.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Transactions for {userId}</h1>
          <p className="text-muted-foreground">
            Manage transactions for this user.
          </p>
          {/* Name, Email, and Role of specific user */}
          {transactions[0]?.user && (
            <div className="mt-4">
              <p className="font-medium">{transactions[0]?.user?.name}</p>
              <p className="text-sm text-muted-foreground">
                {transactions[0]?.user?.email}
              </p>
              <p className="text-sm text-muted-foreground">
                Role: {transactions[0]?.user?.role || "N/A"}
              </p>
            </div>
          )}
        </div>
        {canModify && (
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Transaction
          </Button>
        )}
      </div>

      <TransactionFilters
        filters={filters}
        handleFilterChange={handleFilterChange}
      />

      <Card>
        <CardHeader>
          <CardTitle>Transaction List</CardTitle>
          <CardDescription>
            {pagination.totalTransactions} total transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TransactionTable
            transactions={transactions}
            loading={loading}
            error={error}
            pagination={pagination}
            canModify={canModify}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
            handleGetUserTransactions={undefined} // Not applicable for this page
            handlePageChange={(page) => handleFilterChange("page", page)}
            showUserColumn={false}
          />
        </CardContent>
      </Card>
    </div>
  );
};
