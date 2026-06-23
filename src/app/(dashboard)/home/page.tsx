"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  getLandingEvents,
  getLandingLocations,
  type LandingEvent,
  type LandingLocation,
} from "@/lib/api/landing";
import { ErrorState } from "@/components/ui/error-state";
import { imgUrl, toPersianDigits } from "@/lib/utils";
import { isAuthenticated, loginUrl } from "@/lib/auth-utils";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "صبح بخیر";
  if (hour < 17) return "ظهر بخیر";
  if (hour < 21) return "عصر بخیر";
  return "شب بخیر";
}

function EventImage({ src, alt }: { src?: string; alt: string }) {
  const url = imgUrl(src);
  if (!url) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-surface text-text-secondary/30">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
      </div>
    );
  }
  return (
    <img src={url} alt={alt} loading="lazy" className="w-full h-full object-cover" />
  );
}

function FeaturedCard({ event }: { event: LandingEvent }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Link href={`/events/${event.event_slug}`} className="block">
        <div className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-border shadow-sm">
          <EventImage src={event.thumbnail} alt={event.topic} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-0 inset-x-0 p-4">
            <span className="inline-block text-[10px] font-medium text-white/80 bg-white/15 backdrop-blur-sm px-2 py-0.5 rounded-full mb-2">
              ویژه
            </span>
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
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
    >
      <Link
        href={`/events/${event.event_slug}`}
        className="block w-[140px] shrink-0 snap-start"
      >
        <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-surface border border-border group">
          <EventImage src={event.thumbnail} alt={event.topic} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
          <div className="absolute bottom-0 inset-x-0 p-2">
            <p className="text-[11px] font-medium text-white leading-tight line-clamp-2">
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
  const preview = locations.slice(0, 6);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.4 }}
    >
      <Link href="/home/Injaro" className="block">
        <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/5 via-surface to-background p-4 overflow-hidden">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h2 className="text-base font-bold text-text-primary">روی نقشه</h2>
              <p className="text-xs text-text-secondary mt-0.5">
                {toPersianDigits(locations.length)} مکان هنری در تهران
                {liveCount > 0 && (
                  <span className="text-success ms-1">
                    · {toPersianDigits(liveCount)} زنده
                  </span>
                )}
              </p>
            </div>
            <span className="shrink-0 flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">
              نقشه
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </span>
          </div>

          <div className="flex gap-2 overflow-hidden">
            {preview.map((loc) => (
              <div
                key={loc.slug}
                className="relative shrink-0 w-12 h-12 rounded-xl overflow-hidden border border-border bg-white"
              >
                {loc.logo ? (
                  <img
                    src={imgUrl(loc.logo)}
                    alt={loc.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] text-text-secondary">
                    {loc.name.slice(0, 2)}
                  </div>
                )}
                {loc.is_live && (
                  <span className="absolute top-0.5 end-0.5 w-2 h-2 rounded-full bg-success ring-2 ring-white" />
                )}
              </div>
            ))}
            {locations.length > 6 && (
              <div className="shrink-0 w-12 h-12 rounded-xl border border-dashed border-border flex items-center justify-center text-[10px] text-text-secondary font-medium">
                +{toPersianDigits(locations.length - 6)}
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function HomeSkeleton() {
  return (
    <div className="flex flex-col gap-6 px-4 pt-6 pb-6">
      <div className="h-8 w-40 rounded-lg bg-surface animate-pulse" />
      <div className="aspect-[16/10] rounded-2xl bg-surface animate-pulse" />
      <div className="h-5 w-28 rounded-md bg-surface animate-pulse" />
      <div className="flex gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="w-[140px] aspect-[3/4] rounded-xl bg-surface animate-pulse shrink-0" />
        ))}
      </div>
      <div className="h-32 rounded-2xl bg-surface animate-pulse" />
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
  const liveCount = locations.filter((l) => l.is_live).length;

  return (
    <div className="flex flex-col min-h-dvh">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm px-4 pt-6 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-text-secondary">{getGreeting()}</p>
            <h1 className="text-xl font-bold text-text-primary mt-0.5">
              اینجارو
            </h1>
          </div>
          {guest && (
            <Link
              href={loginUrl("/home")}
              className="shrink-0 text-xs font-medium text-primary bg-primary/10 px-3 py-1.5 rounded-full"
            >
              ورود
            </Link>
          )}
        </div>
      </div>

      {loading ? (
        <HomeSkeleton />
      ) : error ? (
        <div className="flex-1 flex items-center justify-center px-4">
          <ErrorState onRetry={fetchData} />
        </div>
      ) : (
        <div className="flex flex-col gap-6 px-4 pb-6">
          {featured && <FeaturedCard event={featured} />}

          {rest.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-5 rounded-full bg-primary" />
                  <h2 className="text-base font-bold text-text-primary">
                    رویدادهای جدید
                  </h2>
                </div>
                <Link
                  href="/home/Tazeha"
                  className="text-xs font-medium text-primary"
                >
                  همه
                </Link>
              </div>
              <div
                className="flex gap-3 overflow-x-auto scrollbar-none -mx-4 px-4"
                style={{ scrollSnapType: "x mandatory" }}
              >
                {rest.map((event, i) => (
                  <EventCard key={event.event_slug} event={event} index={i} />
                ))}
              </div>
            </section>
          )}

          {locations.length > 0 && (
            <MapPreview locations={locations} liveCount={liveCount} />
          )}

          {events.length === 0 && locations.length === 0 && (
            <div className="flex-1 flex items-center justify-center py-12">
              <p className="text-sm text-text-secondary">محتوایی یافت نشد</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
