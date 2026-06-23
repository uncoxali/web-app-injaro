"use client";

import { useEffect } from "react";

export function SWRegister() {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "production"
    ) {
      navigator.serviceWorker
        .register("/service-worker.js")
        .then(() => {
          console.log("SW registered");
        })
        .catch(() => {
          console.log("SW registration failed");
        });
    }

    if (process.env.NODE_ENV === "development") {
      navigator.serviceWorker?.getRegistrations().then((regs) => {
        regs.forEach((r) => r.unregister());
      });
    }
  }, []);

  return null;
}
