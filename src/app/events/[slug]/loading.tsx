import { PageLoadingShell } from "@/components/ui/page-loading-shell";

export default function EventLoading() {
  return (
    <PageLoadingShell>
      <div className="flex flex-col flex-1">
        <div className="aspect-4/3 bg-border/40 shrink-0" />
        <div className="px-4 pt-5 space-y-3 flex-1">
          <div className="h-6 w-3/4 rounded-lg bg-border/40" />
          <div className="h-4 w-full rounded-lg bg-border/30" />
          <div className="h-4 w-5/6 rounded-lg bg-border/30" />
          <div className="flex gap-2 pt-2">
            <div className="h-10 w-24 rounded-full bg-border/40" />
            <div className="h-10 w-24 rounded-full bg-border/30" />
          </div>
        </div>
      </div>
    </PageLoadingShell>
  );
}
