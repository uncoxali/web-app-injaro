import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  align?: "start" | "center";
}

export function AuthLayout({ children, title, subtitle, align = "start" }: AuthLayoutProps) {
  return (
    <div className="flex min-h-dvh w-full flex-col items-center justify-center px-6 bg-gradient-to-b from-primary/5 via-background to-background">
      <div className="w-full">
        <div className={cn("mb-8", align === "center" ? "text-center" : "text-start")}>
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#FF5A5F"
              strokeWidth="1.5"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
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
