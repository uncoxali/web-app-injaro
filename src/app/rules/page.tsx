"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Icon } from "@/components/ui/icon";

export default function RulesPage() {
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
          <h1 className="text-base font-bold text-text-primary">قوانین و مقررات</h1>
        </div>
      </div>

      <div className="flex-1 px-5 pt-6 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col gap-6"
        >
          <div className="rounded-2xl bg-surface border border-border/50 p-5">
            <h3 className="text-sm font-bold text-text-primary mb-3">قوانین استفاده</h3>
            <div className="flex flex-col gap-4">
              <div>
                <h4 className="text-sm font-medium text-text-primary mb-1">۱. پذیرش قوانین</h4>
                <p className="text-xs text-text-secondary leading-relaxed">
                  با استفاده از سرویس اینجارو، شما تمامی قوانین و مقررات زیر را می‌پذیرید. 
                  در صورت عدم موافقت با هر یک از موارد، لطفاً از سرویس استفاده نکنید.
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-text-primary mb-1">۲. حریم خصوصی</h4>
                <p className="text-xs text-text-secondary leading-relaxed">
                  اطلاعات شخصی شما نزد ما محفوظ است و بدون رضایت شما در اختیار شخص ثالث قرار نخواهد گرفت. 
                  ما متعهد به حفظ امنیت اطلاعات شما هستیم.
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-text-primary mb-1">۳. محتوای کاربران</h4>
                <p className="text-xs text-text-secondary leading-relaxed">
                  کاربران مسئول محتوای ارسالی خود هستند. هرگونه محتوای نامناسب، مجرمانه یا خلاف قوانین 
                  جمهوری اسلامی ایران ممنوع است و حساب کاربری خاطی مسدود خواهد شد.
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-text-primary mb-1">۴. قوانین خرید و فروش</h4>
                <p className="text-xs text-text-secondary leading-relaxed">
                  اینجارو تنها یک پلتفرم معرفی رویدادها و مکان‌هاست و مسئولیتی در قبال معاملات 
                  مالی بین کاربران ندارد. هرگونه تراکنش مالی بین کاربران و برگزارکنندگان رویدادها 
                  به صورت مستقیم انجام می‌شود.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-surface border border-border/50 p-5">
            <h3 className="text-sm font-bold text-text-primary mb-3">مسئولیت‌ها</h3>
            <div className="flex flex-col gap-3">
              <p className="text-xs text-text-secondary leading-relaxed">
                اینجارو تلاش می‌کند تا اطلاعات دقیق و به‌روزی از رویدادها و مکان‌ها ارائه دهد، 
                اما accuracy اطلاعات ارائه شده توسط برگزارکنندگان را تضمین نمی‌کند.
              </p>
              <p className="text-xs text-text-secondary leading-relaxed">
                هرگونه سوءاستفاده از سرویس، تلاش برای نفوذ به سیستم، یا ایجاد اختلال در سرویس 
                پیگرد قانونی خواهد داشت.
              </p>
            </div>
          </div>

          <p className="text-[10px] text-text-secondary/50 text-center">
            آخرین به‌روزرسانی: فروردین ۱۴۰۴
          </p>
        </motion.div>
      </div>
    </div>
  );
}
