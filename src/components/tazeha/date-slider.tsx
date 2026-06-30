"use client";

import { useRef, useEffect } from "react";
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

function scrollChildToCenter(container: HTMLDivElement, child: HTMLElement) {
  const containerRect = container.getBoundingClientRect();
  const childRect = child.getBoundingClientRect();
  const delta =
    childRect.left -
    containerRect.left -
    (containerRect.width - childRect.width) / 2;
  container.scrollBy({ left: delta, behavior: "smooth" });
}

export function DateSlider({ days, selected, onSelect }: DateSliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);
  const selectedDay = days.find((d) => d.date === selected);

  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      scrollChildToCenter(scrollRef.current, activeRef.current);
    }
  }, [selected]);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white/60 dark:bg-white/3 border border-border/15 shadow-xs backdrop-blur-xl">
      <div className="absolute top-0 left-1/3 w-40 h-40 rounded-full bg-primary/4 blur-3xl pointer-events-none" />

      <div className="relative">
        <div className="flex items-center justify-between px-5 pt-4 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-linear-to-br from-primary/10 to-primary/5 flex items-center justify-center shadow-xs">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF5A5F" strokeWidth="1.5">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-text-primary">{selectedDay?.monthName || ""}</span>
                <span className="text-xs text-text-secondary/40 font-medium px-2 py-0.5 rounded-full bg-border/30">تقویم</span>
              </div>
              <p className="text-xs text-text-secondary/40 mt-0.5">
                {selectedDay?.dayName || ""}{selectedDay?.dayName ? "، " : ""}{selectedDay?.label || ""}
              </p>
            </div>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-1 overflow-x-auto scrollbar-none px-3 pb-4 snap-x snap-mandatory scroll-smooth"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {days.map((day) => {
            const isActive = selected === day.date;
            return (
              <button
                key={day.date}
                type="button"
                onClick={() => onSelect(day.date)}
                ref={isActive ? activeRef : undefined}
                className="shrink-0 snap-center flex flex-col items-center gap-1.5 w-14 py-1 active:scale-95 transition-transform duration-200"
              >
                <span
                  className={cn(
                    "text-[10px] font-semibold leading-none h-3",
                    isActive
                      ? "text-primary/70"
                      : day.isToday && !isActive
                        ? "text-primary/50"
                        : "text-text-secondary/30"
                  )}
                >
                  {day.shortDayName === "ام" ? "" : day.shortDayName}
                </span>
                <div
                  className={cn(
                    "w-11 h-11 rounded-2xl flex items-center justify-center transition-[background-color,box-shadow,color] duration-200 ease-out",
                    isActive
                      ? "bg-primary text-white shadow-md shadow-primary/25"
                      : day.isToday && !isActive
                        ? "bg-primary/8 text-primary font-bold border border-primary/20"
                        : "bg-white/60 dark:bg-white/4 text-text-secondary/60 border border-transparent"
                  )}
                >
                  <span
                    className={cn(
                      "text-base leading-none",
                      isActive || day.isToday ? "font-extrabold" : "font-semibold"
                    )}
                  >
                    {day.label}
                  </span>
                </div>
                <span
                  className={cn(
                    "text-[8px] font-medium leading-none h-2.5",
                    isActive ? "text-primary/60" : day.isToday ? "text-primary/40" : "text-transparent"
                  )}
                >
                  {day.isToday ? "امروز" : ""}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
