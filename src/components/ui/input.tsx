"use client";

import { forwardRef, type InputHTMLAttributes, useCallback } from "react";
import { cn, toEnglishDigits, toPersianDigits } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  persianDigits?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      persianDigits = true,
      onChange,
      type,
      dir = "rtl",
      ...props
    },
    ref
  ) => {
    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        if (type === "tel" || type === "number") {
          e.target.value = toEnglishDigits(e.target.value);
        }
        onChange?.(e);
      },
      [onChange, type]
    );

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-medium text-text-primary">
            {label}
          </label>
        )}
        <input
          ref={ref}
          type={type}
          dir={dir}
          onChange={handleChange}
          className={cn(
            "h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm text-text-primary placeholder:text-text-secondary/60 outline-none transition-colors",
            "focus:border-primary focus:ring-1 focus:ring-primary/20",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-surface",
            error && "border-error focus:border-error focus:ring-error/20",
            className
          )}
          {...props}
        />
        {error && (
          <span className="text-xs text-error">{error}</span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
