/**
 * Historical Earthquake Data Fetcher
 * 
 * Fetches historical earthquake data from USGS for the Philippines region.
 * USGS has data going back to 1900 with comprehensive coverage for M4+ events.
 * 
 * Run: npx ts-node scrapers/historical-fetcher.ts [startYear] [endYear]
 * Example: npx ts-node scrapers/historical-fetcher.ts 1900 2025
 */

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database path
const DB_PATH = path.join(__dirname, '../data/earthquakes.db');

// Philippines bounding box (expanded for offshore events)
const PH_BOUNDS = {
  minLat: 3,    // South of Mindanao
  maxLat: 22,   // North of Batanes
  minLon: 115,  // West of Palawan
  maxLon: 130,  // East to include Philippine Sea events
};

interface USGSEarthquake {
  id: string;
  properties: {
    mag: number;
    magType: string;
    place: string;
    time: number;
    url: string;
    felt: number | null;
    tsunami: number;
    type: string;
  };
  geometry: {
    coordinates: [number, number, number]; // lon, lat, depth
  };
}

interface FetchResult {
  year: number;
  total: number;
  new: number;
  errors: string[];
}

// Initialize database
function initDatabase(): Database.Database {
  const db = new Database(DB_PATH);
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS earthquakes (
      id TEXT PRIMARY KEY,
      source TEXT NOT NULL DEFAULT 'usgs',
      date_time TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      depth REAL NOT NULL,
      magnitude REAL NOT NULL,
      magnitude_type TEXT DEFAULT 'ml',
      location TEXT NOT NULL,
      region TEXT,
      url TEXT,
      felt INTEGER,
      tsunami INTEGER DEFAULT 0,
      scraped_at TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE INDEX IF NOT EXISTS idx_earthquakes_timestamp ON earthquakes(timestamp);
    CREATE INDEX IF NOT EXISTS idx_earthquakes_magnitude ON earthquakes(magnitude);
    CREATE INDEX IF NOT EXISTS idx_earthquakes_source ON earthquakes(source);
    CREATE INDEX IF NOT EXISTS idx_earthquakes_region ON earthquakes(region);
  `);
  
  return db;
}

// Categorize Philippine region by coordinates
function categorizeRegion(lat: number, lon: number): string {
  // Core Philippines bounds
  if (lat >= 12.0 && lat <= 21.5 && lon >= 119.0 && lon <= 127.0) return 'Luzon';
  if (lat >= 9.0 && lat < 12.5 && lon >= 122.0 && lon <= 127.0) return 'Visayas';
  if (lat >= 4.5 && lat < 10.0 && lon >= 118.0 && lon <= 127.0) return 'Mindanao';
  if (lon < 121.0 && lat >= 8.0 && lat < 12.5) return 'Palawan';
  
  // Offshore areas
  if (lon > 127) return 'Philippine Sea';
  if (lon < 118) return 'South China Sea';
  if (lat < 4.5) return 'Celebes Sea';
  if (lat > 21.5) return 'Luzon Strait';
  
  return 'Philippines';
}

// Fetch USGS data for a specific year
async function fetchUSGSYear(year: number, minMag: number = 2.5): Promise<USGSEarthquake[]> {
  const startTime = `${year}-01-01`;
  const endTime = `${year}-12-31`;
  
  const params = new URLSearchParams({
    format: 'geojson',
    starttime: startTime,
    endtime: endTime,
    minmagnitude: minMag.toString(),
    minlatitude: PH_BOUNDS.minLat.toString(),
    maxlatitude: PH_BOUNDS.maxLat.toString(),
    minlongitude: PH_BOUNDS.minLon.toString(),
    maxlongitude: PH_BOUNDS.maxLon.toString(),
    limit: '20000',
    orderby: 'time',
  });
  
  const url = `https://earthquake.usgs.gov/fdsnws/event/1/query?${params}`;
  
  console.log(`[USGS] Fetching year ${year} (M${minMag}+)...`);
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'LindolPH-Historical-Fetcher/1.0',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`[USGS] Year ${year}: ${data.features?.length || 0} earthquakes`);
    
    return data.features || [];
  } catch (error: any) {
    console.error(`[USGS] Error fetching year ${year}:`, error.message);
    return [];
  }
}

