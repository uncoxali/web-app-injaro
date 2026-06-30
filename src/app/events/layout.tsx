"use client";

import type { ReactNode } from "react";
import { MobileShell } from "@/components/mobile-shell";
import { PageTransition } from "@/components/page-transition";

export default function EventsLayout({ children }: { children: ReactNode }) {
  return (
    <MobileShell hideNav>
      <PageTransition>{children}</PageTransition>
    </MobileShell>
  );
}
