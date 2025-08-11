/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import type React from "react";
import { useEffect, useState, useMemo } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useAnalytics } from "../hooks/useAnalytics";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { Download } from "lucide-react";
import { AnalyticsStatsCards } from "@/components/analytics/AnalyticsStatsCards";
import { RoleDistributionChart } from "@/components/analytics/RoleDistributionChart";
import { TopUsersCard } from "@/components/analytics/TopUsersCard";
import { AnalyticsFilters } from "@/components/analytics/AnalyticsFilters";
import { UserAnalyticsCard } from "@/components/analytics/UserAnalyticsCard";
import { UsersTable } from "@/components/analytics/UsersTable";
import { UserTransactionsTable } from "@/components/analytics/UserTransactionsTable";
import { isAdmin } from "@/lib/isAdmin";
import LoadingSpinner from "@/components/LoadingSpinner";

export const AnalyticsPage: React.FC = () => {
  const { user } = useAuth();
  const {
    analyticsOverview,
    userAnalytics,
    loading,
    error,
    fetchAnalyticsOverview,
    fetchUserAnalytics,
  } = useAnalytics();

  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: "",
    role: "all",
    sortBy: "name",
    sortOrder: "asc" as "asc" | "desc",
  });

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userFilters, setUserFilters] = useState({
    page: 1,
    limit: 10,
    category: "",
    fromDate: "",
    toDate: "",
    transactionType: "" as "" | "INCOME" | "EXPENSE",
    transactionSearch: "",
    sortBy: "date",
    sortOrder: "desc" as "asc" | "desc",
  });

  const [initialLoadDone, setInitialLoadDone] = useState(false);

  const userIsAdmin = isAdmin(user);

  useEffect(() => {
    if (!initialLoadDone && user) {
      if (userIsAdmin) {
        fetchAnalyticsOverview(filters);
      } else if (user.id) {
        fetchUserAnalytics(user.id, userFilters);
        setSelectedUserId(user.id);
      }
      setInitialLoadDone(true);
    }
  }, [user, userIsAdmin, initialLoadDone]);

  useEffect(() => {
    if (initialLoadDone && userIsAdmin) {
      fetchAnalyticsOverview(filters);
    }
  }, [filters, userIsAdmin, initialLoadDone]);

  useEffect(() => {
    if (initialLoadDone && selectedUserId && !userIsAdmin) {
      fetchUserAnalytics(selectedUserId, userFilters);
    }
  }, [userFilters, selectedUserId, userIsAdmin, initialLoadDone]);

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key !== "page" ? 1 : value,
    }));
  };

  const handleUserFilterChange = (
    key: keyof typeof userFilters,
    value: any
  ) => {
    setUserFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key !== "page" ? 1 : value,
    }));
  };

  const handleViewUserAnalytics = (userId: string) => {
    setSelectedUserId(userId);
    fetchUserAnalytics(userId, userFilters);
  };

  const overviewStats = useMemo(() => {
    if (!analyticsOverview?.users) return null;

    const totalUsers = analyticsOverview.users.length;
    const totalIncome = analyticsOverview.users.reduce(
      (sum, user) => sum + user.totalIncome,
      0
    );
    const totalExpense = analyticsOverview.users.reduce(
      (sum, user) => sum + user.totalExpense,
      0
    );
    const totalTransactions = analyticsOverview.users.reduce(
      (sum, user) => sum + user.transactionCount,
      0
    );

    const roleDistribution = analyticsOverview.users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const roleChartData = Object.entries(roleDistribution).map(
      ([role, count]) => ({
        role,
        count,
      })
    );

    const topUsers = [...analyticsOverview.users]
      .sort((a, b) => b.transactionCount - a.transactionCount)
      .slice(0, 5);

    return {
      totalUsers,
      totalIncome,
      totalExpense,
      totalTransactions,
      netAmount: totalIncome - totalExpense,
      roleChartData,
      topUsers,
    };
  }, [analyticsOverview]);

  const userChartData = useMemo(() => {
    if (!userAnalytics?.transactions) return null;

    const categoryData = userAnalytics.transactions
      .filter((t) => t.type === "EXPENSE")
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    const categoryChartData = Object.entries(categoryData).map(
      ([category, amount]) => ({
        category,
        amount,
      })
    );

    const monthlyData = userAnalytics.transactions.reduce((acc, t) => {
      const month = new Date(t.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
      });
      if (!acc[month]) {
        acc[month] = { month, income: 0, expense: 0 };
      }
      if (t.type === "INCOME") {
        acc[month].income += t.amount;
      } else {
        acc[month].expense += t.amount;
      }
      return acc;
    }, {} as Record<string, { month: string; income: number; expense: number }>);

    const monthlyChartData = Object.values(monthlyData).sort(
      (a, b) => new Date(a.month).getTime() - new Date(b.month).getTime()
    );

    return {
      categoryChartData,
      monthlyChartData,
    };
  }, [userAnalytics]);

  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884D8",
    "#82CA9D",
  ];

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">
            {userIsAdmin
              ? "System-wide financial analytics and user insights"
              : "Your personal financial analytics"}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button disabled variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* This is the overview section */}
      {userIsAdmin && overviewStats && (
        <>
          <AnalyticsStatsCards stats={overviewStats} />

          <div className="grid gap-4 md:grid-cols-2">
            <RoleDistributionChart data={overviewStats.roleChartData} />
            <TopUsersCard users={overviewStats.topUsers} />
          </div>

          <AnalyticsFilters
            filters={filters}
            onFilterChange={handleFilterChange}
          />

          {analyticsOverview && (
            <UsersTable
              users={analyticsOverview.users}
              pagination={analyticsOverview.pagination}
              loading={loading}
              onViewUser={handleViewUserAnalytics}
              onPageChange={(page) => handleFilterChange("page", page)}
            />
          )}
        </>
      )}

      {/* This is the user analytics section */}
      {selectedUserId && userAnalytics && (
        <div className="space-y-6">
          <UserAnalyticsCard data={userAnalytics} isAdmin={userIsAdmin} />

          {userChartData && (
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Expense by Category</CardTitle>
                  <CardDescription>
                    Breakdown of expenses by category
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      amount: {
                        label: "Amount",
                        color: "hsl(var(--chart-1))",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <PieChart width={400} height={300}>
                      <Pie
                        data={userChartData.categoryChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ category, percent }) =>
                          `${category} ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="amount"
                      >
                        {userChartData.categoryChartData.map(
                          (_entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          )
                        )}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Monthly Trends</CardTitle>
                  <CardDescription>
                    Income vs Expenses over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      income: {
                        label: "Income",
                        color: "hsl(var(--chart-1))",
                      },
                      expense: {
                        label: "Expense",
                        color: "hsl(var(--chart-2))",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <LineChart
                      width={400}
                      height={300}
                      data={userChartData.monthlyChartData}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        type="monotone"
                        dataKey="income"
                        stroke="var(--color-income)"
                        name="Income"
                      />
                      <Line
                        type="monotone"
                        dataKey="expense"
                        stroke="var(--color-expense)"
                        name="Expense"
                      />
                    </LineChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          )}

          <UserTransactionsTable
            transactions={userAnalytics.transactions}
            pagination={userAnalytics.pagination}
            loading={loading}
            userName={userAnalytics.user.name}
            onPageChange={(page) => handleUserFilterChange("page", page)}
          />
        </div>
      )}
    </div>
  );
};
