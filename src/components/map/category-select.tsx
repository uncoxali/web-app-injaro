"use client";

import { useRef, useEffect } from "react";
import { cn, imgUrl } from "@/lib/utils";
import type { Category } from "@/lib/api/categories";

interface CategorySelectProps {
  categories: Category[];
  selected: number | null;
  onSelect: (categoryId: number | null) => void;
}

export function CategorySelect({
  categories,
  selected,
  onSelect,
}: CategorySelectProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scrollRef.current) return;
    const active = scrollRef.current.querySelector("[data-active=true]") as HTMLElement | null;
    if (active) {
      active.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, [selected, categories.length]);

  return (
    <div className="px-4">
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto scrollbar-none py-1"
        style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
      >
        <button
          type="button"
          onClick={() => onSelect(null)}
          data-active={selected === null || undefined}
          className={cn(
            "shrink-0 snap-start inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium border transition-all select-none cursor-pointer",
            selected === null
              ? "bg-primary text-white border-primary shadow-sm"
              : "bg-background/80 backdrop-blur-sm border-border/50 text-text-secondary hover:border-primary/30"
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
              onClick={() => onSelect(isActive ? null : cat.id)}
              data-active={isActive || undefined}
              className={cn(
                "shrink-0 snap-start inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium border transition-all select-none cursor-pointer",
                isActive
                  ? "bg-primary text-white border-primary shadow-sm"
                  : "bg-background/80 backdrop-blur-sm border-border/50 text-text-secondary hover:border-primary/30"
              )}
              style={{ scrollSnapAlign: "start" }}
            >
              {cat.location_icon ? (
                <img
                  src={imgUrl(isActive ? cat.location_selected_icon || cat.location_icon : cat.location_icon)}
                  alt=""
                  className="h-4 w-4 shrink-0 object-contain"
                />
              ) : cat.icon ? (
                <span className="text-sm">{cat.icon}</span>
              ) : null}
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
