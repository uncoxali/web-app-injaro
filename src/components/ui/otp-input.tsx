"use client";

import {
  useRef,
  useState,
  useCallback,
  type InputHTMLAttributes,
  useEffect,
} from "react";
import { cn, toEnglishDigits } from "@/lib/utils";

interface OTPInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
}

export function OTPInput({
  length = 6,
  value,
  onChange,
  error,
  className,
  ...props
}: OTPInputProps) {
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const digits = value.split("").slice(0, length);
  while (digits.length < length) {
    digits.push("");
  }

  const focusInput = useCallback((index: number) => {
    const el = inputRefs.current[index];
    if (el) {
      el.focus();
      el.select();
    }
  }, []);

  const handleChange = useCallback(
    (index: number, char: string) => {
      const cleaned = toEnglishDigits(char).replace(/\D/g, "");
      if (!cleaned) return;

      const newDigits = [...digits];
      newDigits[index] = cleaned.slice(-1);
      const newValue = newDigits.join("").slice(0, length);
      onChange(newValue);

      if (index < length - 1) {
        focusInput(index + 1);
      }
    },
    [digits, length, onChange, focusInput]
  );

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace") {
        e.preventDefault();
        const newDigits = [...digits];
        if (digits[index]) {
          newDigits[index] = "";
          onChange(newDigits.join("").slice(0, length));
        } else if (index > 0) {
          newDigits[index - 1] = "";
          onChange(newDigits.join("").slice(0, length));
          focusInput(index - 1);
        }
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (index > 0) focusInput(index - 1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        if (index < length - 1) focusInput(index + 1);
      }
    },
    [digits, length, onChange, focusInput]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault();
      const pasted = toEnglishDigits(e.clipboardData.getData("text")).replace(
        /\D/g,
        ""
      );
      const newValue = pasted.slice(0, length);
      onChange(newValue);
      const nextIndex = Math.min(newValue.length, length - 1);
      focusInput(nextIndex);
    },
    [length, onChange, focusInput]
  );

  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
  }, [length]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("OTPCredential" in window)) return;

    const abort = new AbortController();

    navigator.credentials
      .get({
        otp: { transport: ["sms"] },
        signal: abort.signal,
      } as CredentialRequestOptions)
      .then((cred) => {
        const otpCred = cred as { code?: string } | null;
        if (otpCred?.code) {
          onChange(otpCred.code.slice(0, length));
        }
      })
      .catch(() => {});

    return () => abort.abort();
  }, [length, onChange]);

  return (
    <div className={cn("flex items-center gap-2 justify-center", className)} dir="ltr">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          autoComplete={index === 0 ? "one-time-code" : "off"}
          onPaste={handlePaste}
          onFocus={() => setActiveIndex(index)}
          onBlur={() => setActiveIndex(-1)}
          className={cn(
            "h-12 w-11 rounded-lg border bg-surface text-center text-lg font-bold text-text-primary outline-none transition-colors",
            "focus:border-primary focus:ring-1 focus:ring-primary/20",
            error && "border-error",
            !error && digit && "border-primary",
            !error && !digit && "border-border",
            activeIndex === index && "border-primary ring-1 ring-primary/20"
          )}
          dir="ltr"
          {...props}
        />
      ))}
    </div>
  );
}
