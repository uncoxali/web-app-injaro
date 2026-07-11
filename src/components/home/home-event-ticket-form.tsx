"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { useSubmitHomeEventTicket } from "@/lib/queries/home-events";

function FieldIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0 text-text-primary"
      aria-hidden
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function FormLabel({ children }: { children: string }) {
  return (
    <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-text-primary">
      <FieldIcon />
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-2xl border border-white bg-[#e0e0e0] px-3 py-2.5 text-sm text-text-primary shadow-[inset_0_1px_3px_rgba(0,0,0,0.06)] outline-none transition-colors focus:border-primary/40 focus:ring-1 focus:ring-primary/20";

export function HomeEventTicketForm() {
  const { mutateAsync, isPending } = useSubmitHomeEventTicket();
  const [providerName, setProviderName] = useState("");
  const [eventName, setEventName] = useState("");
  const [eventCategory, setEventCategory] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [attachment, setAttachment] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const next: Record<string, string> = {};
    if (!providerName.trim()) next.providerName = "الزامی";
    if (!eventName.trim()) next.eventName = "الزامی";
    if (!eventCategory.trim()) next.eventCategory = "الزامی";
    if (!phoneNumber.trim()) next.phoneNumber = "الزامی";
    if (!attachment.trim()) next.attachment = "الزامی";
    if (!description.trim()) next.description = "الزامی";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      await mutateAsync({
        provider_name: providerName.trim(),
        event_name: eventName.trim(),
        event_category: eventCategory.trim(),
        phone_number: phoneNumber.trim(),
        attachment: attachment.trim(),
        description: description.trim(),
      });
      toast.success("درخواست شما با موفقیت ارسال شد");
      setProviderName("");
      setEventName("");
      setEventCategory("");
      setPhoneNumber("");
      setAttachment("");
      setDescription("");
      setErrors({});
    } catch {
      toast.error("خطا در ارسال درخواست");
    }
  };

  return (
    <section className="rounded-3xl bg-[#ececec] px-4 py-5 shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
      <div className="mb-4 flex justify-start">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-primary bg-white px-3 py-1.5 text-sm font-bold text-text-primary shadow-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary"
            aria-hidden
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
          ثبت درخواست
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <FormLabel>نام برگزارکننده:</FormLabel>
          <input
            value={providerName}
            onChange={(e) => {
              setProviderName(e.target.value);
              setErrors((p) => ({ ...p, providerName: "" }));
            }}
            className={cn(inputClass, errors.providerName && "border-error")}
          />
        </div>
        <div>
          <FormLabel>نام رویداد:</FormLabel>
          <input
            value={eventName}
            onChange={(e) => {
              setEventName(e.target.value);
              setErrors((p) => ({ ...p, eventName: "" }));
            }}
            className={cn(inputClass, errors.eventName && "border-error")}
          />
        </div>
        <div>
          <FormLabel>حوزه فعالیت:</FormLabel>
          <input
            value={eventCategory}
            onChange={(e) => {
              setEventCategory(e.target.value);
              setErrors((p) => ({ ...p, eventCategory: "" }));
            }}
            className={cn(inputClass, errors.eventCategory && "border-error")}
          />
        </div>
        <div>
          <FormLabel>شماره تماس:</FormLabel>
          <input
            value={phoneNumber}
            onChange={(e) => {
              setPhoneNumber(e.target.value);
              setErrors((p) => ({ ...p, phoneNumber: "" }));
            }}
            type="tel"
            inputMode="tel"
            dir="ltr"
            className={cn(inputClass, "text-left", errors.phoneNumber && "border-error")}
          />
        </div>
        <div>
          <FormLabel>توضیحات:</FormLabel>
          <textarea
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              setErrors((p) => ({ ...p, description: "" }));
            }}
            rows={4}
            className={cn(inputClass, "min-h-[6.5rem] resize-none", errors.description && "border-error")}
          />
        </div>
        <div>
          <FormLabel>آدرس سایت یا اینستاگرام:</FormLabel>
          <input
            value={attachment}
            onChange={(e) => {
              setAttachment(e.target.value);
              setErrors((p) => ({ ...p, attachment: "" }));
            }}
            dir="ltr"
            className={cn(inputClass, "text-left", errors.attachment && "border-error")}
          />
        </div>
      </div>

      <div className="mt-5 flex justify-start">
        <button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={isPending}
          className="inline-flex min-w-[9rem] items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-bold text-white shadow-[0_8px_24px_rgba(255,90,95,0.4)] transition-transform active:scale-[0.98] disabled:opacity-60"
        >
          {isPending ? "در حال ارسال..." : "ارسال درخواست"}
        </button>
      </div>
    </section>
  );
}
