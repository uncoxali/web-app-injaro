import { PageLoadingShell } from "@/components/ui/page-loading-shell";

export default function BrandLoading() {
  return (
    <PageLoadingShell>
      <div className="flex flex-col flex-1 px-4 pt-4 pb-8 gap-4">
        <div className="h-72 rounded-3xl bg-border/30" />
        <div className="h-5 w-2/3 rounded-lg bg-border/30" />
        <div className="h-16 rounded-2xl bg-border/25" />
        <div className="flex gap-2.5">
          <div className="h-12 flex-1 rounded-full bg-border/25" />
          <div className="h-12 flex-1 rounded-full bg-border/25" />
        </div>
        <div className="h-20 rounded-2xl bg-border/25" />
        <div className="h-4 w-28 rounded-md bg-border/30" />
        <div className="space-y-2">
          <div className="h-3 w-full rounded bg-border/20" />
          <div className="h-3 w-5/6 rounded bg-border/20" />
        </div>
        <div className="flex gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="w-[92px] space-y-2">
              <div className="h-[92px] rounded-[18px] bg-border/25" />
              <div className="h-3 w-full rounded bg-border/20" />
            </div>
          ))}
        </div>
      </div>
    </PageLoadingShell>
  );
}
