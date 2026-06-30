"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { toJalaali } from "jalaali-js";
import { getLocationDetail, type LocationDetail } from "@/lib/api/locations";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { ErrorState } from "@/components/ui/error-state";
import { cn, imgUrl, toPersianDigits } from "@/lib/utils";
import { OptimizedImage } from "@/components/ui/optimized-image";

const tabs = [
  { key: "about", label: "درباره" },
  { key: "events", label: "رویدادها" },
  { key: "kenar", label: "نزدیک" },
] as const;

type TabKey = (typeof tabs)[number]["key"];

interface BrandDetailClientProps {
  initialData: LocationDetail | null;
  slug: string;
  hasError: boolean;
}

export function BrandDetailClient({
  initialData,
  slug,
  hasError: serverError,
}: BrandDetailClientProps) {
  const router = useRouter();
  const [data, setData] = useState<LocationDetail | null>(initialData);
  const [loading, setLoading] = useState(!initialData && !serverError);
  const [error, setError] = useState(serverError);
  const [activeTab, setActiveTab] = useState<TabKey>("about");
  const [showQr, setShowQr] = useState(false);
  const [parallaxY, setParallaxY] = useState(0);
  const [tabBarSticky, setTabBarSticky] = useState(false);
  const tabBarRef = useRef<HTMLDivElement>(null);
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialData || serverError) return;

    getLocationDetail(slug)
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug, initialData, serverError]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setParallaxY(scrollY * 0.3);

      if (tabBarRef.current) {
        const tabBarTop = tabBarRef.current.getBoundingClientRect().top;
        setTabBarSticky(tabBarTop <= 0);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleShare = useCallback(() => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: data?.name, url });
    } else {
      navigator.clipboard.writeText(url).then(() => {
        toast.success("لینک کپی شد");
      });
    }
  }, [data]);

  const handleNavigate = useCallback(() => {
    if (!data) return;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${data.latitude},${data.longitude}`;
    window.open(url, "_blank");
  }, [data]);

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <ErrorState onRetry={() => window.location.reload()} />
      </div>
    );
  }

  const events = data.events || [];
  const kenar = data.kenar || [];

  return (
    <div className="flex min-h-dvh flex-col">
      <div ref={bannerRef} className="relative h-56 overflow-hidden bg-linear-to-b from-primary/4 to-surface">
        <button
          onClick={() => router.back()}
          aria-label="بازگشت"
          className="absolute top-4 inset-s-4 z-20 w-9 h-9 rounded-full bg-background/85 backdrop-blur-xs shadow-md flex items-center justify-center text-text-primary hover:bg-background transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
        {data.banner ? (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${imgUrl(data.banner)})`,
              transform: `translateY(${parallaxY}px)`,
            }}
          />
        ) : (
          <div className="absolute inset-0 bg-linear-to-br from-primary/10 via-primary/4 to-surface" />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-background/60 via-transparent to-transparent" />
      </div>

      <div className="relative px-4 -mt-12 z-10">
        <div className="flex items-end gap-4">
          {data.logo ? (
            <OptimizedImage
              src={data.logo}
              alt={data.name}
              width={80}
              height={80}
              className="w-20 h-20 rounded-2xl border-4 border-background shadow-lg bg-surface"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl border-4 border-background shadow-lg bg-linear-to-br from-primary/10 to-surface flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">
                {data.name.slice(0, 1)}
              </span>
            </div>
          )}
          <div className="flex-1 min-w-0 pb-1">
            <h1 className="text-xl font-bold text-text-primary">
              {data.name}
            </h1>
            <Badge variant="primary" size="sm" className="mt-1">
              دسته {data.category}
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex gap-2 px-4 mt-5">
        <button
          onClick={() => setShowQr(true)}
          className="flex items-center justify-center gap-1.5 h-9 px-3 rounded-lg border border-border/50 bg-surface text-xs font-medium text-text-secondary hover:border-primary/30 hover:text-primary transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
          </svg>
          QR
        </button>
        <button
          onClick={handleNavigate}
          className="flex items-center justify-center gap-1.5 h-9 px-3 rounded-lg border border-border/50 bg-surface text-xs font-medium text-text-secondary hover:border-primary/30 hover:text-primary transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          مسیریابی
        </button>
        <button
          onClick={handleShare}
          className="flex items-center justify-center gap-1.5 h-9 px-3 rounded-lg border border-border/50 bg-surface text-xs font-medium text-text-secondary hover:border-primary/30 hover:text-primary transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
          اشتراک
        </button>
      </div>

      <div
        ref={tabBarRef}
        className={cn(
          "sticky top-0 z-10 bg-background/60 backdrop-blur-2xl border-b border-border/40 mt-5 transition-shadow",
          tabBarSticky && "shadow-xs"
        )}
      >
        <div className="flex px-4">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "relative flex-1 h-11 text-sm font-medium transition-colors",
                activeTab === tab.key
                  ? "text-primary"
                  : "text-text-secondary hover:text-text-primary"
              )}
            >
              {tab.label}
              {activeTab === tab.key && (
                <motion.div
                  layoutId="brand-tab-underline"
                  className="absolute bottom-0 left-[15%] right-[15%] h-0.5 rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 px-4 pt-5 pb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            {activeTab === "about" && <AboutTab data={data} onNavigate={handleNavigate} />}
            {activeTab === "events" && <EventsTab events={events} />}
            {activeTab === "kenar" && <KenarTab items={kenar} />}
          </motion.div>
        </AnimatePresence>
      </div>

      <Modal open={showQr} onClose={() => setShowQr(false)} title="QR کد">
        <div className="flex flex-col items-center py-4">
          {data.qr_code ? (
            <OptimizedImage src={data.qr_code} alt="QR" width={192} height={192} className="w-48 h-48 rounded-xl" />
          ) : (
            <div className="w-48 h-48 rounded-xl bg-linear-to-br from-primary/4 to-surface border border-border flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-text-secondary/20">
                <rect x="2" y="2" width="5" height="5" />
                <rect x="17" y="2" width="5" height="5" />
                <rect x="2" y="17" width="5" height="5" />
                <rect x="12" y="12" width="5" height="5" />
                <rect x="8" y="8" width="2" height="2" />
                <rect x="14" y="8" width="2" height="2" />
                <rect x="8" y="14" width="2" height="2" />
                <rect x="19" y="12" width="3" height="2" />
                <rect x="12" y="19" width="2" height="3" />
              </svg>
            </div>
          )}
          <p className="text-xs text-text-secondary mt-3">اسکن کنید تا برند را مشاهده کنید</p>
        </div>
      </Modal>
    </div>
  );
}

