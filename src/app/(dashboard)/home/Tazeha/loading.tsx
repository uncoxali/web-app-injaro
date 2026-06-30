export default function TazehaLoading() {
  return (
    <div className="flex flex-col min-h-dvh animate-pulse">
      <div className="px-4 pt-3 pb-3 border-b border-border/10">
        <div className="h-6 w-24 rounded-lg bg-border/40 mb-4" />
        <div className="flex gap-2 mb-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 w-14 rounded-xl bg-border/30 shrink-0" />
          ))}
        </div>
        <div className="flex gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-8 w-16 rounded-full bg-border/30" />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 p-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="aspect-4/5 rounded-2xl bg-border/30" />
        ))}
      </div>
    </div>
  );
}
