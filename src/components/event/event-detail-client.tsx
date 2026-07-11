"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  getEventDetail,
  getPublicEventDetail,
  toggleSaveEvent,
  type EventDetail,
} from "@/lib/api/events";
import { getLandingEventBySlug, type LandingEvent } from "@/lib/api/landing";
import { landingKeys, useLandingEvents } from "@/lib/queries/landing";
import { toJalaali } from "jalaali-js";
import { isAuthenticated, loginUrl } from "@/lib/auth-utils";
import { reportNavigationClick } from "@/lib/api/locations";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { ErrorState } from "@/components/ui/error-state";
import { PERSIAN_MONTHS } from "@/lib/constants/enums";
import { cn, toPersianDigits, shareContent } from "@/lib/utils";
import { OptimizedImage } from "@/components/ui/optimized-image";


interface EventDetailClientProps {
  initialData: EventDetail | null;
  slug: string;
}

export function EventDetailClient({
  initialData,
  slug,
}: EventDetailClientProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [data, setData] = useState<EventDetail | null>(initialData);
  const [guestEvent, setGuestEvent] = useState<LandingEvent | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState(false);
  const [saved, setSaved] = useState(false);

  const [ticketQrOpen, setTicketQrOpen] = useState(false);
  const [imagePopupOpen, setImagePopupOpen] = useState(false);
  const [popupImageIndex, setPopupImageIndex] = useState(0);

  useEffect(() => {
    if (initialData) return;

    const authed = isAuthenticated();

    async function load() {
      if (authed) {
        try {
          const detail = await getEventDetail(slug);
          setData(detail);
        } catch {
          setError(true);
        }
      } else {
        setIsGuest(true);
        const detail = await getPublicEventDetail(slug);
        if (detail) {
          setData(detail);
        } else {
          const cached = queryClient.getQueryData<LandingEvent[]>(
            landingKeys.events
          );
          const landing = await getLandingEventBySlug(slug, cached);
          if (landing) setGuestEvent(landing);
          else setError(true);
        }
      }
      setLoading(false);
    }

    load();
  }, [slug, initialData, queryClient]);

  const handleParticipate = useCallback(() => {
    if (isGuest) {
      router.push(loginUrl(`/events/${slug}`));
      return;
    }
    if (data?.need_ticket) {
      setTicketQrOpen(true);
      return;
    }
    toast.success("درخواست شرکت ثبت شد");
  }, [isGuest, router, slug, data?.need_ticket]);

  const handleSave = useCallback(async () => {
    if (isGuest) {
      router.push(loginUrl(`/events/${slug}`));
      return;
    }
    try {
      await toggleSaveEvent();
      setSaved((p) => !p);
      toast.success(saved ? "از ذخیره خارج شد" : "رویداد ذخیره شد");
    } catch {
      toast.error("خطا");
    }
  }, [saved, isGuest, router, slug]);

  const handleShare = useCallback(async () => {
    const result = await shareContent({ title: data?.topic });
    if (result === "copied") {
      toast.success("لینک کپی شد");
    }
  }, [data]);

  const handleNavigate = useCallback(() => {
    if (data?.GoogleMapLink) {
      window.open(data.GoogleMapLink, "_blank");
      return;
    }
    if (data?.location?.slug) {
      reportNavigationClick(data.location.slug);
      router.push(`/brands/${data.location.slug}`);
    }
  }, [data, router]);

  const handleOpenImage = useCallback((index: number) => {
    setPopupImageIndex(index);
    setImagePopupOpen(true);
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || (!data && !guestEvent)) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <ErrorState onRetry={() => window.location.reload()} />
      </div>
    );
  }

  if (isGuest && guestEvent) {
    return (
      <GuestEventView
        event={guestEvent}
        onBack={() => router.back()}
        onParticipate={handleParticipate}
        onShare={async () => {
          const result = await shareContent({ title: guestEvent.topic });
          if (result === "copied") {
            toast.success("لینک کپی شد");
          }
        }}
      />
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <ErrorState onRetry={() => window.location.reload()} />
      </div>
    );
  }

  const images = data.images && data.images.length > 0
    ? data.images
    : data.thumbnail
      ? [{ url: data.thumbnail }]
      : [];
  const sideOrgs = data.side_organizers || [];
  const talks = data.conversation_panel || [];
  const saloons = data.saloons || [];
  const showOrganizers = Boolean(data.main_organizers) || sideOrgs.length > 0;

  return (
    <div className="flex min-h-dvh flex-col">
      <div className="relative px-4 pt-4">
        <GallerySection images={images} onOpenImage={handleOpenImage} />
        <button
          onClick={() => router.back()}
          aria-label="بازگشت"
          className="absolute top-7 inset-s-7 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-background/85 text-text-primary shadow-md backdrop-blur-xs transition-colors hover:bg-background"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      <div className="px-4 pt-3">
        <div className="mb-1 flex items-start gap-2">
          <h1 className="flex-1 text-lg font-bold leading-snug text-text-primary">
            {data.topic}
          </h1>
          {data.is_vip && (
            <Badge variant="warning" size="sm" className="shrink-0">
              VIP
            </Badge>
          )}
        </div>

        <EventActionBar
          saved={saved}
          onSave={handleSave}
          onShare={handleShare}
          onCalendar={() => data.GoogleCalendarLink && window.open(data.GoogleCalendarLink, "_blank")}
          calendarDisabled={!data.GoogleCalendarLink}
        />

        <div className="mt-4 flex gap-2.5">
          <button
            onClick={handleParticipate}
            className="flex h-12 flex-1 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white shadow-[0_6px_20px_rgba(255,90,95,0.35)] transition-transform active:scale-[0.98]"
          >
            شرکت می‌کنم
          </button>
          <button
            onClick={handleNavigate}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full border border-primary bg-white text-sm font-semibold text-primary shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-transform active:scale-[0.98] dark:border-primary/50 dark:bg-surface"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </span>
            مسیریابی
          </button>
        </div>

        <EventInfoStrip
          location={data.location?.address || data.location?.name}
          dateRange={formatEventDateRange(data.start_datetime, data.finish_datetime)}
          accessLabel={data.need_ticket ? "نیاز به بلیت" : "برای عموم آزاد"}
          onLocationClick={handleNavigate}
        />
      </div>

      <div className="flex-1 space-y-6 px-4 pt-6 pb-8">
        {data.statement && (
          <section>
            <SectionTitle>درباره رویداد</SectionTitle>
            <StatementBlock text={data.statement} />
          </section>
        )}

        {showOrganizers && (
          <OrganizersSection
            mainOrganizers={data.main_organizers}
            sideOrganizers={sideOrgs}
          />
        )}

        <SimilarEventsSection currentSlug={slug} />

        {talks.length > 0 && (
          <section>
            <SectionTitle>سخنرانان / پنل گفتگو</SectionTitle>
            <div className="bg-white/60 dark:bg-white/3 backdrop-blur-xl border border-border/15 shadow-xs rounded-2xl p-4">
              <div className="flex flex-col gap-2">
                {talks.map((talk, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/50 border border-border/30"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-primary">
                        {talk.name?.slice(0, 1) || "?"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      {talk.name && (
                        <p className="text-sm font-medium text-text-primary">
                          {talk.name}
                        </p>
                      )}
                      {talk.title && (
                        <p className="text-xs text-text-secondary mt-0.5">
                          {talk.title}
                        </p>
                      )}
                    </div>
                    {talk.time && (
                      <span className="text-[10px] px-2 py-1 rounded-full bg-white/50 text-text-secondary border border-border/30 shrink-0 font-medium">
                        {talk.time}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {saloons.length > 0 && (
          <section>
            <SectionTitle>سالن‌ها و غرفه‌ها</SectionTitle>
            <div className="bg-white/60 dark:bg-white/3 backdrop-blur-xl border border-border/15 shadow-xs rounded-2xl p-4">
              <SaloonsAccordion saloons={saloons} />
            </div>
          </section>
        )}
      </div>

      <Modal open={ticketQrOpen} onClose={() => setTicketQrOpen(false)} title="بلیت رویداد">
        <div className="flex flex-col items-center py-6">
          <div className="w-52 h-52 rounded-xl bg-linear-to-br from-primary/4 to-surface border border-border flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="110" height="110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-text-secondary/20">
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
          <p className="text-xs text-text-secondary mt-3">بلیت خود را اسکن کنید</p>
        </div>
      </Modal>

      <AnimatePresence>
        {imagePopupOpen && images.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
            onClick={() => setImagePopupOpen(false)}
          >
            <button
              onClick={() => setImagePopupOpen(false)}
              className="absolute top-4 inset-e-4 z-10 w-9 h-9 rounded-full bg-white/15 backdrop-blur-xs flex items-center justify-center text-white hover:bg-white/25 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <div className="relative w-full h-[70vh] max-h-[80dvh]">
              <OptimizedImage
                src={images[popupImageIndex]?.url}
                alt={images[popupImageIndex]?.alt || ""}
                fill
                sizes="100vw"
                className="object-contain px-4"
              />
            </div>
            {images.length > 1 && (
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => { e.stopPropagation(); setPopupImageIndex(i); }}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all",
                      i === popupImageIndex ? "bg-white w-4" : "bg-white/40"
                    )}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function GuestEventView({
  event,
  onBack,
  onParticipate,
  onShare,
}: {
  event: LandingEvent;
  onBack: () => void;
  onParticipate: () => void;
  onShare: () => void;
}) {
  const imageUrl = event.thumbnail;

  return (
    <div className="flex min-h-dvh flex-col pb-32">
      <div className="relative aspect-4/3 bg-surface">
        <button
          onClick={onBack}
          aria-label="بازگشت"
          className="absolute top-4 inset-s-4 z-20 w-9 h-9 rounded-full bg-background/85 backdrop-blur-xs shadow-md flex items-center justify-center text-text-primary"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
        <OptimizedImage
          src={imageUrl}
          alt={event.topic}
          fill
          priority
          sizes="(max-width: 480px) 100vw, 480px"
          className="w-full h-full"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent" />
      </div>

      <div className="px-4 pt-5 flex-1">
        <h1 className="text-xl font-bold text-text-primary leading-snug">
          {event.topic}
        </h1>
        <p className="text-sm text-text-secondary mt-3 leading-relaxed">
          برای مشاهده جزئیات کامل، آدرس، برگزارکنندگان و شرکت در رویداد وارد حساب کاربری خود شوید.
        </p>

        <button
          type="button"
          onClick={onShare}
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:opacity-80 transition-opacity"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
          اشتراک‌گذاری
        </button>
      </div>

      <div
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-30 px-4 pt-4 pb-2 bg-background/95 backdrop-blur-md border-t border-border/50"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 12px)" }}
      >
        <Button fullWidth size="lg" onClick={onParticipate}>
          می‌خوام شرکت کنم
        </Button>
        <p className="text-[11px] text-text-secondary text-center mt-2">
          با ورود می‌توانید در رویداد شرکت کنید
        </p>
      </div>
    </div>
  );
}

function formatEventDateRange(start?: string, finish?: string): string {
  if (!start) return "";
  const startDate = new Date(start);
  if (isNaN(startDate.getTime())) return "";

  const finishDate = finish ? new Date(finish) : null;
  const startJ = toJalaali(
    startDate.getFullYear(),
    startDate.getMonth() + 1,
    startDate.getDate()
  );

  if (finishDate && !isNaN(finishDate.getTime())) {
    const finishJ = toJalaali(
      finishDate.getFullYear(),
      finishDate.getMonth() + 1,
      finishDate.getDate()
    );

    if (startJ.jy === finishJ.jy && startJ.jm === finishJ.jm && startJ.jd !== finishJ.jd) {
      return `${toPersianDigits(startJ.jd)} تا ${toPersianDigits(finishJ.jd)} ${PERSIAN_MONTHS[startJ.jm - 1]} ${toPersianDigits(startJ.jy)}، ساعت ${toPersianDigits(startDate.getHours())} تا ${toPersianDigits(finishDate.getHours())}`;
    }
  }

  const datePart = `${toPersianDigits(startJ.jd)} ${PERSIAN_MONTHS[startJ.jm - 1]} ${toPersianDigits(startJ.jy)}`;
  const timePart =
    finishDate && !isNaN(finishDate.getTime())
      ? `، ساعت ${toPersianDigits(startDate.getHours())} تا ${toPersianDigits(finishDate.getHours())}`
      : start.includes("T")
        ? `، ساعت ${toPersianDigits(startDate.getHours())}`
        : "";

  return `${datePart}${timePart}`;
}

function EventActionBar({
  saved,
  onSave,
  onShare,
  onCalendar,
  calendarDisabled,
}: {
  saved: boolean;
  onSave: () => void;
  onShare: () => void;
  onCalendar: () => void;
  calendarDisabled?: boolean;
}) {
  const items = [
    {
      key: "like",
      label: "پسندیدم",
      onClick: undefined,
      disabled: true,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      ),
    },
    {
      key: "share",
      label: "اشتراک گذاری",
      onClick: onShare,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
      ),
    },
    {
      key: "save",
      label: "ذخیره سازی",
      onClick: onSave,
      active: saved,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth={saved ? 0 : 1.5}>
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
      ),
    },
    {
      key: "calendar",
      label: "افزودن به تقویم",
      onClick: onCalendar,
      disabled: calendarDisabled,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
    },
  ];

  return (
    <div className="mt-3 flex items-stretch rounded-2xl border border-border/20 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.05)] dark:border-border/30 dark:bg-surface dark:shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
      {items.map((item, index) => (
        <div key={item.key} className="flex flex-1 items-stretch">
          <button
            type="button"
            onClick={item.onClick}
            disabled={item.disabled || !item.onClick}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-1 px-1 py-3 transition-colors",
              item.active ? "text-primary" : "text-text-secondary",
              (item.disabled || !item.onClick) && "opacity-40",
              item.onClick && !item.disabled && "hover:text-primary"
            )}
          >
            {item.icon}
            <span className="text-[10px] font-medium leading-tight">{item.label}</span>
          </button>
          {index < items.length - 1 && (
            <div className="w-px self-center bg-border/30" />
          )}
        </div>
      ))}
    </div>
  );
}

function EventInfoStrip({
  location,
  dateRange,
  accessLabel,
  onLocationClick,
}: {
  location?: string;
  dateRange: string;
  accessLabel: string;
  onLocationClick: () => void;
}) {
  const items = [
    {
      key: "location",
      label: location || "مکان نامشخص",
      onClick: onLocationClick,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      ),
    },
    {
      key: "date",
      label: dateRange || "زمان نامشخص",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
    },
    {
      key: "access",
      label: accessLabel,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary">
          <path d="M2 9a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V9z" />
          <path d="M8 12h8" />
        </svg>
      ),
    },
  ];

  return (
    <div className="mt-4 flex rounded-2xl border border-border/20 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.05)] dark:border-border/30 dark:bg-surface dark:shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
      {items.map((item, index) => {
        const Comp = item.onClick ? "button" : "div";
        return (
          <div key={item.key} className="flex flex-1 items-stretch">
            <Comp
              type={item.onClick ? "button" : undefined}
              onClick={item.onClick}
              className={cn(
                "flex flex-1 flex-col items-center gap-2 px-2 py-3 text-center",
                item.onClick && "transition-colors hover:text-primary"
              )}
            >
              {item.icon}
              <span className="text-[10px] leading-snug text-text-secondary">
                {item.label}
              </span>
            </Comp>
            {index < items.length - 1 && (
              <div className="w-px self-stretch bg-border/30" />
            )}
          </div>
        );
      })}
    </div>
  );
}

