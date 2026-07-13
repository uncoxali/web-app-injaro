"use client";

import { useState, useRef, useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/icon";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  className?: string;
}

export function Select({
  options,
  value,
  onChange,
  placeholder = "انتخاب کنید",
  label,
  error,
  className,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={cn("flex flex-col gap-1.5", className)} ref={ref}>
      {label && (
        <label className="text-sm font-medium text-text-primary">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "flex h-11 w-full items-center justify-between rounded-lg border bg-surface px-3 text-sm transition-colors",
          "focus:border-primary focus:ring-1 focus:ring-primary/20",
          error ? "border-error" : "border-border",
          !selected && "text-text-secondary/60"
        )}
      >
        <span>{selected ? selected.label : placeholder}</span>
        <Icon
          name="chevronLeft"
          size="sm"
          className={cn("rotate-[-90deg] transition-transform", open && "rotate-90")}
        />
      </button>
      {open && (
        <div className="absolute z-50 mt-14 w-[calc(100%-2rem)] max-w-sm rounded-lg border border-border bg-surface shadow-lg animate-fade-in">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange?.(option.value);
                setOpen(false);
              }}
              className={cn(
                "w-full px-3 py-2.5 text-sm text-right hover:bg-surface transition-colors",
                "first:rounded-t-lg last:rounded-b-lg",
                value === option.value && "bg-primary/5 text-primary font-medium"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
      {error && <span className="text-xs text-error">{error}</span>}
    </div>
  );
}
