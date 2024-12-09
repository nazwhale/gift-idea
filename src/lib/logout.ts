import { supabase } from "./supabaseClient";

export const handleLogout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Error logging out:", error.message);
    alert("Failed to log out. Please try again.");
  } else {
    // Redirect to login page or handle post-logout behavior
    window.location.href = "/login";
  }
};
