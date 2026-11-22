import "./config/themeStore";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { logger } from "@/utils/logger";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Elemento root nao encontrado");
}

if (!GOOGLE_CLIENT_ID) {
  logger.error("VITE_GOOGLE_CLIENT_ID nao configurado");
  rootElement.innerHTML =
    "<main style='padding:2rem;font-family:sans-serif'>" +
    "<h1>Configuracao ausente</h1>" +
    "<p>Defina VITE_GOOGLE_CLIENT_ID em um arquivo .env.local e reinicie o aplicativo.</p>" +
    "</main>";
} else {
  createRoot(rootElement).render(
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <StrictMode>
        <App />
      </StrictMode>
    </GoogleOAuthProvider>,
  );
}
