"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface MobileShellProps {
  children: ReactNode;
  className?: string;
  hideNav?: boolean;
  noBottomPadding?: boolean;
}

export function MobileShell({
  children,
  className,
  hideNav,
  noBottomPadding,
}: MobileShellProps) {
  return (
    <div
      className={cn(
        "min-h-dvh w-full max-w-[480px] mx-auto bg-background relative",
        !hideNav && !noBottomPadding && "pb-24",
        className
      )}
    >
      {children}
    </div>
  );
}
