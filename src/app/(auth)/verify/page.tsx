"use client";

import { Suspense, useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { OTPInput } from "@/components/ui/otp-input";
import { Button } from "@/components/ui/button";
import { AuthLayout } from "@/components/auth-layout";
import { verifyOtp, sendOtp, AuthApiError } from "@/lib/api/auth";
import { useAuthStore } from "@/store/auth";
import { toPersianDigits } from "@/lib/utils";

const RESEND_COOLDOWN = 90;

export default function VerifyPageWrapper() {
  return (
    <Suspense>
      <VerifyPage />
    </Suspense>
  );
}

function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone") || "";
  const redirect = searchParams.get("redirect") || "";
  const login = useAuthStore((s) => s.login);

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN);
  const [resending, setResending] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (countdown > 0) {
      timerRef.current = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [countdown]);

  const handleVerify = useCallback(
    async (code: string) => {
      if (code.length !== 6 || loading) return;

      setLoading(true);
      try {
        const data = await verifyOtp(phone, code);
        login(data.user || { id: "", phone, full_name: "" }, data.access, data.refresh);
        toast.success("ورود موفق");
        router.replace(redirect && redirect.startsWith("/") ? redirect : "/home");
      } catch (err) {
        if (err instanceof AuthApiError) {
          toast.error(err.message);
        } else {
          toast.error("کد وارد شده نامعتبر است");
        }
        setOtp("");
      } finally {
        setLoading(false);
      }
    },
    [phone, loading, login, router, redirect]
  );

  useEffect(() => {
    if (otp.length === 6) {
      handleVerify(otp);
    }
  }, [otp, handleVerify]);

  const handleResend = async () => {
    if (countdown > 0) return;

    setResending(true);
    try {
      await sendOtp(phone);
      setCountdown(RESEND_COOLDOWN);
      toast.success("کد جدید ارسال شد");
      setOtp("");
    } catch (err) {
      if (err instanceof AuthApiError) {
        toast.error(err.message);
      } else {
        toast.error("خطا در ارسال مجدد");
      }
    } finally {
      setResending(false);
    }
  };

  const maskedPhone =
    phone.length === 11
      ? `${phone.slice(0, 4)}***${phone.slice(7)}`
      : phone;

  return (
    <AuthLayout
      title="کد تایید"
      subtitle={`کد ۶ رقمی به شماره ${toPersianDigits(maskedPhone)} ارسال شد`}
      align="center"
    >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="flex flex-col items-center gap-6"
        >
        <OTPInput
          value={otp}
          onChange={setOtp}
          length={6}
          error={false}
        />

        <Button
          fullWidth
          size="lg"
          onClick={() => handleVerify(otp)}
          disabled={otp.length !== 6 || loading}
          loading={loading}
        >
          تایید
        </Button>

        <div className="text-center w-full">
          {countdown > 0 ? (
            <p className="text-sm text-text-secondary">
              ارسال مجدد تا {toPersianDigits(countdown)} ثانیه دیگر
            </p>
          ) : (
            <button
              onClick={handleResend}
              disabled={resending}
              className="text-sm text-primary font-medium disabled:opacity-50"
            >
              {resending ? "در حال ارسال..." : "ارسال مجدد کد"}
            </button>
          )}
        </div>

        <button
          onClick={() => router.push("/login")}
          className="text-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          ویرایش شماره موبایل
        </button>
      </motion.div>
    </AuthLayout>
  );
}
