// Direct database queries for server-side rendering
// Uses better-sqlite3 to query the local earthquake database

import Database from 'better-sqlite3';
import path from 'path';
import { haversineKm } from './geo';

const DB_PATH = path.join(process.cwd(), 'data/earthquakes.db');

interface DBEarthquake {
  id: string;
  source: string;
  date_time: string;
  timestamp: number;
  latitude: number;
  longitude: number;
  depth: number;
  magnitude: number;
  magnitude_type: string;
  location: string;
  region: string | null;
  url: string | null;
  felt: number | null;
  tsunami: number;
}

export interface ProcessedEarthquake {
  id: string;
  source: string;
  magnitude: number;
  magnitudeType: string;
  place: string;
  time: Date;
  timestamp: number;
  latitude: number;
  longitude: number;
  depth: number;
  region: string | null;
  url: string | null;
  felt: number | null;
  tsunami: boolean;
}

// Philippines bounding box
const PHILIPPINES_BOUNDS = {
  minLat: 4.5,
  maxLat: 21.5,
  minLon: 116.0,
  maxLon: 127.0,
};

/**
 * Reference "now" for rolling time-window queries.
 *
 * The PHIVOLCS/USGS snapshot is committed to the repo on a schedule, so the
 * newest row can lag wall-clock time (and in a stale deployment can be far
 * behind it). Anchoring "last N days" windows to the newest available row —
 * rather than Date.now() — keeps the queries meaningful when ingestion lags,
 * instead of silently returning zero rows once the data ages past the window.
 * Falls back to Date.now() when the database is empty.
 */
function getReferenceTimestamp(db: Database.Database): number {
  const row = db.prepare(`
    SELECT MAX(timestamp) as maxTs FROM earthquakes
    WHERE latitude >= ? AND latitude <= ?
      AND longitude >= ? AND longitude <= ?
  `).get(
    PHILIPPINES_BOUNDS.minLat,
    PHILIPPINES_BOUNDS.maxLat,
    PHILIPPINES_BOUNDS.minLon,
    PHILIPPINES_BOUNDS.maxLon
  ) as { maxTs: number | null };
  return row?.maxTs ?? Date.now();
}

/**
 * Public accessor for the data reference time (timestamp, ms).
 * Used by pages so the volcanic model analyses the same window the DB queries do.
 */
export function getDataReferenceTime(): number {
  try {
    const db = new Database(DB_PATH, { readonly: true });
    const ref = getReferenceTimestamp(db);
    db.close();
    return ref;
  } catch (error) {
    console.error('Reference time error:', error);
    return Date.now();
  }
}

/**
 * Data freshness for UI indicators: how old the newest PHIVOLCS record is.
 * The scraper runs roughly every 30 minutes, so anything older than ~2 days
 * indicates a stalled pipeline and is flagged as stale.
 */
export function getDataFreshness(): {
  latest: Date | null;
  ageMs: number;
  ageDays: number;
  isStale: boolean;
} {
  const { lastUpdate } = getLastUpdateTime();
  if (!lastUpdate) {
    return { latest: null, ageMs: 0, ageDays: 0, isStale: false };
  }
  const ageMs = Date.now() - lastUpdate.getTime();
  const ageDays = Math.floor(ageMs / (24 * 60 * 60 * 1000));
  return {
    latest: lastUpdate,
    ageMs,
    ageDays,
    isStale: ageMs > 2 * 24 * 60 * 60 * 1000,
  };
}

/**
 * Get Philippines earthquakes from local database
 */
export function getPhilippinesEarthquakes(
  days: number = 7,
  minMag: number = 1.0,
  limit: number = 2000
): ProcessedEarthquake[] {
  try {
    const db = new Database(DB_PATH, { readonly: true });
    const cutoffTime = getReferenceTimestamp(db) - days * 24 * 60 * 60 * 1000;
    
    const earthquakes = db.prepare(`
      SELECT * FROM earthquakes 
      WHERE timestamp >= ?
        AND magnitude >= ?
        AND latitude >= ? AND latitude <= ?
        AND longitude >= ? AND longitude <= ?
      ORDER BY timestamp DESC
      LIMIT ?
    `).all(
      cutoffTime,
      minMag,
      PHILIPPINES_BOUNDS.minLat,
      PHILIPPINES_BOUNDS.maxLat,
      PHILIPPINES_BOUNDS.minLon,
      PHILIPPINES_BOUNDS.maxLon,
      limit
    ) as DBEarthquake[];
    
    db.close();
    
    return earthquakes.map(eq => ({
      id: eq.id,
      source: eq.source,
      magnitude: eq.magnitude,
      magnitudeType: eq.magnitude_type,
      place: eq.location,
      time: new Date(eq.date_time),
      timestamp: eq.timestamp,
      latitude: eq.latitude,
      longitude: eq.longitude,
      depth: eq.depth,
      region: eq.region,
      url: eq.url,
      felt: eq.felt,
      tsunami: eq.tsunami === 1,
    }));
  } catch (error) {
    console.error('Database query error:', error);
    return [];
  }
}

