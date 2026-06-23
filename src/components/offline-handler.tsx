"use client";

import { useEffect, useCallback, useRef } from "react";
import toast from "react-hot-toast";

export function OfflineHandler() {
  const shown = useRef(false);
  const onlineToast = useRef<string | null>(null);

  const showOffline = useCallback(() => {
    if (shown.current) return;
    shown.current = true;
    toast.error("اتصال اینترنت قطع شد", { id: "offline", duration: Infinity });
  }, []);

  const showOnline = useCallback(() => {
    shown.current = false;
    toast.dismiss("offline");
    toast.success("اتصال اینترنت برقرار شد", { id: "online" });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!navigator.onLine) showOffline();

    const handleOffline = () => showOffline();
    const handleOnline = () => showOnline();

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, [showOffline, showOnline]);

  return null;
}
