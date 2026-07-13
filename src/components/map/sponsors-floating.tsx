"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { isAuthenticated } from "@/lib/auth-utils";
import { useSponsors } from "@/lib/queries/sponsors";
import type { Sponsor } from "@/lib/api/locations";
import { Icon } from "@/components/ui/icon";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { cn } from "@/lib/utils";

function SponsorSkeleton() {
  return (
    <div className="pointer-events-none overflow-hidden rounded-2xl border border-border/50 bg-background/70 backdrop-blur-xl shadow-lg">
      <div className="flex items-center gap-3 p-3">
        <div className="h-5 w-14 rounded-full bg-border/60 animate-pulse" />
        <div className="h-10 w-10 rounded-xl bg-border/60 animate-pulse shrink-0" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3.5 w-28 rounded-md bg-border/60 animate-pulse" />
          <div className="h-2.5 w-20 rounded-md bg-border/40 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

function SponsorLogo({ name, logo }: { name: string; logo?: string }) {
  return (
    <div className="relative shrink-0">
      <div className="absolute inset-0 rounded-xl bg-primary/25 blur-md scale-125" />
      <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-background ring-2 ring-background shadow-xs">
        {logo ? (
          <OptimizedImage src={logo} alt={name} width={44} height={44} className="h-full w-full" />
        ) : (
          <span className="text-base font-bold text-primary">
            {name.charAt(0)}
          </span>
        )}
      </div>
    </div>
  );
}

function SponsorSlide({ sponsor }: { sponsor: Sponsor }) {
  return (
    <a
      href={sponsor.link || "#"}
      target={sponsor.link ? "_blank" : undefined}
      rel={sponsor.link ? "noopener noreferrer" : undefined}
      onClick={!sponsor.link ? (e) => e.preventDefault() : undefined}
      className="flex w-full items-center gap-3 p-3 pe-4"
      draggable={false}
    >
      <SponsorLogo name={sponsor.name} logo={sponsor.logo} />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-text-primary">
          {sponsor.name}
        </p>
        <p className="text-[10px] text-text-secondary">با حمایت از اینجارو</p>
      </div>

      {sponsor.link && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Icon name="chevronLeft" size="sm" color="primary" className="scale-x-[-1]" />
        </div>
      )}
    </a>
  );
}

export function SponsorsFloating() {
  const [authed, setAuthed] = useState(false);
  const { data: sponsors = [], isLoading: loading } = useSponsors(authed);
  const [current, setCurrent] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scrollRaf = useRef<number | null>(null);
  const currentRef = useRef(0);

  useEffect(() => {
    setAuthed(isAuthenticated());
  }, []);

  const updateCurrentFromScroll = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;

    const containerCenter =
      container.getBoundingClientRect().left + container.clientWidth / 2;
    let closest = 0;
    let minDist = Infinity;

    slideRefs.current.forEach((slide, i) => {
      if (!slide) return;
      const rect = slide.getBoundingClientRect();
      const slideCenter = rect.left + rect.width / 2;
      const dist = Math.abs(containerCenter - slideCenter);
      if (dist < minDist) {
        minDist = dist;
        closest = i;
      }
    });

    if (closest !== currentRef.current) {
      currentRef.current = closest;
      setCurrent(closest);
    }
  }, []);

  const handleScroll = useCallback(() => {
    if (scrollRaf.current !== null) return;
    scrollRaf.current = requestAnimationFrame(() => {
      scrollRaf.current = null;
      updateCurrentFromScroll();
    });
  }, [updateCurrentFromScroll]);

  const goToSlide = useCallback((index: number) => {
    const slide = slideRefs.current[index];
    if (!slide || !scrollRef.current) return;
    slide.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    currentRef.current = index;
    setCurrent(index);
  }, []);

  if (!authed) return null;

  if (loading) {
    return (
      <div
        className="absolute inset-x-0 z-30 px-4 pointer-events-none"
        style={{ bottom: "calc(env(safe-area-inset-bottom) + 5.25rem)" }}
      >
        <SponsorSkeleton />
      </div>
    );
  }

  if (sponsors.length === 0) return null;

  return (
    <div
      className="absolute inset-x-0 z-30 px-4 pointer-events-none"
      style={{ bottom: "calc(env(safe-area-inset-bottom) + 5.25rem)" }}
    >
      <div
        className="pointer-events-auto relative overflow-hidden rounded-2xl border border-border/70 bg-background/85 backdrop-blur-xl shadow-lg"
        onPointerDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/80 to-transparent" />

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className={cn(
            "flex overflow-x-auto scrollbar-none scroll-smooth",
            sponsors.length > 1 && "snap-x snap-mandatory touch-pan-x"
          )}
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {sponsors.map((sponsor, i) => (
            <div
              key={sponsor.id}
              ref={(el) => {
                slideRefs.current[i] = el;
              }}
              className="w-full shrink-0 snap-center"
            >
              <SponsorSlide sponsor={sponsor} />
            </div>
          ))}
        </div>

        {sponsors.length > 1 && (
          <div className="flex justify-center gap-1.5 pb-2.5">
            {sponsors.map((s, i) => (
              <button
                key={s.id}
                type="button"
                aria-label={`اسپانسر ${i + 1}`}
                onClick={() => goToSlide(i)}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  i === current ? "w-5 bg-primary" : "w-1.5 bg-border hover:bg-primary/40"
                )}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
