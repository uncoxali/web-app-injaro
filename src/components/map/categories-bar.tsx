"use client";

import { useCallback } from "react";
import { motion } from "framer-motion";
import { cn, imgUrl } from "@/lib/utils";
import type { Category } from "@/lib/api/categories";

interface CategoriesBarProps {
  categories: Category[];
  selected: number | null;
  onSelect: (categoryId: number | null) => void;
}

const chipVariants = {
  idle: { scale: 1 },
  tap: { scale: 0.92 },
};

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
        <motion.button
          whileTap="tap"
          variants={chipVariants}
          onClick={() => handleSelect(null)}
          className={cn(
            "shrink-0 snap-start inline-flex items-center justify-center px-4 py-2 rounded-full text-sm font-medium border transition-all whitespace-nowrap select-none",
            selected === null
              ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
              : "bg-background/70 backdrop-blur-md border-border/50 text-text-secondary hover:border-primary/30"
          )}
          style={{ scrollSnapAlign: "start" }}
        >
          همه
        </motion.button>

        {categories.map((cat) => {
          const isActive = selected === cat.id;
          return (
            <motion.button
              key={cat.id}
              whileTap="tap"
              variants={chipVariants}
              onClick={() => handleSelect(cat.id)}
              className={cn(
                "shrink-0 snap-start inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-medium border transition-all whitespace-nowrap select-none",
                isActive
                  ? "bg-primary/10 text-primary border-primary/30 shadow-sm"
                  : "bg-background/70 backdrop-blur-md border-border/50 text-text-secondary hover:border-primary/30 hover:bg-background/90"
              )}
              style={{ scrollSnapAlign: "start" }}
            >
              {(cat.location_icon || cat.icon) && (
                <span className={cn(
                  "inline-flex items-center justify-center w-7 h-7 rounded-full text-sm transition-all overflow-hidden shrink-0",
                  isActive
                    ? "bg-primary text-white shadow-sm"
                    : "bg-border/40 text-text-secondary"
                )}>
                  {cat.location_icon ? (
                    <img src={imgUrl(cat.location_icon)} alt="" className="w-6 h-6 object-contain" />
                  ) : (
                    cat.icon
                  )}
                </span>
              )}
              <span className={cn(isActive && "font-semibold")}>{cat.name}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
