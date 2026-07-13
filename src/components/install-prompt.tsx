"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
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
          <Icon name="shareUpload" size={20} color="primary" />
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
          <Icon name="close" size="md" />
        </button>
      </div>
    </div>
  );
}
