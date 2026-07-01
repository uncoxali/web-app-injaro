"use client";

import Link from "next/link";
import type { TazehaItem } from "@/lib/api/tazeha";
import { OptimizedImage } from "@/components/ui/optimized-image";
import {
  formatTazehaDateRange,
  getTazehaDescription,
  getTazehaImage,
  getTazehaLocation,
  getTazehaSlug,
  getTazehaTitle,
} from "@/components/tazeha/tazeha-format";

interface TazehaListItemProps {
  item: TazehaItem;
  descriptionPending?: boolean;
}

export function TazehaListItem({
  item,
  descriptionPending = false,
}: TazehaListItemProps) {
  const slug = getTazehaSlug(item);
  const title = getTazehaTitle(item);
  const description = getTazehaDescription(item);
  const dateRange = formatTazehaDateRange(item);
  const location = getTazehaLocation(item);
  const showDescription = Boolean(description || descriptionPending);

  return (
    <Link
      href={`/events/${slug}`}
      className="grid min-h-[11.75rem] grid-cols-[auto_minmax(0,1fr)] items-stretch gap-4 px-5 py-5 transition-colors active:bg-black/3"
    >
      <div className="relative aspect-4/5 w-[8.5rem] shrink-0 self-start overflow-hidden rounded-xl bg-gray-300/60">
        <OptimizedImage
          src={getTazehaImage(item)}
          alt={title}
          fill
          sizes="136px"
          className="h-full w-full object-cover"
        />
        {item.is_live && (
          <span className="absolute top-2 right-2 rounded-full bg-success px-2 py-0.5 text-[9px] font-bold text-white">
            زنده
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-col text-right">
        <h3 className="text-base font-bold leading-snug text-text-primary line-clamp-2">
          {title || "بدون عنوان"}
        </h3>

        {showDescription && (
          <p
            className={
              description
                ? "mt-3 text-[0.8125rem] leading-[1.75] text-text-secondary line-clamp-5"
                : "mt-3 animate-pulse text-[0.8125rem] leading-[1.75] text-text-secondary/40 line-clamp-5"
            }
          >
            {description || "در حال بارگذاری توضیحات..."}
          </p>
        )}

        <div className="mt-auto space-y-1.5 pt-4">
          {dateRange ? (
            <p className="text-xs font-medium leading-snug text-text-secondary">
              {dateRange}
            </p>
          ) : null}
          {location ? (
            <p className="text-xs leading-snug text-text-secondary/80">
              • {location}
            </p>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
