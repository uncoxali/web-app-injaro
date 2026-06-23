"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { getProfile, updateProfile, type UserProfile } from "@/lib/api/profile";
import { PersianDatePicker } from "@/components/persian-date-picker";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";
import { PROVINCES, JOBS } from "@/lib/constants/enums";
import { cn } from "@/lib/utils";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export default function EditProfilePage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [livingCity, setLivingCity] = useState("");
  const [job, setJob] = useState("");
  const [birthAt, setBirthAt] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "">("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchProfile = useCallback(() => {
    setLoading(true);
    setError(false);
    getProfile()
      .then((p: UserProfile) => {
        setFullName(p.full_name || "");
        setEmail(p.email || "");
        setLivingCity(p.living_city || "");
        setJob(p.job || "");
        setBirthAt(p.birth_at || "");
        setGender(p.gender || "");
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!fullName.trim()) errs.fullName = "نام و نام خانوادگی الزامی است";
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "ایمیل نامعتبر است";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setSaving(true);
    try {
      await updateProfile({
        full_name: fullName.trim(),
        email: email || undefined,
        living_city: livingCity || undefined,
        job: job || undefined,
        birth_at: birthAt || undefined,
        gender: gender || undefined,
      });
      toast.success("پروفایل با موفقیت به‌روزرسانی شد");
      router.replace("/home/profile");
    } catch {
      toast.error("خطا در ذخیره اطلاعات");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <ErrorState onRetry={fetchProfile} />
      </div>
    );
  }

  const genderOptions: { value: "male" | "female"; label: string }[] = [
    { value: "male", label: "مرد" },
    { value: "female", label: "زن" },
  ];

  return (
    <div className="flex flex-col min-h-dvh">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border/50">
        <div className="flex items-center gap-3 px-4 h-14">
          <button
            onClick={() => router.back()}
            className="text-text-secondary hover:text-text-primary transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
          <h1 className="text-base font-bold text-text-primary">داده‌های کاربری</h1>
        </div>
      </div>

      <div className="flex-1 px-4 pt-6 pb-4">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-5"
        >
          <motion.div variants={item}>
            <FloatingLabelInput
              id="fullName"
              label="نام و نام خانوادگی"
              value={fullName}
              onChange={(v) => { setFullName(v); setErrors((p) => ({ ...p, fullName: "" })); }}
              error={errors.fullName}
            />
          </motion.div>

          <motion.div variants={item}>
            <FloatingLabelInput
              id="email"
              label="ایمیل"
              type="email"
              value={email}
              onChange={(v) => { setEmail(v); setErrors((p) => ({ ...p, email: "" })); }}
              error={errors.email}
              optional
            />
          </motion.div>

          <motion.div variants={item}>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-primary">شهر محل زندگی</label>
              <select
                value={livingCity}
                onChange={(e) => setLivingCity(e.target.value)}
                className={cn(
                  "h-11 w-full rounded-lg border bg-surface px-3 text-sm text-text-primary outline-none transition-colors appearance-none",
                  "focus:border-primary focus:ring-1 focus:ring-primary/20",
                  "border-border"
                )}
              >
                <option value="">انتخاب کنید</option>
                {PROVINCES.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
          </motion.div>

          <motion.div variants={item}>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-primary">شغل</label>
              <select
                value={job}
                onChange={(e) => setJob(e.target.value)}
                className={cn(
                  "h-11 w-full rounded-lg border bg-surface px-3 text-sm text-text-primary outline-none transition-colors appearance-none",
                  "focus:border-primary focus:ring-1 focus:ring-primary/20",
                  "border-border"
                )}
              >
                <option value="">انتخاب کنید</option>
                {JOBS.map((j) => (
                  <option key={j.value} value={j.value}>{j.label}</option>
                ))}
              </select>
            </div>
          </motion.div>

          <motion.div variants={item}>
            <PersianDatePicker
              value={birthAt}
              onChange={(d) => setBirthAt(d)}
            />
          </motion.div>

          <motion.div variants={item}>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-primary">جنسیت</label>
              <div className="flex gap-3">
                {genderOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setGender(opt.value)}
                    className={cn(
                      "flex-1 h-11 rounded-lg border text-sm font-medium transition-all",
                      gender === opt.value
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border text-text-secondary hover:border-primary/30"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <div className="sticky bottom-0 bg-background/80 backdrop-blur-sm px-4 py-4 border-t border-border/50">
        <Button fullWidth size="lg" onClick={handleSubmit} loading={saving}>
          ذخیره
        </Button>
      </div>
    </div>
  );
}

interface FloatingLabelInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (val: string) => void;
  error?: string;
  type?: string;
  optional?: boolean;
}

function FloatingLabelInput({
  id,
  label,
  value,
  onChange,
  error,
  type = "text",
  optional,
}: FloatingLabelInputProps) {
  return (
    <div className="relative">
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder=" "
        className={cn(
          "peer h-14 w-full rounded-xl border bg-surface px-4 pt-5 pb-1 text-sm text-text-primary outline-none transition-colors",
          "focus:border-primary focus:ring-1 focus:ring-primary/20",
          error ? "border-error" : "border-border"
        )}
      />
      <label
        htmlFor={id}
        className={cn(
          "absolute right-3 top-4 text-text-secondary text-sm pointer-events-none transition-all",
          "peer-placeholder-shown:text-sm peer-placeholder-shown:top-4",
          "peer-focus:text-xs peer-focus:-top-2 peer-focus:right-3",
          "peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-top-2"
        )}
      >
        {label}
        {optional && (
          <span className="text-text-secondary/60 mr-1">(اختیاری)</span>
        )}
      </label>
      {error && (
        <span className="text-xs text-error mt-1 block">{error}</span>
      )}
    </div>
  );
}
