"use client";

import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { HomeRegisterEventCta } from "@/components/home/home-register-event-cta";
import { HomePastCollaborations } from "@/components/home/home-past-collaborations";
import { HomeCollaborationInfo } from "@/components/home/home-collaboration-info";
import { HomeEventTicketForm } from "@/components/home/home-event-ticket-form";

export default function RegisterEventPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-dvh flex-col">
      <div className="sticky top-0 z-10 border-b border-border/50 bg-background/80 backdrop-blur-xs">
        <div className="flex h-14 items-center gap-3 px-4">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="بازگشت"
            className="text-text-secondary transition-colors hover:text-text-primary"
          >
            <Icon name="chevronLeft" size={22} className="scale-x-[-1]" />
          </button>
          <h1 className="text-base font-bold text-text-primary">ثبت درخواست همکاری</h1>
        </div>
      </div>

      <div className="flex flex-col gap-5 px-5 pt-5 pb-32">
        <HomeRegisterEventCta />
        <HomePastCollaborations />
        <HomeCollaborationInfo />
        <HomeEventTicketForm />
      </div>
    </div>
  );
}
