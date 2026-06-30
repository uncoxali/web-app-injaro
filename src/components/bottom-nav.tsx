"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { isAuthenticated, loginUrl } from "@/lib/auth-utils";

const navItems = [
  {
    label: "خانه",
    href: "/home",
    icon: HomeIcon,
    exact: true,
  },
  {
    label: "تازه‌ها",
    href: "/home/Tazeha",
    icon: FeedIcon,
  },
  {
    label: "نقشه",
    href: "/home/Injaro",
    icon: MapPinIcon,
  },
  {
    label: "پروفایل",
    href: "/home/profile",
    icon: "profile",
    requiresAuth: true,
  },
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
  const activeIndex = navItems.findIndex((item) =>
    isNavActive(item.href, pathname, item.exact)
  );

  useEffect(() => {
    setGuest(!isAuthenticated());
  }, [pathname]);

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-40 px-3 pb-1"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 4px)" }}
    >
      <div className="relative flex items-center justify-around h-16 rounded-[40px] bg-background/40 backdrop-blur-2xl border border-border/40 shadow-xl shadow-black/5">
        <motion.div
          className="absolute top-1 bottom-1 rounded-[32px] bg-primary/10"
          layout
          layoutId="nav-indicator"
          transition={{ type: "spring", stiffness: 500, damping: 35 }}
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
              prefetch={true}
              aria-label={item.label}
              className={cn(
                "relative z-10 flex flex-col items-center justify-center gap-0.5 w-full h-full rounded-[32px] transition-colors duration-200",
                isActive ? "text-primary" : "text-text-secondary"
              )}
            >
              <div className="relative">
                {item.icon === "profile" ? (
                  <UserIcon active={isActive} />
                ) : (
                  <item.icon active={isActive} />
                )}
              </div>
              <motion.span
                className="text-[10px] font-medium"
                animate={{
                  scale: isActive ? 1 : 0.9,
                  fontWeight: isActive ? 600 : 400,
                }}
                transition={{ duration: 0.2 }}
              >
                {item.icon === "profile" && guest ? "ورود" : item.label}
              </motion.span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill={active ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={active ? 0 : 1.5}
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function FeedIcon({ active }: { active: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill={active ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={active ? 0 : 1.5}
    >
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function MapPinIcon({ active }: { active: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill={active ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={active ? 0 : 1.5}
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function UserIcon({ active }: { active: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill={active ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={active ? 0 : 1.5}
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
