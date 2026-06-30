import { PageLoadingShell } from "@/components/ui/page-loading-shell";

export default function ProfileLoading() {
  return (
    <PageLoadingShell>
      <div className="flex flex-col flex-1 px-4 pt-6">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-20 h-20 rounded-full bg-border/40" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-32 rounded-lg bg-border/40" />
            <div className="h-3 w-24 rounded-lg bg-border/30" />
          </div>
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-14 rounded-2xl bg-border/25 mb-3" />
        ))}
      </div>
    </PageLoadingShell>
  );
}
