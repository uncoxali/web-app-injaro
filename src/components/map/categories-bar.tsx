"use client";

import { useCallback } from "react";
import { cn } from "@/lib/utils";
import type { Category } from "@/lib/api/categories";
import { OptimizedImage } from "@/components/ui/optimized-image";

interface CategoriesBarProps {
  categories: Category[];
  selected: number | null;
  onSelect: (categoryId: number | null) => void;
}

export function CategoriesBar({
  categories,
  selected,
  onSelect,
}: CategoriesBarProps) {
  const handleSelect = useCallback(
    (id: number | null) => {
      onSelect(selected === id ? null : id);
    },
    [selected, onSelect]
  );

  return (
    <div className="relative px-4">
      <div
        className="flex gap-2.5 overflow-x-auto scrollbar-none py-1"
        style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
      >
        <button
          type="button"
          onClick={() => handleSelect(null)}
          className={cn(
            "shrink-0 snap-start inline-flex items-center justify-center px-4 py-2 rounded-full text-sm font-medium border transition-all whitespace-nowrap select-none active:scale-[0.92]",
            selected === null
              ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
              : "bg-background border-border text-text-secondary hover:border-primary/30"
          )}
          style={{ scrollSnapAlign: "start" }}
        >
          همه
        </button>

        {categories.map((cat) => {
          const isActive = selected === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleSelect(cat.id)}
              className={cn(
                "shrink-0 snap-start inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-medium border transition-all whitespace-nowrap select-none active:scale-[0.92]",
                isActive
                  ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                  : "bg-background border-border text-text-secondary hover:border-primary/30"
              )}
              style={{ scrollSnapAlign: "start" }}
            >
              {(cat.location_icon || cat.icon) && (
                <span className={cn(
                  "inline-flex items-center justify-center w-7 h-7 rounded-full text-sm transition-all overflow-hidden shrink-0",
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-border/40 text-text-secondary"
                )}>
                  {cat.location_icon ? (
                    <OptimizedImage
                      src={
                        isActive
                          ? cat.location_selected_icon || cat.location_icon
                          : cat.location_icon
                      }
                      alt=""
                      width={24}
                      height={24}
                      className="w-6 h-6 object-contain"
                    />
                  ) : (
                    cat.icon
                  )}
                </span>
              )}
              <span className={cn(isActive && "font-semibold")}>{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
