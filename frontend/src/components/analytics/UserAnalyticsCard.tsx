import type React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface UserAnalyticsData {
  user: {
    name: string;
    email: string;
    totalIncome: number;
    totalExpense: number;
    netAmount: number;
    transactionCount: number;
  };
}

interface UserAnalyticsCardProps {
  data: UserAnalyticsData;
  isAdmin: boolean;
}

export const UserAnalyticsCard: React.FC<UserAnalyticsCardProps> = ({
  data,
  isAdmin,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isAdmin
            ? `${data.user.name}'s Analytics`
            : "Your Financial Analytics"}
        </CardTitle>
        <CardDescription>
          Detailed financial breakdown and transaction history
          {isAdmin && ` for ${data.user.email}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              ₹{data.user.totalIncome.toFixed(2)}
            </p>
            <p className="text-sm text-muted-foreground">Total Income</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">
              ₹{data.user.totalExpense.toFixed(2)}
            </p>
            <p className="text-sm text-muted-foreground">Total Expenses</p>
          </div>
          <div className="text-center">
            <p
              className={`text-2xl font-bold ${
                data.user.netAmount >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              ₹{data.user.netAmount.toFixed(2)}
            </p>
            <p className="text-sm text-muted-foreground">Net Amount</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{data.user.transactionCount}</p>
            <p className="text-sm text-muted-foreground">Transactions</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
