"use client";

import { forwardRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getPublicEventDetail } from "@/lib/api/events";
import {
  getEventBrandHref,
  getEventBrandSlug,
  normalizeEventLocationSlug,
} from "@/components/tazeha/tazeha-format";

interface EventBrandLinkProps {
  eventSlug?: string;
  locationSlug?: string;
  className?: string;
  children: React.ReactNode;
}

export const EventBrandLink = forwardRef<HTMLAnchorElement, EventBrandLinkProps>(
  function EventBrandLink({ eventSlug, locationSlug, className, children }, ref) {
    const router = useRouter();
    const href =
      getEventBrandHref({
        event_slug: eventSlug,
        location_slug: locationSlug,
      }) ?? "#";

    const handleClick = useCallback(
      async (event: React.MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();

      const knownSlug = getEventBrandSlug({ location_slug: locationSlug });
      if (knownSlug) {
        router.push(
          eventSlug
            ? `/brands/${knownSlug}?event=${encodeURIComponent(eventSlug)}`
            : `/brands/${knownSlug}`
        );
        return;
      }

      if (!eventSlug) return;

      const detail = await getPublicEventDetail(eventSlug);
      const brandSlug = normalizeEventLocationSlug(detail?.location);
      if (brandSlug) {
        router.push(`/brands/${brandSlug}?event=${encodeURIComponent(eventSlug)}`);
      }
      },
      [eventSlug, locationSlug, router]
    );

    return (
      <a ref={ref} href={href} onClick={handleClick} className={className}>
        {children}
      </a>
    );
  }
);
