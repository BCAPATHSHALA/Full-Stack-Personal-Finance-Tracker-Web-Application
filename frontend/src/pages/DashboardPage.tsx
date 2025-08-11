import type React from "react";

import { useAuth } from "../contexts/AuthContext";

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  console.log("DashboardPage user:", user);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.name}! Here's your financial overview.
        </p>
      </div>
    </div>
  );
};
