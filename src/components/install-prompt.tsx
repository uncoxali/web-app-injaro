"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DISMISS_KEY = "injaro-install-prompt-dismissed";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isAppInstalled(): boolean {
  if (typeof window === "undefined") return false;

  const standaloneMedia = window.matchMedia(
    "(display-mode: standalone)"
  ).matches;
  const iosStandalone =
    "standalone" in window.navigator &&
    (window.navigator as Navigator & { standalone?: boolean }).standalone;

  return standaloneMedia || Boolean(iosStandalone);
}

function isPromptDismissed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}

function persistDismiss() {
  try {
    localStorage.setItem(DISMISS_KEY, "1");
  } catch {
    // ignore storage errors
  }
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);

  const dismissPrompt = useCallback(() => {
    persistDismiss();
    setShow(false);
    setDeferredPrompt(null);
  }, []);

  useEffect(() => {
    if (isAppInstalled() || isPromptDismissed()) return;

    const handler = (e: Event) => {
      e.preventDefault();
      if (isAppInstalled() || isPromptDismissed()) return;

      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShow(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;

    if (result.outcome === "accepted") {
      persistDismiss();
      setShow(false);
    } else {
      dismissPrompt();
    }

    setDeferredPrompt(null);
  }, [deferredPrompt, dismissPrompt]);

  if (!show || isAppInstalled() || isPromptDismissed()) return null;

  return (
    <div
      className={cn(
        "fixed bottom-24 left-1/2 z-50 -translate-x-1/2",
        "w-[calc(100%-32px)] max-w-[416px]"
      )}
    >
      <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-surface p-4 shadow-xl shadow-border/20">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#FF5A5F"
            strokeWidth="1.5"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-text-primary">نصب اینجارو</p>
          <p className="text-xs text-text-secondary">افزودن به صفحه اصلی</p>
        </div>
        <Button size="sm" onClick={handleInstall}>
          نصب
        </Button>
        <button
          type="button"
          onClick={dismissPrompt}
          aria-label="بستن"
          className="text-text-secondary transition-colors hover:text-text-primary"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
