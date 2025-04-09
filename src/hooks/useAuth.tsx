import { createContext, useEffect, useState, useContext } from "react";
import { supabase } from "../lib/supabaseClient";

// Create a context with a default value that indicates loading state
const AuthContext = createContext<{
  session: any;
  loading: boolean;
  isTestEnvironment?: boolean;
}>({
  session: null,
  loading: true,
});

// For testing purposes, this can be set to true
let isTestEnvironment = false;
let mockSession: any = null;

// Functions for test mode
export const setTestMode = (enabled: boolean, sessionData: any = null) => {
  console.log("setTestMode called:", { enabled, sessionData });
  isTestEnvironment = enabled;
  mockSession = sessionData;
};

// Expose the setTestMode function globally for Playwright tests
if (typeof window !== 'undefined') {
  (window as any).setTestModeDirectly = setTestMode;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    // If in test mode, use the mock session
    if (isTestEnvironment) {
      setSession(mockSession);
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false); // Mark loading as false
    });

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_, session) => {
        setSession(session);
        setLoading(false); // Mark loading as false if the session updates
      }
    );

    return () => {
      subscription?.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session, loading, isTestEnvironment }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
