import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

// Component that redirects to dashboard if already logged in
export function AuthRedirect({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Only redirect once loading is complete
    if (!loading) {
      if (session) {
        // User is already logged in, redirect to dashboard
        navigate("/dashboard", { replace: true });
      }
    }
  }, [session, loading, navigate]);

  // Show children while loading, they'll be replaced with dashboard if user is logged in
  return <>{children}</>;
} 