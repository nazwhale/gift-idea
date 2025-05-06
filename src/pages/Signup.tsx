import { supabase } from "../lib/supabaseClient";
import { useState } from "react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { useToast } from "@/hooks/use-toast.ts";
import { posthog, AUTH_EVENTS, captureEvent } from "../lib/posthog";

export default function Signup() {
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = async () => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setError(error.message);
      // Track failed signup attempts
      captureEvent(AUTH_EVENTS.SIGNUP_FAILED, {
        reason: error.message
      });
    } else {
      // Identify user in PostHog when they sign up
      if (data.user) {
        posthog.identify(
          data.user.id,
          {
            email: data.user.email,
            $initial_referrer: document.referrer
          }
        );

        // Track successful signup
        captureEvent(AUTH_EVENTS.USER_SIGNED_UP);
      }

      toast({
        title: "Email confirmation sent",
        description: "Please check your email to confirm your account.",
      });
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
        <Button className="w-full" onClick={handleSignUp}>
          Sign Up
        </Button>
        {/*link to login if already have an account*/}
        <a href="/login" className="text-center block text-sm text-blue-500">
          Already have an account? Login
        </a>
      </div>
    </div>
  );
}
