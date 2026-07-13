"use client";

import { useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/icon";

interface SheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  side?: "right" | "left";
  className?: string;
}

export function Sheet({
  open,
  onClose,
  children,
  title,
  side = "right",
  className,
}: SheetProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) {
      document.addEventListener("keydown", handleEscape);
    }
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div
        className={cn(
          "fixed inset-y-0 z-50 w-full max-w-sm bg-surface shadow-lg flex flex-col",
          side === "right" ? "right-0 animate-slide-down" : "left-0",
          className
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          {title && (
            <h2 className="text-base font-semibold text-text-primary">
              {title}
            </h2>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-surface transition-colors"
          >
            <Icon name="close" size="md" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
      </div>
    </div>
  );
}
