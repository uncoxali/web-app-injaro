"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { LandingEvent } from "@/lib/api/landing";
import { loginUrl } from "@/lib/auth-utils";
import { toPersianDigits, cn } from "@/lib/utils";
import { OptimizedImage } from "@/components/ui/optimized-image";

function HeroSlideImage({
  src,
  alt,
  priority,
}: {
  src?: string;
  alt: string;
  priority?: boolean;
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      fill
      priority={priority}
      sizes="(max-width: 480px) 100vw, 480px"
      className="h-full w-full object-cover"
    />
  );
}

interface HomeHeroProps {
  events: LandingEvent[];
  showGuestCta?: boolean;
  showTodayBadge?: boolean;
  className?: string;
}

export function HomeHero({
  events,
  showGuestCta = false,
  showTodayBadge = false,
  className,
}: HomeHeroProps) {
  const [index, setIndex] = useState(0);

  if (events.length === 0) return null;

  const event = events[index];
  const hasMultiple = events.length > 1;

  const goPrev = () => {
    setIndex((i) => (i - 1 + events.length) % events.length);
  };

  const goNext = () => {
    setIndex((i) => (i + 1) % events.length);
  };

  return (
    <div className={cn(className)}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={event.event_slug}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          <Link href={`/events/${event.event_slug}`} className="block">
            <div className="relative aspect-[5/6] overflow-hidden rounded-3xl bg-gray-100 shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:bg-gray-800">
              <HeroSlideImage
                src={event.thumbnail}
                alt={event.topic}
                priority={index === 0}
              />
              {showTodayBadge && (
                <div className="absolute top-3 right-3 z-10 flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-xs font-bold text-white shadow-[0_2px_8px_rgba(255,90,95,0.35)]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  امروز
                </div>
              )}
            </div>
          </Link>

          {hasMultiple && (
            <>
              <button
                type="button"
                onClick={goPrev}
                aria-label="رویداد قبلی"
                className="absolute top-1/2 left-3 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-primary shadow-sm backdrop-blur-xs transition-transform active:scale-90"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button
                type="button"
                onClick={goNext}
                aria-label="رویداد بعدی"
                className="absolute top-1/2 right-3 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-primary shadow-sm backdrop-blur-xs transition-transform active:scale-90"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {showGuestCta && (
        <div className="mt-5 flex flex-col items-center gap-4 text-center">
          <p className="max-w-[18rem] text-sm font-medium leading-relaxed text-text-primary">
            برای شخصی‌سازی و تجربه کاربری بهتر رویدادها، وارد شو
          </p>
          <Link
            href={loginUrl("/home")}
            className="inline-flex min-w-[11rem] items-center justify-center rounded-full bg-primary px-8 py-3 text-sm font-bold text-white shadow-[0_8px_24px_rgba(255,90,95,0.4)] transition-transform active:scale-[0.98]"
          >
            ورود / ثبت‌نام
          </Link>
          <p className="text-xs text-text-secondary">
            بیش از {toPersianDigits("10000")} کاربر در رویدادهای شهری
          </p>
        </div>
      )}
    </div>
  );
}
