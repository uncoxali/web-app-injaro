"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { toPersianDigits, cn } from "@/lib/utils";
import { OptimizedImage } from "@/components/ui/optimized-image";

export interface SearchEventResult {
  slug: string;
  title: string;
  thumbnail?: string;
}

export interface SearchLocationResult {
  slug: string;
  name: string;
  logo?: string;
}

type SearchCategory = "all" | "map" | "tazeha";

interface UnifiedSearchResultsProps {
  query: string;
  events: SearchEventResult[];
  locations: SearchLocationResult[];
  onLocationClick?: (location: SearchLocationResult) => void;
}

const TABS: { id: SearchCategory; label: string }[] = [
  { id: "all", label: "همه" },
  { id: "map", label: "نقشه" },
  { id: "tazeha", label: "تازه‌ها" },
];

const MAX_RESULTS = 25;

export function UnifiedSearchResults({
  query,
  events,
  locations,
  onLocationClick,
}: UnifiedSearchResultsProps) {
  const [category, setCategory] = useState<SearchCategory>("all");

  useEffect(() => {
    setCategory("all");
  }, [query]);

  if (!query.trim()) return null;

  const limitedEvents = events.slice(0, MAX_RESULTS);
  const limitedLocations = locations.slice(0, MAX_RESULTS);

  const counts: Record<SearchCategory, number> = {
    all: limitedEvents.length + limitedLocations.length,
    map: limitedLocations.length,
    tazeha: limitedEvents.length,
  };

  const hasResults = counts.all > 0;
  const showLocations = category === "all" || category === "map";
  const showEvents = category === "all" || category === "tazeha";
  const visibleLocations = showLocations ? limitedLocations : [];
  const visibleEvents = showEvents ? limitedEvents : [];

  return (
    <div className="bg-surface border border-border/50 rounded-xl shadow-xs p-2.5">
      <div className="flex gap-2 overflow-x-auto scrollbar-none">
        {TABS.map((tab) => {
          const count = counts[tab.id];
          const isActive = category === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setCategory(tab.id)}
              className={cn(
                "shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors",
                isActive
                  ? "border-primary bg-primary text-white shadow-xs shadow-primary/20"
                  : "bg-surface border-border/50 text-text-secondary hover:border-primary/30"
              )}
            >
              {tab.label}
              <span
                className={cn(
                  "text-[10px] font-bold px-2 py-0.5 rounded-full leading-none",
                  isActive ? "bg-white/20 text-white" : "bg-surface text-text-secondary/70"
                )}
              >
                {toPersianDigits(count)}
              </span>
            </button>
          );
        })}
      </div>

      <div className="overflow-y-auto mt-2" style={{ maxHeight: "350px" }}>
      {!hasResults && (
        <p className="text-sm text-text-secondary text-center py-8">نتیجه‌ای یافت نشد</p>
      )}

      {hasResults && category !== "tazeha" && visibleLocations.length > 0 && (
        <div>
          {category === "all" && (
            <h3 className="text-[11px] font-semibold text-text-secondary/60 mb-1 px-1 tracking-wide">نقشه</h3>
          )}
          <div className="space-y-0.5">
            {visibleLocations.map((loc) =>
              onLocationClick ? (
                <button
                  key={loc.slug}
                  type="button"
                  onClick={() => onLocationClick(loc)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-white dark:bg-white/5 border border-border/30 shadow-xs hover:shadow-sm hover:border-border/50 transition-shadow text-start"
                >
                  <div className="relative w-8 h-8 rounded-xl overflow-hidden bg-linear-to-br from-primary/10 to-primary/4 shrink-0 ring-1 ring-black/4 dark:ring-white/6">
                    <OptimizedImage src={loc.logo} alt="" width={32} height={32} className="w-full h-full" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-sm font-medium text-text-primary block truncate leading-5">
                      {loc.name}
                    </span>
                  </div>
                </button>
              ) : (
                <Link
                  key={loc.slug}
                  href="/home/Injaro"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-white dark:bg-white/5 border border-border/30 shadow-xs hover:shadow-sm hover:border-border/50 transition-shadow group"
                >
                  <div className="relative w-8 h-8 rounded-xl overflow-hidden bg-linear-to-br from-primary/10 to-primary/4 shrink-0 ring-1 ring-black/4 dark:ring-white/6">
                    <OptimizedImage src={loc.logo} alt="" width={32} height={32} className="w-full h-full" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-sm font-medium text-text-primary block truncate leading-5">
                      {loc.name}
                    </span>
                  </div>
                </Link>
              )
            )}
          </div>
        </div>
      )}

      {hasResults && category !== "map" && visibleEvents.length > 0 && (
        <div>
          {category === "all" && (
            <h3 className="text-[11px] font-semibold text-text-secondary/60 mb-1 px-1 tracking-wide">تازه‌ها</h3>
          )}
          <div className="space-y-0.5">
            {visibleEvents.map((ev) => (
              <Link
                key={ev.slug}
                href={`/events/${ev.slug}`}
                className="flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-white dark:bg-white/5 border border-border/30 shadow-xs hover:shadow-sm hover:border-border/50 transition-shadow group"
              >
                <div className="relative w-8 h-8 rounded-xl overflow-hidden bg-linear-to-br from-primary/10 to-primary/4 shrink-0 ring-1 ring-black/4 dark:ring-white/6">
                  <OptimizedImage src={ev.thumbnail} alt="" width={32} height={32} className="w-full h-full" />
                </div>
                <span className="text-sm font-medium text-text-primary truncate flex-1 leading-5">{ev.title}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {hasResults &&
        ((category === "map" && visibleLocations.length === 0) ||
          (category === "tazeha" && visibleEvents.length === 0)) && (
          <p className="text-sm text-text-secondary text-center py-8">نتیجه‌ای در این دسته یافت نشد</p>
        )}
      </div>
    </div>
  );
}
