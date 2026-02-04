// Direct database queries for server-side rendering
// Uses better-sqlite3 to query the local earthquake database

import Database from 'better-sqlite3';
import path from 'path';

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
 * Get Philippines earthquakes from local database
 */
export function getPhilippinesEarthquakes(
  days: number = 7,
  minMag: number = 1.0,
  limit: number = 2000
): ProcessedEarthquake[] {
  try {
    const db = new Database(DB_PATH, { readonly: true });
    const cutoffTime = Date.now() - days * 24 * 60 * 60 * 1000;
    
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

/**
 * Get Philippines stats from local database
 */
export function getPhilippinesStats(days: number = 7) {
  try {
    const db = new Database(DB_PATH, { readonly: true });
    const cutoffTime = Date.now() - days * 24 * 60 * 60 * 1000;
    
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
 * Get the last update time for PHIVOLCS data
 * Returns the timestamp of the most recent earthquake in the database
 */
export function getLastUpdateTime(): { lastUpdate: Date | null; phivolcsCount: number } {
  try {
    const db = new Database(DB_PATH, { readonly: true });
    
    // Get most recent PHIVOLCS entry and count
    const result = db.prepare(`
      SELECT 
        MAX(timestamp) as lastTimestamp,
        COUNT(*) as count
      FROM earthquakes 
      WHERE source = 'phivolcs'
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
