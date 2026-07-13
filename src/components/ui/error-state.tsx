import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Icon } from "./icon";

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
        <Icon name="support" size="xl" color="error" className="opacity-40" />
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
