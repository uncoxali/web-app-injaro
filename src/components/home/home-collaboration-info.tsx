"use client";

import { Icon, type SemanticIconName } from "@/components/ui/icon";
import type { IconName } from "@/components/ui/icons-registry";
import { toPersianDigits } from "@/lib/utils";

type BenefitIcon = SemanticIconName | IconName;

const BENEFITS: { text: string; icon: BenefitIcon; active?: boolean }[] = [
  {
    text: "نمایش رویداد روی نقشه هوشمند شهر",
    icon: "mapPin",
  },
  {
    text: `دسترسی به بیش از ${toPersianDigits("10000")} هزار کاربر فعال`,
    icon: "user",
  },
  {
    text: "ثبت‌نام و رزرو آنلاین شرکت‌کنندگان",
    icon: "envelope",
  },
  {
    text: "پروفایل اختصاصی برای شما",
    icon: "user",
    active: true,
  },
  {
    text: "پین شدن لوکیشن شما بر روی نقشه شهر",
    icon: "mapLocation",
    active: true,
  },
];

const PROCESS_STEPS: { label: string; icon: BenefitIcon }[] = [
  { label: "ثبت درخواست", icon: "envelope" },
  { label: "بررسی و تایید", icon: "filter" },
  { label: "هماهنگی اجرا", icon: "phone" },
  { label: "انتشار رویداد", icon: "mapPin" },
];

function BenefitPill({
  text,
  icon,
  active,
}: {
  text: string;
  icon: BenefitIcon;
  active?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-full border border-primary bg-[#ececec] dark:bg-surface px-4 py-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-[0_2px_8px_rgba(255,90,95,0.35)]">
        <Icon name={icon} size="sm" color="white" active={active} />
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
            <BenefitPill
              key={benefit.text}
              text={benefit.text}
              icon={benefit.icon}
              active={benefit.active}
            />
          ))}
        </div>
      </section>

      <section className="rounded-3xl bg-[#b5b5b5] dark:bg-surface px-4 py-5 shadow-[0_4px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.25)]">
        <h2 className="text-base font-bold text-text-primary">
          فرایند همکاری با اینجارو
        </h2>
        <div className="relative mt-6 px-1">
          <div
            className="absolute top-5 right-10 left-10 h-px bg-white/85 dark:bg-border/60"
            aria-hidden
          />
          <div className="relative flex items-start justify-between gap-1">
            {PROCESS_STEPS.map((step) => (
              <div
                key={step.label}
                className="flex min-w-0 flex-1 flex-col items-center gap-2"
              >
                <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white shadow-[0_2px_8px_rgba(255,90,95,0.35)]">
                  <Icon name={step.icon} size="sm" color="white" />
                </div>
                <p className="text-center text-[10px] font-semibold leading-snug text-white dark:text-text-primary">
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
