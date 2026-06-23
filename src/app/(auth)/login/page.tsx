"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AuthLayout } from "@/components/auth-layout";
import { sendOtp, AuthApiError } from "@/lib/api/auth";
import { useAuthStore } from "@/store/auth";
import { toEnglishDigits } from "@/lib/utils";

export default function LoginPageWrapper() {
  return (
    <Suspense>
      <LoginPage />
    </Suspense>
  );
}

function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "";
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const setIsNewUser = useAuthStore((s) => s.setIsNewUser);

  const normalizedPhone = toEnglishDigits(phone);
  const isValid = /^09\d{9}$/.test(normalizedPhone);

  const handleSubmit = async () => {
    if (!isValid) return;

    setLoading(true);
    try {
      const res = await sendOtp(normalizedPhone);
      setIsNewUser(res.is_new_user ?? true);
      const verifyUrl = new URLSearchParams({ phone: normalizedPhone });
      if (redirect) verifyUrl.set("redirect", redirect);
      router.push(`/verify?${verifyUrl.toString()}`);
    } catch (err) {
      if (err instanceof AuthApiError) {
        toast.error(err.message);
      } else {
        toast.error("خطا در ارسال کد تایید");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="ورود به اینجارو"
      subtitle="برای ورود شماره موبایل خود را وارد کنید"
      align="center"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="flex flex-col gap-5"
      >
        <Input
          type="tel"
          placeholder="۰۹۱۲۳۴۵۶۷۸۹"
          value={phone}
          onChange={(e) => {
            const raw = toEnglishDigits(e.target.value).replace(/\D/g, "");
            if (raw.length <= 11) setPhone(raw);
          }}
          maxLength={11}
          label="شماره موبایل"
          dir="ltr"
          className="text-center"
        />

        <Button
          fullWidth
          size="lg"
          onClick={handleSubmit}
          disabled={!isValid || loading}
          loading={loading}
        >
          دریافت کد تایید
        </Button>

        <p className="text-xs text-text-secondary text-center">
          با ادامه، <span className="text-primary">قوانین و مقررات</span> اینجارو را می‌پذیرید
        </p>
      </motion.div>
    </AuthLayout>
  );
}
