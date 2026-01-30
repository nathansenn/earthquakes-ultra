import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

// Database path
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

// Region bounding boxes for filtering
const REGION_BOUNDS: Record<string, { minLat: number; maxLat: number; minLon: number; maxLon: number }> = {
  philippines: { minLat: 4.5, maxLat: 21.5, minLon: 116, maxLon: 127 },
  luzon: { minLat: 12.0, maxLat: 21.5, minLon: 119, maxLon: 127 },
  visayas: { minLat: 9.0, maxLat: 12.5, minLon: 122, maxLon: 127 },
  mindanao: { minLat: 4.5, maxLat: 10.0, minLon: 118, maxLon: 127 },
  palawan: { minLat: 8.0, maxLat: 12.5, minLon: 116, maxLon: 121 },
  japan: { minLat: 24, maxLat: 46, minLon: 122, maxLon: 154 },
  indonesia: { minLat: -11, maxLat: 6, minLon: 95, maxLon: 141 },
  newzealand: { minLat: -48, maxLat: -34, minLon: 165, maxLon: 179 },
  usa: { minLat: 24, maxLat: 50, minLon: -125, maxLon: -66 },
  europe: { minLat: 35, maxLat: 72, minLon: -25, maxLon: 45 },
};

// Main API handler - reads from local SQLite database
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  // Parse query parameters
  const hours = parseInt(searchParams.get('hours') || '0');
  const days = parseInt(searchParams.get('days') || '7');
  const years = parseInt(searchParams.get('years') || '0');
  const startDate = searchParams.get('start'); // YYYY-MM-DD format
  const endDate = searchParams.get('end'); // YYYY-MM-DD format
  const minMag = Math.max(parseFloat(searchParams.get('minmag') || '1'), 0);
  const maxMag = parseFloat(searchParams.get('maxmag') || '10');
  const limit = Math.min(parseInt(searchParams.get('limit') || '1000'), 20000);
  const offset = parseInt(searchParams.get('offset') || '0');
  const region = searchParams.get('region')?.toLowerCase();
  const source = searchParams.get('source')?.toLowerCase(); // usgs, phivolcs
  const format = searchParams.get('format') || 'json'; // json or geojson
  const includeStats = searchParams.get('stats') === 'true';
  
  try {
    const db = new Database(DB_PATH, { readonly: true });
    
    // Calculate time range
    let effectiveMs: number;
    if (hours > 0) {
      effectiveMs = hours * 60 * 60 * 1000;
    } else if (years > 0) {
      effectiveMs = years * 365 * 24 * 60 * 60 * 1000;
    } else {
      effectiveMs = days * 24 * 60 * 60 * 1000;
    }
    
    // Build query conditions
    const conditions: string[] = [];
    const params: any[] = [];
    
    // Time filter
    if (startDate && endDate) {
      conditions.push('date_time >= ? AND date_time <= ?');
      params.push(startDate, endDate + 'T23:59:59.999Z');
    } else {
      const cutoffTime = Date.now() - effectiveMs;
      conditions.push('timestamp >= ?');
      params.push(cutoffTime);
    }
    
    // Magnitude filter
    conditions.push('magnitude >= ? AND magnitude <= ?');
    params.push(minMag, maxMag);
    
    // Source filter
    if (source) {
      conditions.push('source = ?');
      params.push(source);
    }
    
    // Region filter (by bounding box or stored region)
    if (region) {
      const bounds = REGION_BOUNDS[region];
      if (bounds) {
        conditions.push('latitude >= ? AND latitude <= ? AND longitude >= ? AND longitude <= ?');
        params.push(bounds.minLat, bounds.maxLat, bounds.minLon, bounds.maxLon);
      } else {
        // Try matching stored region column
        conditions.push('LOWER(region) = ?');
        params.push(region);
      }
    }
    
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    
    // Get earthquakes
    const earthquakes = db.prepare(`
      SELECT * FROM earthquakes 
      ${whereClause}
      ORDER BY timestamp DESC
      LIMIT ? OFFSET ?
    `).all(...params, limit, offset) as DBEarthquake[];
    
    // Get total count
    const countResult = db.prepare(`
      SELECT COUNT(*) as total FROM earthquakes ${whereClause}
    `).get(...params) as { total: number };
    
    // Get stats if requested
    let stats: any = null;
    if (includeStats) {
      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
      const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      
      stats = db.prepare(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN timestamp > ? THEN 1 ELSE 0 END) as last_24h,
          SUM(CASE WHEN timestamp > ? THEN 1 ELSE 0 END) as last_7d,
          SUM(CASE WHEN magnitude >= 2 THEN 1 ELSE 0 END) as m2_plus,
          SUM(CASE WHEN magnitude >= 3 THEN 1 ELSE 0 END) as m3_plus,
          SUM(CASE WHEN magnitude >= 4 THEN 1 ELSE 0 END) as m4_plus,
          SUM(CASE WHEN magnitude >= 5 THEN 1 ELSE 0 END) as m5_plus,
          SUM(CASE WHEN magnitude >= 6 THEN 1 ELSE 0 END) as m6_plus,
          AVG(magnitude) as avg_magnitude,
          MAX(magnitude) as max_magnitude,
          MIN(date_time) as oldest,
          MAX(date_time) as newest
        FROM earthquakes ${whereClause}
      `).get(oneDayAgo, oneWeekAgo, ...params);
      
      // Get by source breakdown
      const sourceStats = db.prepare(`
        SELECT source, COUNT(*) as count, AVG(magnitude) as avg_mag, MAX(magnitude) as max_mag
        FROM earthquakes ${whereClause}
        GROUP BY source
      `).all(...params);
      
      // Get by region breakdown (for Philippines)
      const regionStats = db.prepare(`
        SELECT region, COUNT(*) as count, AVG(magnitude) as avg_mag
        FROM earthquakes ${whereClause}
        GROUP BY region
        ORDER BY count DESC
        LIMIT 10
      `).all(...params);
      
      stats = { ...stats, bySource: sourceStats, byRegion: regionStats };
    }
    
    // Get last scrape info
    let lastScrape = null;
    try {
      lastScrape = db.prepare(`
        SELECT source, completed_at, earthquakes_found, earthquakes_new 
        FROM scrape_log 
        ORDER BY id DESC LIMIT 1
      `).get();
    } catch (e) {
      // scrape_log table might not exist
    }
    
    db.close();
    
    // Format response
    const generated = new Date().toISOString();
    
    if (format === 'geojson') {
      return NextResponse.json({
        type: 'FeatureCollection',
        metadata: {
          generated,
          count: earthquakes.length,
          totalCount: countResult.total,
          source: 'lindol-db',
          lastScrape: lastScrape,
          ...(stats && { stats })
        },
        features: earthquakes.map(eq => ({
          type: 'Feature',
          id: eq.id,
          properties: {
            mag: eq.magnitude,
            magType: eq.magnitude_type,
            place: eq.location,
            time: eq.timestamp,
            region: eq.region,
            depth: eq.depth,
            source: eq.source,
            felt: eq.felt,
            tsunami: eq.tsunami === 1,
            url: eq.url,
          },
          geometry: {
            type: 'Point',
            coordinates: [eq.longitude, eq.latitude, eq.depth],
          },
        })),
      }, {
        headers: {
          'Cache-Control': 'public, max-age=60',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    
    // JSON format
    return NextResponse.json({
      success: true,
      generated,
      count: earthquakes.length,
      totalCount: countResult.total,
      source: 'lindol-db',
      lastScrape,
      ...(stats && { stats }),
      earthquakes: earthquakes.map(eq => ({
        id: eq.id,
        source: eq.source,
        magnitude: eq.magnitude,
        magnitudeType: eq.magnitude_type,
        place: eq.location,
        time: eq.date_time,
        timestamp: eq.timestamp,
        latitude: eq.latitude,
        longitude: eq.longitude,
        depth: eq.depth,
        region: eq.region,
        url: eq.url,
        felt: eq.felt,
        tsunami: eq.tsunami === 1,
      })),
    }, {
      headers: {
        'Cache-Control': 'public, max-age=60',
        'Access-Control-Allow-Origin': '*',
      },
    });
    
  } catch (error: any) {
    console.error('Earthquake API error:', error);
    
    // Database might not exist
    if (error.code === 'SQLITE_CANTOPEN') {
      return NextResponse.json({
        success: false,
        error: 'Earthquake database not initialized',
        hint: 'Run the scrapers first: ./scrapers/run-phivolcs.sh',
      }, { status: 503 });
    }
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error',
    }, { status: 500 });
  }
}
