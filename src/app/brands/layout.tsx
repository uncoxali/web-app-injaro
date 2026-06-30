"use client";

import type { ReactNode } from "react";
import { AuthGuard } from "@/components/auth-guard";
import { MobileShell } from "@/components/mobile-shell";
import { PageTransition } from "@/components/page-transition";

export default function BrandsLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <MobileShell hideNav>
        <PageTransition>{children}</PageTransition>
      </MobileShell>
    </AuthGuard>
  );
}
