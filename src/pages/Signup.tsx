import { supabase } from "../lib/supabaseClient";
import { useState } from "react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { useToast } from "@/hooks/use-toast.ts";

export default function Signup() {
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = async () => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setError(error.message);
    } else {
      toast({
        title: "Email confirmation sent",
        description: "Please check your email to confirm your account.",
      });
    }
  };

  return (
    <div className="max-w-xs mx-auto mt-10 space-y-2 ">
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
      <Button className="w-full" onClick={handleSignUp}>
        Sign Up
      </Button>
      {/*link to login if already have an account*/}
      <a href="/login" className="text-center block text-sm text-blue-500">
        Already have an account? Login
      </a>
    </div>
  );
}
