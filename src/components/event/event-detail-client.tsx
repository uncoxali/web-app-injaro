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
import { landingKeys } from "@/lib/queries/landing";
import { isAuthenticated, loginUrl } from "@/lib/auth-utils";
import { reportNavigationClick } from "@/lib/api/locations";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { ErrorState } from "@/components/ui/error-state";
import { PERSIAN_MONTHS } from "@/lib/constants/enums";
import { cn, toPersianDigits } from "@/lib/utils";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { Icon } from "@/components/ui/icon";

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
    <div className="flex min-h-dvh flex-col">
      <div className="relative">
        <GallerySection images={images} onOpenImage={handleOpenImage} />
        <button
          onClick={() => router.back()}
          aria-label="بازگشت"
          className="absolute top-4 inset-s-4 z-20 w-9 h-9 rounded-full bg-background/85 backdrop-blur-xs shadow-md flex items-center justify-center text-text-primary hover:bg-background transition-colors"
        >
          <Icon name="chevronLeft" size="md" className="scale-x-[-1]" />
        </button>
      </div>

      <div className="px-4 pt-4 pb-3">
        <div className="bg-white/60 dark:bg-white/3 backdrop-blur-xl border border-border/15 shadow-xs rounded-2xl p-4 space-y-3">
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
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Icon name="calendar" size="sm" color="primary" />
              </div>
              <span className="font-medium">
                {formatPersianDateTime(data.start_datetime)}
                {data.finish_datetime && ` — ${formatPersianDateTime(data.finish_datetime)}`}
              </span>
            </div>
          )}

          {data.location && (
            <button
              onClick={handleNavigate}
              className="flex items-center gap-2 text-sm text-text-secondary hover:text-primary transition-colors w-full text-right"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Icon name="mapPin" size="sm" color="primary" />
              </div>
              <span className="font-medium">{data.location.name}</span>
            </button>
          )}
        </div>
      </div>

      <div className="sticky top-0 z-10 bg-background/60 backdrop-blur-2xl border-b border-border/40">
        <div className="flex gap-1.5 px-4 py-2.5">
          <ActionIcon active={saved} onClick={handleSave} tooltip={saved ? "حذف از ذخیره" : "ذخیره"}>
            <Icon name="bookmark" size="md" active={saved} />
          </ActionIcon>
          <ActionIcon onClick={handleShare} tooltip="اشتراک‌گذاری">
            <Icon name="share" size="md" />
          </ActionIcon>
          <ActionIcon onClick={() => data.GoogleCalendarLink && window.open(data.GoogleCalendarLink, "_blank")} tooltip="تقویم" disabled={!data.GoogleCalendarLink}>
            <Icon name="calendar" size="md" />
          </ActionIcon>
          <ActionIcon onClick={handleNavigate} tooltip="مسیریابی">
            <Icon name="mapPin" size="md" />
          </ActionIcon>
          {data.need_ticket && (
            <ActionIcon onClick={() => setTicketQrOpen(true)} tooltip="بلیت" className="text-primary">
              <Icon name="qr" size="md" color="primary" />
            </ActionIcon>
          )}
        </div>
      </div>

      <div className="flex-1 px-4 pt-5 pb-8 space-y-5">
        {data.statement && (
          <section>
            <SectionTitle>درباره رویداد</SectionTitle>
            <div className="bg-white/60 dark:bg-white/3 backdrop-blur-xl border border-border/15 shadow-xs rounded-2xl p-4">
              <StatementBlock text={data.statement} />
            </div>
          </section>
        )}

        {data.main_organizers && (
          <section>
            <SectionTitle>برگزارکنندگان</SectionTitle>
            <div className="bg-white/60 dark:bg-white/3 backdrop-blur-xl border border-border/15 shadow-xs rounded-2xl p-4">
              <p className="text-sm text-text-secondary leading-relaxed">
                {data.main_organizers}
              </p>
            </div>
          </section>
        )}

        {sideOrgs.length > 0 && (
          <section>
            <SectionTitle>برگزارکنندگان فرعی</SectionTitle>
            <div className="bg-white/60 dark:bg-white/3 backdrop-blur-xl border border-border/15 shadow-xs rounded-2xl p-4">
              <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1 snap-x snap-mandatory scrollbar-none">
                {sideOrgs.map((org) => (
                  <div
                    key={org.id}
                    className="snap-start shrink-0 flex flex-col items-center gap-2 w-20"
                  >
                    <div className="w-14 h-14 rounded-xl bg-white/50 dark:bg-white/5 border border-border/40 flex items-center justify-center overflow-hidden shadow-xs">
                      {org.logo ? (
                        <OptimizedImage src={org.logo} alt={org.name} width={56} height={56} className="w-full h-full" />
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
            </div>
          </section>
        )}

        {talks.length > 0 && (
          <section>
            <SectionTitle>سخنرانان / پنل گفتگو</SectionTitle>
            <div className="bg-white/60 dark:bg-white/3 backdrop-blur-xl border border-border/15 shadow-xs rounded-2xl p-4">
              <div className="flex flex-col gap-2">
                {talks.map((talk, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/50 dark:bg-white/5 border border-border/30"
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
                      <span className="text-[10px] px-2 py-1 rounded-full bg-white/50 dark:bg-white/5 text-text-secondary border border-border/30 shrink-0 font-medium">
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
            <Icon name="qr" size={110} className="text-text-secondary/20" />
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
              <Icon name="close" size={20} />
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
          <Icon name="chevronLeft" size="md" className="scale-x-[-1]" />
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
          <Icon name="share" size="sm" />
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
      <div className="relative h-64 bg-linear-to-b from-primary/4 to-surface flex items-center justify-center">
        <Icon name="camera" size={48} className="text-text-secondary/20" />
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
            <OptimizedImage
              src={img.url}
              alt={img.alt || ""}
              fill
              priority={i === 0}
              sizes="(max-width: 480px) 100vw, 480px"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent pointer-events-none" />
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
    <div className="flex items-center gap-2 mb-3">
      <div className="w-1 h-4 rounded-full bg-primary/60" />
      <h2 className="text-sm font-bold text-text-primary">
        {children}
      </h2>
    </div>
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
            className="rounded-xl bg-white/50 dark:bg-white/5 border border-border/30 overflow-hidden"
          >
            <button
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="flex items-center justify-between w-full h-12 px-4 text-sm font-medium text-text-primary hover:bg-white/30 dark:hover:bg-white/5 transition-colors"
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
      className="flex items-center gap-3 p-2.5 rounded-lg bg-white/40 dark:bg-white/5 hover:bg-white/60 dark:hover:bg-white/10 transition-colors"
    >
      <div className="w-9 h-9 rounded-lg bg-white/40 dark:bg-white/5 border border-border/40 flex items-center justify-center overflow-hidden shrink-0">
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
        <Icon name="chevronLeft" size="sm" className="shrink-0 text-text-secondary" />
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
        "flex items-center justify-center h-10 w-10 rounded-xl border border-border/50 bg-surface text-text-secondary hover:border-primary/30 hover:text-primary hover:bg-primary/2 transition-all shadow-xs shadow-border/20",
        active && "border-primary/30 text-primary bg-primary/5",
        disabled && "opacity-40 cursor-not-allowed",
        className
      )}
    >
      {children}
    </button>
  );
}
