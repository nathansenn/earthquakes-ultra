// ============================================================================
// In-process earthquake data refresh (keeps data/earthquakes.db current)
// ============================================================================
//
// The committed SQLite snapshot goes stale the moment it's deployed (the prod
// incident: pages serving February data in June). This module ingests new
// events from the USGS FDSN API — the same source/series as the existing
// `usgs_*` rows (PH-wide bbox, M3+) — directly into the SQLite database the
// whole site reads from.
//
// Scheduling: src/instrumentation.ts runs this on server boot and on an
// interval. Manual trigger + status: /api/refresh.
//
// PHIVOLCS micro-seismicity (M1–3) cannot be refreshed in-process: their site
// returns 503 to plain HTTP clients, and the legacy Puppeteer scraper needs a
// system Chromium the production image doesn't ship. The legacy scraper
// (scrapers/phivolcs-scraper.ts) still works when run externally.
// ============================================================================

import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data/earthquakes.db');

// Matches the bbox/magnitude floor of the existing historical usgs_* series.
const INGEST_BOUNDS = { minLat: 3.0, maxLat: 22.0, minLon: 115.5, maxLon: 130.0 };
const INGEST_MIN_MAG = 3.0;
const OVERLAP_MS = 3 * 24 * 60 * 60 * 1000;        // re-fetch overlap (revisions)
const MAX_BACKFILL_MS = 400 * 24 * 60 * 60 * 1000; // never look back further
const FETCH_LIMIT = 20000;                          // USGS FDSN per-query cap

export interface RefreshResult {
  success: boolean;
  source: 'usgs';
  reason: string;
  startedAt: string;
  completedAt: string;
  durationMs: number;
  found: number;
  inserted: number;
  updated: number;
  windowStart: string;
  error?: string;
}

interface RefreshState {
  inProgress: boolean;
  lastResult: RefreshResult | null;
}

// Shared across bundles (instrumentation + route handlers) within the process.
function state(): RefreshState {
  const g = globalThis as typeof globalThis & { __eqRefreshState?: RefreshState };
  if (!g.__eqRefreshState) g.__eqRefreshState = { inProgress: false, lastResult: null };
  return g.__eqRefreshState;
}

// Same region labels as the existing rows (and the legacy PHIVOLCS scraper).
function categorizeRegion(lat: number, lon: number): string {
  if (lat >= 12.0 && lon >= 119.0) return 'Luzon';
  if (lat >= 9.0 && lat < 12.5 && lon >= 122.0) return 'Visayas';
  if (lat < 10.0 && lon >= 118.0) return 'Mindanao';
  if (lon < 121.0 && lat >= 8.0 && lat < 12.5) return 'Palawan';
  return 'Philippines';
}

interface USGSFeature {
  id: string;
  properties: {
    mag: number | null;
    magType: string | null;
    place: string | null;
    time: number;
    url: string | null;
    felt: number | null;
    tsunami: number | null;
  };
  geometry: { coordinates: [number, number, number | null] };
}

async function fetchUSGSWindow(startMs: number, endMs: number): Promise<USGSFeature[]> {
  const params = new URLSearchParams({
    format: 'geojson',
    starttime: new Date(startMs).toISOString(),
    endtime: new Date(endMs).toISOString(),
    minlatitude: String(INGEST_BOUNDS.minLat),
    maxlatitude: String(INGEST_BOUNDS.maxLat),
    minlongitude: String(INGEST_BOUNDS.minLon),
    maxlongitude: String(INGEST_BOUNDS.maxLon),
    minmagnitude: String(INGEST_MIN_MAG),
    orderby: 'time-asc',
    limit: String(FETCH_LIMIT),
  });
  const res = await fetch(`https://earthquake.usgs.gov/fdsnws/event/1/query?${params}`, {
    headers: { 'User-Agent': 'earthquakes-ultra/1.0 (data refresh)' },
    signal: AbortSignal.timeout(60_000),
  });
  if (!res.ok) throw new Error(`USGS FDSN responded ${res.status}`);
  const json = (await res.json()) as { features?: USGSFeature[] };
  return json.features ?? [];
}

/**
 * Pull new USGS events since the last ingested row and upsert them into the
 * SQLite database. Safe to call concurrently (no-ops if already running);
 * never throws — failures are captured in the returned result + scrape_log.
 */
