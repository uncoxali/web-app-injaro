"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  getLandingEvents,
  getLandingLocations,
  type LandingEvent,
  type LandingLocation,
} from "@/lib/api/landing";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { imgUrl, toPersianDigits, cn } from "@/lib/utils";
import { isAuthenticated, loginUrl } from "@/lib/auth-utils";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "صبح بخیر";
  if (hour < 17) return "ظهر بخیر";
  if (hour < 21) return "عصر بخیر";
  return "شب بخیر";
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

function EventImage({ src, alt, className }: { src?: string; alt: string; className?: string }) {
  const url = imgUrl(src);
  if (!url) {
    return (
      <div className={cn("w-full h-full flex items-center justify-center bg-surface text-text-secondary/30", className)}>
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
      </div>
    );
  }
  return <img src={url} alt={alt} loading="lazy" className={cn("w-full h-full object-cover", className)} />;
}

function QuickActions() {
  const actions = [
    {
      label: "تازه‌ها",
      href: "/home/Tazeha",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      ),
      gradient: "from-orange-500 to-rose-500",
    },
    {
      label: "نقشه",
      href: "/home/Injaro",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      ),
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      label: "پروفایل",
      href: "/home/profile",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
      gradient: "from-violet-500 to-purple-500",
    },
  ];

  return (
    <motion.div variants={item} className="flex gap-3">
      {actions.map((action) => (
        <Link
          key={action.href}
          href={action.href}
          className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-surface border border-border/50 shadow-sm shadow-border/20 hover:border-primary/20 hover:shadow-md transition-all active:scale-95"
        >
          <div className={cn("w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-white shadow-sm", action.gradient)}>
            {action.icon}
          </div>
          <span className="text-[11px] font-medium text-text-secondary">{action.label}</span>
        </Link>
      ))}
    </motion.div>
  );
}

