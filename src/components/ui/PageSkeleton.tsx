import { Skeleton } from "./kit";

/**
 * Generic route-loading skeleton: a colored hero band + a grid of stat/card
 * placeholders. Used by loading.tsx files so data-heavy pages show structure
 * immediately during navigation instead of a blank screen.
 */
export function PageSkeleton({
  hero = "from-blue-600 to-indigo-700",
  cards = 8,
}: {
  hero?: string;
  cards?: number;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <section className={`bg-gradient-to-br ${hero} py-12`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-8 w-64 rounded bg-white/20 animate-pulse" />
          <div className="h-4 w-40 rounded bg-white/10 animate-pulse mt-3" />
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-20 rounded-xl bg-white/10 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-6 w-48 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: cards }).map((_, i) => (
              <Skeleton key={i} className="h-28" />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
