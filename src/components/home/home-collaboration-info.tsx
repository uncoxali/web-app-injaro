"use client";

import type { ReactNode } from "react";
import { toPersianDigits } from "@/lib/utils";

const BENEFITS = [
  {
    text: "نمایش رویداد روی نقشه هوشمند شهر",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
  {
    text: `دسترسی به بیش از ${toPersianDigits("10000")} هزار کاربر فعال`,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    text: "ثبت‌نام و رزرو آنلاین شرکت‌کنندگان",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
  },
  {
    text: "پروفایل اختصاصی برای شما",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    text: "پین شدن لوکیشن شما بر روی نقشه شهر",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="3" />
        <line x1="12" y1="2" x2="12" y2="6" />
        <line x1="12" y1="18" x2="12" y2="22" />
        <line x1="2" y1="12" x2="6" y2="12" />
        <line x1="18" y1="12" x2="22" y2="12" />
      </svg>
    ),
  },
] as const;

const PROCESS_STEPS = [
  {
    label: "ثبت درخواست",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
        <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
      </svg>
    ),
  },
  {
    label: "بررسی و تایید",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
      </svg>
    ),
  },
  {
    label: "هماهنگی اجرا",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    ),
  },
  {
    label: "انتشار رویداد",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
] as const;

function BenefitPill({ text, icon }: { text: string; icon: ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-full border border-primary bg-[#ececec] px-4 py-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-[0_2px_8px_rgba(255,90,95,0.35)]">
        {icon}
      </div>
      <p className="flex-1 text-sm font-medium leading-snug text-text-primary">
        {text}
      </p>
    </div>
  );
}

export function HomeCollaborationInfo() {
  return (
    <div className="flex flex-col gap-5">
      <section>
        <h2 className="mb-3 text-base font-bold text-text-primary">
          مزایای همکاری با اینجارو
        </h2>
        <div className="flex flex-col gap-2.5">
          {BENEFITS.map((benefit) => (
            <BenefitPill key={benefit.text} text={benefit.text} icon={benefit.icon} />
          ))}
        </div>
      </section>

      <section className="rounded-3xl bg-[#b5b5b5] px-4 py-5 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
        <h2 className="text-base font-bold text-text-primary">
          فرایند همکاری با اینجارو
        </h2>
        <div className="relative mt-6 px-1">
          <div
            className="absolute top-5 right-10 left-10 h-px bg-white/85"
            aria-hidden
          />
          <div className="relative flex items-start justify-between gap-1">
            {PROCESS_STEPS.map((step) => (
              <div
                key={step.label}
                className="flex min-w-0 flex-1 flex-col items-center gap-2"
              >
                <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white shadow-[0_2px_8px_rgba(255,90,95,0.35)]">
                  {step.icon}
                </div>
                <p className="text-center text-[10px] font-semibold leading-snug text-white">
                  {step.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
