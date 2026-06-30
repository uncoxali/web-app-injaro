export default function InjaroLoading() {
  return (
    <div className="relative h-dvh w-full animate-pulse bg-surface">
      <div className="absolute top-4 inset-x-4 h-12 rounded-2xl bg-border/40" />
      <div className="absolute bottom-28 inset-x-4 h-16 rounded-2xl bg-border/30" />
    </div>
  );
}
