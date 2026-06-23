"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { toJalaali, toGregorian } from "jalaali-js";
import { cn, toPersianDigits } from "@/lib/utils";

const PERSIAN_MONTHS = [
  "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
  "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند",
];

const WEEKDAYS = [
  "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنج‌شنبه", "جمعه", "شنبه",
];

interface DayOption {
  label: string;
  date: string;
  monthName: string;
  dayName: string;
  isToday: boolean;
  gy: number;
  gm: number;
  gd: number;
}

interface DateSliderProps {
  days: DayOption[];
  selected: string;
  onSelect: (date: string) => void;
}

function toGDateString(gy: number, gm: number, gd: number): string {
  return `${gy}-${String(gm).padStart(2, "0")}-${String(gd).padStart(2, "0")}`;
}

export function generateDays(count = 30): DayOption[] {
  const today = new Date();
  const todayJ = toJalaali(today);

  return Array.from({ length: count }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);

    const j = toJalaali(d);
    const weekdayIdx = d.getDay();

    return {
      label: toPersianDigits(j.jd),
      date: `${j.jy}-${String(j.jm).padStart(2, "0")}-${String(j.jd).padStart(2, "0")}`,
      monthName: PERSIAN_MONTHS[j.jm - 1],
      dayName: i === 0 ? "امروز" : WEEKDAYS[weekdayIdx],
      isToday: i === 0,
      gy: d.getFullYear(),
      gm: d.getMonth() + 1,
      gd: d.getDate(),
    };
  });
}

export function persianToGregorian(dateStr: string): string {
  const parts = dateStr.split("-");
  if (parts.length !== 3) return "";
  const [jy, jm, jd] = parts.map(Number);
  const g = toGregorian(jy, jm, jd);
  return toGDateString(g.gy, g.gm, g.gd);
}

export function DateSlider({ days, selected, onSelect }: DateSliderProps) {
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

  return (
    <div className="pt-3 pb-1">
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto scrollbar-none px-4"
        style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
      >
        {days.map((day) => {
          const isActive = selected === day.date;
          return (
            <motion.button
              key={day.date}
              whileTap={{ scale: 0.9 }}
              onClick={() => onSelect(day.date)}
              ref={isActive ? activeRef : undefined}
              className={cn(
                "shrink-0 snap-start flex flex-col items-center gap-0.5 px-4 py-2 rounded-2xl border transition-all min-w-[68px]",
                isActive
                  ? "bg-primary border-primary text-white shadow-md shadow-primary/20"
                  : "bg-white/80 border-border/50 text-text-secondary hover:border-primary/30"
              )}
              style={{ scrollSnapAlign: "start" }}
            >
              <span className={cn("text-[11px] font-medium whitespace-nowrap", isActive ? "text-white/80" : "")}>
                {day.dayName}
              </span>
              <span className={cn("text-base font-bold leading-tight", isActive ? "text-white" : "text-text-primary")}>
                {day.label}
              </span>
              <span className={cn("text-[10px]", isActive ? "text-white/70" : "text-text-secondary/70")}>
                {day.monthName}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
