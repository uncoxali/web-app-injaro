"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  getEventDetail,
  toggleSaveEvent,
  type EventDetail,
} from "@/lib/api/events";
import { getLandingEventBySlug, type LandingEvent } from "@/lib/api/landing";
import { isAuthenticated, loginUrl } from "@/lib/auth-utils";
import { reportNavigationClick } from "@/lib/api/locations";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { ErrorState } from "@/components/ui/error-state";
import { PERSIAN_MONTHS } from "@/lib/constants/enums";
import { cn, toPersianDigits, imgUrl } from "@/lib/utils";

function formatPersianDateTime(iso?: string): string {
  if (!iso) return "";
  const [datePart, timePart] = iso.split("T");
  if (!datePart) return "";
  const [year, month, day] = datePart.split("-");
  const monthName = PERSIAN_MONTHS[parseInt(month) - 1] || "";
  const time = timePart ? timePart.slice(0, 5) : "";
  const dayPersian = toPersianDigits(parseInt(day));
  const yearPersian = toPersianDigits(parseInt(year));
  const timePersian = time ? toPersianDigits(time) : "";
  return `${dayPersian} ${monthName} ${yearPersian}${timePersian ? `، ساعت ${timePersian}` : ""}`;
}

interface EventDetailClientProps {
  initialData: EventDetail | null;
  slug: string;
  hasError: boolean;
}