function AboutTab({
  data,
  onNavigate,
}: {
  data: LocationDetail;
  onNavigate: () => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      {data.description && (
        <p className="text-sm text-text-secondary leading-relaxed">
          {data.description}
        </p>
      )}

      {data.address && (
        <button
          onClick={onNavigate}
          className="flex items-start gap-3 p-3 rounded-xl bg-surface border border-border/50 text-right hover:border-primary/30 transition-colors"
        >
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-text-primary">آدرس</p>
            <p className="text-xs text-text-secondary mt-0.5 line-clamp-2">
              {data.address}
            </p>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-secondary/50 shrink-0 mt-1.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      )}

      <div className="flex flex-col gap-2">
        {data.website && (
          <a
            href={data.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-border/50 hover:border-primary/30 transition-all"
          >
            <div className="w-9 h-9 rounded-lg bg-primary/5 flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </div>
            <span className="text-sm text-text-primary flex-1">وبسایت</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-secondary/50">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
        )}
        {data.instagram && (
          <a
            href={data.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-border/50 hover:border-primary/30 transition-all"
          >
            <div className="w-9 h-9 rounded-lg bg-primary/5 flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E4405F" strokeWidth="1.5">
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <circle cx="12" cy="12" r="5" />
                <circle cx="17.5" cy="6.5" r="1" />
              </svg>
            </div>
            <span className="text-sm text-text-primary flex-1">اینستاگرام</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-secondary/50">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
        )}
        {data.phone && (
          <a
            href={`tel:${data.phone}`}
            className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-border/50 hover:border-primary/30 transition-all"
          >
            <div className="w-9 h-9 rounded-lg bg-success/5 flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="1.5">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </div>
            <span className="text-sm text-text-primary flex-1" dir="ltr">{data.phone}</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-secondary/50">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </a>
        )}
      </div>

      <Button fullWidth onClick={onNavigate}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-1.5">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        مسیریابی با Google Maps
      </Button>
    </div>
  );
}

const PERSIAN_MONTHS = [
  "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
  "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند",
];

function toShamsiDate(gregDateStr: string): string {
  const d = new Date(gregDateStr);
  if (isNaN(d.getTime())) return gregDateStr;
  const j = toJalaali(d.getFullYear(), d.getMonth() + 1, d.getDate());
  return `${j.jd} ${PERSIAN_MONTHS[j.jm - 1]} ${toPersianDigits(j.jy)}`;
}

function EventsTab({ events }: { events: LocationDetail["events"] }) {
  const router = useRouter();

  if (!events || events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-text-secondary/20">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        <p className="text-sm text-text-secondary mt-3">رویدادی وجود ندارد</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {events.map((ev) => (
        <button
          key={ev.event_slug}
          onClick={() => router.push(`/events/${ev.event_slug}`)}
          className="flex flex-col rounded-2xl bg-surface border border-border/30 overflow-hidden hover:border-primary/30 hover:shadow-md transition-all text-right active:scale-[0.97] group"
        >
          <div className="relative w-full aspect-4/5 overflow-hidden bg-surface">
            {ev.thumbnail ? (
              <OptimizedImage
                src={ev.thumbnail}
                alt=""
                fill
                sizes="200px"
                className="group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-text-secondary/15">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </div>
            )}
          </div>
          <div className="p-3">
            <p className="text-xs font-semibold text-text-primary line-clamp-2 leading-snug">
              {ev.topic}
            </p>
            {ev.start_datetime && (
              <p className="text-[10px] text-text-secondary mt-1.5">
                {toShamsiDate(ev.start_datetime)}
              </p>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}

function KenarTab({ items }: { items: LocationDetail["kenar"] }) {
  if (!items || items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-text-secondary/20">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
        </svg>
        <p className="text-sm text-text-secondary mt-3">محتوایی وجود ندارد</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map((item) => (
        <KenarCard key={item.id} item={item} />
      ))}
    </div>
  );
}

function KenarCard({ item }: { item: NonNullable<LocationDetail["kenar"]>[number] }) {
  const router = useRouter();

  const handleClick = () => {
    if (item.link) {
      router.push(item.link);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="flex flex-col rounded-xl bg-surface border border-border/50 overflow-hidden hover:border-primary/30 hover:shadow-sm transition-all text-right active:scale-[0.98]"
    >
      {item.image ? (
        <div className="relative aspect-4/3 bg-surface overflow-hidden">
          <OptimizedImage
            src={item.image}
            alt={item.title}
            fill
            sizes="300px"
          />
        </div>
      ) : (
        <div className="aspect-4/3 bg-linear-to-br from-primary/4 to-surface flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-text-secondary/20">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </div>
      )}
      <div className="p-2.5">
        <p className="text-xs font-medium text-text-primary line-clamp-2 leading-snug">
          {item.title}
        </p>
      </div>
    </button>
  );
}