export async function refreshEarthquakeData(reason: string = 'manual'): Promise<RefreshResult> {
  const s = state();
  const startedAt = new Date();
  const base: RefreshResult = {
    success: false, source: 'usgs', reason,
    startedAt: startedAt.toISOString(), completedAt: '', durationMs: 0,
    found: 0, inserted: 0, updated: 0, windowStart: '',
  };

  if (s.inProgress) {
    return { ...base, completedAt: new Date().toISOString(), error: 'refresh already in progress' };
  }
  s.inProgress = true;

  let db: Database.Database | null = null;
  try {
    db = new Database(DB_PATH);
    // WAL lets the site's read-only connections keep reading while we write.
    db.pragma('journal_mode = WAL');
    db.pragma('busy_timeout = 5000');

    const row = db.prepare("SELECT MAX(timestamp) AS m FROM earthquakes WHERE source = 'usgs'").get() as { m: number | null };
    const now = Date.now();
    const windowStart = Math.max(
      (row.m ?? now - MAX_BACKFILL_MS) - OVERLAP_MS,
      now - MAX_BACKFILL_MS,
    );
    base.windowStart = new Date(windowStart).toISOString();

    // Page forward through the window (a long gap can exceed one query's cap).
    const features: USGSFeature[] = [];
    let cursor = windowStart;
    for (let i = 0; i < 5; i++) {
      const batch = await fetchUSGSWindow(cursor, now);
      features.push(...batch);
      if (batch.length < FETCH_LIMIT) break;
      cursor = batch[batch.length - 1].properties.time + 1;
    }
    base.found = features.length;

    const upsert = db.prepare(`
      INSERT INTO earthquakes (
        id, source, date_time, timestamp, latitude, longitude,
        depth, magnitude, magnitude_type, location, region, url, scraped_at, felt, tsunami
      ) VALUES (?, 'usgs', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        depth = excluded.depth,
        magnitude = excluded.magnitude,
        magnitude_type = excluded.magnitude_type,
        location = excluded.location,
        felt = excluded.felt,
        tsunami = excluded.tsunami,
        scraped_at = excluded.scraped_at,
        updated_at = CURRENT_TIMESTAMP
    `);
    const exists = db.prepare('SELECT 1 FROM earthquakes WHERE id = ?');
    const scrapedAt = new Date().toISOString();

    const apply = db.transaction((feats: USGSFeature[]) => {
      for (const f of feats) {
        const p = f.properties;
        const [lon, lat, depth] = f.geometry.coordinates;
        if (p.mag == null || !Number.isFinite(lat) || !Number.isFinite(lon)) continue;
        const already = exists.get(`usgs_${f.id}`);
        upsert.run(
          `usgs_${f.id}`,
          new Date(p.time).toISOString(),
          p.time,
          lat,
          lon,
          depth ?? 10,
          p.mag,
          p.magType ?? 'mb',
          p.place ?? 'Philippines region',
          categorizeRegion(lat, lon),
          p.url ?? `https://earthquake.usgs.gov/earthquakes/eventpage/${f.id}`,
          scrapedAt,
          p.felt ?? null,
          p.tsunami ?? 0,
        );
        if (already) base.updated++;
        else base.inserted++;
      }
    });
    apply(features);

    base.success = true;
  } catch (err) {
    base.error = err instanceof Error ? err.message : String(err);
  } finally {
    base.completedAt = new Date().toISOString();
    base.durationMs = Date.now() - startedAt.getTime();

    // Log the run (same scrape_log the legacy scraper uses), best-effort.
    try {
      db?.prepare(`
        INSERT INTO scrape_log (source, started_at, completed_at, success,
          earthquakes_found, earthquakes_new, earthquakes_updated, error_message, duration_ms)
        VALUES ('usgs', ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        base.startedAt, base.completedAt, base.success ? 1 : 0,
        base.found, base.inserted, base.updated, base.error ?? null, base.durationMs,
      );
    } catch { /* logging must not mask the result */ }
    try { db?.close(); } catch { /* ignore */ }

    s.inProgress = false;
    s.lastResult = base;
    console.log(
      `[data-refresh] ${base.success ? 'ok' : 'FAILED'} (${reason}): ` +
      `+${base.inserted} new, ${base.updated} updated of ${base.found} fetched ` +
      `in ${base.durationMs}ms${base.error ? ` — ${base.error}` : ''}`,
    );
  }

  return base;
}

/** Current refresh status + data freshness, for /api/refresh GET. */
export function getRefreshStatus() {
  const s = state();
  let dbLatest: string | null = null;
  let totalRows: number | null = null;
  try {
    const db = new Database(DB_PATH, { readonly: true });
    const row = db.prepare('SELECT MAX(timestamp) AS m, COUNT(*) AS c FROM earthquakes').get() as { m: number | null; c: number };
    dbLatest = row.m ? new Date(row.m).toISOString() : null;
    totalRows = row.c;
    db.close();
  } catch { /* db unavailable */ }
  return {
    inProgress: s.inProgress,
    lastResult: s.lastResult,
    dbLatestEvent: dbLatest,
    totalRows,
  };
}
