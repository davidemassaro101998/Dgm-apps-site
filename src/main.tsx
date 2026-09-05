import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { initMonitoring } from "./lib/monitoring";

initMonitoring();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);

/* Il guscio scritto a mano in index.html serve solo finche' React non
   c'e'. Da qui in poi e' un doppione invisibile sotto l'app: si toglie,
   dopo un fotogramma, cosi' non si vede nessuno stacco fra i due. */
requestAnimationFrame(() => {
  document.getElementById("guscio")?.remove();
});