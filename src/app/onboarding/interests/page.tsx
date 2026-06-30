"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { updateProfile } from "@/lib/api/profile";
import { useCategories } from "@/lib/queries/categories";
import { cn } from "@/lib/utils";

const STEPS = 3;

export default function OnboardingInterestsPage() {
  const router = useRouter();
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
    router.replace("/home");
  };

  const handleSkip = () => {
    sessionStorage.setItem("onb", "1");
    router.replace("/home");
  };

  const progress = Math.min(
    (selected.size / Math.max(1, Math.ceil(categories.length / STEPS))) * 100,
    100
  );

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.04 },
    },
  };

  const chipItem = {
    hidden: { opacity: 0, scale: 0.9 },
    show: { opacity: 1, scale: 1 },
  };

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-linear-to-b from-primary/4 via-background to-background">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xs pt-12 pb-4 px-6">
        <div className="h-1.5 w-full rounded-full bg-border/60 overflow-hidden mb-6">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${Math.max(progress, 10)}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <h1 className="text-2xl font-bold text-text-primary">
          علاقه‌مندی‌هات رو انتخاب کن
        </h1>
        <p className="text-sm text-text-secondary mt-1.5">
          حداقل یکی انتخاب کن تا محتوای مرتبط ببینیم
        </p>
      </div>

      <div className="flex-1 px-6 pb-6 overflow-y-auto">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-wrap gap-3"
        >
          {categories.map((cat) => {
            const isSelected = selected.has(cat.id);
            return (
              <motion.button
                key={cat.id}
                variants={chipItem}
                onClick={() => toggle(cat.id)}
                className={cn(
                  "inline-flex items-center gap-2.5 px-4 py-3 rounded-2xl border text-sm font-medium transition-all",
                  "hover:scale-[1.02] active:scale-95",
                  isSelected
                    ? "border-primary bg-primary/8 text-primary shadow-xs shadow-primary/10"
                    : "border-border bg-surface text-text-secondary hover:border-primary/30 hover:text-text-primary"
                )}
              >
                {cat.icon && (
                  <span className="text-lg leading-none">{cat.icon}</span>
                )}
                <span>{cat.name}</span>
                {isSelected && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="text-primary"
                  >
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                )}
              </motion.button>
            );
          })}
        </motion.div>
      </div>

      <div className="sticky bottom-0 bg-background/80 backdrop-blur-xs px-6 py-4 border-t border-border/50">
        <div className="flex items-center gap-3">
          <button
            onClick={handleSkip}
            className="text-sm text-text-secondary hover:text-text-primary transition-colors px-2"
          >
            رد کردن
          </button>
          <Button
            fullWidth
            size="lg"
            onClick={handleSubmit}
            disabled={selected.size === 0 || saving}
            loading={saving}
          >
            ادامه ({selected.size})
          </Button>
        </div>
      </div>
    </div>
  );
}