// Save earthquakes to database (one by one for reliability)
function saveToDatabase(db: Database.Database, earthquakes: USGSEarthquake[]): { newCount: number } {
  let newCount = 0;
  
  const insertStmt = db.prepare(`
    INSERT INTO earthquakes (
      id, source, date_time, timestamp, latitude, longitude, 
      depth, magnitude, magnitude_type, location, region, url,
      felt, tsunami, scraped_at
    ) VALUES (
      ?, 'usgs', ?, ?, ?, ?, 
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?
    )
    ON CONFLICT(id) DO NOTHING
  `);
  
  const scrapedAt = new Date().toISOString();
  
  for (const eq of earthquakes) {
    try {
      // Skip non-earthquake events
      if (eq.properties.type !== 'earthquake') continue;
      
      const lon = eq.geometry.coordinates[0];
      const lat = eq.geometry.coordinates[1];
      const depth = eq.geometry.coordinates[2] || 10;
      const timestamp = eq.properties.time;
      const dateTime = new Date(timestamp).toISOString();
      const region = categorizeRegion(lat, lon);
      
      const result = insertStmt.run(
        `usgs_${eq.id}`,
        dateTime,
        timestamp,
        lat,
        lon,
        depth,
        eq.properties.mag,
        eq.properties.magType || 'ml',
        eq.properties.place || 'Philippines Region',
        region,
        eq.properties.url || `https://earthquake.usgs.gov/earthquakes/eventpage/${eq.id}`,
        eq.properties.felt || null,
        eq.properties.tsunami || 0,
        scrapedAt
      );
      
      if (result.changes > 0) {
        newCount++;
      }
    } catch (e) {
      // Skip individual failed records
      continue;
    }
  }
  
  return { newCount };
}

// Main fetch function
async function fetchHistoricalData(startYear: number, endYear: number): Promise<void> {
  console.log('='.repeat(60));
  console.log(`[HISTORICAL FETCHER] Fetching ${startYear} - ${endYear}`);
  console.log('='.repeat(60));
  
  const db = initDatabase();
  console.log(`[DB] Database initialized at ${DB_PATH}`);
  
  let totalFetched = 0;
  let totalNew = 0;
  const results: FetchResult[] = [];
  
  // Determine minimum magnitude based on year
  // Older data only has larger earthquakes recorded
  // Recent years have comprehensive M1+ coverage
  function getMinMag(year: number): number {
    if (year < 1960) return 5.0;  // Pre-1960: only M5+
    if (year < 1980) return 4.5;  // 1960-1979: M4.5+
    if (year < 1990) return 4.0;  // 1980-1989: M4+
    if (year < 2000) return 3.0;  // 1990-1999: M3+
    if (year < 2010) return 2.5;  // 2000-2009: M2.5+
    if (year < 2020) return 2.0;  // 2010-2019: M2+
    return 1.0;                    // 2020+: M1+ (comprehensive coverage)
  }
  
  for (let year = startYear; year <= endYear; year++) {
    const minMag = getMinMag(year);
    
    try {
      const earthquakes = await fetchUSGSYear(year, minMag);
      const { newCount } = saveToDatabase(db, earthquakes);
      
      totalFetched += earthquakes.length;
      totalNew += newCount;
      
      results.push({
        year,
        total: earthquakes.length,
        new: newCount,
        errors: [],
      });
      
      console.log(`[DB] Year ${year}: ${newCount} new records saved`);
      
      // Rate limiting - USGS asks for max 1 request per second
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error: any) {
      results.push({
        year,
        total: 0,
        new: 0,
        errors: [error.message],
      });
    }
  }
  
  // Get final database stats
  const stats = db.prepare(`
    SELECT 
      COUNT(*) as total,
      MIN(date_time) as oldest,
      MAX(date_time) as newest,
      SUM(CASE WHEN source = 'usgs' THEN 1 ELSE 0 END) as usgs_count,
      SUM(CASE WHEN source = 'phivolcs' THEN 1 ELSE 0 END) as phivolcs_count
    FROM earthquakes
  `).get() as any;
  
  db.close();
  
  console.log('='.repeat(60));
  console.log('[HISTORICAL FETCHER] Complete');
  console.log(`  Years processed: ${endYear - startYear + 1}`);
  console.log(`  Total fetched: ${totalFetched}`);
  console.log(`  New records: ${totalNew}`);
  console.log('');
  console.log('[DATABASE STATS]');
  console.log(`  Total records: ${stats.total}`);
  console.log(`  USGS records: ${stats.usgs_count}`);
  console.log(`  PHIVOLCS records: ${stats.phivolcs_count}`);
  console.log(`  Oldest: ${stats.oldest}`);
  console.log(`  Newest: ${stats.newest}`);
  console.log('='.repeat(60));
}

// Run if called directly
const args = process.argv.slice(2);
const startYear = parseInt(args[0]) || 1900;
const endYear = parseInt(args[1]) || 2025;

fetchHistoricalData(startYear, endYear)
  .then(() => {
    process.exit(0);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
