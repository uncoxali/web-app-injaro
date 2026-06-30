"use client";

import { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface ExpandableSearchBarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  query: string;
  onQueryChange: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export function ExpandableSearchBar({
  open,
  onOpenChange,
  query,
  onQueryChange,
  placeholder = "جستجو در مکان‌ها و رویدادها...",
  className,
}: ExpandableSearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleClose = () => {
    onOpenChange(false);
    onQueryChange("");
  };

  if (open) {
    return (
      <div className={cn("flex items-center gap-2 flex-1", className)}>
        <button
          type="button"
          onClick={handleClose}
          aria-label="بستن"
          className="text-text-secondary hover:text-text-primary transition-colors shrink-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            className="w-full h-10 px-3 rounded-xl bg-surface border border-border/50 text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-hidden focus:border-primary/30"
          />
          {query && (
            <button
              type="button"
              onClick={() => onQueryChange("")}
              aria-label="پاک کردن"
              className="absolute left-2 top-1/2 -translate-y-1/2 text-text-secondary/60"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onOpenChange(true)}
      aria-label="جستجو"
      className={cn(
        "w-9 h-9 flex items-center justify-center rounded-xl bg-surface border border-border/50 text-text-secondary hover:border-primary/30 transition-colors shrink-0",
        className
      )}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" />
      </svg>
    </button>
  );
}
