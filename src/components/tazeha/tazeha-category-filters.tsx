"use client";

import { cn } from "@/lib/utils";
import type { Category } from "@/lib/api/categories";
import { OptimizedImage } from "@/components/ui/optimized-image";

interface TazehaCategoryFiltersProps {
  categories: Category[];
  selected: number | null;
  onSelect: (categoryId: number | null) => void;
}

export function TazehaCategoryFilters({
  categories,
  selected,
  onSelect,
}: TazehaCategoryFiltersProps) {
  if (categories.length === 0) return null;

  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={cn(
          "shrink-0 inline-flex items-center justify-center rounded-full border px-4 py-2 text-sm font-semibold transition-all active:scale-[0.97]",
          selected === null
            ? "border-primary bg-primary text-white shadow-md shadow-primary/25"
            : "border-gray-300 bg-white text-text-secondary"
        )}
      >
        همه
      </button>

      {categories.map((cat) => {
        const isActive = selected === cat.id;
        const iconSrc = cat.location_icon || cat.icon;
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelect(cat.id)}
            className={cn(
              "shrink-0 inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-semibold transition-all active:scale-[0.97]",
              isActive
                ? "border-primary bg-primary text-white shadow-md shadow-primary/25"
                : "border-gray-300 bg-white text-text-secondary"
            )}
          >
            {iconSrc && (
              <span
                className={cn(
                  "inline-flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full",
                  isActive ? "bg-white/20" : "bg-gray-100"
                )}
              >
                <OptimizedImage
                  src={
                    isActive
                      ? cat.location_selected_icon || cat.location_icon || cat.icon
                      : cat.location_icon || cat.icon
                  }
                  alt=""
                  width={22}
                  height={22}
                  className="h-[1.375rem] w-[1.375rem] object-contain"
                />
              </span>
            )}
            {cat.name}
          </button>
        );
      })}
    </div>
  );
}
