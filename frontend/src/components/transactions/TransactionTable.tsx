import type React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, TrendingUpDown } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";

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

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalTransactions: number;
  hasNext: boolean;
  hasPrev: boolean;
  limit: number;
}

interface TransactionTableProps {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  pagination: Pagination;
  canModify: boolean;
  handleEdit: (transaction: Transaction) => void;
  handleDelete: (id: string) => void;
  handleGetUserTransactions?: (userId: string) => void;
  handlePageChange: (page: number) => void;
  showUserColumn?: boolean;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  loading,
  error,
  pagination,
  canModify,
  handleEdit,
  handleDelete,
  handleGetUserTransactions,
  handlePageChange,
  showUserColumn = false,
}) => {
  const { user } = useAuth();
  return (
    <>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tran ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Amount</TableHead>
                {showUserColumn && <TableHead>User</TableHead>}
                <TableHead>Last Updated</TableHead>
                {canModify && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody className="text-[12px]">
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">
                    {transaction.id}
                  </TableCell>
                  <TableCell>
                    {new Date(transaction.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        transaction.type === "INCOME" ? "default" : "secondary"
                      }
                    >
                      {transaction.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{transaction.category}</TableCell>
                  <TableCell
                    className={
                      transaction.type === "INCOME"
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    ${transaction.amount.toFixed(2)}
                  </TableCell>
                  {showUserColumn && (
                    <TableCell>
                      {transaction.user ? (
                        <div>
                          <p className="font-medium">{transaction.user.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {transaction.user.email}
                          </p>
                        </div>
                      ) : (
                        "N/A"
                      )}
                    </TableCell>
                  )}
                  <TableCell>
                    {new Date(transaction.updatedAt).toLocaleDateString()}
                  </TableCell>
                  {canModify && (
                    <TableCell>
                      <div className="flex space-x-2">
                        {/* Edit and Delete buttons are only anable to the user who created the transaction */}
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={user?.id !== transaction.user?.id}
                          onClick={() => handleEdit(transaction)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={user?.id !== transaction.user?.id}
                          onClick={() => handleDelete(transaction.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>

                        {/* View for seeing the all transactions based on user id */}
                        {handleGetUserTransactions && transaction.user && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleGetUserTransactions?.(
                                `${transaction.user?.id}`
                              )
                            }
                          >
                            <TrendingUpDown className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {(pagination.currentPage - 1) * pagination.limit + 1} to{" "}
              {Math.min(
                pagination.currentPage * pagination.limit,
                pagination.totalTransactions
              )}{" "}
              of {pagination.totalTransactions} transactions
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrev}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNext}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </>
  );
};
