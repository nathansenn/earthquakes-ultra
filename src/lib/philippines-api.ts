// Philippines-Specific Earthquake Data API
// Aggregates data from multiple sources for comprehensive M1+ coverage

import { UnifiedEarthquake } from './multi-source-api';

// Philippine geographic bounds
export const PHILIPPINES_BOUNDS = {
  minLat: 4.5,
  maxLat: 21.5,
  minLon: 116.0,
  maxLon: 127.0,
};

// Philippine regions with bounds for regional queries
export const PHILIPPINE_REGIONS: Record<string, { name: string; bounds: typeof PHILIPPINES_BOUNDS }> = {
  luzon: {
    name: 'Luzon',
    bounds: { minLat: 12.0, maxLat: 21.5, minLon: 119.0, maxLon: 127.0 }
  },
  visayas: {
    name: 'Visayas',
    bounds: { minLat: 9.0, maxLat: 12.5, minLon: 122.0, maxLon: 127.0 }
  },
  mindanao: {
    name: 'Mindanao',
    bounds: { minLat: 4.5, maxLat: 10.0, minLon: 118.0, maxLon: 127.0 }
  },
  palawan: {
    name: 'Palawan',
    bounds: { minLat: 8.0, maxLat: 12.5, minLon: 116.0, maxLon: 121.0 }
  }
};

// Fetch from EMSC (best coverage for Philippines M1+)
async function fetchEMSCPhilippines(
  days: number = 7,
  minMag: number = 1.0,
  limit: number = 1000
): Promise<UnifiedEarthquake[]> {
  const startTime = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const { minLat, maxLat, minLon, maxLon } = PHILIPPINES_BOUNDS;
  
  const url = `https://www.seismicportal.eu/fdsnws/event/1/query?format=json&minmagnitude=${minMag}&minlatitude=${minLat}&maxlatitude=${maxLat}&minlongitude=${minLon}&maxlongitude=${maxLon}&starttime=${startTime}&limit=${limit}&orderby=time`;
  
  try {
    const response = await fetch(url, { next: { revalidate: 60 } });
    if (!response.ok) return [];
    
    const data = await response.json();
    return (data.features || []).map((f: any) => ({
      id: `emsc_ph_${f.properties.source_id || f.id}`,
      source: 'emsc' as const,
      magnitude: f.properties.mag,
      magnitudeType: f.properties.magtype || 'ml',
      place: f.properties.flynn_region || 'Philippines',
      time: new Date(f.properties.time),
      latitude: f.geometry.coordinates[1],
      longitude: f.geometry.coordinates[0],
      depth: f.geometry.coordinates[2] || 10,
      url: f.properties.unid 
        ? `https://www.emsc-csem.org/Earthquake/earthquake.php?id=${f.properties.unid}` 
        : '#',
      region: categorizePhilippineRegion(f.geometry.coordinates[1], f.geometry.coordinates[0]),
    }));
  } catch (error) {
    console.error('EMSC Philippines fetch error:', error);
    return [];
  }
}

// Fetch from USGS (for larger earthquakes M4+)
async function fetchUSGSPhilippines(
  days: number = 7,
  minMag: number = 1.0,
  limit: number = 500
): Promise<UnifiedEarthquake[]> {
  const startTime = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const { minLat, maxLat, minLon, maxLon } = PHILIPPINES_BOUNDS;
  
  const url = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&minmagnitude=${minMag}&minlatitude=${minLat}&maxlatitude=${maxLat}&minlongitude=${minLon}&maxlongitude=${maxLon}&starttime=${startTime}&limit=${limit}&orderby=time`;
  
  try {
    const response = await fetch(url, { next: { revalidate: 60 } });
    if (!response.ok) return [];
    
    const data = await response.json();
    return data.features.map((f: any) => ({
      id: `usgs_ph_${f.id}`,
      source: 'usgs' as const,
      magnitude: f.properties.mag,
      magnitudeType: f.properties.magType || 'ml',
      place: f.properties.place || 'Philippines',
      time: new Date(f.properties.time),
      latitude: f.geometry.coordinates[1],
      longitude: f.geometry.coordinates[0],
      depth: f.geometry.coordinates[2],
      url: f.properties.url || `https://earthquake.usgs.gov/earthquakes/eventpage/${f.id}`,
      felt: f.properties.felt,
      tsunami: f.properties.tsunami === 1,
      region: categorizePhilippineRegion(f.geometry.coordinates[1], f.geometry.coordinates[0]),
    }));
  } catch (error) {
    console.error('USGS Philippines fetch error:', error);
    return [];
  }
}

