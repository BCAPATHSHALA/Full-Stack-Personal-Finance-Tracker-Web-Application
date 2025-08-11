import type React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface TopUser {
  id: string;
  name: string;
  email: string;
  transactionCount: number;
  netAmount: number;
}

interface TopUsersCardProps {
  users: TopUser[];
}

export const TopUsersCard: React.FC<TopUsersCardProps> = ({ users }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Active Users</CardTitle>
        <CardDescription>Users with most transactions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.map((user, index) => (
            <div key={user.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">
                  {user.transactionCount} transactions
                </p>
                <p className="text-sm text-muted-foreground">
                  ₹{user.netAmount.toFixed(2)} net
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
