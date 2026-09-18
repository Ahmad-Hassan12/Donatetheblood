export default function SkeletonCard() {
  return (
    <article
      role="status"
      aria-label="Loading donors"
      className="flex h-full animate-pulse flex-col rounded-2xl border border-fog bg-white p-4"
    >
      <div className="flex items-start gap-3">
        <div className="h-12 w-12 shrink-0 rounded-xl bg-fog" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-4 w-2/3 rounded-full bg-fog" />
          <div className="h-3 w-1/2 rounded-full bg-fog" />
        </div>
        <div className="h-3 w-14 rounded-full bg-fog" />
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-fog pt-3">
        <div className="h-3 w-24 rounded-full bg-fog" />
        <div className="h-8 w-24 rounded-full bg-fog" />
      </div>
    </article>
  );
}