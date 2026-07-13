import type { ReactNode } from "react";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  align?: "start" | "center";
}

export function AuthLayout({ children, title, subtitle, align = "start" }: AuthLayoutProps) {
  return (
    <div className="flex min-h-dvh w-full flex-col items-center justify-center px-6 bg-linear-to-b from-primary/5 via-background to-background">
      <div className="w-full">
        <div className={cn("mb-8", align === "center" ? "text-center" : "text-start")}>
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4">
            <Icon name="home" size="xl" color="primary" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary">{title}</h1>
          {subtitle && (
            <p className="text-sm text-text-secondary mt-1.5">{subtitle}</p>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}
