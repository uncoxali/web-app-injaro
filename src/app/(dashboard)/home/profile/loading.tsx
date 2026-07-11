import { PageLoadingShell } from "@/components/ui/page-loading-shell";

export default function ProfileLoading() {
  return (
    <PageLoadingShell>
      <div className="flex flex-col flex-1 gap-4 px-4 pt-4">
        <div className="h-11 w-11 rounded-full bg-border/30" />
        <div className="h-[100px] rounded-[22px] bg-border/30" />
        <div className="grid grid-cols-3 gap-2.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-[100px] rounded-[18px] bg-border/25" />
          ))}
        </div>
        <div className="flex-1 rounded-[22px] bg-border/20">
          <div className="h-14 border-b border-border/20" />
          <div className="h-28 border-b border-border/20 p-4">
            <div className="mb-3 h-4 w-24 rounded-md bg-border/30 ms-auto" />
            <div className="flex gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-7 w-16 rounded-full bg-border/25" />
              ))}
            </div>
          </div>
          <div className="h-14" />
        </div>
      </div>
    </PageLoadingShell>
  );
}
