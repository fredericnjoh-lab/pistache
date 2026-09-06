import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Force fresh shell after deploy (old SW was cache-first and hid updates).
if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      const swUrl = `${import.meta.env.BASE_URL}sw.js?v=3`;
      const reg = await navigator.serviceWorker.register(swUrl);

      // Drop any leftover v1/v2 caches ASAP
      if (window.caches?.keys) {
        const keys = await caches.keys();
        await Promise.all(
          keys
            .filter((k) => k.startsWith("pistache-polyglot-") && k !== "pistache-polyglot-v3")
            .map((k) => caches.delete(k))
        );
      }

      reg.addEventListener("updatefound", () => {
        const worker = reg.installing;
        if (!worker) return;
        worker.addEventListener("statechange", () => {
          if (worker.state === "installed" && navigator.serviceWorker.controller) {
            worker.postMessage("SKIP_WAITING");
          }
        });
      });

      let refreshing = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (refreshing) return;
        refreshing = true;
        window.location.reload();
      });

      // Check for updates when the tab becomes visible again
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") reg.update().catch(() => {});
      });
    } catch {
      /* SW optional */
    }
  });
}
