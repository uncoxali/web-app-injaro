"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { MobileShell } from "@/components/mobile-shell";
import { BottomNav } from "@/components/bottom-nav";
import { PageTransition } from "@/components/page-transition";

interface HomeLayoutProps {
  children: ReactNode;
}

export function HomeLayout({ children }: HomeLayoutProps) {
  const pathname = usePathname();
  const hideNav = pathname === "/home/profile/support";
  const isMapPage = pathname === "/home/Injaro";

  return (
    <MobileShell hideNav={hideNav} noBottomPadding={isMapPage}>
      <PageTransition>{children}</PageTransition>
      {!hideNav && <BottomNav />}
    </MobileShell>
  );
}
