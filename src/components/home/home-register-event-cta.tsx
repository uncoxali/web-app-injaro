"use client";

import { toPersianDigits } from "@/lib/utils";

export function HomeRegisterEventCta() {
  return (
    <section className="rounded-3xl border-2 border-primary bg-[#ececec] dark:bg-surface px-5 py-6 text-center shadow-[0_4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.25)]">
      <h2 className="text-base font-bold leading-snug text-text-primary">
        رویداد خود را در اینجارو ثبت کنید.
      </h2>
      <p className="mx-auto mt-3 max-w-[18rem] text-sm leading-relaxed text-text-primary">
        رویداد خود را به بیش از {toPersianDigits("10000")} کاربر فعال در حوزه
        معماری، دیزاین، هنرهای تجسمی و تکنولوژی معرفی کنید.
      </p>
    </section>
  );
}
