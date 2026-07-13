"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import type { Sponsor } from "@/lib/api/locations";
import { useSponsors } from "@/lib/queries/sponsors";
import { Icon } from "@/components/ui/icon";
import { OptimizedImage } from "@/components/ui/optimized-image";

function SponsorLogo({ sponsor }: { sponsor: Sponsor }) {
  return (
    <div className="relative h-[4.5rem] w-[4.5rem] overflow-hidden rounded-full bg-white p-1.5 shadow-[0_4px_14px_rgba(0,0,0,0.1)] ring-2 ring-white">
      {sponsor.logo ? (
        <OptimizedImage
          src={sponsor.logo}
          alt={sponsor.name}
          fill
          sizes="72px"
          className="h-full w-full rounded-full object-contain"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-primary/10 text-xl font-bold text-primary">
          {sponsor.name.charAt(0)}
        </div>
      )}
    </div>
  );
}

function SponsorItem({
  sponsor,
  itemRef,
}: {
  sponsor: Sponsor;
  itemRef: (el: HTMLDivElement | null) => void;
}) {
  const content = (
    <div
      ref={itemRef}
      className="flex w-[7.5rem] shrink-0 snap-center flex-col items-center gap-2.5 px-2"
    >
      <SponsorLogo sponsor={sponsor} />
      <p className="w-full text-center text-[11px] font-medium leading-snug text-text-secondary line-clamp-3">
        {sponsor.name}
      </p>
    </div>
  );

  if (sponsor.link) {
    return (
      <a
        href={sponsor.link}
        target="_blank"
        rel="noopener noreferrer"
        className="transition-opacity hover:opacity-80"
      >
        {content}
      </a>
    );
  }

  return content;
}

function SponsorsSkeleton() {
  return (
    <div className="flex gap-4 px-2 py-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex w-[7.5rem] flex-col items-center gap-2.5">
          <div className="h-[4.5rem] w-[4.5rem] rounded-full bg-gray-200 animate-pulse" />
          <div className="h-3 w-16 rounded-md bg-gray-200 animate-pulse" />
        </div>
      ))}
    </div>
  );
}

function SponsorCarousel({ sponsors }: { sponsors: Sponsor[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
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
    const next = (activeIdx - 1 + sponsors.length) % sponsors.length;
    scrollToIndex(next);
  };

  const goNext = () => {
    const next = (activeIdx + 1) % sponsors.length;
    scrollToIndex(next);
  };

  useEffect(() => {
    updateActiveIdx();
  }, [sponsors.length, updateActiveIdx]);

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex items-start overflow-x-auto scrollbar-none py-2 snap-x snap-mandatory scroll-smooth"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {sponsors.map((sponsor, index) => (
          <div key={sponsor.id} className="flex shrink-0 items-stretch">
            {index > 0 && (
              <div className="mx-1 w-px shrink-0 self-stretch bg-gray-300/70 dark:bg-border/50" aria-hidden />
            )}
            <SponsorItem
              sponsor={sponsor}
              itemRef={(el) => {
                itemRefs.current[index] = el;
              }}
            />
          </div>
        ))}
      </div>

      {sponsors.length > 1 && (
        <>
          <button
            type="button"
            onClick={goPrev}
            aria-label="اسپانسر قبلی"
            className="absolute top-[2.25rem] left-0 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 dark:bg-surface/90 text-primary shadow-sm backdrop-blur-xs transition-transform active:scale-90"
          >
            <Icon name="chevronLeft" size={20} color="primary" />
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="اسپانسر بعدی"
            className="absolute top-[2.25rem] right-0 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 dark:bg-surface/90 text-primary shadow-sm backdrop-blur-xs transition-transform active:scale-90"
          >
            <Icon name="chevronLeft" size={20} color="primary" className="scale-x-[-1]" />
          </button>
        </>
      )}
    </div>
  );
}

export function HomeSponsorsSection({ enabled = true }: { enabled?: boolean }) {
  const { data: sponsors = [], isLoading, isError, refetch } = useSponsors(enabled);

  return (
    <section className="rounded-3xl bg-[#ececec] dark:bg-surface px-4 py-5 shadow-[0_4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.25)]">
      <h2 className="mb-3 text-base font-bold text-text-primary">
        مهمترین همکاری‌های گذشته
      </h2>

      {isLoading ? (
        <SponsorsSkeleton />
      ) : isError ? (
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <p className="text-sm text-text-secondary">خطا در بارگذاری همکاران</p>
          <button
            type="button"
            onClick={() => void refetch()}
            className="rounded-full bg-primary px-4 py-2 text-xs font-bold text-white"
          >
            تلاش مجدد
          </button>
        </div>
      ) : sponsors.length === 0 ? (
        <p className="py-4 text-center text-sm text-text-secondary">
          به زودی همکاران جدید اضافه می‌شوند
        </p>
      ) : (
        <SponsorCarousel sponsors={sponsors} />
      )}
    </section>
  );
}
