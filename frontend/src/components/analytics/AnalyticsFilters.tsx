/* eslint-disable @typescript-eslint/no-explicit-any */
import type React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

interface AnalyticsFiltersProps {
  filters: {
    search: string;
    role: string;
    sortBy: string;
    sortOrder: "asc" | "desc";
  };
  onFilterChange: (key: string, value: any) => void;
}

export const AnalyticsFilters: React.FC<AnalyticsFiltersProps> = ({
  filters,
  onFilterChange,
}) => {
  return (
    <div className="grid gap-4 md:grid-cols-4 mb-6">
      <div className="space-y-2">
        <Label>Search</Label>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={filters.search}
            onChange={(e) => onFilterChange("search", e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Role</Label>
        <Select
          value={filters.role}
          onValueChange={(value) => onFilterChange("role", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
            <SelectItem value="USER">User</SelectItem>
            <SelectItem value="READ_ONLY">Read Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Sort by</Label>
        <Select
          value={`${filters.sortBy}-${filters.sortOrder}`}
          onValueChange={(value) => {
            const [sortBy, sortOrder] = value.split("-");
            onFilterChange("sortBy", sortBy);
            onFilterChange("sortOrder", sortOrder);
          }}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name-asc">Name (A-Z)</SelectItem>
            <SelectItem value="name-desc">Name (Z-A)</SelectItem>
            <SelectItem value="joinedDate-desc">Joined (Newest)</SelectItem>
            <SelectItem value="joinedDate-asc">Joined (Oldest)</SelectItem>
            <SelectItem value="transactionCount-desc">
              Transactions (Most)
            </SelectItem>
            <SelectItem value="transactionCount-asc">
              Transactions (Least)
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
