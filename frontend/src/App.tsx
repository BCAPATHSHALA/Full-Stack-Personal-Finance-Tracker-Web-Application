import { Suspense } from "react";
import { BrowserRouter as Router, Routes } from "react-router-dom";
import LoadingSpinner from "./components/LoadingSpinner";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Public routes: Login, Register */}

            {/* Protected routes: Dashboard, Transactions */}

            {/* Default route: Dashboard */}
          </Routes>
        </Suspense>
      </div>
    </Router>
  );
}

export default App;