function FeaturedCard({ event }: { event: LandingEvent }) {
  return (
    <motion.div variants={item}>
      <Link href={`/events/${event.event_slug}`} className="block group">
        <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-surface shadow-sm">
          <EventImage src={event.thumbnail} alt={event.topic} className="group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-l from-primary/20 via-transparent to-transparent" />
          <div className="absolute bottom-0 inset-x-0 p-4">
            <div className="flex items-center gap-2 mb-2.5">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-white bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                ویژه
              </span>
            </div>
            <h2 className="text-lg font-bold text-white leading-snug line-clamp-2">
              {event.topic}
            </h2>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function EventCard({ event, index }: { event: LandingEvent; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
    >
      <Link
        href={`/events/${event.event_slug}`}
        className="block w-[150px] shrink-0 snap-start group"
      >
        <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-surface border border-border/50 shadow-sm shadow-border/20 group-hover:border-primary/25 group-hover:shadow-md transition-all">
          <EventImage src={event.thumbnail} alt={event.topic} className="group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
          <div className="absolute bottom-0 inset-x-0 p-3">
            <p className="text-xs font-semibold text-white leading-tight line-clamp-2 drop-shadow-sm">
              {event.topic}
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function MapPreview({
  locations,
  liveCount,
}: {
  locations: LandingLocation[];
  liveCount: number;
}) {
  const preview = locations.slice(0, 8);

  return (
    <motion.div variants={item}>
      <Link href="/home/Injaro" className="block group">
        <div className="rounded-2xl border border-border/50 bg-surface overflow-hidden shadow-sm shadow-border/20 group-hover:shadow-md group-hover:border-primary/20 transition-all">
          <div className="p-4 pb-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-sm font-bold text-text-primary">روی نقشه</h2>
                  <p className="text-[11px] text-text-secondary mt-0.5">
                    {toPersianDigits(locations.length)} مکان هنری
                    {liveCount > 0 && (
                      <span className="text-success me-1">
                        · {toPersianDigits(liveCount)} زنده
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <span className="shrink-0 text-xs font-medium text-primary bg-primary/8 px-3 py-1 rounded-full">
                مشاهده
              </span>
            </div>
          </div>

          <div className="px-4 pb-4 overflow-hidden">
            <div className="flex gap-2.5 overflow-x-auto scrollbar-none -mx-4 px-4">
              {preview.map((loc, i) => (
                <div
                  key={loc.slug}
                  className="shrink-0 flex flex-col items-center gap-1.5"
                >
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden border-2 border-border/40 bg-surface shadow-sm">
                    {loc.logo ? (
                      <img src={imgUrl(loc.logo)} alt={loc.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs font-bold text-text-secondary">
                        {loc.name.slice(0, 2)}
                      </div>
                    )}
                    {loc.is_live && (
                      <span className="absolute top-0.5 end-0.5 w-2.5 h-2.5 rounded-full bg-success ring-2 ring-background" />
                    )}
                  </div>
                  <span className="text-[9px] text-text-secondary font-medium text-center line-clamp-1 max-w-[56px]">
                    {loc.name}
                  </span>
                </div>
              ))}
              {locations.length > 8 && (
                <div className="shrink-0 flex flex-col items-center justify-center gap-1.5">
                  <div className="w-14 h-14 rounded-xl border-2 border-dashed border-border/60 flex items-center justify-center text-xs font-bold text-text-secondary bg-surface/50">
                    +{toPersianDigits(locations.length - 8)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function LiveMarquee({ locations }: { locations: LandingLocation[] }) {
  const liveLocations = locations.filter((l) => l.is_live);
  if (liveLocations.length === 0) return null;

  return (
    <motion.div variants={item}>
      <Link href="/home/Injaro" className="block">
        <div className="rounded-2xl bg-gradient-to-l from-success/10 via-success/5 to-transparent border border-success/15 p-3.5 overflow-hidden">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success" />
              </span>
              <span className="text-xs font-bold text-success">زنده</span>
            </div>
            <div className="flex gap-2 overflow-hidden flex-1">
              {liveLocations.slice(0, 5).map((loc) => (
                <span key={loc.slug} className="text-xs text-text-secondary whitespace-nowrap">
                  {loc.name}
                </span>
              ))}
              {liveLocations.length > 5 && (
                <span className="text-xs font-medium text-success whitespace-nowrap">
                  +{toPersianDigits(liveLocations.length - 5)} مکان دیگر
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function HomeSkeleton() {
  return (
    <div className="flex flex-col gap-6 px-4 pt-6 pb-6">
      <div className="flex gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex-1 h-20 rounded-2xl bg-gradient-to-r from-border/40 via-border/60 to-border/40 bg-[length:200%_100%] animate-shimmer" />
        ))}
      </div>
      <div className="aspect-[16/9] rounded-2xl bg-gradient-to-r from-border/40 via-border/60 to-border/40 bg-[length:200%_100%] animate-shimmer" />
      <div className="h-5 w-28 rounded-md bg-gradient-to-r from-border/40 via-border/60 to-border/40 bg-[length:200%_100%] animate-shimmer" />
      <div className="flex gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="w-[150px] aspect-[3/4] rounded-xl bg-gradient-to-r from-border/40 via-border/60 to-border/40 bg-[length:200%_100%] animate-shimmer shrink-0" />
        ))}
      </div>
      <div className="h-40 rounded-2xl bg-gradient-to-r from-border/40 via-border/60 to-border/40 bg-[length:200%_100%] animate-shimmer" />
    </div>
  );
}

export default function HomePage() {
  const [events, setEvents] = useState<LandingEvent[]>([]);
  const [locations, setLocations] = useState<LandingLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [guest, setGuest] = useState(true);

  const fetchData = useCallback(() => {
    setLoading(true);
    setError(false);
    Promise.all([getLandingEvents(), getLandingLocations()])
      .then(([ev, loc]) => {
        setEvents(ev);
        setLocations(loc);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchData();
    setGuest(!isAuthenticated());
  }, [fetchData]);

  const [featured, ...rest] = events;
  const liveCount = useMemo(
    () => locations.filter((l) => l.is_live).length,
    [locations]
  );

  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <div className="sticky top-0 z-10 bg-gradient-to-b from-background to-background/95 backdrop-blur-md border-b border-border/20 px-4 pt-3 pb-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-sm shadow-primary/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <div>
              <p className="text-[11px] text-text-secondary font-medium">{getGreeting()}</p>
              <h1 className="text-base font-bold text-text-primary -mt-0.5">
                اینجارو
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {guest ? (
              <Link
                href={loginUrl("/home")}
                className="text-xs font-semibold text-white bg-primary px-4 py-1.5 rounded-full shadow-sm shadow-primary/20 hover:shadow-md hover:shadow-primary/30 transition-all"
              >
                ورود / ثبت‌نام
              </Link>
            ) : (
              <Link
                href="/home/profile"
                className="w-8 h-8 rounded-full bg-surface border border-border/50 flex items-center justify-center text-xs font-bold text-primary hover:border-primary/30 transition-colors"
              >
                {String.fromCodePoint(0x1F464)}
              </Link>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <HomeSkeleton />
      ) : error ? (
        <div className="flex-1 flex items-center justify-center px-4">
          <ErrorState onRetry={fetchData} />
        </div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-5 px-4 pt-5 pb-6"
        >
          <QuickActions />

          {liveCount > 0 && <LiveMarquee locations={locations} />}

          {featured && <FeaturedCard event={featured} />}

          {rest.length > 0 && (
            <motion.section variants={item}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-5 rounded-full bg-primary" />
                  <h2 className="text-sm font-bold text-text-primary">رویدادهای جدید</h2>
                </div>
                <Link
                  href="/home/Tazeha"
                  className="text-xs font-semibold text-primary"
                >
                  مشاهده همه
                </Link>
              </div>
              <div
                className="flex gap-3 overflow-x-auto scrollbar-none -mx-4 px-4 pb-1"
                style={{ scrollSnapType: "x mandatory" }}
              >
                {rest.map((event, i) => (
                  <EventCard key={event.event_slug} event={event} index={i} />
                ))}
              </div>
            </motion.section>
          )}

          {locations.length > 0 && <MapPreview locations={locations} liveCount={liveCount} />}

          {events.length === 0 && locations.length === 0 && (
            <motion.div variants={item}>
              <EmptyState
                title="محتوایی یافت نشد"
                description="در حال حاضر محتوایی برای نمایش وجود ندارد"
              />
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}
