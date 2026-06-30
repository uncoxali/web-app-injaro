"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  type LandingEvent,
  type LandingLocation,
} from "@/lib/api/landing";
import { useLandingEvents, useLandingLocations } from "@/lib/queries/landing";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { UnifiedSearchResults } from "@/components/search/unified-search-results";
import { useMapStore } from "@/store/map";
import { imgUrl, toPersianDigits } from "@/lib/utils";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { isAuthenticated } from "@/lib/auth-utils";

function EventImage({
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
      sizes={priority ? "(max-width: 480px) 100vw, 480px" : "(max-width: 480px) 45vw, 200px"}
      className="w-full h-full"
    />
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } },
};

function TopBar({
  searchOpen,
  searchQuery,
  onSearchQueryChange,
  onSearchClose,
  onSearchClick,
  searchInputRef,
}: {
  searchOpen: boolean;
  searchQuery: string;
  onSearchQueryChange: (v: string) => void;
  onSearchClose: () => void;
  onSearchClick: () => void;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
}) {
  return (
    <div className="bg-background/60 backdrop-blur-2xl border-b border-border/40 shadow-xs">
      <div className="flex items-center justify-between gap-3 px-5 pt-5 pb-2">
        <div className="flex items-center gap-2.5">
          <Image src="/icons/icon.png" alt="" width={36} height={36} className="w-9 h-9" />
          <div>
            <span className="text-[10px] text-text-secondary">خوش آمدید</span>
            <h1 className="text-lg font-bold tracking-tight text-text-primary leading-none">اینجارو</h1>
          </div>
        </div>
        {searchOpen && (
          <div className="flex items-center gap-2 flex-1 max-w-[400px]">
            <input
              ref={searchInputRef}
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              placeholder="جستجو..."
              className="flex-1 h-9 rounded-xl bg-surface border border-border/50 px-3 text-sm text-text-primary placeholder:text-text-secondary/50 outline-hidden focus:border-primary/50 transition-colors min-w-0"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchQueryChange("")}
                aria-label="پاک کردن"
                className="text-text-secondary hover:text-text-primary transition-colors shrink-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        )}
        {searchOpen ? (
          <button
            onClick={onSearchClose}
            aria-label="بستن"
            className="text-text-secondary hover:text-text-primary transition-colors shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        ) : (
          <button
            onClick={onSearchClick}
            aria-label="جستجو"
            className="w-9 h-9 flex items-center justify-center rounded-full bg-surface border border-border/50 hover:border-primary/30 transition-colors shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-secondary">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.3-4.3" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

function HeroSection({ event }: { event: LandingEvent }) {
  return (
    <motion.div variants={fadeUp} className="px-5 pt-2">
      <Link href={`/events/${event.event_slug}`} className="block group">
        <div className="relative aspect-4/3 rounded-3xl overflow-hidden bg-gray-100 dark:bg-gray-800 shadow-lg shadow-black/5">
          <EventImage src={event.thumbnail} alt={event.topic} priority />
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <span className="inline-block text-[11px] font-semibold text-white/80 bg-white/20 backdrop-blur-xs px-2.5 py-1 rounded-full mb-2.5">
              ویژه
            </span>
            <h2 className="text-2xl font-bold text-white leading-tight drop-shadow-xs">
              {event.topic}
            </h2>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}



function LiveBadge({ liveCount }: { liveCount: number }) {
  if (liveCount === 0) return null;

  return (
    <motion.div variants={fadeUp} className="px-5">
      <Link href="/home/Injaro">
        <div className="flex items-center gap-2.5 py-3 px-4 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-60" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
          </span>
          <span className="text-sm font-medium text-red-600 dark:text-red-400">
            {toPersianDigits(liveCount)} مکان در حال پخش
          </span>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mr-auto text-red-400">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </div>
      </Link>
    </motion.div>
  );
}

function EventsSection({ events }: { events: LandingEvent[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const scrollRaf = useRef<number | null>(null);

  const handleScroll = useCallback(() => {
    if (scrollRaf.current !== null) return;
    scrollRaf.current = requestAnimationFrame(() => {
      scrollRaf.current = null;
      const el = scrollRef.current;
      if (!el) return;
      const center = el.scrollLeft + el.clientWidth / 2;
      let closest = 0;
      let minDist = Infinity;
      itemRefs.current.forEach((item, i) => {
        if (!item) return;
        const itemCenter = item.offsetLeft + item.offsetWidth / 2;
        const dist = Math.abs(center - itemCenter);
        if (dist < minDist) {
          minDist = dist;
          closest = i;
        }
      });
      setActiveIdx(closest);
    });
  }, []);

  if (events.length === 0) return null;

  return (
    <motion.section variants={fadeUp} className="px-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">رویدادهای در حال برگزاری</h2>
        <Link href="/home/Tazeha" className="text-sm font-medium text-primary">
          مشاهده همه
        </Link>
      </div>
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-3 overflow-x-auto scrollbar-none -mx-5 px-5 pb-2"
      >
        {events.map((event, i) => {
          const isActive = i === activeIdx;
          return (
            <Link
              key={event.event_slug}
              ref={(el) => { itemRefs.current[i] = el; }}
              href={`/events/${event.event_slug}`}
              className={`shrink-0 transition-all duration-300 ${
                isActive ? "w-[180px]" : "w-[130px]"
              }`}
            >
              <div className={`relative rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 transition-all duration-300 ${
                isActive ? "aspect-3/4 shadow-lg shadow-black/10" : "aspect-2/3"
              }`}>
                <EventImage src={event.thumbnail} alt={event.topic} />
                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-xs font-semibold text-white leading-snug line-clamp-2 drop-shadow-xs">
                    {event.topic}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </motion.section>
  );
}

function LocationPin({ location, isActive }: { location: LandingLocation; isActive: boolean }) {
  const id = `pin-${location.slug}`;
  const w = isActive ? 72 : 52;
  const h = isActive ? 88 : 64;
  const cr = isActive ? 11 : 9;
  const imgSize = isActive ? 22 : 18;
  const imgOffset = (42 - imgSize) / 2;
  return (
    <svg width={w} height={h} viewBox="0 0 42 50" fill="none" className="transition-all duration-300">
      <defs>
        <clipPath id={`pc-${id}`}>
          <circle cx="21" cy="15" r={cr} />
        </clipPath>
      </defs>
      <path
        d="M21 1C12.72 1 6 7.72 6 16c0 10.5 15 33 15 33s15-22.5 15-33c0-8.28-6.72-15-15-15z"
        fill={isActive ? "#ff5a5f" : "#ffffff"}
        stroke={isActive ? "#ff5a5f" : "#d1d5db"}
        strokeWidth="1.5"
      />
      <circle
        cx="21"
        cy="15"
        r={cr}
        fill={isActive ? "#ffffff" : "#f3f4f6"}
        stroke={isActive ? "#ff5a5f" : "#d1d5db"}
        strokeWidth="1.5"
      />
      {location.logo ? (
        <image
          href={imgUrl(location.logo)}
          x={imgOffset}
          y={15 - imgSize / 2}
          width={imgSize}
          height={imgSize}
          clipPath={`url(#pc-${id})`}
          preserveAspectRatio="xMidYMid slice"
        />
      ) : null}
    </svg>
  );
}

function MapSection({ locations, liveCount }: { locations: LandingLocation[]; liveCount: number }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const scrollRaf = useRef<number | null>(null);

  const handleScroll = useCallback(() => {
    if (scrollRaf.current !== null) return;
    scrollRaf.current = requestAnimationFrame(() => {
      scrollRaf.current = null;
      const el = scrollRef.current;
      if (!el) return;
      const center = el.scrollLeft + el.clientWidth / 2;
      let closest = 0;
      let minDist = Infinity;
      itemRefs.current.forEach((item, i) => {
        if (!item) return;
        const itemCenter = item.offsetLeft + item.offsetWidth / 2;
        const dist = Math.abs(center - itemCenter);
        if (dist < minDist) {
          minDist = dist;
          closest = i;
        }
      });
      setActiveIdx(closest);
    });
  }, []);

  const preview = locations.slice(0, 8);

  return (
    <motion.div variants={fadeUp} className="px-5 pb-28">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">مکان‌های نزدیک شما</h2>
        <Link href="/home/Injaro" className="text-sm font-medium text-primary">
          مشاهده همه
        </Link>
      </div>
      <Link href="/home/Injaro" className="block">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-surface/50">
          <div className="p-4 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-text-primary">{toPersianDigits(locations.length)} مکان</span>
              </div>
              {liveCount > 0 && (
                <span className="text-xs font-medium text-white bg-primary px-2 py-1 rounded-full shadow-xs shadow-primary/20">
                  {toPersianDigits(liveCount)} زنده
                </span>
              )}
            </div>
          </div>
          <div className="px-4 pb-4">
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex items-end gap-4 overflow-x-auto scrollbar-none -mx-4 px-4"
          >
            {preview.map((loc, i) => {
              const isActive = i === activeIdx;
              return (
                <div
                  key={loc.slug}
                  ref={(el) => { itemRefs.current[i] = el; }}
                  className="shrink-0 flex flex-col items-center gap-1.5"
                >
                  <LocationPin location={loc} isActive={isActive} />
                  <span className={`font-medium text-center line-clamp-1 max-w-[72px] ${
                    isActive ? "text-xs text-text-primary" : "text-[10px] text-text-secondary"
                  }`}>
                    {loc.name}
                  </span>
                </div>
              );
            })}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function Skeleton() {
  return (
    <div className="flex flex-col gap-5 px-5 pt-5">
      <div className="flex items-center justify-between">
        <div className="h-7 w-24 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
        <div className="flex gap-2">
          <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" />
          <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" />
        </div>
      </div>
      <div className="aspect-4/3 rounded-3xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-10 w-20 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" />
        ))}
      </div>
      <div className="h-5 w-32 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
      <div className="flex gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="w-[140px] aspect-2/3 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse shrink-0" />
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const setMapSearchQuery = useMapStore((s) => s.setMapSearchQuery);
  const {
    data: events = [],
    isLoading: eventsLoading,
    isError: eventsError,
    refetch: refetchEvents,
  } = useLandingEvents();
  const {
    data: locations = [],
    isLoading: locationsLoading,
    isError: locationsError,
    refetch: refetchLocations,
  } = useLandingLocations();
  const loading = eventsLoading || locationsLoading;
  const error = eventsError || locationsError;
  const [guest, setGuest] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return {
        events: [] as { slug: string; title: string; thumbnail?: string }[],
        locations: [] as LandingLocation[],
      };
    }
    const q = searchQuery.trim().toLowerCase();
    return {
      events: events
        .filter((ev) => ev.topic.toLowerCase().includes(q))
        .map((ev) => ({ slug: ev.event_slug, title: ev.topic, thumbnail: ev.thumbnail })),
      locations: locations.filter((loc) => loc.name.toLowerCase().includes(q)),
    };
  }, [searchQuery, events, locations]);

  const handleLocationSelect = useCallback(
    (loc: { name: string }) => {
      setMapSearchQuery(loc.name);
      router.push("/home/Injaro");
    },
    [router, setMapSearchQuery]
  );

  const handleSearchOpen = useCallback(() => {
    setSearchOpen(true);
    setTimeout(() => searchInputRef.current?.focus(), 100);
  }, []);

  const handleSearchClose = useCallback(() => {
    setSearchOpen(false);
    setSearchQuery("");
  }, []);

  const fetchData = useCallback(() => {
    void refetchEvents();
    void refetchLocations();
  }, [refetchEvents, refetchLocations]);

  useEffect(() => {
    setGuest(!isAuthenticated());
  }, []);

  const [featured, ...rest] = events;
  const liveCount = useMemo(
    () => locations.filter((l) => l.is_live).length,
    [locations]
  );

  const hasContent = events.length > 0 || locations.length > 0;

  if (loading) return <Skeleton />;

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center px-5">
        <ErrorState onRetry={fetchData} />
      </div>
    );
  }

  if (!hasContent) {
    return (
      <div className="flex-1 flex items-center justify-center px-5">
        <EmptyState title="خوش آمدید" description="به زودی رویدادها اضافه می‌شوند" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-dvh">
      <TopBar
        searchOpen={searchOpen}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        onSearchClose={handleSearchClose}
        onSearchClick={handleSearchOpen}
        searchInputRef={searchInputRef}
      />
      {searchOpen && searchQuery.trim() && (
        <div className="px-5 pb-4 mt-3">
          <UnifiedSearchResults
            query={searchQuery}
            events={searchResults.events}
            locations={searchResults.locations}
            onLocationClick={handleLocationSelect}
          />
        </div>
      )}

      <motion.div
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-6 pt-3"
      >
        {featured && <HeroSection event={featured} />}

        <LiveBadge liveCount={liveCount} />

        <EventsSection events={rest} />

        {locations.length > 0 && <MapSection locations={locations} liveCount={liveCount} />}
      </motion.div>
    </div>
  );
}
