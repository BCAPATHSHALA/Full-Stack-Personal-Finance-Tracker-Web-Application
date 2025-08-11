/* eslint-disable @typescript-eslint/no-explicit-any */
import type React from "react";
import { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useTransactions } from "../hooks/useTransactions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Plus } from "lucide-react";
import { TransactionTable } from "@/components/transactions/TransactionTable";
import {
  TransactionFilters,
  type FiltersType,
} from "@/components/transactions/TransactionFilters";
import { useNavigate } from "react-router-dom";

import {
  EditTransactionDialog,
  type TransactionUpdateData,
} from "@/components/transactions/EditTransactionDialog";
import { DeleteTransactionDialog } from "@/components/transactions/DeleteTransactionDialog";

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

export const TransactionsPage: React.FC = () => {
  const { user } = useAuth();
  const {
    transactions,
    loading,
    error,
    pagination,
    fetchTransactions,
    updateTransaction,
    deleteTransaction,
  } = useTransactions();

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

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [deletingTransaction, setDeletingTransaction] =
    useState<Transaction | null>(null);

  const canModify = user?.role === "ADMIN" || user?.role === "USER";

  // Debounce ref
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced fetch function
  const debouncedFetchTransactions = useCallback(
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
    debouncedFetchTransactions(filters);
    // Cleanup on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [filters, debouncedFetchTransactions]);

  const handleFilterChange = (key: keyof FiltersType, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key !== "page" ? 1 : value,
    }));
  };

  const onEditSubmit = async (data: TransactionUpdateData) => {
    if (!editingTransaction) return;

    try {
      // Convert Date to string if present
      const updatedData: Partial<
        Omit<Transaction, "id" | "updatedAt" | "user">
      > = {
        ...data,
        date: data.date ? data.date.toISOString() : undefined,
      };
      await updateTransaction(editingTransaction.id, updatedData);
      setIsEditDialogOpen(false);
      setEditingTransaction(null);
    } catch (err) {
      console.error("Update transaction error:", err);
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    const transaction = transactions.find((t) => t.id === id);
    if (transaction) {
      setDeletingTransaction(transaction);
      setIsDeleteDialogOpen(true);
    }
  };

  const confirmDelete = async () => {
    if (!deletingTransaction) return;

    try {
      await deleteTransaction(deletingTransaction.id);
      setIsDeleteDialogOpen(false);
      setDeletingTransaction(null);
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const navigate = useNavigate();
  const handleGetUserTransactions = async (userId: string) => {
    navigate(`/transactions/user/${userId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Transactions</h1>
          <p className="text-muted-foreground">
            Manage your income and expense transactions
          </p>
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
            handleGetUserTransactions={handleGetUserTransactions}
            handlePageChange={(page) => handleFilterChange("page", page)}
            showUserColumn={user?.role === "ADMIN"}
          />
        </CardContent>
      </Card>

      {/* Dialogs: Add, Edit and Delete */}
      <EditTransactionDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSubmit={onEditSubmit}
        isSubmitting={loading}
        editingTransaction={editingTransaction}
      />

      <DeleteTransactionDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
        isDeleting={loading}
        transaction={deletingTransaction}
      />
    </div>
  );
};
