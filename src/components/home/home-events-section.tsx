"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Link from "next/link";
import type { LandingEvent } from "@/lib/api/landing";
import { EventBrandLink } from "@/components/home/event-brand-link";
import { Icon } from "@/components/ui/icon";
import { OptimizedImage } from "@/components/ui/optimized-image";

function EventCardImage({ src, alt }: { src?: string; alt: string }) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      fill
      sizes="140px"
      className="h-full w-full object-cover"
    />
  );
}

interface HomeEventsSectionProps {
  events: LandingEvent[];
  title?: string;
  variant?: "boxed" | "plain";
  titleStyle?: "text" | "pill";
  cardWidth?: string;
}

export function HomeEventsSection({
  events,
  title = "آخرین رویدادها",
  variant = "boxed",
  titleStyle = "text",
  cardWidth = "w-[140px]",
}: HomeEventsSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const scrollRaf = useRef<number | null>(null);
  const activeIdxRef = useRef(0);

  const updateActiveIdx = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;

    const containerCenter =
      container.getBoundingClientRect().left + container.clientWidth / 2;
    let closest = 0;
    let minDist = Infinity;

    itemRefs.current.forEach((item, i) => {
      if (!item) return;
      const rect = item.getBoundingClientRect();
      const itemCenter = rect.left + rect.width / 2;
      const dist = Math.abs(containerCenter - itemCenter);
      if (dist < minDist) {
        minDist = dist;
        closest = i;
      }
    });

    if (closest !== activeIdxRef.current) {
      activeIdxRef.current = closest;
      setActiveIdx(closest);
    }
  }, []);

  const handleScroll = useCallback(() => {
    if (scrollRaf.current !== null) return;
    scrollRaf.current = requestAnimationFrame(() => {
      scrollRaf.current = null;
      updateActiveIdx();
    });
  }, [updateActiveIdx]);

  const scrollToIndex = useCallback((index: number) => {
    const target = itemRefs.current[index];
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    activeIdxRef.current = index;
    setActiveIdx(index);
  }, []);

  const goPrev = () => {
    const next = (activeIdx - 1 + events.length) % events.length;
    scrollToIndex(next);
  };

  const goNext = () => {
    const next = (activeIdx + 1) % events.length;
    scrollToIndex(next);
  };

  useEffect(() => {
    updateActiveIdx();
  }, [events.length, updateActiveIdx]);

  if (events.length === 0) return null;

  const content = (
    <>
      <div className="mb-3 flex items-center justify-between">
        {titleStyle === "pill" ? (
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-sm font-bold text-white shadow-[0_2px_8px_rgba(255,90,95,0.35)]">
            <Icon name="calendar" size="sm" color="white" />
            {title}
          </div>
        ) : (
          <h2 className="text-base font-bold text-text-primary">{title}</h2>
        )}
        <Link
          href="/home/Tazeha"
          className="inline-flex items-center gap-0.5 text-sm font-semibold text-primary"
        >
          بیشتر
          <Icon name="chevronLeft" size="sm" color="primary" />
        </Link>
      </div>

      <div className="relative">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex items-center gap-3 overflow-x-auto scrollbar-none py-2 snap-x snap-mandatory scroll-smooth"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {events.map((event, i) => (
            <EventBrandLink
              key={event.event_slug}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              eventSlug={event.event_slug}
              locationSlug={event.location_slug}
              className="shrink-0 snap-center"
            >
              <div
                className={`relative aspect-3/4 ${cardWidth} overflow-hidden rounded-2xl bg-gray-200 dark:bg-surface shadow-[0_4px_16px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.35)]`}
              >
                <EventCardImage src={event.thumbnail} alt={event.topic} />
              </div>
            </EventBrandLink>
          ))}
        </div>

        {events.length > 1 && (
          <>
            <button
              type="button"
              onClick={goPrev}
              aria-label="رویداد قبلی"
              className="absolute top-1/2 left-2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 dark:bg-surface/90 text-primary shadow-sm backdrop-blur-xs transition-transform active:scale-90"
            >
              <Icon name="chevronLeft" size={20} color="primary" />
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="رویداد بعدی"
              className="absolute top-1/2 right-2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 dark:bg-surface/90 text-primary shadow-sm backdrop-blur-xs transition-transform active:scale-90"
            >
              <Icon name="chevronLeft" size={20} color="primary" className="scale-x-[-1]" />
            </button>
          </>
        )}
      </div>
    </>
  );

  return (
    <section>
      {variant === "boxed" ? (
        <div className="rounded-3xl bg-[#ececec] dark:bg-surface px-4 pb-4 pt-4 shadow-[0_4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.25)]">
          {content}
        </div>
      ) : (
        <div>{content}</div>
      )}
    </section>
  );
}
