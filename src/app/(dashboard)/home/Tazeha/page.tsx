"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type TazehaResponse, type TazehaItem } from "@/lib/api/tazeha";
import { type LandingEvent, type LandingLocation } from "@/lib/api/landing";
import { useLandingEvents, useLandingLocations } from "@/lib/queries/landing";
import { useTazeha } from "@/lib/queries/tazeha";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { ExpandableSearchBar } from "@/components/search/expandable-search-bar";
import { UnifiedSearchResults } from "@/components/search/unified-search-results";
import { isAuthenticated, loginUrl } from "@/lib/auth-utils";
import { DateSlider, generateDays, persianToGregorian, type DayOption } from "@/components/tazeha/date-slider";
import { TazehaVirtualGrid } from "@/components/tazeha/tazeha-virtual-grid";
import { useMapStore } from "@/store/map";
import type { ReactNode } from "react";
import { toPersianDigits, cn } from "@/lib/utils";
import { OptimizedImage } from "@/components/ui/optimized-image";

const SECTION_CONFIG: Record<
  string,
  { label: string; gradient: string; icon: ReactNode }
> = {
  live_events: {
    label: "زنده",
    gradient: "from-rose-500 to-red-600",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </svg>
    ),
  },
  future_events: {
    label: "آینده",
    gradient: "from-sky-500 to-blue-600",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  popular_events: {
    label: "محبوب",
    gradient: "from-amber-400 to-orange-500",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
  all_events: {
    label: "همه",
    gradient: "from-slate-600 to-slate-800",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
};

function getSlug(item: TazehaItem): string {
  return item.event_slug || item.topic || String(item.id || "");
}

function getTitle(item: TazehaItem): string {
  return item.event_name || item.topic || "";
}

function getImage(item: TazehaItem): string {
  return item.thumbnail || item.image_url || "";
}

function landingToItem(event: LandingEvent): TazehaItem {
  return {
    event_slug: event.event_slug,
    topic: event.topic,
    thumbnail: event.thumbnail,
    event_name: event.topic,
  };
}

function LiveDot() {
  return (
    <span className="relative flex h-1.5 w-1.5">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/70" />
      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
    </span>
  );
}

function FilterPill({
  config,
  isActive,
  count,
  onClick,
}: {
  config: (typeof SECTION_CONFIG)[string];
  isActive: boolean;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border transition-all active:scale-[0.92]",
        isActive
          ? `border-transparent text-white shadow-lg bg-linear-to-br ${config.gradient}`
          : "bg-surface border-border/30 text-text-secondary hover:border-border/60"
      )}
    >
      {isActive && (
        <span className={cn("bg-linear-to-br rounded-full p-1", config.gradient)}>
          {config.icon}
        </span>
      )}
      {!isActive && (
        <span className="text-text-secondary/60">{config.icon}</span>
      )}
      <span className="text-sm font-semibold whitespace-nowrap">
        {config.label}
      </span>
      <span
        className={cn(
          "text-[10px] font-bold px-2 py-0.5 rounded-full leading-none transition-all",
          isActive
            ? "bg-white/20 text-white"
            : "bg-surface/80 text-text-secondary/70"
        )}
      >
        {toPersianDigits(count)}
      </span>
    </button>
  );
}

function EventCard({
  item,
  sectionKey,
}: {
  item: TazehaItem;
  sectionKey: string;
}) {
  const slug = getSlug(item);
  const title = getTitle(item);
  const isLive = sectionKey === "live_events";

  return (
    <Link
      href={`/events/${slug}`}
      className="block rounded-2xl overflow-hidden bg-surface border border-border/30 shadow-xs group active:scale-[0.97] transition-transform"
    >
      <div className="relative w-full aspect-4/5 overflow-hidden">
        <OptimizedImage
          src={getImage(item)}
          alt={title}
          fill
          sizes="(max-width: 480px) 45vw, 200px"
          className="group-hover:scale-105 transition-transform duration-500"
        />
          {isLive && (
            <div className="absolute top-2.5 inset-s-2.5 flex items-center gap-1.5 rounded-full bg-success px-2.5 py-1 text-[9px] font-bold text-white shadow-xs backdrop-blur-[2px]">
              <LiveDot />
              زنده
            </div>
          )}
        </div>
        <div className="p-3">
          <p className="text-xs font-semibold text-text-primary leading-snug line-clamp-2">
            {title}
          </p>
        </div>
      </Link>
  );
}

