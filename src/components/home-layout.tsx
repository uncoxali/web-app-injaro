"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { MobileShell } from "@/components/mobile-shell";
import { BottomNav } from "@/components/bottom-nav";

interface HomeLayoutProps {
  children: ReactNode;
}

export function HomeLayout({ children }: HomeLayoutProps) {
  const pathname = usePathname();
  const hideNav = pathname === "/home/profile/support";
  const isMapPage = pathname === "/home/Injaro";

  return (
    <MobileShell hideNav={hideNav} noBottomPadding={isMapPage} noTopPadding={isMapPage}>
      {children}
      {!hideNav && <BottomNav />}
    </MobileShell>
  );
}
