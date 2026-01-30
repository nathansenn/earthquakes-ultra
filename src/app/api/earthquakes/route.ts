import { NextRequest, NextResponse } from 'next/server';

// Unified Earthquake type
interface UnifiedEarthquake {
  id: string;
  source: string;
  magnitude: number;
  magnitudeType: string;
  place: string;
  time: string;
  timestamp: number;
  latitude: number;
  longitude: number;
  depth: number;
  url: string;
  felt?: number | null;
  tsunami?: boolean;
  region?: string;
}

// In-memory cache
interface CacheEntry {
  data: UnifiedEarthquake[];
  timestamp: number;
  stats: {
    total: number;
    bySource: Record<string, number>;
    fetchTime: number;
  };
}

let cache: CacheEntry | null = null;
const CACHE_TTL = 60 * 1000; // 1 minute cache

// Fetch from USGS (Global)
async function fetchUSGS(hours: number, minMag: number): Promise<UnifiedEarthquake[]> {
  const startTime = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
  const url = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&minmagnitude=${minMag}&starttime=${startTime}&limit=5000&orderby=time`;
  
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    
    const response = await fetch(url, { 
      signal: controller.signal,
      cache: 'no-store'
    });
    clearTimeout(timeout);
    
    if (!response.ok) return [];
    const data = await response.json();
    
    return data.features.map((f: any) => ({
      id: `usgs_${f.id}`,
      source: 'usgs',
      magnitude: f.properties.mag,
      magnitudeType: f.properties.magType || 'ml',
      place: f.properties.place || 'Unknown',
      time: new Date(f.properties.time).toISOString(),
      timestamp: f.properties.time,
      latitude: f.geometry.coordinates[1],
      longitude: f.geometry.coordinates[0],
      depth: f.geometry.coordinates[2],
      url: f.properties.url || `https://earthquake.usgs.gov/earthquakes/eventpage/${f.id}`,
      felt: f.properties.felt,
      tsunami: f.properties.tsunami === 1,
    }));
  } catch (error) {
    console.error('USGS fetch error:', error);
    return [];
  }
}

// Fetch from EMSC (Europe, Mediterranean, Asia)
async function fetchEMSC(hours: number, minMag: number): Promise<UnifiedEarthquake[]> {
  const startTime = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
  const url = `https://www.seismicportal.eu/fdsnws/event/1/query?format=json&minmagnitude=${minMag}&starttime=${startTime}&limit=2000&orderby=time`;
  
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    
    const response = await fetch(url, { 
      signal: controller.signal,
      cache: 'no-store'
    });
    clearTimeout(timeout);
    
    if (!response.ok) return [];
    const data = await response.json();
    
    return (data.features || []).map((f: any) => ({
      id: `emsc_${f.properties.source_id || f.id}`,
      source: 'emsc',
      magnitude: f.properties.mag,
      magnitudeType: f.properties.magtype || 'ml',
      place: f.properties.flynn_region || 'Unknown',
      time: new Date(f.properties.time).toISOString(),
      timestamp: new Date(f.properties.time).getTime(),
      latitude: f.geometry.coordinates[1],
      longitude: f.geometry.coordinates[0],
      depth: f.geometry.coordinates[2] || 10,
      url: f.properties.unid ? `https://www.emsc-csem.org/Earthquake/earthquake.php?id=${f.properties.unid}` : '#',
      region: f.properties.flynn_region,
    }));
  } catch (error) {
    console.error('EMSC fetch error:', error);
    return [];
  }
}

// Fetch from JMA (Japan)
async function fetchJMA(hours: number): Promise<UnifiedEarthquake[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    
    const response = await fetch('https://www.jma.go.jp/bosai/quake/data/list.json', {
      signal: controller.signal,
      cache: 'no-store'
    });
    clearTimeout(timeout);
    
    if (!response.ok) return [];
    const data = await response.json();
    
    const cutoff = Date.now() - hours * 60 * 60 * 1000;
    
    return data
      .filter((item: any) => new Date(item.at).getTime() >= cutoff)
      .map((item: any) => {
        const coords = parseJMACoords(item.cod);
        const time = new Date(item.at);
        return {
          id: `jma_${item.eid}`,
          source: 'jma',
          magnitude: parseFloat(item.mag) || 0,
          magnitudeType: 'mj',
          place: item.en_anm || item.anm || 'Japan',
          time: time.toISOString(),
          timestamp: time.getTime(),
          latitude: coords.lat,
          longitude: coords.lon,
          depth: coords.depth,
          url: `https://www.jma.go.jp/bosai/quake/data/${item.json}`,
          region: 'Japan',
        };
      })
      .filter((eq: UnifiedEarthquake) => eq.magnitude >= 1.0);
  } catch (error) {
    console.error('JMA fetch error:', error);
    return [];
  }
}

function parseJMACoords(cod: string): { lat: number; lon: number; depth: number } {
  try {
    const match = cod.match(/([+-][\d.]+)([+-][\d.]+)([+-]?\d+)/);
    if (match) {
      return {
        lat: parseFloat(match[1]),
        lon: parseFloat(match[2]),
        depth: Math.abs(parseInt(match[3])) / 1000,
      };
    }
  } catch {}
  return { lat: 35.68, lon: 139.65, depth: 10 };
}

