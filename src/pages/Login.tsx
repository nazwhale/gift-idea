import { supabase } from "../lib/supabaseClient";
import { useState, useEffect } from "react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { posthog, AUTH_EVENTS, captureEvent } from "../lib/posthog";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { session, loading } = useAuth();
  const navigate = useNavigate();

  // Check if user is already logged in and redirect to dashboard
  useEffect(() => {
    if (!loading && session) {
      // User is already logged in, redirect to dashboard
      navigate('/dashboard', { replace: true });
    }
  }, [session, loading, navigate]);

  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      // Track failed login attempts
      captureEvent(AUTH_EVENTS.LOGIN_FAILED, {
        reason: error.message
      });
    } else {
      // Identify user in PostHog on successful login
      if (data.user) {
        posthog.identify(
          data.user.id,
          {
            email: data.user.email,
            $current_url: window.location.href
          }
        );

        // Capture successful login event
        captureEvent(AUTH_EVENTS.USER_LOGGED_IN);
      }

      window.location.href = "/dashboard";
    }
  };

  return (
    <div className="max-w-xs mx-auto mt-4 space-y-4">
      <div className="space-y-2">
        <Input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      {error && <div className="text-red-500">{error}</div>}

      <div className="space-y-2">
        <Button onClick={handleLogin} className="w-full">
          Login
        </Button>
        {/*link to signup if don't have an account*/}
        <a href="/signup" className="text-center block text-sm text-blue-500">
          New to Gift Goats? Sign Up
        </a>
      </div>
    </div>
  );
}
