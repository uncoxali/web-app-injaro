"use client";

import Link from "next/link";

export function HomeRegisterEventBanner() {
  return (
    <Link
      href="/home/register-event"
      className="block rounded-3xl border-2 border-gray-300/80 bg-[#ffd8d8] px-5 py-6 text-center shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-transform active:scale-[0.99]"
    >
      <h2 className="text-base font-bold leading-snug text-text-primary">
        رویداد برگزار می‌کنید؟
      </h2>
      <p className="mx-auto mt-3 max-w-[20rem] text-sm leading-relaxed text-text-primary">
        رویداد خود را برای کاربران اینجارو معرفی کنید و روی نقشه هوشمند شهر دیده
        شوید.
      </p>
      <span className="mt-5 inline-flex min-w-[11rem] items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-bold text-white shadow-[0_8px_24px_rgba(255,90,95,0.4)]">
        ثبت درخواست همکاری
      </span>
    </Link>
  );
}
