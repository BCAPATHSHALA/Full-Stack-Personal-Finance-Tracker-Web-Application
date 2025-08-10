import React, { Suspense } from "react";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import LoadingSpinner from "./components/LoadingSpinner";
import { ThemeProvider } from "./contexts/ThemeProvider";
import { AuthProvider } from "./contexts/AuthProvider";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Layout } from "./components/Layout";

// Lazy load pages for code splitting
const LoginPage = React.lazy(() =>
  import("./pages/LoginPage").then((module) => ({ default: module.LoginPage }))
);
const RegisterPage = React.lazy(() =>
  import("./pages/RegisterPage").then((module) => ({
    default: module.RegisterPage,
  }))
);
const DashboardPage = React.lazy(() =>
  import("./pages/DashboardPage").then((module) => ({
    default: module.DashboardPage,
  }))
);
const TransactionsPage = React.lazy(() => import("./pages/TransactionsPage"));
const AnalyticsPage = React.lazy(() => import("./pages/AnalyticsPage"));
const NotFoundPage = React.lazy(() => import("./pages/NotFoundPage"));

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-background">
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                {/* Public routes: Login, Register, Not found */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Protected routes: Dashboard, Transactions, Analytics */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <DashboardPage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/transactions"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <TransactionsPage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/analytics"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <AnalyticsPage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                {/* Default route: Dashboard */}
                <Route
                  path="/"
                  element={<Navigate to="/dashboard" replace />}
                />
                {/* Not found route */}
                <Route path="/*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
