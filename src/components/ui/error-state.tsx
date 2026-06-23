import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  action?: ReactNode;
  className?: string;
}

export function ErrorState({
  title = "خطایی رخ داد",
  message = "مشکلی پیش آمده، دوباره تلاش کنید",
  onRetry,
  action,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-6 text-center",
        className
      )}
    >
      <div className="w-16 h-16 rounded-2xl bg-error/5 flex items-center justify-center text-error/40 mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h3 className="text-base font-semibold text-text-primary">{title}</h3>
      <p className="mt-1.5 text-sm text-text-secondary leading-relaxed max-w-[260px]">{message}</p>
      <div className="mt-5">
        {onRetry ? (
          <Button variant="secondary" size="sm" onClick={onRetry}>
            تلاش مجدد
          </Button>
        ) : (
          action
        )}
      </div>
    </div>
  );
}
