import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { AuthProvider, setTestMode } from "@/hooks/useAuth.tsx";

// Check if we're in test mode (injected by playwright)
if (window.hasOwnProperty('mockAuthForTests')) {
  setTestMode(
    true, 
    (window as any).mockSessionData
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>
);
