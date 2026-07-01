"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Link from "next/link";
import type { LandingEvent } from "@/lib/api/landing";
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
}

export function HomeEventsSection({ events }: HomeEventsSectionProps) {
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

  return (
    <section>
      <div className="rounded-3xl bg-[#ececec] px-4 pb-4 pt-4 shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold text-text-primary">آخرین رویدادها</h2>
          <Link
            href="/home/Tazeha"
            className="inline-flex items-center gap-0.5 text-sm font-semibold text-primary"
          >
            بیشتر
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </Link>
        </div>

        <div className="relative">
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex items-center gap-2.5 overflow-x-auto scrollbar-none py-2 snap-x snap-mandatory scroll-smooth"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {events.map((event, i) => (
                <Link
                  key={event.event_slug}
                  ref={(el) => {
                    itemRefs.current[i] = el;
                  }}
                  href={`/events/${event.event_slug}`}
                  className="shrink-0 snap-center"
                >
                  <div className="relative aspect-3/4 w-[140px] overflow-hidden rounded-2xl bg-gray-200 shadow-sm shadow-black/10">
                    <EventCardImage src={event.thumbnail} alt={event.topic} />
                  </div>
                </Link>
              ))}
          </div>

          {events.length > 1 && (
            <>
              <button
                type="button"
                onClick={goPrev}
                aria-label="رویداد قبلی"
                className="absolute top-1/2 left-2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-primary shadow-sm backdrop-blur-xs transition-transform active:scale-90"
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
                className="absolute top-1/2 right-2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-primary shadow-sm backdrop-blur-xs transition-transform active:scale-90"
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
        </div>
      </div>
    </section>
  );
}
