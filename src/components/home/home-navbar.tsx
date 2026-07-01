"use client";

import { useEffect, type RefObject } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const HOME_NAVBAR_HEIGHT = "4.75rem";
export const HOME_NAVBAR_HEIGHT_EXPANDED = "6.75rem";

interface HomeNavbarProps {
  searchOpen: boolean;
  searchQuery: string;
  onSearchOpen: () => void;
  onSearchClose: () => void;
  onSearchQueryChange: (value: string) => void;
  searchInputRef?: RefObject<HTMLInputElement | null>;
  className?: string;
}

export function HomeNavbar({
  searchOpen,
  searchQuery,
  onSearchOpen,
  onSearchClose,
  onSearchQueryChange,
  searchInputRef,
  className,
}: HomeNavbarProps) {
  useEffect(() => {
    if (searchOpen) {
      const timer = setTimeout(() => searchInputRef?.current?.focus(), 120);
      return () => clearTimeout(timer);
    }
  }, [searchOpen, searchInputRef]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 bg-[#ececec] border-b border-black/[0.06]",
        className
      )}
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <motion.div
        animate={{
          height: searchOpen ? HOME_NAVBAR_HEIGHT_EXPANDED : HOME_NAVBAR_HEIGHT,
        }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto flex max-w-[480px] flex-col justify-center px-5"
      >
        <div className="flex items-center gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Image
              src="/icons/icon.png"
              alt=""
              width={44}
              height={44}
              className="h-11 w-11 shrink-0"
              priority
            />
            <div className="min-w-0 text-right">
              <h1 className="text-[1.05rem] font-bold leading-tight text-text-primary">
                اینجارو،
              </h1>
              <p className="text-[11px] leading-[1.45] text-text-primary/75">
                تجربه هوشمند رویدادهای نوآوری و خلاقیت.
              </p>
            </div>
          </div>

          {!searchOpen && (
            <button
              type="button"
              onClick={onSearchOpen}
              aria-label="جستجو"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-[3px] border-white bg-primary text-white shadow-[0_4px_14px_rgba(255,90,95,0.35)] transition-transform active:scale-95"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.25"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3.5-3.5" />
              </svg>
            </button>
          )}
        </div>

        <AnimatePresence initial={false}>
          {searchOpen && (
            <motion.div
              key="search-row"
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: 10 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-2 overflow-hidden"
            >
              <button
                type="button"
                onClick={onSearchClose}
                aria-label="بستن جستجو"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-text-secondary transition-colors hover:text-text-primary"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
              <div className="relative min-w-0 flex-1">
                <input
                  ref={searchInputRef}
                  value={searchQuery}
                  onChange={(e) => onSearchQueryChange(e.target.value)}
                  placeholder="جستجو در مکان‌ها و رویدادها..."
                  className="h-10 w-full rounded-full border border-border/40 bg-white px-4 text-sm text-text-primary shadow-xs outline-hidden transition-colors placeholder:text-text-secondary/50 focus:border-primary/40"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => onSearchQueryChange("")}
                    aria-label="پاک کردن"
                    className="absolute inset-y-0 left-3 flex items-center text-text-secondary/70"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </header>
  );
}

export function HomeNavbarSpacer({ searchOpen = false }: { searchOpen?: boolean }) {
  const height = searchOpen ? HOME_NAVBAR_HEIGHT_EXPANDED : HOME_NAVBAR_HEIGHT;

  return (
    <motion.div
      aria-hidden
      animate={{ height: `calc(${height} + env(safe-area-inset-top))` }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
    />
  );
}
