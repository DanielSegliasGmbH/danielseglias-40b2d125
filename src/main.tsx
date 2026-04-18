import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./lib/i18n";
import { ensureServiceWorker } from "./lib/push";

createRoot(document.getElementById("root")!).render(<App />);

// Register service worker (no-op in Lovable preview / iframes — guarded inside).
if (typeof window !== "undefined") {
  window.addEventListener("load", () => {
    ensureServiceWorker().catch(() => {/* noop */});
  });
}
