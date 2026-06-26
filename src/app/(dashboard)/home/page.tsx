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
import { ThemeToggle } from "@/components/theme-toggle";
import { imgUrl, toPersianDigits, cn } from "@/lib/utils";
import { isAuthenticated, loginUrl } from "@/lib/auth-utils";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "صبح بخیر";
  if (hour < 17) return "ظهر بخیر";
  if (hour < 21) return "عصر بخیر";
  return "شب بخیر";
}

function EventImage({ src, alt, className }: { src?: string; alt: string; className?: string }) {
  const url = imgUrl(src);
  if (!url) {
    return (
      <div className={cn("w-full h-full flex items-center justify-center bg-surface", className)}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-text-secondary/25">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
      </div>
    );
  }
  return <img src={url} alt={alt} loading="lazy" className={cn("w-full h-full object-cover", className)} />;
}

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } },
};

const CATEGORIES = ["موزیک", "تئاتر", "هنر", "ورزش", "آموزش", "غذا"] as const;

function SectionHeader({
  title,
  count,
  href,
}: {
  title: string;
  count?: number;
  href?: string;
}) {
  return (
    <div className="flex items-end justify-between mb-4">
      <div>
        <h2 className="text-[15px] font-semibold text-text-primary tracking-tight">{title}</h2>
        {count !== undefined && (
          <p className="text-[11px] text-text-secondary mt-0.5">
            {toPersianDigits(count)} مورد
          </p>
        )}
      </div>
      {href && (
        <Link href={href} className="text-[11px] font-medium text-text-secondary hover:text-text-primary transition-colors pb-0.5 border-b border-border/60">
          مشاهده همه
        </Link>
      )}
    </div>
  );
}

function TopBar({ guest }: { guest: boolean }) {
  return (
    <header className="sticky top-0 z-20 bg-background/90 backdrop-blur-md border-b border-border/40">
      <div className="px-5 pt-4 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] text-text-secondary font-medium">{getGreeting()}</p>
            <h1 className="text-2xl font-bold text-text-primary tracking-tight mt-0.5">اینجارو</h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {guest ? (
              <Link
                href={loginUrl("/home")}
                className="text-xs font-medium text-text-primary border border-border px-4 py-2 rounded-full hover:bg-surface transition-colors"
              >
                ورود
              </Link>
            ) : (
              <Link
                href="/home/profile"
                className="w-9 h-9 rounded-full flex items-center justify-center border border-border text-text-secondary hover:text-text-primary hover:bg-surface transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </Link>
            )}
          </div>
        </div>

        <Link
          href="/home/Tazeha"
          className="mt-4 flex items-center gap-3 w-full px-4 py-3 rounded-xl border border-border/60 text-text-secondary hover:border-border hover:bg-surface/50 transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="shrink-0 opacity-40">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <span className="text-sm">جستجوی رویدادها</span>
        </Link>
      </div>
    </header>
  );
}

function GuestBanner() {
  return (
    <motion.div variants={fadeUp} className="mx-5">
      <div className="flex items-center justify-between gap-4 py-3.5 px-4 rounded-xl border border-border/60">
        <p className="text-xs text-text-secondary leading-relaxed">
          برای ذخیره رویدادها وارد حساب شوید
        </p>
        <Link
          href={loginUrl("/home")}
          className="shrink-0 text-xs font-medium text-primary"
        >
          ورود
        </Link>
      </div>
    </motion.div>
  );
}

function HeroSection({ event }: { event: LandingEvent }) {
  return (
    <motion.section variants={fadeUp} className="px-5">
      <Link href={`/events/${event.event_slug}`} className="block group">
        <div className="relative aspect-[5/4] rounded-2xl overflow-hidden bg-surface">
          <EventImage
            src={event.thumbnail}
            alt={event.topic}
            className="group-hover:scale-[1.02] transition-transform duration-500 ease-out"
          />
          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/25 transition-colors" />
          <div className="absolute inset-0 flex flex-col justify-end p-5">
            <span className="text-[10px] font-medium tracking-widest uppercase text-white/60 mb-2">
              رویداد ویژه
            </span>
            <h2 className="text-xl font-bold text-white leading-snug line-clamp-2">
              {event.topic}
            </h2>
          </div>
        </div>
      </Link>
    </motion.section>
  );
}

function NavRow({ liveCount }: { liveCount: number }) {
  const items = [
    { href: "/home/Tazeha", label: "تازه‌ها", sub: "رویدادها" },
    { href: "/home/Injaro", label: "نقشه", sub: liveCount > 0 ? `${toPersianDigits(liveCount)} زنده` : "مکان‌ها" },
    { href: "/home/savedEvents", label: "ذخیره‌شده", sub: "علاقه‌مندی" },
  ];

  return (
    <motion.nav variants={fadeUp} className="px-5">
      <div className="grid grid-cols-3 divide-x divide-border/40 border border-border/60 rounded-xl overflow-hidden">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center py-4 hover:bg-surface/60 transition-colors active:bg-surface"
          >
            <span className="text-sm font-semibold text-text-primary">{item.label}</span>
            <span className="text-[10px] text-text-secondary mt-1">{item.sub}</span>
          </Link>
        ))}
      </div>
    </motion.nav>
  );
}