// Fetch from GeoNet (New Zealand)
async function fetchGeoNet(hours: number): Promise<UnifiedEarthquake[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    
    const response = await fetch('https://api.geonet.org.nz/quake?MMI=-1', {
      signal: controller.signal,
      cache: 'no-store'
    });
    clearTimeout(timeout);
    
    if (!response.ok) return [];
    const data = await response.json();
    
    const cutoff = Date.now() - hours * 60 * 60 * 1000;
    
    return (data.features || [])
      .filter((f: any) => new Date(f.properties.time).getTime() >= cutoff)
      .map((f: any) => {
        const time = new Date(f.properties.time);
        return {
          id: `geonet_${f.properties.publicID}`,
          source: 'geonet',
          magnitude: f.properties.magnitude,
          magnitudeType: f.properties.magnitudeType || 'ml',
          place: f.properties.locality || 'New Zealand',
          time: time.toISOString(),
          timestamp: time.getTime(),
          latitude: f.geometry.coordinates[1],
          longitude: f.geometry.coordinates[0],
          depth: f.geometry.coordinates[2] || 10,
          url: `https://www.geonet.org.nz/earthquake/${f.properties.publicID}`,
          region: 'New Zealand',
        };
      });
  } catch (error) {
    console.error('GeoNet fetch error:', error);
    return [];
  }
}

// Fetch from PHIVOLCS (Philippines) - may fail if site blocks
async function fetchPHIVOLCS(hours: number): Promise<UnifiedEarthquake[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    
    const response = await fetch('https://earthquake.phivolcs.dost.gov.ph/', {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml',
      },
      cache: 'no-store'
    });
    clearTimeout(timeout);
    
    if (!response.ok) return [];
    const html = await response.text();
    
    return parsePHIVOLCS(html, hours);
  } catch (error) {
    console.error('PHIVOLCS fetch error:', error);
    return [];
  }
}

function parsePHIVOLCS(html: string, hours: number): UnifiedEarthquake[] {
  const earthquakes: UnifiedEarthquake[] = [];
  const cutoff = Date.now() - hours * 60 * 60 * 1000;
  
  const tableMatches = html.matchAll(/<table[^>]*>([\s\S]*?)<\/table>/gi);
  
  for (const tableMatch of tableMatches) {
    const rowMatches = tableMatch[1].matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi);
    
    for (const rowMatch of rowMatches) {
      if (rowMatch[1].includes('<th') || rowMatch[1].includes('Date - Time')) continue;
      
      const cellMatches = rowMatch[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi);
      const cells: string[] = [];
      for (const cell of cellMatches) {
        cells.push(cell[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
      }
      
      if (cells.length !== 6) continue;
      
      try {
        const latitude = parseFloat(cells[1]);
        const longitude = parseFloat(cells[2]);
        const depth = parseFloat(cells[3]) || 10;
        const magnitude = parseFloat(cells[4]);
        const location = cells[5];
        
        if (isNaN(magnitude) || magnitude < 0.5 || magnitude > 10) continue;
        if (latitude < 4 || latitude > 22 || longitude < 116 || longitude > 128) continue;
        
        const time = parsePHIVOLCSTime(cells[0]);
        if (!time || time.getTime() < cutoff) continue;
        
        earthquakes.push({
          id: `phivolcs_${time.getTime()}_${magnitude}_${latitude.toFixed(2)}`,
          source: 'phivolcs',
          magnitude,
          magnitudeType: 'Ms',
          place: location,
          time: time.toISOString(),
          timestamp: time.getTime(),
          latitude,
          longitude,
          depth,
          url: 'https://earthquake.phivolcs.dost.gov.ph/',
          region: 'Philippines',
        });
      } catch {}
    }
  }
  
  return earthquakes;
}

function parsePHIVOLCSTime(str: string): Date | null {
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
  
  if (ampm === 'PM' && hour !== 12) hour += 12;
  else if (ampm === 'AM' && hour === 12) hour = 0;
  
  return new Date(Date.UTC(year, month, day, hour - 8, minute, 0));
}

// Haversine distance in km
function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) ** 2 + 
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon/2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// Deduplicate earthquakes from multiple sources
function deduplicate(earthquakes: UnifiedEarthquake[]): UnifiedEarthquake[] {
  // Sort by timestamp descending
  const sorted = [...earthquakes].sort((a, b) => b.timestamp - a.timestamp);
  const unique: UnifiedEarthquake[] = [];
  
  // Priority: PHIVOLCS > JMA > GeoNet > EMSC > USGS (prefer local/regional sources)
  const sourcePriority: Record<string, number> = {
    phivolcs: 5,
    jma: 4,
    geonet: 4,
    emsc: 2,
    usgs: 1,
  };
  
  for (const eq of sorted) {
    // Check if this is a duplicate of an existing earthquake
    const duplicate = unique.find(existing => {
      const timeDiff = Math.abs(existing.timestamp - eq.timestamp);
      const magDiff = Math.abs(existing.magnitude - eq.magnitude);
      const distance = haversine(existing.latitude, existing.longitude, eq.latitude, eq.longitude);
      
      // Same earthquake if: within 100km, 3 minutes, similar magnitude
      return timeDiff < 180000 && distance < 100 && magDiff < 0.5;
    });
    
    if (duplicate) {
      // Keep the one from higher priority source
      const existingPriority = sourcePriority[duplicate.source] || 0;
      const newPriority = sourcePriority[eq.source] || 0;
      
      if (newPriority > existingPriority) {
        // Replace with higher priority source
        const idx = unique.indexOf(duplicate);
        unique[idx] = eq;
      }
    } else {
      unique.push(eq);
    }
  }
  
  return unique;
}

