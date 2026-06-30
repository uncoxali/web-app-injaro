export default function BrandLoading() {
  return (
    <div className="flex min-h-dvh flex-col animate-pulse">
      <div className="h-56 bg-border/40" />
      <div className="px-4 -mt-12 space-y-4">
        <div className="flex items-end gap-4">
          <div className="w-20 h-20 rounded-2xl bg-border/50" />
          <div className="flex-1 space-y-2 pb-1">
            <div className="h-5 w-2/3 rounded-lg bg-border/40" />
            <div className="h-3 w-1/2 rounded-lg bg-border/30" />
          </div>
        </div>
        <div className="flex gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-9 w-16 rounded-full bg-border/30" />
          ))}
        </div>
        <div className="h-24 rounded-2xl bg-border/30" />
      </div>
    </div>
  );
}
