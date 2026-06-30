"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { imgUrl, toPersianDigits, cn } from "@/lib/utils";

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

  const counts: Record<SearchCategory, number> = {
    all: events.length + locations.length,
    map: locations.length,
    tazeha: events.length,
  };

  const hasResults = counts.all > 0;
  const showLocations = category === "all" || category === "map";
  const showEvents = category === "all" || category === "tazeha";
  const visibleLocations = showLocations ? locations : [];
  const visibleEvents = showEvents ? events : [];

  return (
    <div className="bg-surface border border-border/50 rounded-xl shadow-sm p-2.5">
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
                "shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all",
                isActive
                  ? "border-primary bg-primary text-white shadow-sm shadow-primary/20"
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
          <div className="space-y-[3px]">
            {visibleLocations.map((loc) =>
              onLocationClick ? (
                <button
                  key={loc.slug}
                  type="button"
                  onClick={() => onLocationClick(loc)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-white dark:bg-white/5 border border-border/30 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] hover:shadow-[0_2px_8px_0_rgba(0,0,0,0.08)] hover:border-border/50 transition-all text-start"
                >
                  <div className="w-8 h-8 rounded-xl overflow-hidden bg-gradient-to-br from-primary/10 to-primary/[0.04] shrink-0 ring-1 ring-black/[0.04] dark:ring-white/[0.06]">
                    {loc.logo ? (
                      <img src={imgUrl(loc.logo)} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[11px] font-bold text-primary/70">
                        {loc.name.slice(0, 2)}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-sm font-medium text-text-primary block truncate leading-5">
                      {loc.name}
                    </span>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-black/[0.03] dark:bg-white/[0.05] flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-secondary/40 group-hover:text-primary/60 transition-colors">
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </div>
                </button>
              ) : (
                <Link
                  key={loc.slug}
                  href="/home/Injaro"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-white dark:bg-white/5 border border-border/30 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] hover:shadow-[0_2px_8px_0_rgba(0,0,0,0.08)] hover:border-border/50 transition-all group"
                >
                  <div className="w-8 h-8 rounded-xl overflow-hidden bg-gradient-to-br from-primary/10 to-primary/[0.04] shrink-0 ring-1 ring-black/[0.04] dark:ring-white/[0.06]">
                    {loc.logo ? (
                      <img src={imgUrl(loc.logo)} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[11px] font-bold text-primary/70">
                        {loc.name.slice(0, 2)}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-sm font-medium text-text-primary block truncate leading-5">
                      {loc.name}
                    </span>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-black/[0.03] dark:bg-white/[0.05] flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-secondary/40 group-hover:text-primary/60 transition-colors">
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
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
          <div className="space-y-[3px]">
            {visibleEvents.map((ev) => (
              <Link
                key={ev.slug}
                href={`/events/${ev.slug}`}
                className="flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-white dark:bg-white/5 border border-border/30 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] hover:shadow-[0_2px_8px_0_rgba(0,0,0,0.08)] hover:border-border/50 transition-all group"
              >
                <div className="w-8 h-8 rounded-xl overflow-hidden bg-gradient-to-br from-primary/10 to-primary/[0.04] shrink-0 ring-1 ring-black/[0.04] dark:ring-white/[0.06]">
                  {ev.thumbnail ? (
                    <img src={imgUrl(ev.thumbnail)} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-text-secondary/30">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                    </div>
                  )}
                </div>
                <span className="text-sm font-medium text-text-primary truncate flex-1 leading-5">{ev.title}</span>
                <div className="w-6 h-6 rounded-full bg-black/[0.03] dark:bg-white/[0.05] flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-secondary/40 group-hover:text-primary/60 transition-colors">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </div>
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


