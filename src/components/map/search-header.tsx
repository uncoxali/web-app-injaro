"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useMapStore } from "@/store/map";

interface SearchHeaderProps {
  onSearch?: (query: string) => void;
  className?: string;
}

export function SearchHeader({ onSearch, className }: SearchHeaderProps) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const mapSearchQuery = useMapStore((s) => s.mapSearchQuery);
  const setMapSearchQuery = useMapStore((s) => s.setMapSearchQuery);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setMapSearchQuery(value);

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        onSearch?.(value);
      }, 300);
    },
    [setMapSearchQuery, onSearch]
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className={cn("px-4", className)}>
      <div
        className={cn(
          "flex items-center gap-2 h-11 rounded-2xl bg-white/90 backdrop-blur-md border shadow-sm transition-all",
          focused
            ? "border-primary ring-2 ring-primary/10 shadow-md"
            : "border-border/60"
        )}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-text-secondary shrink-0 mr-3"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          placeholder="جستجوی مکان‌ها..."
          value={mapSearchQuery}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="flex-1 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-secondary/50 h-full"
        />
        {mapSearchQuery && (
          <button
            onClick={() => {
              setMapSearchQuery("");
              onSearch?.("");
              inputRef.current?.focus();
            }}
            className="ml-2 p-1 rounded-full hover:bg-surface transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-text-secondary"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
