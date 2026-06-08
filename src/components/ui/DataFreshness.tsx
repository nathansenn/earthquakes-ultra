// Server components for surfacing how fresh the underlying earthquake data is.
// Used on data-backed pages so a stale snapshot (or a stalled scraper) is shown
// to users instead of being silently presented as live conditions.

export interface FreshnessData {
  latest: Date | null;
  ageDays: number;
  isStale: boolean;
}

function formatAsOf(latest: Date): string {
  return latest.toLocaleString('en-PH', {
    timeZone: 'Asia/Manila',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * Compact inline badge: green when current, amber "as of <date>" when stale.
 */
export function DataFreshness({
  latest,
  ageDays,
  isStale,
  label = 'Data',
  className = '',
}: FreshnessData & { label?: string; className?: string }) {
  if (!latest) {
    return (
      <span className={`inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 ${className}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
        {label} unavailable
      </span>
    );
  }

  const asOf = formatAsOf(latest);

  if (isStale) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-300 ${className}`}
        title={`Most recent record: ${asOf} PHT`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        {label} as of {asOf} PHT · {ageDays} day{ageDays === 1 ? '' : 's'} old
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 ${className}`}
      title={`Most recent record: ${asOf} PHT`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
      {label} current · as of {asOf} PHT
    </span>
  );
}

/**
 * Full-width warning banner, rendered only when the data is stale.
 */
export function StaleDataBanner({ latest, ageDays, isStale }: FreshnessData) {
  if (!isStale || !latest) return null;
  const asOf = formatAsOf(latest);

  return (
    <section className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-start gap-3 text-sm text-amber-800 dark:text-amber-200">
          <span className="text-lg leading-none">⚠️</span>
          <p>
            <strong>Data may be delayed.</strong> This page reflects the most recent available
            seismic data (as of {asOf} PHT — about {ageDays} day{ageDays === 1 ? '' : 's'} ago),
            not live conditions. For current volcano status, always consult{' '}
            <a
              href="https://www.phivolcs.dost.gov.ph/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-medium"
            >
              PHIVOLCS
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
