/**
 * PHIVOLCS Earthquake Scraper
 * 
 * Scrapes earthquake data from https://earthquake.phivolcs.dost.gov.ph/
 * Uses Puppeteer for browser automation to bypass anti-scraping measures.
 * 
 * Run: npx ts-node scrapers/phivolcs-scraper.ts
 * Or via cron: node scrapers/dist/phivolcs-scraper.js
 */

import puppeteer, { Browser, Page } from 'puppeteer';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Types
interface PHIVOLCSEarthquake {
  id: string;
  dateTime: string;
  latitude: number;
  longitude: number;
  depth: number;
  magnitude: number;
  location: string;
  scrapedAt: string;
}

interface ScrapeResult {
  success: boolean;
  earthquakesFound: number;
  earthquakesNew: number;
  earthquakesUpdated: number;
  errors: string[];
  duration: number;
}

// Database setup
const DB_PATH = path.join(__dirname, '../data/earthquakes.db');

function initDatabase(): Database.Database {
  const db = new Database(DB_PATH);
  
  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS earthquakes (
      id TEXT PRIMARY KEY,
      source TEXT NOT NULL DEFAULT 'phivolcs',
      date_time TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      depth REAL NOT NULL,
      magnitude REAL NOT NULL,
      magnitude_type TEXT DEFAULT 'Ms',
      location TEXT NOT NULL,
      region TEXT,
      url TEXT,
      scraped_at TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE INDEX IF NOT EXISTS idx_earthquakes_timestamp ON earthquakes(timestamp);
    CREATE INDEX IF NOT EXISTS idx_earthquakes_magnitude ON earthquakes(magnitude);
    CREATE INDEX IF NOT EXISTS idx_earthquakes_source ON earthquakes(source);
    CREATE INDEX IF NOT EXISTS idx_earthquakes_region ON earthquakes(region);
    
    CREATE TABLE IF NOT EXISTS scrape_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source TEXT NOT NULL,
      started_at TEXT NOT NULL,
      completed_at TEXT,
      success INTEGER DEFAULT 0,
      earthquakes_found INTEGER DEFAULT 0,
      earthquakes_new INTEGER DEFAULT 0,
      earthquakes_updated INTEGER DEFAULT 0,
      error_message TEXT,
      duration_ms INTEGER
    );
  `);
  
  return db;
}

// Categorize Philippine region by coordinates
function categorizeRegion(lat: number, lon: number): string {
  if (lat >= 12.0 && lon >= 119.0) return 'Luzon';
  if (lat >= 9.0 && lat < 12.5 && lon >= 122.0) return 'Visayas';
  if (lat < 10.0 && lon >= 118.0) return 'Mindanao';
  if (lon < 121.0 && lat >= 8.0 && lat < 12.5) return 'Palawan';
  return 'Philippines';
}

// Parse PHIVOLCS datetime format
// Format: "30 January 2026 - 04:47 PM" 
function parseDateTime(str: string): { dateTime: string; timestamp: number } | null {
  const match = str.match(/(\d{1,2})\s+(\w+)\s+(\d{4})\s*-\s*(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (!match) return null;
  
  const months: Record<string, number> = {
    january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
    july: 6, august: 7, september: 8, october: 9, november: 10, december: 11
  };
  
  const day = parseInt(match[1]);
  const month = months[match[2].toLowerCase()];
  const year = parseInt(match[3]);
  let hour = parseInt(match[4]);
  const minute = parseInt(match[5]);
  const ampm = (match[6] || '').toUpperCase();
  
  if (month === undefined) return null;
  
  // Convert 12-hour to 24-hour format
  if (ampm === 'PM' && hour !== 12) hour += 12;
  else if (ampm === 'AM' && hour === 12) hour = 0;
  
  // PHIVOLCS uses Philippine Time (UTC+8)
  const date = new Date(Date.UTC(year, month, day, hour - 8, minute, 0));
  
  return {
    dateTime: date.toISOString(),
    timestamp: date.getTime()
  };
}

// Generate unique ID for earthquake
function generateId(timestamp: number, magnitude: number, lat: number, lon: number): string {
  return `phivolcs_${timestamp}_${magnitude.toFixed(1)}_${lat.toFixed(2)}_${lon.toFixed(2)}`;
}

// Scrape PHIVOLCS website
async function scrapePHIVOLCS(): Promise<PHIVOLCSEarthquake[]> {
  const earthquakes: PHIVOLCSEarthquake[] = [];
  let browser: Browser | null = null;
  
  try {
    console.log('[PHIVOLCS] Launching browser...');
    browser = await puppeteer.launch({
      headless: true,
      executablePath: '/usr/bin/chromium-browser', // Use system Chromium
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--window-size=1920,1080'
      ]
    });
    
    const page: Page = await browser.newPage();
    
    // Set viewport and user agent
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Navigate to PHIVOLCS earthquake page
    console.log('[PHIVOLCS] Navigating to earthquake.phivolcs.dost.gov.ph...');
    await page.goto('https://earthquake.phivolcs.dost.gov.ph/', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    // Wait for table to load
    await page.waitForSelector('table', { timeout: 10000 });
    
    console.log('[PHIVOLCS] Page loaded, extracting data...');
    
    // Extract earthquake data from tables
    const data = await page.evaluate(() => {
      const results: Array<{
        dateTime: string;
        latitude: string;
        longitude: string;
        depth: string;
        magnitude: string;
        location: string;
      }> = [];
      
      // Find all tables
      const tables = document.querySelectorAll('table');
      
      for (const table of tables) {
        const rows = table.querySelectorAll('tr');
        
        for (const row of rows) {
          // Skip header rows
          if (row.querySelector('th')) continue;
          
          const cells = row.querySelectorAll('td');
          if (cells.length !== 6) continue;
          
          // Check if this looks like earthquake data
          const dateTimeText = cells[0]?.textContent?.trim() || '';
          if (!dateTimeText.includes('-') || !dateTimeText.match(/\d{4}/)) continue;
          
          results.push({
            dateTime: dateTimeText,
            latitude: cells[1]?.textContent?.trim() || '',
            longitude: cells[2]?.textContent?.trim() || '',
            depth: cells[3]?.textContent?.trim() || '',
            magnitude: cells[4]?.textContent?.trim() || '',
            location: cells[5]?.textContent?.trim() || ''
          });
        }
      }
      
      return results;
    });
    
    console.log(`[PHIVOLCS] Found ${data.length} raw records`);
    
    const scrapedAt = new Date().toISOString();
    
    // Parse and validate each record
    for (const record of data) {
      try {
        const latitude = parseFloat(record.latitude);
        const longitude = parseFloat(record.longitude);
        const depth = parseFloat(record.depth) || 10;
        const magnitude = parseFloat(record.magnitude);
        
        // Validate coordinates (Philippines bounds)
        if (isNaN(latitude) || latitude < 4 || latitude > 22) continue;
        if (isNaN(longitude) || longitude < 116 || longitude > 128) continue;
        if (isNaN(magnitude) || magnitude < 0.5 || magnitude > 10) continue;
        
        const parsed = parseDateTime(record.dateTime);
        if (!parsed) continue;
        
        const id = generateId(parsed.timestamp, magnitude, latitude, longitude);
        
        earthquakes.push({
          id,
          dateTime: parsed.dateTime,
          latitude,
          longitude,
          depth,
          magnitude,
          location: record.location,
          scrapedAt
        });
      } catch (e) {
        // Skip invalid records
        continue;
      }
    }
    
    console.log(`[PHIVOLCS] Parsed ${earthquakes.length} valid earthquakes`);
    
  } catch (error) {
    console.error('[PHIVOLCS] Scrape error:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
  
  return earthquakes;
}

// Save earthquakes to database
function saveToDatabase(db: Database.Database, earthquakes: PHIVOLCSEarthquake[]): { newCount: number; updatedCount: number } {
  let newCount = 0;
  let updatedCount = 0;
  
  const insertStmt = db.prepare(`
    INSERT INTO earthquakes (
      id, source, date_time, timestamp, latitude, longitude, 
      depth, magnitude, magnitude_type, location, region, url, scraped_at
    ) VALUES (
      ?, 'phivolcs', ?, ?, ?, ?, 
      ?, ?, 'Ms', ?, ?, 'https://earthquake.phivolcs.dost.gov.ph/', ?
    )
    ON CONFLICT(id) DO UPDATE SET
      depth = excluded.depth,
      magnitude = excluded.magnitude,
      location = excluded.location,
      scraped_at = excluded.scraped_at,
      updated_at = CURRENT_TIMESTAMP
  `);
  
  const checkStmt = db.prepare('SELECT id FROM earthquakes WHERE id = ?');
  
  const transaction = db.transaction((quakes: PHIVOLCSEarthquake[]) => {
    for (const eq of quakes) {
      const existing = checkStmt.get(eq.id);
      const timestamp = new Date(eq.dateTime).getTime();
      const region = categorizeRegion(eq.latitude, eq.longitude);
      
      insertStmt.run(
        eq.id,
        eq.dateTime,
        timestamp,
        eq.latitude,
        eq.longitude,
        eq.depth,
        eq.magnitude,
        eq.location,
        region,
        eq.scrapedAt
      );
      
      if (existing) {
        updatedCount++;
      } else {
        newCount++;
      }
    }
  });
  
  transaction(earthquakes);
  
  return { newCount, updatedCount };
}

// Log scrape result
function logScrape(db: Database.Database, result: ScrapeResult): void {
  const stmt = db.prepare(`
    INSERT INTO scrape_log (
      source, started_at, completed_at, success, 
      earthquakes_found, earthquakes_new, earthquakes_updated,
      error_message, duration_ms
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(
    'phivolcs',
    new Date(Date.now() - result.duration).toISOString(),
    new Date().toISOString(),
    result.success ? 1 : 0,
    result.earthquakesFound,
    result.earthquakesNew,
    result.earthquakesUpdated,
    result.errors.length > 0 ? result.errors.join('; ') : null,
    result.duration
  );
}

// Main scraper function
async function runScraper(): Promise<ScrapeResult> {
  const startTime = Date.now();
  const result: ScrapeResult = {
    success: false,
    earthquakesFound: 0,
    earthquakesNew: 0,
    earthquakesUpdated: 0,
    errors: [],
    duration: 0
  };
  
  console.log('='.repeat(60));
  console.log('[PHIVOLCS SCRAPER] Starting at', new Date().toISOString());
  console.log('='.repeat(60));
  
  try {
    // Initialize database
    const db = initDatabase();
    console.log('[DB] Database initialized at', DB_PATH);
    
    // Run scraper
    const earthquakes = await scrapePHIVOLCS();
    result.earthquakesFound = earthquakes.length;
    
    if (earthquakes.length > 0) {
      // Save to database
      const { newCount, updatedCount } = saveToDatabase(db, earthquakes);
      result.earthquakesNew = newCount;
      result.earthquakesUpdated = updatedCount;
      console.log(`[DB] Saved: ${newCount} new, ${updatedCount} updated`);
    }
    
    result.success = true;
    
    // Log scrape result
    result.duration = Date.now() - startTime;
    logScrape(db, result);
    
    db.close();
    
  } catch (error: any) {
    result.errors.push(error.message || String(error));
    console.error('[ERROR]', error);
    
    // Try to log even on failure
    try {
      const db = initDatabase();
      result.duration = Date.now() - startTime;
      logScrape(db, result);
      db.close();
    } catch {}
  }
  
  result.duration = Date.now() - startTime;
  
  console.log('='.repeat(60));
  console.log('[PHIVOLCS SCRAPER] Completed');
  console.log(`  Success: ${result.success}`);
  console.log(`  Found: ${result.earthquakesFound}`);
  console.log(`  New: ${result.earthquakesNew}`);
  console.log(`  Updated: ${result.earthquakesUpdated}`);
  console.log(`  Duration: ${result.duration}ms`);
  if (result.errors.length > 0) {
    console.log(`  Errors: ${result.errors.join(', ')}`);
  }
  console.log('='.repeat(60));
  
  return result;
}

// Export for API use
export { initDatabase, runScraper };
export type { PHIVOLCSEarthquake, ScrapeResult };

// Run if called directly (ESM style)
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule || process.argv[1]?.includes('phivolcs-scraper')) {
  runScraper()
    .then(result => {
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}
