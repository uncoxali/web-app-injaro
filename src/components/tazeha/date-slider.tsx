'use client';

import { useRef, useEffect, useCallback } from 'react';
import { toJalaali, toGregorian } from 'jalaali-js';
import { Icon } from '@/components/ui/icon';
import { cn, toPersianDigits } from '@/lib/utils';

const PERSIAN_MONTHS = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
];

const WEEKDAYS = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه', 'شنبه'];

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
  return `${gy}-${String(gm).padStart(2, '0')}-${String(gd).padStart(2, '0')}`;
}

export function generateDays(count = 21): DayOption[] {
  const today = new Date();

  return Array.from({ length: count }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);

    const j = toJalaali(d);
    const weekdayIdx = d.getDay();

    return {
      label: toPersianDigits(j.jd),
      date: `${j.jy}-${String(j.jm).padStart(2, '0')}-${String(j.jd).padStart(2, '0')}`,
      monthName: PERSIAN_MONTHS[j.jm - 1],
      dayName: i === 0 ? 'امروز' : WEEKDAYS[weekdayIdx],
      shortDayName: WEEKDAYS[weekdayIdx],
      isToday: i === 0,
      gy: d.getFullYear(),
      gm: d.getMonth() + 1,
      gd: d.getDate(),
    };
  });
}

export function persianToGregorian(dateStr: string): string {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return '';
  const [jy, jm, jd] = parts.map(Number);
  const g = toGregorian(jy, jm, jd);
  return toGDateString(g.gy, g.gm, g.gd);
}

function scrollChildToCenter(container: HTMLDivElement, child: HTMLElement) {
  const containerRect = container.getBoundingClientRect();
  const childRect = child.getBoundingClientRect();
  const delta = childRect.left - containerRect.left - (containerRect.width - childRect.width) / 2;
  container.scrollBy({ left: delta, behavior: 'smooth' });
}

function NavChevron({ direction }: { direction: 'prev' | 'next' }) {
  return (
    <Icon
      name='chevronLeft'
      size={18}
      color='primary'
      className={direction === 'prev' ? 'scale-x-[-1]' : undefined}
    />
  );
}

function weekdayLabel(day: DayOption): string {
  return WEEKDAYS[new Date(day.gy, day.gm - 1, day.gd).getDay()];
}

export function DateSlider({ days, selected, onSelect }: DateSliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const selectedIdx = days.findIndex((d) => d.date === selected);

  useEffect(() => {
    const el = itemRefs.current[selectedIdx];
    if (el && scrollRef.current && selectedIdx >= 0) {
      scrollChildToCenter(scrollRef.current, el);
    }
  }, [selected, selectedIdx]);

  const goPrev = useCallback(() => {
    if (selectedIdx > 0) onSelect(days[selectedIdx - 1].date);
  }, [days, onSelect, selectedIdx]);

  const goNext = useCallback(() => {
    if (selectedIdx < days.length - 1) onSelect(days[selectedIdx + 1].date);
  }, [days, onSelect, selectedIdx]);

  return (
    <div className='rounded-3xl bg-[#ececec] dark:bg-surface px-3 pt-4 pb-4 shadow-[0_4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.25)]'>
      <div className='mb-3 flex items-center justify-center gap-2'>
        <span className='text-base font-bold text-text-primary'>تقویم</span>
        <Icon name='calendar' size={18} color='primary' />
      </div>

      <div className='flex items-start gap-1'>
        {days.length > 1 && (
          <button
            type='button'
            onClick={goPrev}
            disabled={selectedIdx <= 0}
            aria-label='روز قبل'
            className='flex h-10 w-7 shrink-0 items-center justify-center text-primary transition-opacity disabled:opacity-25 active:scale-90'
          >
            <NavChevron direction='prev' />
          </button>
        )}

        <div
          ref={scrollRef}
          className='flex min-w-0 flex-1 items-start justify-start gap-1 overflow-x-auto scrollbar-none py-0.5 snap-x snap-mandatory scroll-smooth'
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {days.map((day, i) => {
            const isActive = selected === day.date;
            return (
              <button
                key={day.date}
                type='button'
                onClick={() => onSelect(day.date)}
                ref={(el) => {
                  itemRefs.current[i] = el;
                }}
                className='flex w-[3.25rem] shrink-0 snap-center flex-col items-center gap-1.5 active:scale-95 transition-transform'
              >
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-colors duration-200',
                    isActive
                      ? 'bg-primary text-white shadow-[0_2px_8px_rgba(255,90,95,0.35)]'
                      : 'bg-[#d4d4d4] text-text-primary',
                  )}
                >
                  {day.label}
                </div>
                <span
                  className={cn(
                    'max-w-full truncate text-center text-[10px] font-medium leading-tight',
                    isActive ? 'text-text-primary' : 'text-text-secondary',
                  )}
                >
                  {weekdayLabel(day)}
                </span>
              </button>
            );
          })}
        </div>

        {days.length > 1 && (
          <button
            type='button'
            onClick={goNext}
            disabled={selectedIdx >= days.length - 1}
            aria-label='روز بعد'
            className='flex h-10 w-7 shrink-0 items-center justify-center text-primary transition-opacity disabled:opacity-25 active:scale-90'
          >
            <NavChevron direction='next' />
          </button>
        )}
      </div>
    </div>
  );
}