// PHIVOLCS Scraper (when site is available)
// Site structure: https://earthquake.phivolcs.dost.gov.ph/EQLatest.html
// Monthly archives: https://earthquake.phivolcs.dost.gov.ph/EQLatest-Monthly/YYYY/YYYY_Month.html
async function fetchPHIVOLCS(days: number = 7): Promise<UnifiedEarthquake[]> {
  const earthquakes: UnifiedEarthquake[] = [];
  
  // Try latest earthquakes page
  try {
    const response = await fetch('https://earthquake.phivolcs.dost.gov.ph/EQLatest.html', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; QuakeGlobe/1.0; +https://quakeglobe.com)',
      },
      next: { revalidate: 300 } // 5 min cache
    });
    
    if (!response.ok) {
      console.log('PHIVOLCS not available, using backup sources');
      return [];
    }
    
    const html = await response.text();
    const parsed = parsePHIVOLCSHtml(html);
    earthquakes.push(...parsed);
  } catch (error) {
    console.error('PHIVOLCS fetch error:', error);
    return [];
  }
  
  return earthquakes;
}

// Parse PHIVOLCS HTML table format
// Expected format: Date-Time | Latitude | Longitude | Depth | Magnitude | Location
function parsePHIVOLCSHtml(html: string): UnifiedEarthquake[] {
  const earthquakes: UnifiedEarthquake[] = [];
  
  // Extract table rows using regex (PHIVOLCS uses simple HTML tables)
  const tableMatch = html.match(/<table[^>]*>([\s\S]*?)<\/table>/i);
  if (!tableMatch) return [];
  
  const rowMatches = tableMatch[1].matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi);
  
  for (const rowMatch of rowMatches) {
    const cells = rowMatch[1].match(/<td[^>]*>([\s\S]*?)<\/td>/gi);
    if (!cells || cells.length < 6) continue;
    
    // Extract cell contents
    const extractContent = (cell: string) => cell.replace(/<[^>]+>/g, '').trim();
    
    try {
      const dateTimeStr = extractContent(cells[0]);
      const latitude = parseFloat(extractContent(cells[1]));
      const longitude = parseFloat(extractContent(cells[2]));
      const depth = parseFloat(extractContent(cells[3]));
      const magnitude = parseFloat(extractContent(cells[4]));
      const location = extractContent(cells[5]);
      
      if (isNaN(magnitude) || isNaN(latitude) || isNaN(longitude)) continue;
      
      // Parse Philippine datetime format (DD Month YYYY - HH:MM:SS)
      const time = parsePHIVOLCSDateTime(dateTimeStr);
      if (!time) continue;
      
      earthquakes.push({
        id: `phivolcs_${time.getTime()}_${magnitude}`,
        source: 'phivolcs' as any,
        magnitude,
        magnitudeType: 'Ms', // PHIVOLCS typically uses surface wave magnitude
        place: location,
        time,
        latitude,
        longitude,
        depth,
        url: 'https://earthquake.phivolcs.dost.gov.ph/',
        region: categorizePhilippineRegion(latitude, longitude),
      });
    } catch (e) {
      continue;
    }
  }
  
  return earthquakes;
}

// Parse PHIVOLCS datetime format
function parsePHIVOLCSDateTime(str: string): Date | null {
  // Format: "30 January 2026 - 14:30:00" or similar
  const match = str.match(/(\d{1,2})\s+(\w+)\s+(\d{4})\s*-?\s*(\d{2}):(\d{2}):?(\d{2})?/);
  if (!match) return null;
  
  const months: Record<string, number> = {
    january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
    july: 6, august: 7, september: 8, october: 9, november: 10, december: 11
  };
  
  const day = parseInt(match[1]);
  const month = months[match[2].toLowerCase()];
  const year = parseInt(match[3]);
  const hour = parseInt(match[4]);
  const minute = parseInt(match[5]);
  const second = parseInt(match[6] || '0');
  
  if (month === undefined) return null;
  
  // PHIVOLCS uses Philippine Time (UTC+8)
  const date = new Date(Date.UTC(year, month, day, hour - 8, minute, second));
  return date;
}

// Categorize earthquake by Philippine region
function categorizePhilippineRegion(lat: number, lon: number): string {
  if (lat >= 12.0 && lon >= 119.0) return 'Luzon';
  if (lat >= 9.0 && lat < 12.5 && lon >= 122.0) return 'Visayas';
  if (lat < 10.0 && lon >= 118.0) return 'Mindanao';
  if (lon < 121.0 && lat >= 8.0 && lat < 12.5) return 'Palawan';
  return 'Philippines';
}

