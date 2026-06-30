import { PageLoadingShell } from "@/components/ui/page-loading-shell";

export default function InjaroLoading() {
  return (
    <PageLoadingShell>
      <div className="relative flex-1 w-full bg-surface">
        <div className="absolute top-4 inset-x-4 h-12 rounded-2xl bg-border/40" />
        <div className="absolute bottom-28 inset-x-4 h-16 rounded-2xl bg-border/30" />
      </div>
    </PageLoadingShell>
  );
}
