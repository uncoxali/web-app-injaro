import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AuthStepPanelProps {
  children: ReactNode;
  className?: string;
}

export function AuthStepPanel({ children, className }: AuthStepPanelProps) {
  return (
    <div className={cn("w-full animate-fade-in", className)}>{children}</div>
  );
}
