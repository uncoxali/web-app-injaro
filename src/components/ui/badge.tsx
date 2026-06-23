import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

const variants = {
  default: "bg-surface text-text-primary border border-border",
  primary: "bg-primary/10 text-primary border border-primary/15",
  success: "bg-success/10 text-success border border-success/15",
  error: "bg-error/10 text-error border border-error/15",
  warning: "bg-warning/10 text-warning border border-warning/15",
  outline: "bg-transparent text-text-secondary border border-border",
} as const;

const sizes = {
  sm: "px-1.5 py-0.5 text-[10px]",
  md: "px-2 py-0.5 text-xs",
  lg: "px-3 py-1 text-sm",
} as const;

interface BadgeProps {
  children: ReactNode;
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  className?: string;
  dot?: boolean;
}

export function Badge({
  children,
  variant = "default",
  size = "md",
  className,
  dot,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-medium whitespace-nowrap",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {dot && (
        <span className={cn(
          "w-1.5 h-1.5 rounded-full",
          variant === "success" && "bg-success",
          variant === "error" && "bg-error",
          variant === "warning" && "bg-warning",
          variant === "primary" && "bg-primary",
          variant === "default" && "bg-text-secondary",
          variant === "outline" && "bg-text-secondary",
        )} />
      )}
      {children}
    </span>
  );
}
