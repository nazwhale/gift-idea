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
      window.location.href = "/";
    }
  };

  const handleSignUp = async () => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setError(error.message);
    } else {
      // on sign up success, automatically log them in or redirect
      window.location.href = "/";
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      {error && <div className="text-red-500">{error}</div>}
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
      <Button onClick={handleLogin}>Login</Button>
      <Button variant="secondary" onClick={handleSignUp}>
        Sign Up
      </Button>
    </div>
  );
}