function OrganizersSection({
  mainOrganizers,
  sideOrganizers,
}: {
  mainOrganizers?: string;
  sideOrganizers: NonNullable<EventDetail["side_organizers"]>;
}) {
  return (
    <section>
      <SectionTitle>برگزارکنندگان</SectionTitle>
      {mainOrganizers && (
        <p className="mb-4 text-sm leading-relaxed text-text-secondary">
          {mainOrganizers}
        </p>
      )}
      {sideOrganizers.length > 0 && (
        <div className="flex gap-4 overflow-x-auto pb-1 scrollbar-none">
          {sideOrganizers.map((org) => (
            <div
              key={org.id}
              className="flex w-[92px] shrink-0 flex-col items-center gap-2"
            >
              <div className="flex h-[92px] w-[92px] items-center justify-center overflow-hidden rounded-[18px] bg-white p-3 shadow-[0_6px_24px_rgba(0,0,0,0.08),0_2px_6px_rgba(0,0,0,0.04)] dark:border dark:border-border/30 dark:bg-surface dark:shadow-[0_6px_24px_rgba(0,0,0,0.35)]">
                {org.logo ? (
                  <OptimizedImage
                    src={org.logo}
                    alt={org.name}
                    width={72}
                    height={72}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <span className="text-2xl font-bold text-text-secondary/40">
                    {org.name.slice(0, 1)}
                  </span>
                )}
              </div>
              <p className="line-clamp-2 text-center text-[10px] leading-snug text-text-secondary">
                {org.name}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function SimilarEventsSection({ currentSlug }: { currentSlug: string }) {
  const router = useRouter();
  const { data: landingEvents = [] } = useLandingEvents();
  const scrollRef = useRef<HTMLDivElement>(null);
  const similarEvents = useMemo(
    () => landingEvents.filter((event) => event.event_slug !== currentSlug).slice(0, 8),
    [landingEvents, currentSlug]
  );

  const scroll = useCallback((direction: "prev" | "next") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.75 * (direction === "next" ? 1 : -1);
    el.scrollBy({ left: amount, behavior: "smooth" });
  }, []);

  if (similarEvents.length === 0) return null;

  return (
    <section>
      <SectionTitle>رویدادهای مشابه</SectionTitle>
      <div className="relative">
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto pb-1 scrollbar-none snap-x snap-mandatory"
        >
          {similarEvents.map((event) => (
            <button
              key={event.event_slug}
              onClick={() => router.push(`/events/${event.event_slug}`)}
              className="group w-[140px] shrink-0 snap-start overflow-hidden rounded-2xl bg-white text-right shadow-[0_6px_24px_rgba(0,0,0,0.08)] transition-transform active:scale-[0.98] dark:border dark:border-border/30 dark:bg-surface dark:shadow-[0_6px_24px_rgba(0,0,0,0.35)]"
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-surface">
                {event.thumbnail ? (
                  <OptimizedImage
                    src={event.thumbnail}
                    alt={event.topic}
                    fill
                    sizes="140px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-text-secondary/20">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  </div>
                )}
                <div className="absolute inset-x-2 bottom-2 rounded-xl bg-white/85 px-2 py-1.5 backdrop-blur-sm dark:bg-surface/90">
                  <p className="line-clamp-2 text-[10px] font-medium leading-snug text-text-primary">
                    {event.topic}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
        {similarEvents.length > 2 && (
          <>
            <CarouselArrow direction="prev" onClick={() => scroll("prev")} className="absolute top-1/2 inset-s-0 -translate-y-1/2" />
            <CarouselArrow direction="next" onClick={() => scroll("next")} className="absolute top-1/2 inset-e-0 -translate-y-1/2" />
          </>
        )}
      </div>
    </section>
  );
}

function CarouselArrow({
  direction,
  onClick,
  className,
}: {
  direction: "prev" | "next";
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direction === "prev" ? "قبلی" : "بعدی"}
      className={cn(
        "z-10 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white shadow-[0_4px_14px_rgba(255,90,95,0.4)] transition-transform active:scale-95",
        className
      )}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        {direction === "prev" ? (
          <polyline points="15 18 9 12 15 6" />
        ) : (
          <polyline points="9 18 15 12 9 6" />
        )}
      </svg>
    </button>
  );
}

function GallerySection({
  images,
  onOpenImage,
}: {
  images: EventDetail["images"];
  onOpenImage: (index: number) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    setActiveIndex(Math.min(idx, (images?.length || 1) - 1));
  }, [images]);

  if (!images || images.length === 0) {
    return (
      <div className="relative flex h-72 items-center justify-center overflow-hidden rounded-3xl bg-linear-to-b from-primary/4 to-surface">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-text-secondary/20">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      </div>
    );
  }

  const scroll = (direction: "prev" | "next") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * (direction === "next" ? 1 : -1);
    el.scrollBy({ left: amount, behavior: "smooth" });
  };

  return (
    <div className="relative overflow-hidden rounded-3xl">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth scrollbar-none"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => onOpenImage(i)}
            className="relative h-72 w-full shrink-0 snap-start overflow-hidden"
          >
            <OptimizedImage
              src={img.url}
              alt={img.alt || ""}
              fill
              priority={i === 0}
              sizes="(max-width: 480px) 100vw, 480px"
            />
            <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/25 to-transparent" />
          </button>
        ))}
      </div>

      {images.length > 1 && (
        <>
          <CarouselArrow
            direction="prev"
            onClick={() => scroll("prev")}
            className="absolute top-1/2 inset-s-3 -translate-y-1/2"
          />
          <CarouselArrow
            direction="next"
            onClick={() => scroll("next")}
            className="absolute top-1/2 inset-e-3 -translate-y-1/2"
          />
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {images.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-2 rounded-full transition-all",
                  i === activeIndex ? "w-5 bg-white" : "w-2 bg-white/50"
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 text-sm font-bold text-text-primary">
      {children}
    </h2>
  );
}

function StatementBlock({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const long = text.length > 200;

  return (
    <div>
      <p
        className={cn(
          "text-sm text-text-secondary leading-relaxed whitespace-pre-line",
          !expanded && long && "line-clamp-4"
        )}
      >
        {text}
      </p>
      {long && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-primary font-medium mt-1.5 hover:opacity-80 transition-opacity"
        >
          {expanded ? "نمایش کمتر" : "نمایش بیشتر"}
        </button>
      )}
    </div>
  );
}

function SaloonsAccordion({ saloons }: { saloons: EventDetail["saloons"] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (!saloons || saloons.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      {saloons.map((saloon, i) => {
        const isOpen = openIndex === i;
        const companies = saloon.company || [];
        return (
          <div
            key={i}
            className="rounded-xl bg-white/50 border border-border/30 overflow-hidden"
          >
            <button
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="flex items-center justify-between w-full h-12 px-4 text-sm font-medium text-text-primary hover:bg-white/30 transition-colors"
            >
              <span>{saloon.name}</span>
              <motion.svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-text-secondary"
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <polyline points="6 9 12 15 18 9" />
              </motion.svg>
            </button>
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-3 border-t border-border/20 pt-3">
                    {companies.length === 0 ? (
                      <p className="text-xs text-text-secondary">غرفه‌ای ثبت نشده</p>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {companies.map((c) => (
                          <CompanyBoothCard key={c.id} company={c} />
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

function CompanyBoothCard({
  company,
}: {
  company: NonNullable<NonNullable<EventDetail["saloons"]>[number]["company"]>[number];
}) {
  const router = useRouter();

  const handleClick = () => {
    if (company.link) {
      router.push(company.link);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-3 p-2.5 rounded-lg bg-white/40 hover:bg-white/60 transition-colors"
    >
      <div className="w-9 h-9 rounded-lg bg-white/40 border border-border/40 flex items-center justify-center overflow-hidden shrink-0">
        {company.logo ? (
          <OptimizedImage src={company.logo} alt="" width={36} height={36} className="w-full h-full" />
        ) : (
          <span className="text-xs font-bold text-text-secondary/40">{company.name.slice(0, 1)}</span>
        )}
      </div>
      <div className="flex-1 min-w-0 text-right">
        <p className="text-sm font-medium text-text-primary">{company.name}</p>
        {company.booth && (
          <p className="text-[11px] text-text-secondary">غرفه {company.booth}</p>
        )}
      </div>
      {company.link && (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-secondary shrink-0">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      )}
    </button>
  );
}
