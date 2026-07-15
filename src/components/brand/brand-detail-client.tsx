"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { toJalaali } from "jalaali-js";
import {
  getLocationDetail,
  pickFeaturedEvent,
  resolveActiveEventSlug,
  type LocationDetail,
  type KenarItem,
  type BrandEvent,
} from "@/lib/api/locations";
import {
  getEventDetail,
  getPublicEventDetail,
  getEventInteractionState,
  toggleGoingEvent,
  toggleLikeEvent,
  toggleSaveEvent,
  type EventDetail,
  type EventInteractionState,
} from "@/lib/api/events";
import { isAuthenticated } from "@/lib/auth-utils";
import { useCategories } from "@/lib/queries/categories";
import { goingEventsKeys, savedEventsKeys } from "@/lib/queries/saved-events";
import { Modal } from "@/components/ui/modal";
import { Spinner } from "@/components/ui/spinner";
import { ErrorState } from "@/components/ui/error-state";
import { PERSIAN_MONTHS } from "@/lib/constants/enums";
import { cn, toPersianDigits, shareContent } from "@/lib/utils";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { Icon } from "@/components/ui/icon";

interface BrandDetailClientProps {
  initialData: LocationDetail | null;
  slug: string;
}

export function BrandDetailClient({
  initialData,
  slug,
}: BrandDetailClientProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const eventFromQuery = searchParams.get("event");
  const { data: categories = [] } = useCategories();
  const [data, setData] = useState<LocationDetail | null>(initialData);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState(false);
  const [going, setGoing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [actionPending, setActionPending] = useState<
    "going" | "like" | "save" | null
  >(null);
  const [showQr, setShowQr] = useState(false);
  const [eventDetail, setEventDetail] = useState<EventDetail | null>(null);
  const eventsRef = useRef<HTMLDivElement>(null);

  const featuredEvent = useMemo(
    () => pickFeaturedEvent(data?.events, eventFromQuery),
    [data?.events, eventFromQuery]
  );
  const activeEventSlug = useMemo(
    () => resolveActiveEventSlug(data?.events, eventFromQuery),
    [data?.events, eventFromQuery]
  );

  const galleryImages = useMemo(() => {
    if (eventDetail?.images?.length) {
      return eventDetail.images.map((image) => ({
        url: image.url,
        alt: image.alt || eventDetail.topic,
      }));
    }

    const eventThumbnail =
      eventDetail?.thumbnail || featuredEvent?.thumbnail;
    if (eventThumbnail) {
      return [
        {
          url: eventThumbnail,
          alt: eventDetail?.topic || featuredEvent?.topic || data?.name || "",
        },
      ];
    }

    if (data?.banner) {
      return [{ url: data.banner, alt: data.name }];
    }

    return [];
  }, [eventDetail, featuredEvent, data?.banner, data?.name]);

  const applyInteractionState = useCallback(
    (
      state: EventInteractionState,
      fallback?: EventInteractionState
    ) => {
      if (typeof state.is_going === "boolean") {
        setGoing(state.is_going);
      } else if (typeof fallback?.is_going === "boolean") {
        setGoing(fallback.is_going);
      }

      if (typeof state.is_saved === "boolean") {
        setSaved(state.is_saved);
      } else if (typeof fallback?.is_saved === "boolean") {
        setSaved(fallback.is_saved);
      }

      if (typeof state.is_liked === "boolean") {
        setLiked(state.is_liked);
      } else if (typeof fallback?.is_liked === "boolean") {
        setLiked(fallback.is_liked);
      }

      if (typeof state.likes === "number") {
        setLikes(state.likes);
      } else if (typeof fallback?.likes === "number") {
        setLikes(fallback.likes);
      }
    },
    []
  );

  const refreshPageData = useCallback(async (
    interactionFallback?: EventInteractionState
  ) => {
    const [locationDetail, eventState] = await Promise.all([
      getLocationDetail(slug),
      activeEventSlug
        ? getEventInteractionState(activeEventSlug)
        : Promise.resolve(null),
    ]);

    setData(locationDetail);
    if (eventState) {
      applyInteractionState(eventState, interactionFallback);
    }

    await Promise.all([
      queryClient.invalidateQueries({ queryKey: savedEventsKeys.all }),
      queryClient.invalidateQueries({ queryKey: goingEventsKeys.all }),
    ]);
  }, [slug, activeEventSlug, applyInteractionState, queryClient]);

  useEffect(() => {
    let cancelled = false;

    getLocationDetail(slug)
      .then((detail) => {
        if (cancelled) return;
        setData(detail);
      })
      .catch(() => {
        if (cancelled) return;
        if (!initialData) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug, initialData]);

  useEffect(() => {
    if (!activeEventSlug) {
      setEventDetail(null);
      return;
    }

    let cancelled = false;

    const loadEventDetail = async () => {
      try {
        const detail = isAuthenticated()
          ? await getEventDetail(activeEventSlug)
          : await getPublicEventDetail(activeEventSlug);
        if (!cancelled) {
          setEventDetail(detail);
        }
      } catch {
        if (!cancelled) {
          setEventDetail(null);
        }
      }
    };

    loadEventDetail();

    return () => {
      cancelled = true;
    };
  }, [activeEventSlug]);

  useEffect(() => {
    if (!activeEventSlug) {
      setGoing(false);
      setSaved(false);
      setLiked(false);
      setLikes(0);
      return;
    }

    let cancelled = false;

    getEventInteractionState(activeEventSlug)
      .then((state) => {
        if (cancelled) return;
        applyInteractionState(state);
      })
      .catch(() => {
        if (cancelled) return;
        setGoing(false);
        setSaved(false);
        setLiked(false);
        setLikes(0);
      });

    return () => {
      cancelled = true;
    };
  }, [activeEventSlug, applyInteractionState]);

  const handleSave = useCallback(async () => {
    if (!activeEventSlug || actionPending) return;
    const wasSaved = saved;
    const nextSaved = !wasSaved;
    setActionPending("save");
    setSaved(nextSaved);
    try {
      const result = await toggleSaveEvent(activeEventSlug);
      applyInteractionState(result, { is_saved: nextSaved });
      await refreshPageData({ is_saved: nextSaved });
      toast.success(nextSaved ? "رویداد ذخیره شد" : "از ذخیره خارج شد");
    } catch {
      setSaved(wasSaved);
      toast.error("خطا در ذخیره‌سازی");
    } finally {
      setActionPending(null);
    }
  }, [saved, activeEventSlug, actionPending, applyInteractionState, refreshPageData]);

  const handleLike = useCallback(async () => {
    if (!activeEventSlug || actionPending) return;
    const wasLiked = liked;
    const prevLikes = likes;
    const nextLiked = !wasLiked;
    setActionPending("like");
    setLiked(nextLiked);
    setLikes((count) => Math.max(0, count + (wasLiked ? -1 : 1)));
    try {
      const result = await toggleLikeEvent(activeEventSlug);
      applyInteractionState(result, {
        is_liked: nextLiked,
        likes: Math.max(0, prevLikes + (wasLiked ? -1 : 1)),
      });
      await refreshPageData({
        is_liked: nextLiked,
        likes: Math.max(0, prevLikes + (wasLiked ? -1 : 1)),
      });
      toast.success(nextLiked ? "رویداد پسندیده شد" : "پسند برداشته شد");
    } catch {
      setLiked(wasLiked);
      setLikes(prevLikes);
      toast.error("خطا در ثبت پسند");
    } finally {
      setActionPending(null);
    }
  }, [liked, likes, activeEventSlug, actionPending, applyInteractionState, refreshPageData]);

  const handleGoing = useCallback(async () => {
    if (!activeEventSlug || actionPending) return;
    const wasGoing = going;
    const nextGoing = !wasGoing;
    setActionPending("going");
    setGoing(nextGoing);
    try {
      const result = await toggleGoingEvent(activeEventSlug);
      applyInteractionState(result, { is_going: nextGoing });
      await refreshPageData({ is_going: nextGoing });
      toast.success(nextGoing ? "شرکت شما ثبت شد" : "شرکت لغو شد");
    } catch {
      setGoing(wasGoing);
      toast.error("خطا در ثبت شرکت");
    } finally {
      setActionPending(null);
    }
  }, [going, activeEventSlug, actionPending, applyInteractionState, refreshPageData]);

  const handleShare = useCallback(async () => {
    const result = await shareContent({ title: data?.name });
    if (result === "copied") {
      toast.success("لینک کپی شد");
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
  const categoryName =
    categories.find((cat) => cat.id === data.category)?.name || "";

  return (
    <div className="flex min-h-dvh flex-col bg-[#ececec] dark:bg-background">
      <div className="relative px-4 pt-4">
        <button
          onClick={() => router.back()}
          aria-label="بازگشت"
          className="absolute top-7 inset-s-7 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-border/30 bg-white text-primary shadow-md transition-colors hover:bg-white/90 dark:bg-surface"
        >
          <Icon name="chevronLeft" size="md" color="primary" className="scale-x-[-1]" />
        </button>

        <div className="overflow-hidden rounded-3xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.07)] dark:border dark:border-border/30 dark:bg-surface">
          <BrandGallery
            images={galleryImages}
            logo={data.logo}
            name={eventDetail?.topic || featuredEvent?.topic || data.name}
          />
          <BrandActionBar
            likes={likes}
            saved={saved}
            liked={liked}
            eventActionsDisabled={!activeEventSlug}
            onSave={handleSave}
            onLike={handleLike}
            onShare={handleShare}
            onQr={() => setShowQr(true)}
          />
        </div>
      </div>

      <div className="px-4 pt-4">

        <div className="mt-4 flex gap-2.5">
          <button
            onClick={handleGoing}
            disabled={!activeEventSlug || actionPending === "going"}
            className={cn(
              "flex h-12 flex-1 items-center justify-center rounded-full text-sm font-semibold shadow-[0_6px_20px_rgba(255,90,95,0.35)] transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50",
              going
                ? "border border-primary bg-white text-primary"
                : "bg-primary text-white"
            )}
          >
            {actionPending === "going"
              ? "در حال ثبت..."
              : going
                ? "شرکت کرده"
                : "شرکت می‌کنم"}
          </button>
          <button
            onClick={handleNavigate}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full border border-primary bg-white text-sm font-semibold text-primary shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-transform active:scale-[0.98] dark:border-primary/50 dark:bg-surface"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-white">
              <Icon name="navigation" size={20} color="white" />
            </span>
            مسیریابی
          </button>
        </div>

        <BrandInfoStrip
          address={data.address}
          category={categoryName}
          phone={data.phone}
          onAddressClick={handleNavigate}
        />

        <section className="mt-6">
          <SectionTitle>درباره این برند</SectionTitle>
          {data.description ? (
            <p className="text-sm leading-relaxed text-text-secondary">
              {data.description}
            </p>
          ) : (
            <p className="text-sm leading-relaxed text-text-secondary/70">
              اطلاعاتی برای این برند ثبت نشده است.
            </p>
          )}
          <BrandContactLinks data={data} />
        </section>
      </div>

      <div className="flex-1 space-y-6 px-4 pt-6 pb-8">
        {kenar.length > 0 && (
          <KenarCardsSection items={kenar} />
        )}

        {events.length > 0 && (
          <div ref={eventsRef}>
            <BrandEventsCarousel
              events={events}
              brandName={data.name}
              brandSlug={slug}
              activeEventSlug={activeEventSlug}
            />
          </div>
        )}
      </div>

      <Modal open={showQr} onClose={() => setShowQr(false)} title="کیوآرکد برند">
        <div className="flex flex-col items-center py-4">
          {data.qr_code ? (
            <OptimizedImage src={data.qr_code} alt="QR" width={192} height={192} className="h-48 w-48 rounded-xl" />
          ) : (
            <div className="flex h-48 w-48 items-center justify-center rounded-xl border border-border bg-linear-to-br from-primary/4 to-surface">
              <Icon name="qr" size={100} className="text-text-secondary/20" />
            </div>
          )}
          <p className="mt-3 text-xs text-text-secondary">اسکن کنید تا برند را مشاهده کنید</p>
        </div>
      </Modal>
    </div>
  );
}

function BrandGallery({
  images,
  logo,
  name,
}: {
  images: { url: string; alt?: string }[];
  logo?: string;
  name: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    setActiveIndex(Math.min(idx, Math.max(images.length - 1, 0)));
  }, [images.length]);

  const scroll = (direction: "prev" | "next") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({
      left: el.clientWidth * (direction === "next" ? 1 : -1),
      behavior: "smooth",
    });
  };

  if (images.length === 0) {
    return (
      <div className="relative flex h-72 items-center justify-center bg-linear-to-b from-primary/4 to-surface">
        {logo ? (
          <OptimizedImage src={logo} alt={name} width={80} height={80} className="h-20 w-20 rounded-2xl object-cover" />
        ) : (
          <span className="text-4xl font-bold text-primary/30">{name.slice(0, 1)}</span>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth scrollbar-none"
      >
        {images.map((img, i) => (
          <div key={i} className="relative h-72 w-full shrink-0 snap-start">
            <OptimizedImage
              src={img.url}
              alt={img.alt || name}
              fill
              priority={i === 0}
              sizes="(max-width: 480px) 100vw, 480px"
              className="object-cover"
            />
            <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/25 to-transparent" />
          </div>
        ))}
      </div>

      {logo ? (
        <div className="absolute top-3 inset-s-3 z-10 flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-white/90 p-1 shadow-md dark:bg-surface/90">
          <OptimizedImage src={logo} alt="" width={32} height={32} className="h-full w-full object-contain" />
        </div>
      ) : null}

      {images.length > 1 && (
        <>
          <CarouselArrow direction="prev" onClick={() => scroll("prev")} className="absolute top-1/2 inset-s-3 -translate-y-1/2" />
          <CarouselArrow direction="next" onClick={() => scroll("next")} className="absolute top-1/2 inset-e-3 -translate-y-1/2" />
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

function BrandActionBar({
  likes,
  saved,
  liked,
  eventActionsDisabled,
  onSave,
  onLike,
  onShare,
  onQr,
}: {
  likes: number;
  saved: boolean;
  liked: boolean;
  eventActionsDisabled?: boolean;
  onSave: () => void;
  onLike: () => void;
  onShare: () => void;
  onQr: () => void;
}) {
  const items = [
    {
      key: "like",
      label: toPersianDigits(likes),
      onClick: onLike,
      active: liked,
      disabled: eventActionsDisabled,
      icon: <Icon name="heart" size={24} active={liked} />,
    },
    {
      key: "share",
      label: "اشتراک گذاری",
      onClick: onShare,
      icon: <Icon name="share" size={24} />,
    },
    {
      key: "save",
      label: "ذخیره سازی",
      onClick: onSave,
      active: saved,
      disabled: eventActionsDisabled,
      icon: <Icon name="bookmark" size={24} active={saved} />,
    },
    {
      key: "qr",
      label: "کیوآرکد",
      onClick: onQr,
      icon: <Icon name="qr" size={24} />,
    },
  ];

  return (
    <div className="flex items-stretch border-t border-border/15">
      {items.map((item, index) => (
        <div key={item.key} className="flex flex-1 items-stretch">
          <button
            type="button"
            onClick={item.onClick}
            disabled={item.disabled}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-1.5 px-1 py-3.5 transition-colors hover:text-primary disabled:cursor-not-allowed disabled:opacity-40",
              item.active ? "text-primary" : "text-text-secondary"
            )}
          >
            {item.icon}
            <span className="text-[10px] font-medium leading-tight">{item.label}</span>
          </button>
          {index < items.length - 1 && <div className="w-px self-stretch bg-border/20" />}
        </div>
      ))}
    </div>
  );
}

function BrandInfoStrip({
  address,
  category,
  phone,
  onAddressClick,
}: {
  address?: string;
  category?: string;
  phone?: string;
  onAddressClick: () => void;
}) {
  const items = [
    {
      key: "address",
      label: address || "آدرس ثبت نشده",
      onClick: onAddressClick,
      icon: <Icon name="mapPin" size="md" color="primary" />,
    },
    {
      key: "category",
      label: category || "دسته‌بندی نامشخص",
      icon: <Icon name="feed" size="md" color="primary" />,
    },
    {
      key: "phone",
      label: phone || "تماس ثبت نشده",
      icon: <Icon name="phone" size="md" color="primary" />,
    },
  ];

  return (
    <div className="mt-4 flex rounded-2xl border border-border/20 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.05)] dark:border-border/30 dark:bg-surface">
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
              <span className="line-clamp-2 text-[10px] leading-snug text-text-secondary">
                {item.key === "phone" ? <span dir="ltr">{item.label}</span> : item.label}
              </span>
            </Comp>
            {index < items.length - 1 && <div className="w-px self-stretch bg-border/30" />}
          </div>
        );
      })}
    </div>
  );
}

function BrandContactLinks({ data }: { data: LocationDetail }) {
  if (!data.website && !data.instagram && !data.phone) return null;

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {data.website && (
        <a
          href={data.website}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-border/40 px-3 py-1.5 text-xs text-text-secondary transition-colors hover:border-primary/40 hover:text-primary"
        >
          وبسایت
        </a>
      )}
      {data.instagram && (
        <a
          href={data.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-border/40 px-3 py-1.5 text-xs text-text-secondary transition-colors hover:border-primary/40 hover:text-primary"
        >
          اینستاگرام
        </a>
      )}
      {data.phone && (
        <a
          href={`tel:${data.phone}`}
          className="rounded-full border border-border/40 px-3 py-1.5 text-xs text-text-secondary transition-colors hover:border-primary/40 hover:text-primary"
          dir="ltr"
        >
          {data.phone}
        </a>
      )}
    </div>
  );
}

function KenarCardsSection({ items }: { items: KenarItem[] }) {
  const router = useRouter();

  return (
    <section>
      <SectionTitle>برگزارکنندگان</SectionTitle>
      <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => item.link && router.push(item.link)}
            className="flex w-[88px] shrink-0 flex-col items-center gap-2"
          >
            <div className="flex h-[88px] w-[88px] items-center justify-center overflow-hidden rounded-2xl border border-border/20 bg-white p-3 shadow-[0_2px_12px_rgba(0,0,0,0.05)] dark:bg-surface">
              {item.image ? (
                <OptimizedImage
                  src={item.image}
                  alt={item.title}
                  width={72}
                  height={72}
                  className="h-full w-full object-contain"
                />
              ) : (
                <span className="text-2xl font-bold text-text-secondary/40">
                  {item.title.slice(0, 1)}
                </span>
              )}
            </div>
            <p className="line-clamp-2 text-center text-[10px] leading-snug text-text-secondary">
              {item.title}
            </p>
          </button>
        ))}
      </div>
    </section>
  );
}

function toShamsiDate(gregDateStr: string): string {
  const d = new Date(gregDateStr);
  if (isNaN(d.getTime())) return gregDateStr;
  const j = toJalaali(d.getFullYear(), d.getMonth() + 1, d.getDate());
  return `${toPersianDigits(j.jd)} ${PERSIAN_MONTHS[j.jm - 1]} ${toPersianDigits(j.jy)}`;
}

function BrandEventsCarousel({
  events,
  brandName,
  brandSlug,
  activeEventSlug,
}: {
  events: NonNullable<LocationDetail["events"]>;
  brandName: string;
  brandSlug: string;
  activeEventSlug?: string | null;
}) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = useCallback((direction: "prev" | "next") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({
      left: el.clientWidth * 0.75 * (direction === "next" ? 1 : -1),
      behavior: "smooth",
    });
  }, []);

  return (
    <section>
      <SectionTitle>رویدادهای {brandName}</SectionTitle>
      <div className="relative">
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto pb-1 scrollbar-none snap-x snap-mandatory"
        >
          {events.map((ev) => (
            <button
              key={ev.event_slug}
              onClick={() =>
                router.push(
                  `/brands/${brandSlug}?event=${encodeURIComponent(ev.event_slug)}`
                )
              }
              className={cn(
                "group w-[140px] shrink-0 snap-start overflow-hidden rounded-2xl bg-white text-right shadow-[0_6px_24px_rgba(0,0,0,0.08)] transition-transform active:scale-[0.98] dark:border dark:border-border/30 dark:bg-surface",
                activeEventSlug === ev.event_slug && "ring-2 ring-primary/40"
              )}
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-surface">
                {ev.thumbnail ? (
                  <OptimizedImage
                    src={ev.thumbnail}
                    alt={ev.topic}
                    fill
                    sizes="140px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-text-secondary/20">
                    <Icon name="camera" size={28} className="text-text-secondary/40" />
                  </div>
                )}
                <div className="absolute inset-x-2 bottom-2 rounded-xl bg-white/85 px-2 py-1.5 backdrop-blur-sm dark:bg-surface/90">
                  <p className="line-clamp-2 text-[10px] font-medium leading-snug text-text-primary">
                    {ev.topic}
                  </p>
                  {ev.start_datetime ? (
                    <p className="mt-0.5 text-[9px] text-text-secondary">
                      {toShamsiDate(ev.start_datetime)}
                    </p>
                  ) : null}
                </div>
              </div>
            </button>
          ))}
        </div>
        {events.length > 2 && (
          <>
            <CarouselArrow direction="prev" onClick={() => scroll("prev")} className="absolute top-1/2 inset-s-0 -translate-y-1/2" />
            <CarouselArrow direction="next" onClick={() => scroll("next")} className="absolute top-1/2 inset-e-0 -translate-y-1/2" />
          </>
        )}
      </div>
    </section>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-3 text-sm font-bold text-text-primary">{children}</h2>;
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
      <Icon
        name="chevronLeft"
        size="sm"
        color="white"
        className={direction === "next" ? "scale-x-[-1]" : undefined}
      />
    </button>
  );
}
