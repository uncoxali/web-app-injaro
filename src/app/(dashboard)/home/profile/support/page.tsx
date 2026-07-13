"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { sendTicket } from "@/lib/api/profile";
import { cn } from "@/lib/utils";

export default function SupportPage() {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    }
  }, []);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!subject.trim()) errs.subject = "موضوع الزامی است";
    if (!message.trim()) errs.message = "پیام الزامی است";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSending(true);
    try {
      await sendTicket({ subject: subject.trim(), message: message.trim() });
      toast.success("تیکت شما با موفقیت ارسال شد");
      router.replace("/home/profile");
    } catch {
      toast.error("خطا در ارسال تیکت");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col min-h-dvh">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xs border-b border-border/50">
        <div className="flex items-center gap-3 px-4 h-14">
          <button onClick={() => router.back()} className="text-text-secondary hover:text-text-primary transition-colors">
            <Icon name="chevronLeft" size={22} className="scale-x-[-1]" />
          </button>
          <h1 className="text-base font-bold text-text-primary">پشتیبانی</h1>
        </div>
      </div>

      <div className="flex-1 px-4 pt-6 pb-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-5"
        >
          <div className="relative">
            <input
              id="subject"
              value={subject}
              onChange={(e) => { setSubject(e.target.value); setErrors((p) => ({ ...p, subject: "" })); }}
              placeholder=" "
              className={cn(
                "peer h-14 w-full rounded-xl border bg-surface px-4 pt-5 pb-1 text-sm text-text-primary outline-hidden transition-colors",
                "focus:border-primary focus:ring-1 focus:ring-primary/20",
                errors.subject ? "border-error" : "border-border"
              )}
            />
            <label
              htmlFor="subject"
              className={cn(
                "absolute right-3 top-4 text-text-secondary text-sm pointer-events-none transition-all",
                "peer-placeholder-shown:text-sm peer-placeholder-shown:top-4",
                "peer-focus:text-xs peer-focus:-top-2 peer-focus:right-3",
                "peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:-top-2"
              )}
            >
              موضوع
            </label>
            {errors.subject && (
              <span className="text-xs text-error mt-1 block">{errors.subject}</span>
            )}
          </div>

          <div className="relative">
            <textarea
              ref={textareaRef}
              id="message"
              value={message}
              onChange={(e) => { setMessage(e.target.value); setErrors((p) => ({ ...p, message: "" })); autoResize(); }}
              placeholder=" "
              rows={4}
              className={cn(
                "peer w-full rounded-xl border bg-surface px-4 pt-6 pb-3 text-sm text-text-primary outline-hidden transition-colors resize-none min-h-[120px]",
                "focus:border-primary focus:ring-1 focus:ring-primary/20",
                errors.message ? "border-error" : "border-border"
              )}
            />
            <label
              htmlFor="message"
              className={cn(
                "absolute right-3 top-4 text-text-secondary text-sm pointer-events-none transition-all",
                "peer-placeholder-shown:text-sm peer-placeholder-shown:top-4",
                "peer-focus:text-xs peer-focus:-top-2 peer-focus:right-3",
                "peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:-top-2"
              )}
            >
              پیام
            </label>
            {errors.message && (
              <span className="text-xs text-error mt-1 block">{errors.message}</span>
            )}
          </div>
        </motion.div>
      </div>

      <div className="sticky bottom-0 bg-background/80 backdrop-blur-xs px-4 py-4 border-t border-border/50">
        <Button fullWidth size="lg" onClick={handleSubmit} loading={sending}>
          ارسال
        </Button>
      </div>
    </div>
  );
}
