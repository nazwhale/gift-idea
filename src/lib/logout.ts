import { supabase } from "./supabaseClient";
import { AUTH_EVENTS, captureEvent } from "./posthog";

export const handleLogout = async () => {
  // Capture logout event before actually logging out
  captureEvent(AUTH_EVENTS.USER_LOGGED_OUT);

  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Error logging out:", error.message);
    alert("Failed to log out. Please try again.");
  } else {
    // Redirect to login page or handle post-logout behavior
    window.location.href = "/login";
  }
};
