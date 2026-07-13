"use client";

import { Suspense, useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { AuthStepPanel } from "@/components/auth/auth-step-panel";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { OTPInput } from "@/components/ui/otp-input";
import { PersianDatePicker } from "@/components/persian-date-picker";
import { Spinner } from "@/components/ui/spinner";
import { sendOtp, verifyOtp, registerUser, AuthApiError } from "@/lib/api/auth";
import { updateProfile } from "@/lib/api/profile";
import { useCategories } from "@/lib/queries/categories";
import { cookieUtils } from "@/lib/cookies";
import { useAuthStore } from "@/store/auth";
import { isAuthenticated, getLoginBackTarget } from "@/lib/auth-utils";
import { toEnglishDigits, toPersianDigits, cn } from "@/lib/utils";
import { PROVINCES, JOBS } from "@/lib/constants/enums";

const RESEND_COOLDOWN = 90;

type Step = "phone" | "verify" | "info" | "interests";

export default function UnifiedAuthPageWrapper() {
  return (
    <Suspense>
      <UnifiedAuthPage />
    </Suspense>
  );
}

function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {Array.from({ length: total }, (_, i) => total - 1 - i).map((i) => (
        <div
          key={i}
          className={cn(
            "h-2 rounded-full transition-all duration-300",
            i === current
              ? "w-8 bg-primary shadow-xs shadow-primary/30"
              : i < current
              ? "w-2 bg-primary/40"
              : "w-2 bg-border/60"
          )}
        />
      ))}
    </div>
  );
}

function UnifiedAuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "";
  const login = useAuthStore((s) => s.login);
  const logout = useAuthStore((s) => s.logout);
  const setIsNewUser = useAuthStore((s) => s.setIsNewUser);

  const [mode, setMode] = useState<"login" | "register">("login");
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [isNewUser, setIsNewUserLocal] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace(redirect && redirect.startsWith("/") ? redirect : "/home");
    }
  }, [router, redirect]);

  const navigate = (to: Step) => {
    setStep(to);
  };

  const steps = mode === "login"
    ? [{ id: "phone" }, { id: "verify" }] as const
    : [{ id: "phone" }, { id: "info" }, { id: "interests" }] as const;

  const normalizedPhone = toEnglishDigits(phone);
  const isValidPhone = /^09\d{9}$/.test(normalizedPhone);

  const handleBack = useCallback(() => {
    if (step === "verify" || step === "info") {
      setStep("phone");
      return;
    }
    if (step === "interests") {
      setStep("info");
      return;
    }

    router.replace(getLoginBackTarget(redirect));
  }, [redirect, router, step]);

  const handleSendOtp = async () => {
    if (!isValidPhone) return;
    if (mode === "register") {
      setIsNewUserLocal(true);
      setIsNewUser(true);
      navigate("info");
      return;
    }
    setLoading(true);
    try {
      const res = await sendOtp(normalizedPhone);
      if (res.is_new_user) {
        toast.error("کاربری با این شماره ثبت‌نام نکرده است");
        setMode("register");
        setIsNewUserLocal(true);
        setIsNewUser(true);
        return;
      }
      setIsNewUserLocal(false);
      setIsNewUser(false);
      navigate("verify");
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
    <div className="relative flex min-h-dvh w-full flex-col items-center justify-center px-4 bg-linear-to-b from-primary/5 via-background to-background">
      <button
        type="button"
        onClick={handleBack}
        aria-label="بازگشت"
        className="absolute top-[max(1rem,env(safe-area-inset-top))] right-4 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-border/30 bg-white/80 text-text-secondary shadow-sm backdrop-blur-sm transition-all hover:text-text-primary active:scale-95 pointer-events-auto"
      >
        <Icon name="chevronLeft" size={22} className="scale-x-[-1]" />
      </button>

      <div className="w-full max-w-[420px]">
        <div className="w-full rounded-3xl border border-border/20 bg-white/60 dark:bg-white/3 backdrop-blur-2xl shadow-xl p-6 md:p-8 animate-fade-in">
          <div className="flex flex-col items-center gap-6">
            {step === "phone" && (
              <div className="flex items-center w-full max-w-[200px] rounded-full bg-border/40 p-1">
                <button
                  onClick={() => setMode("login")}
                  className={cn(
                    "flex-1 py-2 text-sm font-medium rounded-full transition-all",
                    mode === "login"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-text-secondary hover:text-text-primary"
                  )}
                >
                  ورود
                </button>
                <button
                  onClick={() => setMode("register")}
                  className={cn(
                    "flex-1 py-2 text-sm font-medium rounded-full transition-all",
                    mode === "register"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-text-secondary hover:text-text-primary"
                  )}
                >
                  ثبت‌نام
                </button>
              </div>
            )}

            <StepDots current={steps.findIndex((s) => s.id === step)} total={steps.length} />

            {step === "phone" && (
              <PhoneStep
                mode={mode}
                phone={phone}
                setPhone={setPhone}
                isValid={isValidPhone}
                loading={loading}
                onSubmit={handleSendOtp}
              />
            )}
            {step === "verify" && mode === "login" && (
              <VerifyStep
                phone={normalizedPhone}
                isNewUser={isNewUser}
                mode={mode}
                onVerified={(user, access, refresh) => {
                  login(user, access, refresh);
                  router.replace(redirect && redirect.startsWith("/") ? redirect : "/home");
                }}
                onBack={() => navigate("phone")}
              />
            )}
            {step === "info" && mode === "register" && (
              <InfoStep
                mode={mode}
                phone={normalizedPhone}
                onComplete={() => navigate("interests")}
              />
            )}
            {step === "interests" && (
              <InterestsStep
                onComplete={() => {
                  logout();
                  cookieUtils.clearAll();
                  setMode("login");
                  setStep("phone");
                  setPhone("");
                  setIsNewUserLocal(false);
                  toast.success("ثبت‌نام با موفقیت انجام شد، وارد شوید");
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PhoneStep({
  mode,
  phone,
  setPhone,
  isValid,
  loading,
  onSubmit,
}: {
  mode: "login" | "register";
  phone: string;
  setPhone: (v: string) => void;
  isValid: boolean;
  loading: boolean;
  onSubmit: () => void;
}) {
  return (
    <AuthStepPanel className="flex flex-col gap-5">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-text-primary">{mode === "login" ? "ورود به اینجارو" : "عضویت در اینجارو"}</h1>
        <p className="text-sm text-text-secondary mt-1.5">{mode === "login" ? "برای ورود شماره موبایل خود را وارد کنید" : "برای ثبت‌نام شماره موبایل خود را وارد کنید"}</p>
      </div>

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

      <Button fullWidth size="lg" className="rounded-full" onClick={onSubmit} disabled={!isValid || loading} loading={loading}>
        {mode === "register" ? "مرحله بعد" : "دریافت کد تایید"}
      </Button>

      <p className="text-xs text-text-secondary text-center">
        با ادامه، <Link href="/rules" className="text-primary font-medium underline">قوانین و مقررات</Link> اینجارو را می‌پذیرید
      </p>
    </AuthStepPanel>
  );
}

function VerifyStep({
  phone,
  isNewUser,
  mode,
  onVerified,
  onBack,
}: {
  phone: string;
  isNewUser: boolean;
  mode: "login" | "register";
  onVerified: (user: { id: string; phone: string; full_name?: string }, access: string, refresh: string) => void;
  onBack: () => void;
}) {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN);
  const [resending, setResending] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const loadingRef = useRef(false);
  const otpRef = useRef("");

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

  const doVerify = useCallback(async () => {
    const code = otpRef.current;
    if (code.length !== 6 || loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    try {
      const data = await verifyOtp(phone, code);
      const user = data.user || { id: "", phone, full_name: "" };
      onVerified(user, data.access, data.refresh);
    } catch (err) {
      if (err instanceof AuthApiError) {
        toast.error(err.message);
      } else {
        toast.error("کد وارد شده نامعتبر است");
      }
      setOtp("");
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [phone, onVerified]);

  const handleOtpChange = useCallback((value: string) => {
    otpRef.current = value;
    setOtp(value);
    if (value.length === 6) {
      doVerify();
    }
  }, [doVerify]);

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
    phone.length === 11 ? `${phone.slice(0, 4)}***${phone.slice(7)}` : phone;

  return (
    <AuthStepPanel className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-text-primary">کد تایید</h1>
        <p className="text-sm text-text-secondary mt-1.5">
          کد ۶ رقمی به شماره {toPersianDigits(maskedPhone)} ارسال شد
        </p>
      </div>

      <OTPInput value={otp} onChange={handleOtpChange} length={6} error={false} />

      <Button
        fullWidth
        size="lg"
        className="rounded-full"
        onClick={() => doVerify()}
        disabled={otp.length !== 6 || loading}
        loading={loading}
      >
        {mode === "register" ? "ثبت‌نام و ادامه" : isNewUser ? "تایید و ادامه" : "تایید"}
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

      <button onClick={onBack} className="text-sm text-text-secondary hover:text-text-primary transition-colors">
        ویرایش شماره موبایل
      </button>
    </AuthStepPanel>
  );
}

function InfoStep({
  mode,
  phone,
  onComplete,
}: {
  mode: "login" | "register";
  phone: string;
  onComplete: () => void;
}) {
  const [fullName, setFullName] = useState("");
  const [livingCity, setLivingCity] = useState("");
  const [job, setJob] = useState("");
  const [birthAt, setBirthAt] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "">("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const login = useAuthStore((s) => s.login);

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
      if (mode === "login") {
        login(data.user, data.access, data.refresh);
      }
      if (mode === "register") {
        toast.success("اطلاعات با موفقیت ذخیره شد");
      } else {
        toast.success("ثبت‌نام با موفقیت انجام شد");
      }
      onComplete();
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

  const genderOptions: { value: "male" | "female"; label: string }[] = [
    { value: "male", label: "مرد" },
    { value: "female", label: "زن" },
  ];

  return (
    <AuthStepPanel>
      <div className="text-center mb-5">
        <h1 className="text-2xl font-bold text-text-primary">ثبت‌نام</h1>
        <p className="text-sm text-text-secondary mt-1.5">اطلاعات خود را وارد کنید</p>
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <Input
            label="نام و نام خانوادگی"
            placeholder="مثال: علی محمدی"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            error={errors.fullName}
          />
        </div>

        <div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-primary">شهر محل زندگی</label>
            <select
              value={livingCity}
              onChange={(e) => {
                setLivingCity(e.target.value);
                setErrors((prev) => ({ ...prev, livingCity: "" }));
              }}
              className={cn(
                "h-11 w-full rounded-lg border bg-surface px-3 text-base text-text-primary outline-hidden transition-colors appearance-none",
                "focus:border-primary focus:ring-1 focus:ring-primary/20",
                errors.livingCity ? "border-error" : "border-border",
                !livingCity && "text-text-secondary/60"
              )}
            >
              <option value="">انتخاب کنید</option>
              {PROVINCES.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
            {errors.livingCity && <span className="text-xs text-error">{errors.livingCity}</span>}
          </div>
        </div>

        <div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-primary">شغل</label>
            <select
              value={job}
              onChange={(e) => {
                setJob(e.target.value);
                setErrors((prev) => ({ ...prev, job: "" }));
              }}
              className={cn(
                "h-11 w-full rounded-lg border bg-surface px-3 text-base text-text-primary outline-hidden transition-colors appearance-none",
                "focus:border-primary focus:ring-1 focus:ring-primary/20",
                errors.job ? "border-error" : "border-border",
                !job && "text-text-secondary/60"
              )}
            >
              <option value="">انتخاب کنید</option>
              {JOBS.map((j) => (
                <option key={j.value} value={j.value}>{j.label}</option>
              ))}
            </select>
            {errors.job && <span className="text-xs text-error">{errors.job}</span>}
          </div>
        </div>

        <div>
          <PersianDatePicker
            value={birthAt}
            onChange={(d) => {
              setBirthAt(d);
              setErrors((prev) => ({ ...prev, birthAt: "" }));
            }}
            error={errors.birthAt}
          />
        </div>

        <div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-primary">جنسیت</label>
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
                    "flex-1 h-11 rounded-full border text-sm font-medium transition-all",
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
            {errors.gender && <span className="text-xs text-error">{errors.gender}</span>}
          </div>
        </div>

        <div className="mt-2">
          <Button fullWidth size="lg" className="rounded-full" onClick={handleSubmit} loading={loading}>
            ثبت‌نام
          </Button>
        </div>
      </div>
    </AuthStepPanel>
  );
}

function InterestsStep({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const { data: categories = [], isLoading: loading } = useCategories();
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);

  const toggle = useCallback((id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleSubmit = async () => {
    if (selected.size === 0) return;
    setSaving(true);
    sessionStorage.setItem("onb", "1");
    try {
      await updateProfile({ interests: Array.from(selected) });
      toast.success("علاقه‌مندی‌ها ذخیره شد");
    } catch {
      toast.success("علاقه‌مندی‌ها ذخیره شد");
    } finally {
      setSaving(false);
    }
    onComplete();
  };

  const handleSkip = () => {
    sessionStorage.setItem("onb", "1");
    onComplete();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <AuthStepPanel className="flex flex-col">
      <div className="text-center mb-4">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF5A5F" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-text-primary">علاقه‌مندی‌هات رو انتخاب کن</h1>
        <p className="text-sm text-text-secondary mt-1">برای دیدن محتوای مرتبط، حداقل یکی رو انتخاب کن</p>
      </div>

      <div className="flex-1 overflow-y-auto max-h-[320px] -mx-2 px-2 scrollbar-thin">
        <div className="grid grid-cols-2 gap-3 py-2">
          {categories.map((cat) => {
            const isSelected = selected.has(cat.id);
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => toggle(cat.id)}
                className={cn(
                  "relative flex flex-col items-center gap-2.5 p-4 rounded-2xl border text-sm font-medium transition-all",
                  "hover:scale-[1.02] active:scale-95",
                  isSelected
                    ? "border-primary bg-linear-to-b from-primary/10 to-primary/5 text-primary shadow-xs shadow-primary/10"
                    : "border-border/40 bg-white/50 dark:bg-white/2 text-text-secondary hover:border-primary/30 hover:text-text-primary hover:shadow-sm"
                )}
              >
                {cat.icon && <span className="text-2xl leading-none">{cat.icon}</span>}
                <span className="text-[13px]">{cat.name}</span>
                {isSelected && (
                  <div className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="white">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-3 pt-4 border-t border-border/20 mt-3">
        <button
          onClick={handleSkip}
          className="shrink-0 h-13 px-5 rounded-full text-sm font-medium text-text-secondary border border-border/30 bg-white/50 dark:bg-white/2 hover:bg-border/30 hover:text-text-primary transition-all active:scale-95"
        >
          رد کردن
        </button>
        <div className="flex-1">
          <Button fullWidth size="lg" className="rounded-full" onClick={handleSubmit} disabled={selected.size === 0 || saving} loading={saving}>
            ادامه
            {selected.size > 0 && (
              <span className="mr-1.5 inline-flex items-center justify-center min-w-[22px] h-[22px] rounded-full bg-white/20 text-xs">
                {selected.size}
              </span>
            )}
          </Button>
        </div>
      </div>
    </AuthStepPanel>
  );
}
