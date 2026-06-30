import type { ReactNode } from "react";

export function PageLoadingShell({ children }: { children: ReactNode }) {
  return (
    <div
      className="flex min-h-dvh w-full flex-1 flex-col animate-pulse"
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
