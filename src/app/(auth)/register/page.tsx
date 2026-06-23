"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AuthLayout } from "@/components/auth-layout";
import { PersianDatePicker } from "@/components/persian-date-picker";
import { registerUser, AuthApiError } from "@/lib/api/auth";
import { useAuthStore } from "@/store/auth";
import { PROVINCES, JOBS } from "@/lib/constants/enums";
import { cn } from "@/lib/utils";

export default function RegisterPageWrapper() {
  return (
    <Suspense>
      <RegisterPage />
    </Suspense>
  );
}

function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone") || "";
  const login = useAuthStore((s) => s.login);

  const [fullName, setFullName] = useState("");
  const [livingCity, setLivingCity] = useState("");
  const [job, setJob] = useState("");
  const [birthAt, setBirthAt] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "">("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!fullName.trim()) errs.fullName = "نام و نام خانوادگی الزامی است";
    if (!livingCity) errs.livingCity = "شهر محل زندگی را انتخاب کنید";
    if (!job) errs.job = "شغل خود را انتخاب کنید";
    if (!birthAt) errs.birthAt = "تاریخ تولد الزامی است";
    if (!gender) errs.gender = "جنسیت را انتخاب کنید";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const data = await registerUser({
        phone_number: phone,
        full_name: fullName.trim(),
        job,
        living_city: livingCity,
        birth_at: birthAt,
        gender: gender as "male" | "female",
      });

      login(data.user, data.access, data.refresh);
      toast.success("ثبت‌نام با موفقیت انجام شد");
      router.replace("/home");
    } catch (err) {
      if (err instanceof AuthApiError) {
        toast.error(err.message);
      } else {
        toast.error("خطا در ثبت‌نام");
      }
    } finally {
      setLoading(false);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.07 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0 },
  };

  const genderOptions: { value: "male" | "female"; label: string }[] = [
    { value: "male", label: "مرد" },
    { value: "female", label: "زن" },
  ];

  return (
    <AuthLayout
      title="ثبت‌نام"
      subtitle="اطلاعات خود را وارد کنید"
      align="center"
    >
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-4"
      >
        <motion.div variants={item}>
          <Input
            label="نام و نام خانوادگی"
            placeholder="مثال: علی محمدی"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            error={errors.fullName}
          />
        </motion.div>

        <motion.div variants={item}>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-primary">
              شهر محل زندگی
            </label>
            <select
              value={livingCity}
              onChange={(e) => {
                setLivingCity(e.target.value);
                setErrors((prev) => ({ ...prev, livingCity: "" }));
              }}
              className={cn(
                "h-11 w-full rounded-lg border bg-surface px-3 text-base text-text-primary outline-none transition-colors appearance-none",
                "focus:border-primary focus:ring-1 focus:ring-primary/20",
                errors.livingCity ? "border-error" : "border-border",
                !livingCity && "text-text-secondary/60"
              )}
            >
              <option value="">انتخاب کنید</option>
              {PROVINCES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
            {errors.livingCity && (
              <span className="text-xs text-error">{errors.livingCity}</span>
            )}
          </div>
        </motion.div>

        <motion.div variants={item}>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-primary">
              شغل
            </label>
            <select
              value={job}
              onChange={(e) => {
                setJob(e.target.value);
                setErrors((prev) => ({ ...prev, job: "" }));
              }}
              className={cn(
                "h-11 w-full rounded-lg border bg-surface px-3 text-base text-text-primary outline-none transition-colors appearance-none",
                "focus:border-primary focus:ring-1 focus:ring-primary/20",
                errors.job ? "border-error" : "border-border",
                !job && "text-text-secondary/60"
              )}
            >
              <option value="">انتخاب کنید</option>
              {JOBS.map((j) => (
                <option key={j.value} value={j.value}>
                  {j.label}
                </option>
              ))}
            </select>
            {errors.job && (
              <span className="text-xs text-error">{errors.job}</span>
            )}
          </div>
        </motion.div>

        <motion.div variants={item}>
          <PersianDatePicker
            value={birthAt}
            onChange={(d) => {
              setBirthAt(d);
              setErrors((prev) => ({ ...prev, birthAt: "" }));
            }}
            error={errors.birthAt}
          />
        </motion.div>

        <motion.div variants={item}>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-primary">
              جنسیت
            </label>
            <div className="flex gap-3">
              {genderOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setGender(opt.value);
                    setErrors((prev) => ({ ...prev, gender: "" }));
                  }}
                  className={cn(
                    "flex-1 h-11 rounded-lg border text-sm font-medium transition-all",
                    gender === opt.value
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border text-text-secondary hover:border-primary/30",
                    errors.gender && "border-error"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {errors.gender && (
              <span className="text-xs text-error">{errors.gender}</span>
            )}
          </div>
        </motion.div>

        <motion.div variants={item} className="mt-2">
          <Button
            fullWidth
            size="lg"
            onClick={handleSubmit}
            loading={loading}
          >
            ثبت‌نام
          </Button>
        </motion.div>
      </motion.div>
    </AuthLayout>
  );
}
