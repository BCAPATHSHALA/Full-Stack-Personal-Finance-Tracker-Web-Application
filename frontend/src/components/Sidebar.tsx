import type React from "react";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { BarChart3, CreditCard, Home, LogOut, Wallet } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

interface SidebarProps {
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: Home,
      roles: ["ADMIN", "USER", "READ_ONLY"],
      description: "Overview of your finances",
    },
    {
      name: "Transactions",
      href: "/transactions",
      icon: CreditCard,
      roles: ["ADMIN", "USER", "READ_ONLY"],
      description: "Manage income and expenses",
    },
    {
      name: "Analytics",
      href: "/analytics",
      icon: BarChart3,
      roles: ["ADMIN", "USER", "READ_ONLY"],
      description: "Financial insights and reports",
    },
  ];

  const filteredNavigation = navigation.filter(
    (item) => user && item.roles.includes(user.role)
  );

  return (
    <div className={cn("pb-12 w-64", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="flex items-center mb-4">
            <Wallet className="h-6 w-6 mr-2" />
            <h2 className="text-lg font-semibold tracking-tight">
              Finance Tracker
            </h2>
          </div>

          {/* User Info */}
          <div className="mb-4 p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium">{user?.name}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
            <div className="flex items-center mt-2">
              <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                {user?.role}
              </span>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Main Navigation */}
          <div className="space-y-1">
            <h3 className="mb-2 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Navigation
            </h3>
            {filteredNavigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link key={item.name} to={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className="w-full justify-start h-10 mb-1"
                    title={item.description}
                  >
                    <Icon className="mr-3 h-4 w-4" />
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium">{item.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {item.description}
                      </span>
                    </div>
                  </Button>
                </Link>
              );
            })}
          </div>

          <Separator className="my-4" />

          {/* Logout Button */}
          <Button
            variant="ghost"
            className="w-full justify-start h-10 text-red-600 hover:text-red-700"
            onClick={logout}
          >
            <LogOut className="mr-3 h-4 w-4" />
            <span className="text-sm font-medium">Logout</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