function GuestPrompt() {
  return (
    <div className="rounded-2xl bg-linear-to-br from-primary/7 to-background border border-primary/15 p-4 mb-4">
      <div className="flex items-center gap-3">
        <div className="shrink-0 w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center text-primary shadow-xs">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-text-primary">ورود به حساب</p>
          <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
            برای دیدن همه رویدادها و ذخیره کردن، وارد شوید.
          </p>
        </div>
        <Link
          href={loginUrl("/home/Tazeha")}
          className="shrink-0 text-xs font-semibold text-white bg-primary px-4 py-2.5 rounded-full shadow-xs shadow-primary/20"
        >
          ورود
        </Link>
      </div>
    </div>
  );
}

export default function TazehaPage() {
  const router = useRouter();
  const setMapSearchQuery = useMapStore((s) => s.setMapSearchQuery);
  const [guest, setGuest] = useState(true);
  const { data: landingEvents, isLoading: landingLoading } = useLandingEvents();
  const { data: locations = [] } = useLandingLocations();
  const [activeSection, setActiveSection] = useState("all_events");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [days, setDays] = useState<DayOption[]>([]);

  const gregDate = selectedDate ? persianToGregorian(selectedDate) : undefined;
  const {
    data: tazehaData,
    isLoading: tazehaLoading,
    isError: tazehaError,
    refetch: refetchTazeha,
  } = useTazeha(gregDate, !guest);

  const data: TazehaResponse | null = guest
    ? landingEvents
      ? { all_events: landingEvents.map(landingToItem) }
      : null
    : tazehaData ?? null;

  const loading = guest ? landingLoading : tazehaLoading;
  const error = guest ? false : tazehaError;

  useEffect(() => {
    const d = generateDays(14);
    setDays(d);
    setSelectedDate(d[0]?.date || "");
    setGuest(!isAuthenticated());
  }, []);

  const handleDateChange = useCallback((date: string) => {
    setSelectedDate(date);
  }, []);

  const handleLocationSelect = useCallback(
    (loc: { name: string }) => {
      setMapSearchQuery(loc.name);
      router.push("/home/Injaro");
    },
    [router, setMapSearchQuery]
  );

  const sections = useMemo(() => {
    if (!data) return [];

    const result: {
      key: string;
      label: string;
      gradient: string;
      icon: ReactNode;
      items: TazehaItem[];
    }[] = [];

    for (const [key, items] of Object.entries(data)) {
      const arr = items as TazehaItem[] | undefined;
      if (key === "all_events" || !arr?.length) continue;

      const meta = SECTION_CONFIG[key];
      if (meta) {
        result.push({ key, items: arr, ...meta });
      } else {
        result.push({
          key,
          label: key,
          gradient: "from-primary/80 to-primary/60",
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          ),
          items: arr,
        });
      }
    }

    if (guest) {
      const guestItems = data.all_events as TazehaItem[] | undefined;
      if (guestItems?.length) {
        result.push({ key: "all_events", ...SECTION_CONFIG["all_events"], items: guestItems });
      }
    } else if (result.length > 0) {
      const seen = new Set<string>();
      const combined = result.flatMap((s) => s.items).filter((item) => {
        const slug = item.event_slug || item.topic || String(item.id || "");
        if (seen.has(slug)) return false;
        seen.add(slug);
        return true;
      });
      result.push({ key: "all_events", ...SECTION_CONFIG["all_events"], items: combined });
    }

    return result;
  }, [data, guest]);

  useEffect(() => {
    if (sections.length > 0) {
      const exists = sections.find((s) => s.key === activeSection);
      if (!exists) {
        setActiveSection(sections[0].key);
      }
    }
  }, [sections, activeSection]);

  const activeItems = useMemo(() => {
    const section = sections.find((s) => s.key === activeSection);
    return section?.items || [];
  }, [sections, activeSection]);

  const allEventsForSearch = useMemo(() => {
    const seen = new Set<string>();
    return sections.flatMap((s) => s.items).filter((item) => {
      const slug = getSlug(item);
      if (!slug || seen.has(slug)) return false;
      seen.add(slug);
      return true;
    });
  }, [sections]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return { events: [] as { slug: string; title: string; thumbnail?: string }[], locations: [] as LandingLocation[] };
    }
    const q = searchQuery.trim().toLowerCase();
    return {
      events: allEventsForSearch
        .filter((item) => getTitle(item).toLowerCase().includes(q))
        .map((item) => ({
          slug: getSlug(item),
          title: getTitle(item),
          thumbnail: getImage(item),
        })),
      locations: locations.filter((loc) => loc.name.toLowerCase().includes(q)),
    };
  }, [searchQuery, allEventsForSearch, locations]);

  return (
    <div className="flex flex-col min-h-dvh overflow-x-hidden">
      <div className="sticky top-0 z-10 bg-background/60 backdrop-blur-2xl border-b border-border/10">
        <div className="px-4 pt-3 pb-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3 flex-1">
              {!searchOpen && (
                <div>
                  <h1 className="text-lg font-bold text-text-primary leading-tight">تازه‌ها</h1>
                  <p className="text-[10px] text-text-secondary/60 leading-tight -mt-0.5">
                    رویدادهای روز
                  </p>
                </div>
              )}
              <div className={cn("flex items-center gap-2", searchOpen ? "flex-1" : "mr-auto")}>
                <ExpandableSearchBar
                  open={searchOpen}
                  onOpenChange={setSearchOpen}
                  query={searchQuery}
                  onQueryChange={setSearchQuery}
                />
                {!searchOpen && guest && (
                  <Link
                    href={loginUrl("/home/Tazeha")}
                    className="text-xs font-semibold text-white bg-primary px-4 py-2 rounded-full shadow-xs shadow-primary/20"
                  >
                    ورود
                  </Link>
                )}
              </div>
            </div>
          </div>

              {!searchOpen && (
                <>
                  {!loading && days.length > 0 && (
                    <div className="mb-4">
                      <DateSlider
                        days={days}
                        selected={selectedDate}
                        onSelect={handleDateChange}
                      />
                    </div>
                  )}

              {!loading && sections.length > 1 && (
                <div className="flex gap-2 overflow-x-auto scrollbar-none">
                  {sections.map((section) => (
                    <FilterPill
                      key={section.key}
                      config={section}
                      isActive={activeSection === section.key}
                      count={section.items.length}
                      onClick={() => setActiveSection(section.key)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="flex-1 px-4 pt-4 pb-6">
        {searchOpen && searchQuery.trim() ? (
          <UnifiedSearchResults
            query={searchQuery}
            events={searchResults.events}
            locations={searchResults.locations}
            onLocationClick={handleLocationSelect}
          />
        ) : loading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="aspect-3/4 rounded-2xl bg-linear-to-r from-border/30 via-border/50 to-border/30 bg-size-[200%_100%] animate-shimmer"
              />
            ))}
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center py-16">
            <ErrorState onRetry={() => refetchTazeha()} />
          </div>
        ) : activeItems.length === 0 ? (
          <div className="flex-1 flex items-center justify-center py-16">
            <EmptyState
              title="رویدادی یافت نشد"
              description="در حال حاضر رویدادی برای نمایش وجود ندارد."
            />
          </div>
        ) : (
          <div key={activeSection} className="flex flex-col gap-4">
            {guest && <GuestPrompt />}
            <TazehaVirtualGrid
              items={activeItems}
              renderCard={(item) => (
                <EventCard
                  key={item.event_slug || item.id || getSlug(item)}
                  item={item}
                  sectionKey={activeSection}
                />
              )}
            />
          </div>
        )}
      </div>
    </div>
  );
}