function mapRow(eq: DBEarthquake): ProcessedEarthquake {
  return {
    id: eq.id,
    source: eq.source,
    magnitude: eq.magnitude,
    magnitudeType: eq.magnitude_type,
    place: eq.location,
    time: new Date(eq.date_time),
    timestamp: eq.timestamp,
    latitude: eq.latitude,
    longitude: eq.longitude,
    depth: eq.depth,
    region: eq.region,
    url: eq.url,
    felt: eq.felt,
    tsunami: eq.tsunami === 1,
  };
}

/**
 * Look up a single earthquake by its database id (e.g. "usgs_us6000s5d3").
 * Returns null when the id is not in the local snapshot — callers can then fall
 * back to a live source (see fetchUSGSEventById in usgs-api).
 */
export function getEarthquakeById(id: string): ProcessedEarthquake | null {
  try {
    const db = new Database(DB_PATH, { readonly: true });
    const row = db.prepare('SELECT * FROM earthquakes WHERE id = ?').get(id) as DBEarthquake | undefined;
    db.close();
    return row ? mapRow(row) : null;
  } catch (error) {
    console.error('getEarthquakeById error:', error);
    return null;
  }
}

/**
 * Earthquakes near a point (great-circle), excluding one id, within a time
 * window measured back from the data reference time. Used for an event's
 * "related earthquakes" / local sequence.
 */
export function getNearbyEarthquakes(
  latitude: number,
  longitude: number,
  opts: { excludeId?: string; radiusKm?: number; days?: number; minMag?: number; limit?: number } = {}
): (ProcessedEarthquake & { distanceKm: number })[] {
  const { excludeId, radiusKm = 250, days = 365, minMag = 1.0, limit = 12 } = opts;
  try {
    const db = new Database(DB_PATH, { readonly: true });
    const cutoff = getReferenceTimestamp(db) - days * 24 * 60 * 60 * 1000;
    // Coarse bounding box first (1° lat ≈ 111 km), then exact haversine filter.
    const dLat = radiusKm / 111;
    const dLon = radiusKm / (111 * Math.max(0.2, Math.cos((latitude * Math.PI) / 180)));
    const rows = db.prepare(`
      SELECT * FROM earthquakes
      WHERE timestamp >= ? AND magnitude >= ?
        AND latitude BETWEEN ? AND ? AND longitude BETWEEN ? AND ?
      ORDER BY timestamp DESC
      LIMIT 500
    `).all(cutoff, minMag, latitude - dLat, latitude + dLat, longitude - dLon, longitude + dLon) as DBEarthquake[];
    db.close();

    return rows
      .filter((r) => r.id !== excludeId)
      .map((r) => ({ ...mapRow(r), distanceKm: haversineKm(latitude, longitude, r.latitude, r.longitude) }))
      .filter((r) => r.distanceKm <= radiusKm)
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, limit);
  } catch (error) {
    console.error('getNearbyEarthquakes error:', error);
    return [];
  }
}

/** Most significant recent earthquakes — used to pre-render their detail pages. */
export function getSignificantEarthquakeIds(minMag = 4.0, days = 120, limit = 250): string[] {
  try {
    const db = new Database(DB_PATH, { readonly: true });
    const cutoff = getReferenceTimestamp(db) - days * 24 * 60 * 60 * 1000;
    const rows = db.prepare(`
      SELECT id FROM earthquakes WHERE magnitude >= ? AND timestamp >= ?
      ORDER BY magnitude DESC, timestamp DESC LIMIT ?
    `).all(minMag, cutoff, limit) as { id: string }[];
    db.close();
    return rows.map((r) => r.id);
  } catch (error) {
    console.error('getSignificantEarthquakeIds error:', error);
    return [];
  }
}

/**
 * Get Philippines stats from local database
 */
