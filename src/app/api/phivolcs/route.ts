import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

// Database path
const DB_PATH = path.join(process.cwd(), 'data/earthquakes.db');

interface Earthquake {
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
  region: string;
  url: string;
  scraped_at: string;
}

interface ScrapeLog {
  id: number;
  source: string;
  started_at: string;
  completed_at: string;
  success: number;
  earthquakes_found: number;
  earthquakes_new: number;
  earthquakes_updated: number;
  error_message: string | null;
  duration_ms: number;
}

// GET /api/phivolcs - Query PHIVOLCS data from database
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  // Parse parameters
  const days = parseInt(searchParams.get('days') || '7');
  const minMag = parseFloat(searchParams.get('minmag') || '1');
  const maxMag = parseFloat(searchParams.get('maxmag') || '10');
  const region = searchParams.get('region'); // luzon, visayas, mindanao, palawan
  const limit = Math.min(parseInt(searchParams.get('limit') || '1000'), 10000);
  const offset = parseInt(searchParams.get('offset') || '0');
  const format = searchParams.get('format') || 'json'; // json or geojson
  const includeStats = searchParams.get('stats') === 'true';
  
  try {
    const db = new Database(DB_PATH, { readonly: true });
    
    // Build query
    const cutoffTime = Date.now() - days * 24 * 60 * 60 * 1000;
    let whereClause = 'source = ? AND timestamp >= ? AND magnitude >= ? AND magnitude <= ?';
    const params: any[] = ['phivolcs', cutoffTime, minMag, maxMag];
    
    if (region) {
      whereClause += ' AND LOWER(region) = ?';
      params.push(region.toLowerCase());
    }
    
    // Get earthquakes
    const earthquakes = db.prepare(`
      SELECT * FROM earthquakes 
      WHERE ${whereClause}
      ORDER BY timestamp DESC
      LIMIT ? OFFSET ?
    `).all(...params, limit, offset) as Earthquake[];
    
    // Get total count
    const countResult = db.prepare(`
      SELECT COUNT(*) as total FROM earthquakes 
      WHERE ${whereClause}
    `).get(...params) as { total: number };
    
    // Get stats if requested
    let stats: Record<string, any> | null = null;
    if (includeStats) {
      const statsQuery = db.prepare(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN timestamp > ? THEN 1 ELSE 0 END) as last_24h,
          SUM(CASE WHEN magnitude >= 2 THEN 1 ELSE 0 END) as m2_plus,
          SUM(CASE WHEN magnitude >= 3 THEN 1 ELSE 0 END) as m3_plus,
          SUM(CASE WHEN magnitude >= 4 THEN 1 ELSE 0 END) as m4_plus,
          SUM(CASE WHEN magnitude >= 5 THEN 1 ELSE 0 END) as m5_plus,
          AVG(magnitude) as avg_magnitude,
          MAX(magnitude) as max_magnitude,
          MIN(magnitude) as min_magnitude,
          AVG(depth) as avg_depth
        FROM earthquakes 
        WHERE ${whereClause}
      `);
      
      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
      const rawStats = statsQuery.get(...params.slice(0, -1), oneDayAgo, ...params.slice(-1)) as Record<string, any>;
      
      // Get by region breakdown
      const regionStats = db.prepare(`
        SELECT region, COUNT(*) as count, AVG(magnitude) as avg_mag
        FROM earthquakes 
        WHERE ${whereClause}
        GROUP BY region
      `).all(...params);
      
      stats = { ...rawStats, byRegion: regionStats };
    }
    
    // Get last scrape info
    const lastScrape = db.prepare(`
      SELECT * FROM scrape_log 
      WHERE source = 'phivolcs' 
      ORDER BY id DESC LIMIT 1
    `).get() as ScrapeLog | undefined;
    
    db.close();
    
    // Format response
    if (format === 'geojson') {
      return NextResponse.json({
        type: 'FeatureCollection',
        metadata: {
          generated: new Date().toISOString(),
          count: earthquakes.length,
          totalCount: countResult.total,
          source: 'phivolcs',
          lastScrape: lastScrape?.completed_at,
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
    
    return NextResponse.json({
      success: true,
      generated: new Date().toISOString(),
      source: 'phivolcs',
      count: earthquakes.length,
      totalCount: countResult.total,
      lastScrape: lastScrape ? {
        completedAt: lastScrape.completed_at,
        success: lastScrape.success === 1,
        earthquakesFound: lastScrape.earthquakes_found,
        durationMs: lastScrape.duration_ms,
      } : null,
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
      })),
    }, {
      headers: {
        'Cache-Control': 'public, max-age=60',
        'Access-Control-Allow-Origin': '*',
      },
    });
    
  } catch (error: any) {
    // Database might not exist yet
    if (error.code === 'SQLITE_CANTOPEN') {
      return NextResponse.json({
        success: false,
        error: 'PHIVOLCS database not initialized. Run the scraper first.',
        hint: 'npx ts-node scrapers/phivolcs-scraper.ts',
      }, { status: 503 });
    }
    
    console.error('PHIVOLCS API error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error',
    }, { status: 500 });
  }
}

// POST /api/phivolcs/scrape - Trigger a scrape (protected)
export async function POST(request: NextRequest) {
  // Check for API key (simple protection)
  const apiKey = request.headers.get('x-api-key');
  const expectedKey = process.env.SCRAPER_API_KEY;
  
  if (expectedKey && apiKey !== expectedKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    // Dynamic import the scraper
    const { runScraper } = await import('../../../../scrapers/phivolcs-scraper');
    
    const result = await runScraper();
    
    return NextResponse.json({
      ...result,
      message: result.success ? 'Scrape completed successfully' : 'Scrape failed',
    });
    
  } catch (error: any) {
    console.error('Scrape trigger error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to run scraper',
    }, { status: 500 });
  }
}