function CategoriesStrip() {
  return (
    <motion.section variants={fadeUp} className="px-5">
      <SectionHeader title="دسته‌بندی" />
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((label) => (
          <button
            key={label}
            className="text-xs font-medium text-text-secondary border border-border/50 px-3.5 py-2 rounded-full hover:text-text-primary hover:border-border transition-colors"
          >
            {label}
          </button>
        ))}
      </div>
    </motion.section>
  );
}

function LiveRow({ liveCount }: { liveCount: number }) {
  if (liveCount === 0) return null;

  return (
    <motion.div variants={fadeUp} className="px-5">
      <Link
        href="/home/Injaro"
        className="flex items-center gap-3 py-3 border-y border-border/40"
      >
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-50" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
        </span>
        <span className="text-sm text-text-primary">
          {toPersianDigits(liveCount)} مکان در حال پخش
        </span>
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mr-auto text-text-secondary">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </Link>
    </motion.div>
  );
}

function EventsSection({ events }: { events: LandingEvent[] }) {
  if (events.length === 0) return null;

  return (
    <motion.section variants={fadeUp} className="px-5">
      <SectionHeader title="رویدادهای جدید" count={events.length} href="/home/Tazeha" />
      <div className="flex gap-3 overflow-x-auto scrollbar-none -mx-5 px-5">
        {events.map((event) => (
          <Link
            key={event.event_slug}
            href={`/events/${event.event_slug}`}
            className="block w-[130px] shrink-0 group"
          >
            <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-surface mb-2">
              <EventImage
                src={event.thumbnail}
                alt={event.topic}
                className="group-hover:scale-[1.03] transition-transform duration-400"
              />
            </div>
            <p className="text-xs font-medium text-text-primary leading-snug line-clamp-2 group-hover:text-primary transition-colors">
              {event.topic}
            </p>
          </Link>
        ))}
      </div>
    </motion.section>
  );
}

function MapSection({ locations, liveCount }: { locations: LandingLocation[]; liveCount: number }) {
  const preview = locations.slice(0, 6);

  return (
    <motion.section variants={fadeUp} className="px-5 pb-6">
      <SectionHeader title="نقشه هنری" count={locations.length} href="/home/Injaro" />
      <Link href="/home/Injaro" className="block group">
        <div className="rounded-xl border border-border/60 overflow-hidden">
          <div className="px-4 py-3 border-b border-border/40 flex items-center justify-between">
            <span className="text-xs text-text-secondary">مکان‌های نزدیک شما</span>
            {liveCount > 0 && (
              <span className="text-[10px] font-medium text-primary flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                {toPersianDigits(liveCount)} زنده
              </span>
            )}
          </div>
          <div className="p-4 flex gap-4 overflow-x-auto scrollbar-none">
            {preview.map((loc) => (
              <div key={loc.slug} className="shrink-0 flex items-center gap-2.5">
                <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-surface border border-border/40">
                  {loc.logo ? (
                    <img src={imgUrl(loc.logo)} alt={loc.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] font-semibold text-text-secondary/50">
                      {loc.name.slice(0, 2)}
                    </div>
                  )}
                  {loc.is_live && (
                    <span className="absolute top-0.5 end-0.5 w-1.5 h-1.5 rounded-full bg-primary ring-1 ring-background" />
                  )}
                </div>
                <span className="text-xs text-text-primary font-medium line-clamp-1 max-w-[80px]">
                  {loc.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Link>
    </motion.section>
  );
}

function Skeleton() {
  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <div className="px-5 pt-4 pb-4 border-b border-border/40">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-3 w-16 rounded bg-surface animate-pulse" />
            <div className="h-7 w-24 rounded bg-surface animate-pulse" />
          </div>
          <div className="flex gap-2">
            <div className="w-9 h-9 rounded-full bg-surface animate-pulse" />
            <div className="w-14 h-9 rounded-full bg-surface animate-pulse" />
          </div>
        </div>
        <div className="mt-4 h-11 rounded-xl bg-surface animate-pulse" />
      </div>
      <div className="flex flex-col gap-8 p-5">
        <div className="aspect-[5/4] rounded-2xl bg-surface animate-pulse" />
        <div className="h-20 rounded-xl bg-surface animate-pulse" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-8 w-16 rounded-full bg-surface animate-pulse" />
          ))}
        </div>
        <div className="flex gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="w-[130px] shrink-0">
              <div className="aspect-[3/4] rounded-xl bg-surface animate-pulse mb-2" />
              <div className="h-3 w-full rounded bg-surface animate-pulse" />
            </div>
          ))}
        </div>
      </div>
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

  const hasContent = events.length > 0 || locations.length > 0;

  if (loading) return <Skeleton />;

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center px-5 min-h-dvh">
        <ErrorState onRetry={fetchData} />
      </div>
    );
  }

  if (!hasContent) {
    return (
      <div className="flex-1 flex items-center justify-center px-5 min-h-dvh">
        <EmptyState title="خوش آمدید" description="به زودی رویدادها اضافه می‌شوند" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-dvh bg-background overflow-x-hidden">
      <TopBar guest={guest} />

      <motion.main
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-8 pt-6"
      >
        {featured && <HeroSection event={featured} />}

        <NavRow liveCount={liveCount} />

        {guest && <GuestBanner />}

        <LiveRow liveCount={liveCount} />

        <EventsSection events={rest} />

        <CategoriesStrip />

        {locations.length > 0 && <MapSection locations={locations} liveCount={liveCount} />}
      </motion.main>
    </div>
  );
}
