import { supabase } from "../lib/supabaseClient";
import { useState } from "react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    console.log("handleLogin invoked...");
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    console.log("called login");
    if (error) {
      console.log("login error");
      setError(error.message);
    } else {
      console.log("login success");
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
