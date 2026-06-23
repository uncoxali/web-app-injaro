"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { PERSIAN_MONTHS } from "@/lib/constants/enums";

interface PersianDatePickerProps {
  value: string;
  onChange: (date: string) => void;
  error?: string;
}

function getCurrentPersianYear(): number {
  const now = new Date();
  const gregorianYear = now.getFullYear();
  const persianYear = gregorianYear - 621;
  const persianNewYearDay = new Date(gregorianYear, 2, 21);
  return now >= persianNewYearDay ? persianYear : persianYear - 1;
}

export function PersianDatePicker({
  value,
  onChange,
  error,
}: PersianDatePickerProps) {
  const currentYear = useMemo(() => getCurrentPersianYear(), []);

  const parts = value ? value.split("-") : ["", "", ""];
  const year = parts[0] || "";
  const month = parts[1] || "";
  const day = parts[2] || "";

  const years = useMemo(
    () =>
      Array.from({ length: 70 }, (_, i) => ({
        value: String(currentYear - i),
        label: String(currentYear - i),
      })),
    [currentYear]
  );

  const months = useMemo(
    () =>
      PERSIAN_MONTHS.map((name, i) => ({
        value: String(i + 1).padStart(2, "0"),
        label: name,
      })),
    []
  );

  const daysInMonth = useMemo(() => {
    const m = parseInt(month);
    if (!m) return 31;
    if (m <= 6) return 31;
    if (m <= 11) return 30;
    return 29;
  }, [month]);

  const days = useMemo(
    () =>
      Array.from({ length: daysInMonth }, (_, i) => ({
        value: String(i + 1).padStart(2, "0"),
        label: String(i + 1),
      })),
    [daysInMonth]
  );

  const handleChange = (part: "year" | "month" | "day", val: string) => {
    const newParts = [...parts];
    if (part === "year") newParts[0] = val;
    if (part === "month") newParts[1] = val;
    if (part === "day") newParts[2] = val;

    const nextValue = newParts.every((p) => p) ? newParts.join("-") : newParts.join("-").replace(/-+$/, "");
    onChange(nextValue);
  };

  const selectClass = cn(
    "h-11 rounded-lg border border-border bg-surface px-3 text-base text-text-primary outline-none transition-colors appearance-none",
    "focus:border-primary focus:ring-1 focus:ring-primary/20",
    error && "border-error"
  );

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-text-primary">
        تاریخ تولد
      </label>
      <div className="flex gap-2" dir="ltr">
        <select
          value={day}
          onChange={(e) => handleChange("day", e.target.value)}
          className={cn(selectClass, "flex-1")}
        >
          <option value="">روز</option>
          {days.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>
        <select
          value={month}
          onChange={(e) => handleChange("month", e.target.value)}
          className={cn(selectClass, "flex-[2]")}
        >
          <option value="">ماه</option>
          {months.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
        <select
          value={year}
          onChange={(e) => handleChange("year", e.target.value)}
          className={cn(selectClass, "flex-1")}
        >
          <option value="">سال</option>
          {years.map((y) => (
            <option key={y.value} value={y.value}>
              {y.label}
            </option>
          ))}
        </select>
      </div>
      {error && <span className="text-xs text-error">{error}</span>}
    </div>
  );
}