export function EventDetailClient({
  initialData,
  slug,
  hasError: serverError,
}: EventDetailClientProps) {
  const router = useRouter();
  const [data, setData] = useState<EventDetail | null>(initialData);
  const [guestEvent, setGuestEvent] = useState<LandingEvent | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(!initialData && !serverError);
  const [error, setError] = useState(serverError);
  const [saved, setSaved] = useState(false);

  const [ticketQrOpen, setTicketQrOpen] = useState(false);
  const [imagePopupOpen, setImagePopupOpen] = useState(false);
  const [popupImageIndex, setPopupImageIndex] = useState(0);

  useEffect(() => {
    if (initialData || serverError) return;

    const authed = isAuthenticated();
    setIsGuest(!authed);

    if (authed) {
      getEventDetail(slug)
        .then(setData)
        .catch(() => setError(true))
        .finally(() => setLoading(false));
      return;
    }

    getLandingEventBySlug(slug)
      .then((event) => {
        if (event) setGuestEvent(event);
        else setError(true);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug, initialData, serverError]);

  const handleParticipate = useCallback(() => {
    router.push(loginUrl(`/events/${slug}`));
  }, [router, slug]);

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

  const handleShare = useCallback(() => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: data?.topic, url });
    } else {
      navigator.clipboard.writeText(url).then(() => toast.success("لینک کپی شد"));
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
        onShare={() => {
          const url = window.location.href;
          if (navigator.share) {
            navigator.share({ title: guestEvent.topic, url });
          } else {
            navigator.clipboard.writeText(url).then(() => toast.success("لینک کپی شد"));
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
  const statementLong = (data.statement?.length || 0) > 200;
  const sideOrgs = data.side_organizers || [];
  const talks = data.conversation_panel || [];
  const saloons = data.saloons || [];

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <button
        onClick={() => router.back()}
        aria-label="بازگشت"
        className="fixed top-4 start-4 z-20 w-9 h-9 rounded-full bg-background/85 backdrop-blur-sm shadow-md flex items-center justify-center text-text-primary hover:bg-background transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      <GallerySection images={images} onOpenImage={handleOpenImage} />

      <div className="px-4 pt-4 pb-3">
        <div className="flex items-start gap-2">
          <h1 className="text-xl font-bold text-text-primary flex-1 leading-snug">
            {data.topic}
          </h1>
          {data.is_vip && (
            <Badge variant="warning" size="sm" className="shrink-0">
              VIP
            </Badge>
          )}
        </div>

        {data.start_datetime && (
          <p className="text-sm text-text-secondary mt-2 flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="shrink-0">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            {formatPersianDateTime(data.start_datetime)}
            {data.finish_datetime && ` — ${formatPersianDateTime(data.finish_datetime)}`}
          </p>
        )}

        {data.location && (
          <button
            onClick={handleNavigate}
            className="mt-2 flex items-center gap-1.5 text-sm text-primary font-medium hover:opacity-80 transition-opacity"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {data.location.name}
          </button>
        )}
      </div>

      <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-sm border-b border-border/40">
        <div className="flex gap-1.5 px-4 py-2.5">
          <ActionIcon active={saved} onClick={handleSave} tooltip={saved ? "حذف از ذخیره" : "ذخیره"}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth={saved ? 0 : 1.5}>
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </ActionIcon>
          <ActionIcon onClick={handleShare} tooltip="اشتراک‌گذاری">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
          </ActionIcon>
          <ActionIcon onClick={() => data.GoogleCalendarLink && window.open(data.GoogleCalendarLink, "_blank")} tooltip="تقویم" disabled={!data.GoogleCalendarLink}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
              <polyline points="8 14 11 17 16 12" />
            </svg>
          </ActionIcon>
          <ActionIcon onClick={handleNavigate} tooltip="مسیریابی">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </ActionIcon>
          {data.need_ticket && (
            <ActionIcon onClick={() => setTicketQrOpen(true)} tooltip="بلیت" className="text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
              </svg>
            </ActionIcon>
          )}
        </div>
      </div>

      <div className="flex-1 px-4 pt-5 pb-8 space-y-6">
        {data.statement && (
          <section>
            <SectionTitle>درباره رویداد</SectionTitle>
            <StatementBlock text={data.statement} />
          </section>
        )}

        {data.main_organizers && (
          <section>
            <SectionTitle>برگزارکنندگان</SectionTitle>
            <p className="text-sm text-text-secondary leading-relaxed">
              {data.main_organizers}
            </p>
          </section>
        )}

        {sideOrgs.length > 0 && (
          <section>
            <SectionTitle>برگزارکنندگان فرعی</SectionTitle>
            <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4 snap-x snap-mandatory scrollbar-none">
              {sideOrgs.map((org) => (
                <div
                  key={org.id}
                  className="snap-start shrink-0 flex flex-col items-center gap-2 w-20"
                >
                  <div className="w-14 h-14 rounded-xl bg-surface border border-border/60 flex items-center justify-center overflow-hidden">
                    {org.logo ? (
                      <img src={imgUrl(org.logo)} alt={org.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg font-bold text-text-secondary/40">
                        {org.name.slice(0, 1)}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-text-secondary text-center line-clamp-2 leading-snug">
                    {org.name}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {talks.length > 0 && (
          <section>
            <SectionTitle>سخنرانان / پنل گفتگو</SectionTitle>
            <div className="flex flex-col gap-2">
              {talks.map((talk, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-border/50"
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
                    <span className="text-[10px] px-2 py-1 rounded-md bg-surface text-text-secondary border border-border/50 shrink-0">
                      {talk.time}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {saloons.length > 0 && (
          <section>
            <SectionTitle>سالن‌ها و غرفه‌ها</SectionTitle>
            <SaloonsAccordion saloons={saloons} />
          </section>
        )}
      </div>

      <Modal open={ticketQrOpen} onClose={() => setTicketQrOpen(false)} title="بلیت رویداد">
        <div className="flex flex-col items-center py-6">
          <div className="w-52 h-52 rounded-xl bg-gradient-to-br from-primary/[0.04] to-surface border border-border flex items-center justify-center">
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
              className="absolute top-4 end-4 z-10 w-9 h-9 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/25 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <img
              src={imgUrl(images[popupImageIndex]?.url)}
              alt={images[popupImageIndex]?.alt || ""}
              className="max-w-full max-h-full object-contain px-4"
            />
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
  const imageUrl = imgUrl(event.thumbnail);

  return (
    <div className="flex min-h-dvh flex-col bg-background pb-32">
      <button
        onClick={onBack}
        aria-label="بازگشت"
        className="fixed top-4 start-4 z-20 w-9 h-9 rounded-full bg-background/85 backdrop-blur-sm shadow-md flex items-center justify-center text-text-primary"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      <div className="relative aspect-[4/3] bg-surface">
        {imageUrl ? (
          <img src={imageUrl} alt={event.topic} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-text-secondary/30">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
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
      <div className="relative h-64 bg-gradient-to-b from-primary/[0.04] to-surface flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-text-secondary/20">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      </div>
    );
  }

  return (
    <div className="relative">
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
            className="snap-start shrink-0 w-full h-64 overflow-hidden relative"
          >
            <img
              src={imgUrl(img.url)}
              alt={img.alt || ""}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
          </button>
        ))}
      </div>
      {images.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {images.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-2 rounded-full transition-all",
                i === activeIndex
                  ? "bg-white w-5"
                  : "bg-white/50 w-2"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-sm font-bold text-text-primary mb-3">
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
            className="rounded-xl bg-surface border border-border/50 overflow-hidden"
          >
            <button
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="flex items-center justify-between w-full h-12 px-4 text-sm font-medium text-text-primary hover:bg-surface/50 transition-colors"
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
                  <div className="px-4 pb-3 border-t border-border/30 pt-3">
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
      className="flex items-center gap-3 p-2.5 rounded-lg bg-surface hover:bg-surface/80 transition-colors"
    >
      <div className="w-9 h-9 rounded-lg bg-surface border border-border/60 flex items-center justify-center overflow-hidden shrink-0">
        {company.logo ? (
          <img src={imgUrl(company.logo)} alt="" className="w-full h-full object-cover" />
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

function ActionIcon({
  children,
  onClick,
  tooltip,
  active,
  disabled,
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  tooltip?: string;
  active?: boolean;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={tooltip}
      title={tooltip}
      className={cn(
        "flex items-center justify-center h-10 w-10 rounded-xl border border-border/50 bg-surface text-text-secondary hover:border-primary/30 hover:text-primary hover:bg-primary/[0.02] transition-all shadow-sm shadow-border/20",
        active && "border-primary/30 text-primary bg-primary/5",
        disabled && "opacity-40 cursor-not-allowed",
        className
      )}
    >
      {children}
    </button>
  );
}
