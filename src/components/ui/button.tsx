"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";

const variants = {
  primary:
    "bg-primary text-primary-foreground hover:opacity-90 active:opacity-80",
  secondary:
    "bg-surface text-text-primary border border-border hover:bg-border/50 active:bg-border",
  ghost:
    "text-text-primary hover:bg-surface active:bg-border/50",
  destructive: "bg-error text-white hover:opacity-90 active:opacity-80",
} as const;

const sizes = {
  sm: "h-9 px-3 text-sm rounded-md",
  md: "h-11 px-4 text-sm rounded-lg",
  lg: "h-13 px-6 text-base rounded-lg",
  xl: "h-14 px-8 text-base rounded-xl",
} as const;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading,
      fullWidth,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed select-none",
          variants[variant],
          sizes[size],
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {loading ? <Spinner size="sm" className="-ml-1 mr-2" /> : null}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
