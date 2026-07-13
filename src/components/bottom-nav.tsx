"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { isAuthenticated, loginUrl } from "@/lib/auth-utils";
import { Icon, type SemanticIconName } from "@/components/ui/icon";

const navItems: {
  label: string;
  href: string;
  icon: SemanticIconName;
  exact?: boolean;
  requiresAuth?: boolean;
}[] = [
  { label: "خانه", href: "/home", icon: "home", exact: true },
  { label: "تازه‌ها", href: "/home/Tazeha", icon: "feed" },
  { label: "نقشه", href: "/home/Injaro", icon: "mapPin" },
  { label: "پروفایل", href: "/home/profile", icon: "user", requiresAuth: true },
];

function isNavActive(
  href: string,
  pathname: string,
  exact?: boolean
): boolean {
  if (exact) return pathname === href || pathname === `${href}/`;
  return pathname.startsWith(href);
}

export function BottomNav() {
  const pathname = usePathname();
  const [guest, setGuest] = useState(true);

  useEffect(() => {
    setGuest(!isAuthenticated());
  }, []);

  const activeIndex = navItems.findIndex((item) =>
    isNavActive(item.href, pathname, item.exact)
  );

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-40 px-3 pb-1"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 4px)" }}
    >
      <div className="relative flex items-center justify-around h-16 rounded-[40px] bg-background/40 backdrop-blur-2xl border border-border/40 shadow-xl shadow-black/5">
        <div
          className="absolute top-1 bottom-1 rounded-[32px] bg-primary/10 transition-[inset-inline-start] duration-300 ease-out"
          style={{
            width: `calc(${100 / navItems.length}% - 8px)`,
            insetInlineStart: `calc(${activeIndex * (100 / navItems.length)}% + 4px)`,
          }}
        />

        {navItems.map((item, index) => {
          const isActive = activeIndex === index;
          const href =
            guest && item.requiresAuth ? loginUrl(item.href) : item.href;
          return (
            <Link
              key={item.href}
              href={href}
              prefetch={item.href === "/home"}
              aria-label={item.label}
              className={cn(
                "relative z-10 flex flex-col items-center justify-center gap-0.5 w-full h-full rounded-[32px] transition-colors duration-200",
                isActive ? "text-primary" : "text-text-secondary"
              )}
            >
              <Icon name={item.icon} size={28} active={isActive} />
              <span
                className={cn(
                  "text-[10px] font-medium transition-transform duration-200",
                  isActive ? "scale-100 font-semibold" : "scale-90"
                )}
              >
                {item.icon === "user" && guest ? "ورود" : item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
