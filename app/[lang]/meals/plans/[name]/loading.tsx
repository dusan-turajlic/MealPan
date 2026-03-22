export default function Loading() {
  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="h-8 bg-rule rounded-lg w-3/4" />
      <div className="h-4 bg-lift rounded w-1/2" />

      {/* Tab bar skeleton */}
      <div className="flex gap-2">
        <div className="h-10 bg-rule rounded-full w-28" />
        <div className="h-10 bg-lift rounded-full w-28" />
      </div>

      {/* Daily totals skeleton */}
      <div className="h-16 bg-lift rounded-xl" />

      {/* Meal cards skeleton */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-surface rounded-2xl p-4 space-y-3">
          <div className="h-5 bg-lift rounded w-1/3" />
          <div className="flex gap-2">
            <div className="h-8 bg-lift rounded-full w-24" />
            <div className="h-8 bg-rule rounded-full w-24" />
          </div>
          <div className="space-y-2">
            {[1, 2, 3].map((j) => (
              <div key={j} className="flex justify-between">
                <div className="h-4 bg-lift rounded w-1/2" />
                <div className="h-4 bg-lift rounded w-1/4" />
              </div>
            ))}
          </div>
          <div className="h-3 bg-lift rounded-full" />
        </div>
      ))}
    </div>
  );
}
