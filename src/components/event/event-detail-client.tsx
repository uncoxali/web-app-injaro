"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toJalaali } from "jalaali-js";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  getEventDetail,
  getPublicEventDetail,
  type EventDetail,
} from "@/lib/api/events";
import { getLandingEventBySlug, type LandingEvent } from "@/lib/api/landing";
import { landingKeys } from "@/lib/queries/landing";
import { isAuthenticated, loginUrl } from "@/lib/auth-utils";
import {
  getLocationDetail,
  reportNavigationClick,
  type BrandEvent,
  type LocationDetail,
} from "@/lib/api/locations";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ErrorState } from "@/components/ui/error-state";
import { PERSIAN_MONTHS } from "@/lib/constants/enums";
import { toPersianDigits } from "@/lib/utils";
import { normalizeEventLocationSlug } from "@/components/tazeha/tazeha-format";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { Icon } from "@/components/ui/icon";

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
  const [locationDetail, setLocationDetail] = useState<LocationDetail | null>(null);
  const [guestEvent, setGuestEvent] = useState<LandingEvent | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState(false);

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

  useEffect(() => {
    const locSlug = normalizeEventLocationSlug(data?.location);
    if (!locSlug || isGuest) return;

    let cancelled = false;
    getLocationDetail(locSlug)
      .then((detail) => {
        if (!cancelled) setLocationDetail(detail);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [data?.location, isGuest]);

  const pastEvents = useMemo(() => {
    const events = locationDetail?.events || [];
    return events.filter((event) => event.event_slug !== slug);
  }, [locationDetail?.events, slug]);

  const handleParticipate = useCallback(() => {
    router.push(loginUrl(`/events/${slug}`));
  }, [router, slug]);

  const handleNavigate = useCallback(() => {
    if (data?.GoogleMapLink) {
      window.open(data.GoogleMapLink, "_blank");
      return;
    }
    if (locationDetail) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${locationDetail.latitude},${locationDetail.longitude}`;
      window.open(url, "_blank");
      reportNavigationClick(locationDetail.slug);
      return;
    }
    const locationSlug = normalizeEventLocationSlug(data?.location);
    if (locationSlug) {
      reportNavigationClick(locationSlug);
    }
  }, [data, locationDetail]);

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#ececec] dark:bg-background">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || (!data && !guestEvent)) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#ececec] dark:bg-background">
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
      <div className="flex min-h-dvh items-center justify-center bg-[#ececec] dark:bg-background">
        <ErrorState onRetry={() => window.location.reload()} />
      </div>
    );
  }

  const locationName =
    locationDetail?.name ||
    (typeof data.location === "object" ? data.location.name : "") ||
    "";
  const address =
    locationDetail?.address ||
    (typeof data.location === "string" ? data.location : locationDetail?.address);
  const bannerImage =
    locationDetail?.banner ||
    data.thumbnail ||
    data.images?.[0]?.url;
  const eventImage =
    data.images?.[0]?.url || data.thumbnail || bannerImage;

  return (
    <div className="flex min-h-dvh flex-col bg-[#ececec] pb-8 dark:bg-background">
      <EventLocationHeader
        bannerImage={bannerImage}
        logo={locationDetail?.logo}
        locationName={locationName}
        subtitle={data.topic}
        address={address}
        subwayStation={locationDetail?.subway_station}
        busStation={locationDetail?.bus_station}
        parking={locationDetail?.parking}
        onBack={() => router.back()}
        onNavigate={handleNavigate}
      />

      <div className="space-y-6 px-4 pb-8 pt-6">
        <section className="space-y-4">
          <SectionDivider title="آخرین رویداد" />
          <LatestEventCard
            image={eventImage}
            logo={locationDetail?.logo}
            topic={data.topic}
            startDatetime={data.start_datetime}
            finishDatetime={data.finish_datetime}
            isLive={locationDetail?.events?.find((event) => event.event_slug === slug)?.is_live}
          />
        </section>

        {pastEvents.length > 0 ? (
          <section className="space-y-4">
            <SectionDivider title="رویدادهای گذشته" />
            <PastEventsGrid events={pastEvents} />
          </section>
        ) : null}
      </div>
    </div>
  );
}

function EventLocationHeader({
  bannerImage,
  logo,
  locationName,
  subtitle,
  address,
  subwayStation,
  busStation,
  parking,
  onBack,
  onNavigate,
}: {
  bannerImage?: string;
  logo?: string;
  locationName: string;
  subtitle?: string;
  address?: string;
  subwayStation?: string;
  busStation?: string;
  parking?: string;
  onBack: () => void;
  onNavigate: () => void;
}) {
  const hasFacilities = Boolean(subwayStation || busStation || parking);

  return (
    <div className="overflow-hidden">
      <div className="relative h-56 w-full overflow-hidden bg-linear-to-br from-primary/8 via-[#ececec] to-primary/5 dark:via-background">
        {bannerImage ? (
          <OptimizedImage
            src={bannerImage}
            alt={locationName}
            fill
            priority
            sizes="(max-width: 480px) 100vw, 480px"
            className="object-cover"
          />
        ) : null}

        <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-white/60 bg-white/78 px-4 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.06)] backdrop-blur-md dark:border-border/20 dark:bg-surface/85">
          <div className="flex items-center gap-3">
            {logo ? (
              <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-white shadow-[0_2px_10px_rgba(0,0,0,0.08)]">
                <OptimizedImage
                  src={logo}
                  alt={locationName}
                  width={52}
                  height={52}
                  className="h-full w-full object-contain p-1.5"
                />
              </div>
            ) : null}
            <div className="min-w-0 flex-1 text-right">
              <h1 className="text-[15px] font-bold leading-snug text-text-primary">
                {locationName || subtitle}
              </h1>
              {locationName && subtitle ? (
                <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-text-secondary/80">
                  {subtitle}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <button
          type="button"
          dir="ltr"
          onClick={onNavigate}
          className="absolute top-3 left-3 z-10 flex h-10 items-center gap-2 rounded-full bg-primary ps-4 pe-1.5 text-sm font-semibold text-white shadow-[0_6px_20px_rgba(255,90,95,0.35)] transition-transform active:scale-[0.98]"
        >
          مسیریابی
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white">
            <Icon name="navigation" size={16} color="primary" />
          </span>
        </button>

        <button
          type="button"
          onClick={onBack}
          aria-label="بازگشت"
          className="absolute top-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/70 bg-white/90 text-primary shadow-md transition-colors hover:bg-white dark:border-border/30 dark:bg-surface/90"
        >
          <Icon name="chevronLeft" size="md" color="primary" className="scale-x-[-1]" />
        </button>
      </div>

      {(address || hasFacilities) ? (
        <div className="space-y-3 px-4 py-4">
          {address ? (
            <p className="flex items-start gap-2 text-[13px] leading-relaxed text-text-secondary">
              <Icon name="mapPin" size="sm" color="primary" className="mt-0.5 shrink-0" />
              <span>
                <span className="font-semibold text-text-primary">آدرس: </span>
                {address}
              </span>
            </p>
          ) : null}

          {hasFacilities ? (
            <div className="flex flex-nowrap items-center justify-start gap-2 overflow-x-auto scrollbar-none">
              {subwayStation ? (
                <FacilityTag icon="metro" label={subwayStation} />
              ) : null}
              {busStation ? (
                <FacilityTag icon="bus" label={busStation} />
              ) : null}
              {parking ? (
                <FacilityTag icon="parking" label={parking} />
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function FacilityTag({
  icon,
  label,
}: {
  icon: "metro" | "bus" | "parking";
  label: string;
}) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border/50 bg-white px-3 py-1.5 text-xs font-medium whitespace-nowrap text-text-secondary dark:bg-surface">
      <Icon name={icon} size="sm" color="primary" />
      {label}
    </span>
  );
}

function SectionDivider({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3">
      <h2 className="shrink-0 text-sm font-bold text-text-primary">{title}</h2>
      <div className="h-px min-w-0 flex-1 bg-border/55" />
    </div>
  );
}

function LatestEventCard({
  image,
  logo,
  topic,
  startDatetime,
  finishDatetime,
  isLive,
}: {
  image?: string;
  logo?: string;
  topic: string;
  startDatetime?: string;
  finishDatetime?: string;
  isLive?: boolean;
}) {
  const timeLabel = startDatetime
    ? formatEventTimeRange(startDatetime, finishDatetime)
    : "";

  return (
    <article className="overflow-hidden rounded-[28px] border border-border/35 bg-white shadow-[0_4px_24px_rgba(0,0,0,0.07)] dark:bg-surface">
      <div className="relative aspect-3/4 overflow-hidden bg-surface">
        {image ? (
          <OptimizedImage
            src={image}
            alt={topic}
            fill
            sizes="(max-width: 480px) 100vw, 480px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Icon name="camera" size={48} className="text-text-secondary/20" />
          </div>
        )}

        {logo ? (
          <div className="absolute top-4 inset-s-4 flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-white/90 p-1 shadow-sm">
            <OptimizedImage
              src={logo}
              alt=""
              width={36}
              height={36}
              className="h-full w-full object-contain"
            />
          </div>
        ) : null}

        {isLive ? (
          <span className="absolute top-4 inset-e-4 h-5 w-5 rounded-full border-[3px] border-white bg-teal-400 shadow-md" />
        ) : null}

        <div className="absolute inset-x-4 bottom-4">
          <div className="rounded-full border border-white/50 bg-white/82 px-4 py-3 shadow-[0_2px_12px_rgba(0,0,0,0.08)] backdrop-blur-md dark:bg-surface/90">
            <p className="text-right text-[11px] leading-relaxed text-text-primary">
              <span className="font-semibold">موضوع: </span>
              {topic}
            </p>
            {timeLabel ? (
              <p className="mt-0.5 text-right text-[11px] leading-relaxed text-text-secondary">
                {timeLabel}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}

function PastEventsGrid({ events }: { events: BrandEvent[] }) {
  const router = useRouter();

  return (
    <div className="grid grid-cols-2 gap-3">
      {events.map((event) => (
        <button
          key={event.event_slug}
          type="button"
          onClick={() => router.push(`/events/${event.event_slug}`)}
          className="group overflow-hidden rounded-[22px] border border-border/30 bg-white text-right shadow-[0_4px_18px_rgba(0,0,0,0.06)] transition-transform active:scale-[0.98] dark:bg-surface"
        >
          <div className="relative aspect-3/4 overflow-hidden bg-surface">
            {event.thumbnail ? (
              <OptimizedImage
                src={event.thumbnail}
                alt={event.topic}
                fill
                sizes="50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Icon name="camera" size={28} className="text-text-secondary/30" />
              </div>
            )}
            <div className="absolute inset-x-0 bottom-3 flex justify-center px-2">
              <div className="max-w-[92%] rounded-full border border-white/50 bg-white/85 px-3 py-1.5 shadow-sm backdrop-blur-sm dark:bg-surface/90">
                <p className="line-clamp-1 text-center text-[10px] font-medium leading-snug text-text-primary">
                  {event.topic}
                </p>
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

function extractTime(iso: string): string {
  const match = iso.match(/T(\d{2}):(\d{2})/);
  return match ? `${match[1]}:${match[2]}` : "";
}

function formatEventTimeRange(start?: string, finish?: string): string {
  if (!start) return "";
  const startDate = new Date(start);
  if (isNaN(startDate.getTime())) return "";

  const startJ = toJalaali(
    startDate.getFullYear(),
    startDate.getMonth() + 1,
    startDate.getDate()
  );
  const timeFrom = extractTime(start);

  if (!finish) {
    return `زمان: ${toPersianDigits(startJ.jd)} ${PERSIAN_MONTHS[startJ.jm - 1]} ${toPersianDigits(startJ.jy)}${timeFrom ? ` از ${toPersianDigits(timeFrom)}` : ""}`;
  }

  const finishDate = new Date(finish);
  if (isNaN(finishDate.getTime())) {
    return `زمان: ${toPersianDigits(startJ.jd)} ${PERSIAN_MONTHS[startJ.jm - 1]} ${toPersianDigits(startJ.jy)}`;
  }

  const finishJ = toJalaali(
    finishDate.getFullYear(),
    finishDate.getMonth() + 1,
    finishDate.getDate()
  );
  const timeTo = extractTime(finish);

  const sameMonth = startJ.jm === finishJ.jm && startJ.jy === finishJ.jy;
  if (sameMonth && startJ.jd !== finishJ.jd) {
    return `زمان: ${toPersianDigits(startJ.jd)} تا ${toPersianDigits(finishJ.jd)} ${PERSIAN_MONTHS[finishJ.jm - 1]} ${toPersianDigits(finishJ.jy)}${timeFrom && timeTo ? ` از ${toPersianDigits(timeFrom)} تا ${toPersianDigits(timeTo)}` : ""}`;
  }

  return `زمان: ${toPersianDigits(startJ.jd)} ${PERSIAN_MONTHS[startJ.jm - 1]} ${toPersianDigits(startJ.jy)}${timeFrom && timeTo ? ` از ${toPersianDigits(timeFrom)} تا ${toPersianDigits(timeTo)}` : ""}`;
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
