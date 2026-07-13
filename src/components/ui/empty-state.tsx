import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "./icon";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-6 text-center",
        className
      )}
    >
      {icon ? (
        <div className="mb-4">{icon}</div>
      ) : (
        <div className="w-16 h-16 rounded-2xl bg-surface flex items-center justify-center text-text-secondary/30 mb-4">
          <Icon name="calendar" size="xl" className="text-text-secondary/30" />
        </div>
      )}
      <h3 className="text-base font-semibold text-text-primary">{title}</h3>
      {description && (
        <p className="mt-1.5 text-sm text-text-secondary leading-relaxed max-w-[260px]">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
