export default function HomeLoading() {
  return (
    <div className="flex flex-col gap-5 px-5 pt-5 pb-8 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-7 w-24 rounded-lg bg-border/40" />
        <div className="flex gap-2">
          <div className="w-9 h-9 rounded-full bg-border/40" />
          <div className="w-9 h-9 rounded-full bg-border/40" />
        </div>
      </div>
      <div className="aspect-4/3 rounded-3xl bg-border/40" />
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-10 w-20 rounded-full bg-border/40" />
        ))}
      </div>
      <div className="h-5 w-32 rounded-lg bg-border/40" />
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="w-[140px] aspect-2/3 rounded-2xl bg-border/40 shrink-0" />
        ))}
      </div>
    </div>
  );
}
