import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import GifteeDetail from "./pages/GifteeDetail";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard"; // a landing page after login
import { useAuth } from "./hooks/useAuth";
import "./index.css";

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { session, loading } = useAuth();

  if (loading) {
    // Optionally, render a loading indicator while waiting for the session
    return <div>Loading...</div>;
  }

  if (!session) {
    console.log("no session");
    return <Navigate to="/login" replace />;
  }

  console.log("found session");
  return children;
}

export default function App() {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/giftee/:id"
            element={
              <ProtectedRoute>
                <GifteeDetail />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </div>
  );
}
