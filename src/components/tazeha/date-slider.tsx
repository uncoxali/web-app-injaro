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

const SHORT_WEEKDAYS = ["ی", "د", "س", "چ", "پ", "ج", "ش"];

export interface DayOption {
  label: string;
  date: string;
  monthName: string;
  dayName: string;
  shortDayName: string;
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

export function generateDays(count = 14): DayOption[] {
  const today = new Date();

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
      shortDayName: i === 0 ? "ام" : SHORT_WEEKDAYS[weekdayIdx],
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
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-1 px-0.5">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-secondary/60 shrink-0">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-1 overflow-x-auto scrollbar-none flex-1"
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
                "shrink-0 flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl border transition-all min-w-[44px]",
                isActive
                  ? "bg-primary border-primary text-white shadow-sm shadow-primary/20"
                  : "bg-transparent border-transparent text-text-secondary/70 hover:bg-surface hover:border-border/40"
              )}
            >
              <span className={cn(
                "text-[10px] font-medium leading-none",
                isActive ? "text-white/80" : "text-text-secondary/60"
              )}>
                {day.shortDayName}
              </span>
              <span className={cn(
                "text-sm font-bold leading-tight",
                isActive ? "text-white" : "text-text-primary"
              )}>
                {day.label}
              </span>
              {day.monthName && (
                <span className={cn(
                  "text-[8px] leading-none",
                  isActive ? "text-white/70" : "text-text-secondary/50"
                )}>
                  {day.monthName.slice(0, 2)}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
