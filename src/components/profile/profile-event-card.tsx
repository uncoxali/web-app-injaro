"use client";

import { EventBrandLink } from "@/components/home/event-brand-link";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { Icon } from "@/components/ui/icon";
import type { ProfileEventItem } from "@/lib/api/events";

export function ProfileEventCard({ event }: { event: ProfileEventItem }) {
  const caption = event.location_name
    ? `${event.location_name}، ${event.topic}`
    : event.topic;

  return (
    <EventBrandLink
      eventSlug={event.event_slug}
      locationSlug={event.location_slug}
      className="group block"
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-white shadow-[0_4px_16px_rgba(0,0,0,0.1)] dark:bg-surface">
        {event.thumbnail ? (
          <OptimizedImage
            src={event.thumbnail}
            alt={event.topic}
            fill
            sizes="(max-width: 480px) 30vw, 140px"
            className="object-cover transition-transform duration-500 group-active:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-surface">
            <Icon name="camera" size={28} className="text-text-secondary/30" />
          </div>
        )}
        <div className="absolute inset-x-2 bottom-2 rounded-xl bg-white/88 px-2 py-1.5 backdrop-blur-sm dark:bg-surface/90">
          <p className="line-clamp-2 text-[10px] font-medium leading-snug text-text-primary">
            {caption}
          </p>
        </div>
      </div>
    </EventBrandLink>
  );
}
