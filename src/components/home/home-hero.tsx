"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { TazehaItem } from "@/lib/api/tazeha";
import { loginUrl } from "@/lib/auth-utils";
import { toPersianDigits, cn } from "@/lib/utils";
import { Icon } from "@/components/ui/icon";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { EventBrandLink } from "@/components/home/event-brand-link";
import {
  formatTazehaDateRange,
  getTazehaDescription,
  getTazehaImage,
  getTazehaLocation,
  getTazehaTitle,
  getEventBrandSlug,
} from "@/components/tazeha/tazeha-format";
import { useEnrichedTazehaItems } from "@/lib/queries/tazeha-enrichment";

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

function HeroGlassOverlay({ item }: { item: TazehaItem }) {
  const title = getTazehaTitle(item);
  const description = getTazehaDescription(item);
  const dateRange = formatTazehaDateRange(item);
  const location = getTazehaLocation(item);
  const footer = [dateRange, location].filter(Boolean).join(" · ");

  return (
    <div className="absolute inset-x-3 bottom-3 z-10 rounded-2xl border border-white/70 bg-white/55 px-4 py-3.5 text-right shadow-[0_4px_24px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.8)] backdrop-blur-xl backdrop-saturate-150 dark:border-white/15 dark:bg-black/40 dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
      <h3 className="text-sm font-bold leading-snug text-text-primary line-clamp-1">
        {title}
      </h3>
      {description ? (
        <p className="mt-1 text-xs leading-relaxed text-text-secondary line-clamp-2">
          {description}
        </p>
      ) : null}
      {footer ? (
        <p className="mt-2 text-[11px] leading-snug text-text-secondary/85">
          {footer}
        </p>
      ) : null}
    </div>
  );
}

interface HomeHeroProps {
  events: TazehaItem[];
  showGuestCta?: boolean;
  showTodayBadge?: boolean;
  className?: string;
  enrich?: boolean;
}

export function HomeHero({
  events,
  showGuestCta = false,
  showTodayBadge = false,
  className,
  enrich = true,
}: HomeHeroProps) {
  const [index, setIndex] = useState(0);
  const { items: enrichedItems } = useEnrichedTazehaItems(
    events,
    enrich && events.length > 0
  );

  if (events.length === 0) return null;

  const event = events[index];
  const enriched = enrichedItems[index] ?? event;
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
          key={event.event_slug ?? index}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          <EventBrandLink
            eventSlug={event.event_slug}
            locationSlug={getEventBrandSlug(enriched)}
            className="block"
          >
            <div className="relative aspect-[5/6] overflow-hidden rounded-3xl bg-gray-100 shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:bg-gray-800">
              <HeroSlideImage
                src={getTazehaImage(enriched)}
                alt={getTazehaTitle(enriched)}
                priority={index === 0}
              />
              <HeroGlassOverlay item={enriched} />
              {showTodayBadge && (
                <div className="absolute top-3 right-3 z-20 flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-xs font-bold text-white shadow-[0_2px_8px_rgba(255,90,95,0.35)]">
                  <Icon name="calendar" size="sm" color="white" />
                  امروز
                </div>
              )}
            </div>
          </EventBrandLink>

          {hasMultiple && (
            <>
              <button
                type="button"
                onClick={goPrev}
                aria-label="رویداد قبلی"
                className="absolute top-1/2 left-3 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-primary shadow-sm backdrop-blur-xs transition-transform active:scale-90"
              >
                <Icon name="chevronLeft" size={20} color="primary" />
              </button>
              <button
                type="button"
                onClick={goNext}
                aria-label="رویداد بعدی"
                className="absolute top-1/2 right-3 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-primary shadow-sm backdrop-blur-xs transition-transform active:scale-90"
              >
                <Icon name="chevronLeft" size={20} color="primary" className="scale-x-[-1]" />
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
