import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { AuthProvider, setTestMode } from "@/hooks/useAuth.tsx";
import { PostHogProvider } from "posthog-js/react";

// Check if we're in test mode (injected by playwright)
if (window.hasOwnProperty('mockAuthForTests')) {
  setTestMode(
    true, 
    (window as any).mockSessionData
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PostHogProvider
      apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_KEY}
      options={{
        api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
        debug: import.meta.env.MODE === "development",
      }}
    >
      <AuthProvider>
        <App />
      </AuthProvider>
    </PostHogProvider>
  </StrictMode>
);