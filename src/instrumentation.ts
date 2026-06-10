// Next.js instrumentation hook — runs once when the server boots.
// Schedules the earthquake-data refresh so the SQLite snapshot the site reads
// from stays current in production without any external cron.
//
// Env knobs:
//   DATA_REFRESH_DISABLED=1   turn scheduling off entirely
//   DATA_REFRESH_MINUTES=15   interval between refreshes (min 5)

export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;
  if (process.env.DATA_REFRESH_DISABLED === '1') return;

  // Guard against double-registration (dev HMR re-runs register()).
  const g = globalThis as typeof globalThis & { __eqRefreshScheduled?: boolean };
  if (g.__eqRefreshScheduled) return;
  g.__eqRefreshScheduled = true;

  const { refreshEarthquakeData } = await import('@/lib/data-refresh');

  const minutes = Math.max(5, parseInt(process.env.DATA_REFRESH_MINUTES || '15', 10) || 15);

  // Catch up shortly after boot (a fresh deploy ships a stale snapshot),
  // then keep current on an interval. unref() so timers never hold the
  // process open during shutdown.
  setTimeout(() => {
    refreshEarthquakeData('startup').catch(() => {});
  }, 5_000).unref();

  setInterval(() => {
    refreshEarthquakeData('interval').catch(() => {});
  }, minutes * 60_000).unref();

  console.log(`[data-refresh] scheduled: on boot + every ${minutes} min (DATA_REFRESH_DISABLED=1 to turn off)`);
}
