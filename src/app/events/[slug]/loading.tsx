export default function EventLoading() {
  return (
    <div className="flex min-h-dvh flex-col animate-pulse">
      <div className="aspect-4/3 bg-border/40" />
      <div className="px-4 pt-5 space-y-3">
        <div className="h-6 w-3/4 rounded-lg bg-border/40" />
        <div className="h-4 w-full rounded-lg bg-border/30" />
        <div className="h-4 w-5/6 rounded-lg bg-border/30" />
        <div className="flex gap-2 pt-2">
          <div className="h-10 w-24 rounded-full bg-border/40" />
          <div className="h-10 w-24 rounded-full bg-border/30" />
        </div>
      </div>
    </div>
  );
}
