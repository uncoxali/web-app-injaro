"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Icon } from "@/components/ui/icon";

export default function AboutPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-dvh flex-col">
      <div className="sticky top-0 z-10 bg-background/85 backdrop-blur-md border-b border-border/40">
        <div className="flex items-center gap-3 px-4 h-14">
          <button
            onClick={() => router.back()}
            className="text-text-secondary hover:text-text-primary transition-colors"
            aria-label="بازگشت"
          >
            <Icon name="chevronLeft" size={22} />
          </button>
          <h1 className="text-base font-bold text-text-primary">درباره ما</h1>
        </div>
      </div>

      <div className="flex-1 px-5 pt-6 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col gap-6"
        >
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 mb-4">
              <Icon name="home" size="xl" color="white" />
            </div>
            <h2 className="text-xl font-bold text-text-primary">اینجارو</h2>
            <p className="text-sm text-text-secondary mt-1">پلتفرم هنری و طراحی</p>
          </div>

          <div className="rounded-2xl bg-surface border border-border/50 p-5">
            <h3 className="text-sm font-bold text-text-primary mb-3">داستان ما</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              اینجارو یک پلتفرم هنری و طراحی است که با هدف گردآوری و معرفی رویدادها، 
              مکان‌ها و برندهای هنری در سراسر ایران ایجاد شده است. 
              ما به دنبال ایجاد فضایی هستیم که هنرمندان، طراحان و علاقه‌مندان به هنر 
              بتوانند به راحتی رویدادهای مورد نظر خود را پیدا کنند و در آن‌ها شرکت کنند.
            </p>
          </div>

          <div className="rounded-2xl bg-surface border border-border/50 p-5">
            <h3 className="text-sm font-bold text-text-primary mb-3">ارتباط با ما</h3>
            <div className="flex flex-col gap-3">
              <a href="mailto:info@injaro.com" className="flex items-center gap-3 text-sm text-text-secondary hover:text-primary transition-colors">
                <Icon name="mail" size="sm" color="primary" />
                info@injaro.com
              </a>
              <a href="tel:02112345678" className="flex items-center gap-3 text-sm text-text-secondary hover:text-primary transition-colors">
                <Icon name="phone" size="sm" color="primary" />
                ۰۲۱-۱۲۳۴۵۶۷۸
              </a>
            </div>
          </div>

          <div className="rounded-2xl bg-linear-to-br from-primary/4 to-surface border border-primary/15 p-5">
            <h3 className="text-sm font-bold text-text-primary mb-2">ما را دنبال کنید</h3>
            <p className="text-xs text-text-secondary mb-3">
              برای اطلاع از آخرین رویدادها و اخبار ما را در شبکه‌های اجتماعی دنبال کنید.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 rounded-xl bg-surface border border-border/50 flex items-center justify-center text-text-secondary hover:border-primary/30 hover:text-primary transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <circle cx="12" cy="12" r="5" />
                  <circle cx="17.5" cy="6.5" r="1" />
                </svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-xl bg-surface border border-border/50 flex items-center justify-center text-text-secondary hover:border-primary/30 hover:text-primary transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
