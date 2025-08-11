/* eslint-disable @typescript-eslint/no-explicit-any */
import type React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter } from "lucide-react";

// Define FiltersType here to ensure consistency
export type FiltersType = {
  page: number;
  limit: number;
  category: string;
  fromDate: string;
  toDate: string;
  transactionType: "ALL" | "INCOME" | "EXPENSE";
  transactionSearch: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
};

interface TransactionFiltersProps {
  filters: FiltersType;
  handleFilterChange: (key: keyof FiltersType, value: any) => void;
}

export const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  filters,
  handleFilterChange,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label>Search</Label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by transaction ID"
                value={filters.transactionSearch}
                onChange={(e) =>
                  handleFilterChange("transactionSearch", e.target.value)
                }
                className="pl-8"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Input
              placeholder="Filter by category"
              value={filters.category}
              onChange={(e) => handleFilterChange("category", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Type</Label>
            <Select
              value={filters.transactionType}
              onValueChange={(value) =>
                handleFilterChange("transactionType", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All types</SelectItem>
                <SelectItem value="INCOME">Income</SelectItem>
                <SelectItem value="EXPENSE">Expense</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Sort by</Label>
            <Select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onValueChange={(value) => {
                const [sortBy, sortOrder] = value.split("-");
                handleFilterChange("sortBy", sortBy);
                handleFilterChange("sortOrder", sortOrder);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">Date (Newest)</SelectItem>
                <SelectItem value="date-asc">Date (Oldest)</SelectItem>
                <SelectItem value="amount-desc">
                  Amount (High to Low)
                </SelectItem>
                <SelectItem value="amount-asc">Amount (Low to High)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>From Date</Label>
            <Input
              type="date"
              value={filters.fromDate}
              onChange={(e) => handleFilterChange("fromDate", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>To Date</Label>
            <Input
              type="date"
              value={filters.toDate}
              onChange={(e) => handleFilterChange("toDate", e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