// Main API handler
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  // Parse query parameters
  const hours = Math.min(parseInt(searchParams.get('hours') || '24'), 168); // Max 7 days
  const minMag = Math.max(parseFloat(searchParams.get('minmag') || '1'), 0);
  const limit = Math.min(parseInt(searchParams.get('limit') || '1000'), 5000);
  const region = searchParams.get('region'); // Optional: philippines, japan, etc.
  const format = searchParams.get('format') || 'json'; // json or geojson
  const noCache = searchParams.get('nocache') === 'true';
  
  // Check cache
  if (!noCache && cache && (Date.now() - cache.timestamp) < CACHE_TTL) {
    let data = cache.data;
    
    // Filter by parameters
    if (minMag > 1) {
      data = data.filter(eq => eq.magnitude >= minMag);
    }
    if (region) {
      data = filterByRegion(data, region);
    }
    
    data = data.slice(0, limit);
    
    return formatResponse(data, cache.stats, format);
  }
  
  // Fetch from all sources in parallel
  const startFetch = Date.now();
  
  const [usgsData, emscData, jmaData, geonetData, phivolcsData] = await Promise.all([
    fetchUSGS(hours, 1.0),
    fetchEMSC(hours, 1.0),
    fetchJMA(hours),
    fetchGeoNet(hours),
    fetchPHIVOLCS(hours),
  ]);
  
  const fetchTime = Date.now() - startFetch;
  
  // Combine all data
  const combined = [...usgsData, ...emscData, ...jmaData, ...geonetData, ...phivolcsData];
  
  // Deduplicate
  const deduplicated = deduplicate(combined);
  
  // Sort by time (newest first)
  deduplicated.sort((a, b) => b.timestamp - a.timestamp);
  
  // Calculate stats
  const stats = {
    total: deduplicated.length,
    bySource: {
      usgs: usgsData.length,
      emsc: emscData.length,
      jma: jmaData.length,
      geonet: geonetData.length,
      phivolcs: phivolcsData.length,
      combined: combined.length,
      afterDedup: deduplicated.length,
    },
    fetchTime,
  };
  
  // Update cache
  cache = {
    data: deduplicated,
    timestamp: Date.now(),
    stats,
  };
  
  // Apply filters
  let result = deduplicated;
  if (minMag > 1) {
    result = result.filter(eq => eq.magnitude >= minMag);
  }
  if (region) {
    result = filterByRegion(result, region);
  }
  result = result.slice(0, limit);
  
  return formatResponse(result, stats, format);
}

function filterByRegion(data: UnifiedEarthquake[], region: string): UnifiedEarthquake[] {
  const bounds: Record<string, { minLat: number; maxLat: number; minLon: number; maxLon: number }> = {
    philippines: { minLat: 4.5, maxLat: 21.5, minLon: 116, maxLon: 127 },
    japan: { minLat: 24, maxLat: 46, minLon: 122, maxLon: 154 },
    indonesia: { minLat: -11, maxLat: 6, minLon: 95, maxLon: 141 },
    newzealand: { minLat: -48, maxLat: -34, minLon: 165, maxLon: 179 },
    usa: { minLat: 24, maxLat: 50, minLon: -125, maxLon: -66 },
    europe: { minLat: 35, maxLat: 72, minLon: -25, maxLon: 45 },
  };
  
  const b = bounds[region.toLowerCase()];
  if (!b) return data;
  
  return data.filter(eq => 
    eq.latitude >= b.minLat && eq.latitude <= b.maxLat &&
    eq.longitude >= b.minLon && eq.longitude <= b.maxLon
  );
}

function formatResponse(data: UnifiedEarthquake[], stats: any, format: string): NextResponse {
  if (format === 'geojson') {
    return NextResponse.json({
      type: 'FeatureCollection',
      metadata: {
        generated: new Date().toISOString(),
        count: data.length,
        ...stats,
      },
      features: data.map(eq => ({
        type: 'Feature',
        id: eq.id,
        properties: {
          mag: eq.magnitude,
          magType: eq.magnitudeType,
          place: eq.place,
          time: eq.timestamp,
          url: eq.url,
          felt: eq.felt,
          tsunami: eq.tsunami,
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
    count: data.length,
    stats,
    earthquakes: data,
  }, {
    headers: {
      'Cache-Control': 'public, max-age=60',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