export function getPhilippinesStats(days: number = 7) {
  try {
    const db = new Database(DB_PATH, { readonly: true });
    const cutoffTime = getReferenceTimestamp(db) - days * 24 * 60 * 60 * 1000;
    
    const stats = db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN magnitude >= 2 THEN 1 ELSE 0 END) as m2Plus,
        SUM(CASE WHEN magnitude >= 3 THEN 1 ELSE 0 END) as m3Plus,
        SUM(CASE WHEN magnitude >= 4 THEN 1 ELSE 0 END) as m4Plus,
        SUM(CASE WHEN magnitude >= 5 THEN 1 ELSE 0 END) as m5Plus,
        SUM(CASE WHEN magnitude >= 6 THEN 1 ELSE 0 END) as m6Plus,
        AVG(magnitude) as avgMagnitude,
        MAX(magnitude) as maxMagnitude,
        MIN(magnitude) as minMagnitude,
        AVG(depth) as avgDepth
      FROM earthquakes 
      WHERE timestamp >= ?
        AND latitude >= ? AND latitude <= ?
        AND longitude >= ? AND longitude <= ?
    `).get(
      cutoffTime,
      PHILIPPINES_BOUNDS.minLat,
      PHILIPPINES_BOUNDS.maxLat,
      PHILIPPINES_BOUNDS.minLon,
      PHILIPPINES_BOUNDS.maxLon
    ) as Record<string, number>;
    
    // Get by region
    const byRegion = db.prepare(`
      SELECT region, COUNT(*) as count, AVG(magnitude) as avgMag
      FROM earthquakes 
      WHERE timestamp >= ?
        AND latitude >= ? AND latitude <= ?
        AND longitude >= ? AND longitude <= ?
      GROUP BY region
      ORDER BY count DESC
    `).all(
      cutoffTime,
      PHILIPPINES_BOUNDS.minLat,
      PHILIPPINES_BOUNDS.maxLat,
      PHILIPPINES_BOUNDS.minLon,
      PHILIPPINES_BOUNDS.maxLon
    );
    
    db.close();
    
    return {
      total: stats.total || 0,
      m2Plus: stats.m2Plus || 0,
      m3Plus: stats.m3Plus || 0,
      m4Plus: stats.m4Plus || 0,
      m5Plus: stats.m5Plus || 0,
      m6Plus: stats.m6Plus || 0,
      avgMagnitude: stats.avgMagnitude || 0,
      maxMagnitude: stats.maxMagnitude || 0,
      minMagnitude: stats.minMagnitude || 0,
      avgDepth: stats.avgDepth || 0,
      byRegion,
    };
  } catch (error) {
    console.error('Database stats error:', error);
    return {
      total: 0,
      m2Plus: 0,
      m3Plus: 0,
      m4Plus: 0,
      m5Plus: 0,
      m6Plus: 0,
      avgMagnitude: 0,
      maxMagnitude: 0,
      minMagnitude: 0,
      avgDepth: 0,
      byRegion: [],
    };
  }
}

/**
 * Get database info
 */
export function getDatabaseInfo() {
  try {
    const db = new Database(DB_PATH, { readonly: true });
    
    const info = db.prepare(`
      SELECT 
        COUNT(*) as total,
        MIN(date_time) as oldest,
        MAX(date_time) as newest
      FROM earthquakes
    `).get() as Record<string, any>;
    
    const bySrc = db.prepare(`
      SELECT source, COUNT(*) as count
      FROM earthquakes
      GROUP BY source
    `).all();
    
    db.close();
    
    return {
      total: info.total,
      oldest: info.oldest,
      newest: info.newest,
      bySource: bySrc,
    };
  } catch (error) {
    console.error('Database info error:', error);
    return null;
  }
}

/**
 * Get the last update time of the earthquake data (newest row, any source),
 * plus the PHIVOLCS row count for source-specific indicators.
 */
export function getLastUpdateTime(): { lastUpdate: Date | null; phivolcsCount: number } {
  try {
    const db = new Database(DB_PATH, { readonly: true });

    // Freshness = the newest row from ANY source. The in-process refresher
    // (src/lib/data-refresh.ts) keeps the usgs series current; measuring only
    // PHIVOLCS rows (the old behavior) flagged the whole site as stale
    // whenever that one scraper lagged, even with current data on the pages.
    const result = db.prepare(`
      SELECT
        MAX(timestamp) as lastTimestamp,
        SUM(CASE WHEN source = 'phivolcs' THEN 1 ELSE 0 END) as count
      FROM earthquakes
    `).get() as { lastTimestamp: number | null; count: number };

    db.close();

    return {
      lastUpdate: result.lastTimestamp ? new Date(result.lastTimestamp) : null,
      phivolcsCount: result.count || 0,
    };
  } catch (error) {
    console.error('Last update time error:', error);
    return { lastUpdate: null, phivolcsCount: 0 };
  }
}

/**
 * Get today vs yesterday comparison for Philippines seismicity
 * Returns counts and largest magnitudes for comparison
 */
export function getTodayVsYesterday() {
  try {
    const db = new Database(DB_PATH, { readonly: true });
    
    // Calculate time boundaries (midnight PHT = UTC+8).
    // Anchored to the newest available record so "today/yesterday" stays
    // meaningful even when the data snapshot lags wall-clock time.
    const now = getReferenceTimestamp(db);
    const phtOffset = 8 * 60 * 60 * 1000; // 8 hours in ms
    const todayMidnight = new Date(now + phtOffset);
    todayMidnight.setUTCHours(0, 0, 0, 0);
    const todayStartMs = todayMidnight.getTime() - phtOffset;
    const yesterdayStartMs = todayStartMs - 24 * 60 * 60 * 1000;
    
    // Today's stats
    const todayStats = db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN magnitude >= 3 THEN 1 ELSE 0 END) as m3Plus,
        SUM(CASE WHEN magnitude >= 4 THEN 1 ELSE 0 END) as m4Plus,
        MAX(magnitude) as maxMag,
        AVG(magnitude) as avgMag
      FROM earthquakes 
      WHERE timestamp >= ?
        AND latitude >= ? AND latitude <= ?
        AND longitude >= ? AND longitude <= ?
    `).get(
      todayStartMs,
      PHILIPPINES_BOUNDS.minLat,
      PHILIPPINES_BOUNDS.maxLat,
      PHILIPPINES_BOUNDS.minLon,
      PHILIPPINES_BOUNDS.maxLon
    ) as Record<string, number>;
    
    // Yesterday's stats
    const yesterdayStats = db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN magnitude >= 3 THEN 1 ELSE 0 END) as m3Plus,
        SUM(CASE WHEN magnitude >= 4 THEN 1 ELSE 0 END) as m4Plus,
        MAX(magnitude) as maxMag,
        AVG(magnitude) as avgMag
      FROM earthquakes 
      WHERE timestamp >= ? AND timestamp < ?
        AND latitude >= ? AND latitude <= ?
        AND longitude >= ? AND longitude <= ?
    `).get(
      yesterdayStartMs,
      todayStartMs,
      PHILIPPINES_BOUNDS.minLat,
      PHILIPPINES_BOUNDS.maxLat,
      PHILIPPINES_BOUNDS.minLon,
      PHILIPPINES_BOUNDS.maxLon
    ) as Record<string, number>;
    
    db.close();
    
    const today = {
      total: todayStats.total || 0,
      m3Plus: todayStats.m3Plus || 0,
      m4Plus: todayStats.m4Plus || 0,
      maxMag: todayStats.maxMag || 0,
      avgMag: todayStats.avgMag || 0,
    };
    
    const yesterday = {
      total: yesterdayStats.total || 0,
      m3Plus: yesterdayStats.m3Plus || 0,
      m4Plus: yesterdayStats.m4Plus || 0,
      maxMag: yesterdayStats.maxMag || 0,
      avgMag: yesterdayStats.avgMag || 0,
    };
    
    // Calculate change percentages
    const totalChange = yesterday.total > 0 
      ? Math.round(((today.total - yesterday.total) / yesterday.total) * 100) 
      : (today.total > 0 ? 100 : 0);
    
    // Determine activity level
    let activityLevel: 'low' | 'normal' | 'elevated' | 'high' = 'normal';
    if (totalChange > 50 || today.m4Plus > 2) activityLevel = 'high';
    else if (totalChange > 20 || today.m4Plus > 0) activityLevel = 'elevated';
    else if (totalChange < -30) activityLevel = 'low';
    
    return {
      today,
      yesterday,
      totalChange,
      activityLevel,
    };
  } catch (error) {
    console.error('Today vs yesterday error:', error);
    return {
      today: { total: 0, m3Plus: 0, m4Plus: 0, maxMag: 0, avgMag: 0 },
      yesterday: { total: 0, m3Plus: 0, m4Plus: 0, maxMag: 0, avgMag: 0 },
      totalChange: 0,
      activityLevel: 'normal' as const,
    };
  }
}
