import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageLoadingShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("flex min-h-dvh w-full flex-1 flex-col animate-pulse", className)}
      style={{
        minHeight: "100dvh",
        paddingTop: "var(--safe-area-top)",
        paddingBottom: "var(--safe-area-bottom)",
      }}
    >
      {children}
    </div>
  );
}
