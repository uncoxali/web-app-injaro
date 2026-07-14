"use client";

import Image, { type StaticImageData } from "next/image";
import fipcoLogo from "@/assets/images/1.png";
import artFairLogo from "@/assets/images/2.png";
import designWeekLogo from "@/assets/images/3.png";
import { cn } from "@/lib/utils";

interface PastCollaboration {
  id: string;
  label: string;
  logo: StaticImageData;
  logoAlt: string;
  logoClassName?: string;
}

const PAST_COLLABORATIONS: PastCollaboration[] = [
  {
    id: "tehran-design-week",
    label: "هفته دیزاین تهران",
    logo: designWeekLogo,
    logoAlt: "Tehran Design Week 2025",
    logoClassName: "max-h-[5.5rem]",
  },
  {
    id: "tehran-art-fair",
    label: "آرتفر تهران",
    logo: artFairLogo,
    logoAlt: "Tehran Art Fair",
    logoClassName: "max-h-[4.75rem]",
  },
  {
    id: "tehran-furniture-expo",
    label: "نمایشگاه بین‌المللی مبلمان تهران",
    logo: fipcoLogo,
    logoAlt: "Persia FIPCO",
    logoClassName: "max-h-[5.75rem]",
  },
];

function CollaborationLogo({ item }: { item: PastCollaboration }) {
  return (
    <div className="relative mx-auto flex h-24 w-full max-w-26 items-center justify-center">
      <Image
        src={item.logo}
        alt={item.logoAlt}
        className={cn("h-auto w-full object-contain", item.logoClassName)}
      />
    </div>
  );
}

export function HomePastCollaborations() {
  return (
    <section className="rounded-3xl border-2 border-gray-300/80 bg-white px-3 py-5 shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
      <h2 className="mb-4 text-base font-bold text-text-primary">
        مهمترین همکاری‌های گذشته
      </h2>

      <div className="grid grid-cols-3 divide-x divide-gray-300/70">
        {PAST_COLLABORATIONS.map((item) => (
          <div
            key={item.id}
            className="flex min-w-0 flex-col items-center gap-3 px-2 first:ps-0 last:pe-0"
          >
            <CollaborationLogo item={item} />
            <p className="w-full text-center text-[11px] font-medium leading-snug text-text-secondary">
              {item.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
