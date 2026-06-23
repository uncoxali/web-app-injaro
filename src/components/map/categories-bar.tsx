"use client";

import { useCallback, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const el = activeRef.current;
      const offset = el.offsetLeft - container.offsetLeft - container.clientWidth / 2 + el.clientWidth / 2;
      container.scrollTo({ left: offset, behavior: "smooth" });
    }
  }, [selected]);

  const handleSelect = useCallback(
    (id: number | null) => {
      onSelect(selected === id ? null : id);
    },
    [selected, onSelect]
  );

  return (
    <div className="relative px-4">
      <div
        ref={scrollRef}
        className="flex gap-2.5 overflow-x-auto scrollbar-none py-1"
        style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
      >
        <motion.button
          whileTap="tap"
          variants={chipVariants}
          onClick={() => handleSelect(null)}
          ref={selected === null ? activeRef : undefined}
          className={cn(
            "shrink-0 snap-start inline-flex items-center justify-center px-4 py-2 rounded-full text-sm font-medium border transition-all whitespace-nowrap select-none",
            selected === null
              ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
              : "bg-white/70 backdrop-blur-md border-border/50 text-text-secondary hover:border-primary/30"
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
              ref={isActive ? activeRef : undefined}
              className={cn(
                "shrink-0 snap-start inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-medium border transition-all whitespace-nowrap select-none",
                isActive
                  ? "bg-primary/10 text-primary border-primary/30 shadow-sm"
                  : "bg-white/70 backdrop-blur-md border-border/50 text-text-secondary hover:border-primary/30 hover:bg-white/90"
              )}
              style={{ scrollSnapAlign: "start" }}
            >
              {cat.icon && (
                <span className={cn(
                  "inline-flex items-center justify-center w-7 h-7 rounded-full text-sm transition-all",
                  isActive
                    ? "bg-primary text-white shadow-sm"
                    : "bg-border/40 text-text-secondary"
                )}>
                  {cat.icon}
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