// Deduplicate earthquakes from multiple sources
function deduplicatePhilippines(earthquakes: UnifiedEarthquake[]): UnifiedEarthquake[] {
  const sorted = [...earthquakes].sort((a, b) => b.time.getTime() - a.time.getTime());
  const unique: UnifiedEarthquake[] = [];
  
  for (const eq of sorted) {
    const isDuplicate = unique.some(existing => {
      const timeDiff = Math.abs(existing.time.getTime() - eq.time.getTime());
      const magDiff = Math.abs(existing.magnitude - eq.magnitude);
      const distance = haversineDistance(
        existing.latitude, existing.longitude,
        eq.latitude, eq.longitude
      );
      
      // Consider duplicate if within 50km, 2 min, and similar magnitude
      // Tighter threshold for regional data
      return timeDiff < 120000 && distance < 50 && magDiff < 0.3;
    });
    
    if (!isDuplicate) {
      unique.push(eq);
    }
  }
  
  return unique;
}

// Haversine distance in km
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

// Main function: Fetch all Philippines earthquakes from all sources
export async function fetchAllPhilippinesEarthquakes(
  days: number = 7,
  minMagnitude: number = 1.0
): Promise<UnifiedEarthquake[]> {
  // Fetch from all sources in parallel
  const [emscData, usgsData, phivolcsData] = await Promise.all([
    fetchEMSCPhilippines(days, minMagnitude, 1000),
    fetchUSGSPhilippines(days, minMagnitude, 500),
    fetchPHIVOLCS(days).catch(() => []), // Don't fail if PHIVOLCS is down
  ]);
  
  console.log(`Philippines data: EMSC=${emscData.length}, USGS=${usgsData.length}, PHIVOLCS=${phivolcsData.length}`);
  
  // Combine and deduplicate
  const combined = [...emscData, ...usgsData, ...phivolcsData];
  const deduplicated = deduplicatePhilippines(combined);
  
  console.log(`Philippines combined: ${combined.length}, After dedup: ${deduplicated.length}`);
  
  // Sort by time (newest first)
  return deduplicated.sort((a, b) => b.time.getTime() - a.time.getTime());
}

// Fetch for specific Philippine region
export async function fetchPhilippineRegionEarthquakes(
  region: keyof typeof PHILIPPINE_REGIONS,
  days: number = 7,
  minMagnitude: number = 1.0
): Promise<UnifiedEarthquake[]> {
  const all = await fetchAllPhilippinesEarthquakes(days, minMagnitude);
  const regionBounds = PHILIPPINE_REGIONS[region]?.bounds;
  
  if (!regionBounds) return all;
  
  return all.filter(eq => 
    eq.latitude >= regionBounds.minLat &&
    eq.latitude <= regionBounds.maxLat &&
    eq.longitude >= regionBounds.minLon &&
    eq.longitude <= regionBounds.maxLon
  );
}

// Get statistics for Philippines
export interface PhilippinesStats {
  total: number;
  last24h: number;
  byRegion: Record<string, number>;
  byMagnitude: {
    m1Plus: number;
    m2Plus: number;
    m3Plus: number;
    m4Plus: number;
    m5Plus: number;
  };
  largest: UnifiedEarthquake | null;
  bySource: {
    emsc: number;
    usgs: number;
    phivolcs: number;
  };
}

export function calculatePhilippinesStats(earthquakes: UnifiedEarthquake[]): PhilippinesStats {
  const now = Date.now();
  const oneDayAgo = now - 24 * 60 * 60 * 1000;
  
  const last24h = earthquakes.filter(eq => eq.time.getTime() > oneDayAgo);
  
  const byRegion: Record<string, number> = {
    Luzon: 0,
    Visayas: 0,
    Mindanao: 0,
    Palawan: 0,
    Philippines: 0,
  };
  
  earthquakes.forEach(eq => {
    const region = eq.region || 'Philippines';
    byRegion[region] = (byRegion[region] || 0) + 1;
  });
  
  return {
    total: earthquakes.length,
    last24h: last24h.length,
    byRegion,
    byMagnitude: {
      m1Plus: earthquakes.filter(eq => eq.magnitude >= 1).length,
      m2Plus: earthquakes.filter(eq => eq.magnitude >= 2).length,
      m3Plus: earthquakes.filter(eq => eq.magnitude >= 3).length,
      m4Plus: earthquakes.filter(eq => eq.magnitude >= 4).length,
      m5Plus: earthquakes.filter(eq => eq.magnitude >= 5).length,
    },
    largest: earthquakes.length > 0
      ? earthquakes.reduce((max, eq) => eq.magnitude > max.magnitude ? eq : max)
      : null,
    bySource: {
      emsc: earthquakes.filter(eq => eq.source === 'emsc').length,
      usgs: earthquakes.filter(eq => eq.source === 'usgs').length,
      phivolcs: earthquakes.filter(eq => (eq.source as string) === 'phivolcs').length,
    },
  };
}
