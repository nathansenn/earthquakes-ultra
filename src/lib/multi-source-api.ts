// Multi-Source Earthquake API Aggregator
// Combines data from USGS, EMSC, JMA, GeoNet for comprehensive M1+ coverage

export interface UnifiedEarthquake {
  id: string;
  source: 'usgs' | 'emsc' | 'jma' | 'geonet';
  magnitude: number;
  magnitudeType: string;
  place: string;
  time: Date;
  latitude: number;
  longitude: number;
  depth: number;
  url: string;
  felt?: number | null;
  tsunami?: boolean;
  region?: string;
}

// USGS API (primary source)
async function fetchUSGS(startTime: string, minMag: number = 1.0, limit: number = 5000): Promise<UnifiedEarthquake[]> {
  const url = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&minmagnitude=${minMag}&starttime=${startTime}&limit=${limit}&orderby=time`;
  
  try {
    const response = await fetch(url, { next: { revalidate: 60 } });
    if (!response.ok) return [];
    
    const data = await response.json();
    return data.features.map((f: any) => ({
      id: `usgs_${f.id}`,
      source: 'usgs' as const,
      magnitude: f.properties.mag,
      magnitudeType: f.properties.magType || 'ml',
      place: f.properties.place || 'Unknown',
      time: new Date(f.properties.time),
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

// EMSC API (Europe-Mediterranean Seismological Centre)
// Covers: Europe, Mediterranean, Middle East, parts of Asia
async function fetchEMSC(startTime: string, minMag: number = 1.0, limit: number = 2000): Promise<UnifiedEarthquake[]> {
  const url = `https://www.seismicportal.eu/fdsnws/event/1/query?format=json&minmagnitude=${minMag}&starttime=${startTime}&limit=${limit}&orderby=time`;
  
  try {
    const response = await fetch(url, { next: { revalidate: 60 } });
    if (!response.ok) return [];
    
    const data = await response.json();
    return (data.features || []).map((f: any) => ({
      id: `emsc_${f.properties.source_id || f.id}`,
      source: 'emsc' as const,
      magnitude: f.properties.mag,
      magnitudeType: f.properties.magtype || 'ml',
      place: f.properties.flynn_region || f.properties.place || 'Unknown',
      time: new Date(f.properties.time),
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

// JMA API (Japan Meteorological Agency)
// Covers: Japan with detailed M1+ data
async function fetchJMA(limit: number = 500): Promise<UnifiedEarthquake[]> {
  const url = 'https://www.jma.go.jp/bosai/quake/data/list.json';
  
  try {
    const response = await fetch(url, { next: { revalidate: 60 } });
    if (!response.ok) return [];
    
    const data = await response.json();
    return data.slice(0, limit).map((item: any) => {
      // Parse JMA coordinate format: "+35.8+140.3-40000/"
      const coords = parseJMACoords(item.cod);
      
      return {
        id: `jma_${item.eid}`,
        source: 'jma' as const,
        magnitude: parseFloat(item.mag) || 0,
        magnitudeType: 'mj', // JMA magnitude
        place: item.en_anm || item.anm || 'Japan',
        time: new Date(item.at),
        latitude: coords.lat,
        longitude: coords.lon,
        depth: coords.depth,
        url: `https://www.jma.go.jp/bosai/quake/data/${item.json}`,
        region: 'Japan',
      };
    }).filter((eq: UnifiedEarthquake) => eq.magnitude >= 1.0);
  } catch (error) {
    console.error('JMA fetch error:', error);
    return [];
  }
}

// Parse JMA coordinate format: "+35.8+140.3-40000/" -> {lat, lon, depth}
function parseJMACoords(cod: string): { lat: number; lon: number; depth: number } {
  try {
    // Format: +35.8+140.3-40000/ or +35.8+140.3+10000/
    const match = cod.match(/([+-][\d.]+)([+-][\d.]+)([+-]?\d+)/);
    if (match) {
      return {
        lat: parseFloat(match[1]),
        lon: parseFloat(match[2]),
        depth: Math.abs(parseInt(match[3])) / 1000, // Convert meters to km
      };
    }
  } catch {}
  return { lat: 35.6762, lon: 139.6503, depth: 10 }; // Default to Tokyo
}

// GeoNet API (New Zealand)
async function fetchGeoNet(limit: number = 500): Promise<UnifiedEarthquake[]> {
  // GeoNet uses MMI (Modified Mercalli Intensity), -1 = unnoticeable = M1+
  const url = 'https://api.geonet.org.nz/quake?MMI=-1';
  
  try {
    const response = await fetch(url, { next: { revalidate: 60 } });
    if (!response.ok) return [];
    
    const data = await response.json();
    return (data.features || []).slice(0, limit).map((f: any) => ({
      id: `geonet_${f.properties.publicID}`,
      source: 'geonet' as const,
      magnitude: f.properties.magnitude,
      magnitudeType: f.properties.magnitudeType || 'ml',
      place: f.properties.locality || 'New Zealand',
      time: new Date(f.properties.time),
      latitude: f.geometry.coordinates[1],
      longitude: f.geometry.coordinates[0],
      depth: f.geometry.coordinates[2] || 10,
      url: `https://www.geonet.org.nz/earthquake/${f.properties.publicID}`,
      region: 'New Zealand',
    }));
  } catch (error) {
    console.error('GeoNet fetch error:', error);
    return [];
  }
}

// Deduplicate earthquakes from multiple sources
// Same earthquake if: within 100km, 2 minutes, and 0.5 magnitude
function deduplicateEarthquakes(earthquakes: UnifiedEarthquake[]): UnifiedEarthquake[] {
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
      
      // Consider duplicate if within 100km, 2 min, and similar magnitude
      return timeDiff < 120000 && distance < 100 && magDiff < 0.5;
    });
    
    if (!isDuplicate) {
      unique.push(eq);
    }
  }
  
  return unique;
}

// Haversine distance in km
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
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

// Main aggregator function
export async function fetchGlobalEarthquakesMultiSource(
  hours: number = 24,
  minMagnitude: number = 1.0
): Promise<UnifiedEarthquake[]> {
  const startTime = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
  
  // Fetch from all sources in parallel
  const [usgsData, emscData, jmaData, geonetData] = await Promise.all([
    fetchUSGS(startTime, minMagnitude, 5000),
    fetchEMSC(startTime, minMagnitude, 2000),
    fetchJMA(500),
    fetchGeoNet(500),
  ]);
  
  console.log(`Fetched: USGS=${usgsData.length}, EMSC=${emscData.length}, JMA=${jmaData.length}, GeoNet=${geonetData.length}`);
  
  // Filter JMA and GeoNet by time window
  const cutoffTime = Date.now() - hours * 60 * 60 * 1000;
  const filteredJMA = jmaData.filter(eq => eq.time.getTime() >= cutoffTime);
  const filteredGeoNet = geonetData.filter(eq => eq.time.getTime() >= cutoffTime);
  
  // Combine all data
  const combined = [...usgsData, ...emscData, ...filteredJMA, ...filteredGeoNet];
  
  // Deduplicate
  const deduplicated = deduplicateEarthquakes(combined);
  
  console.log(`Combined: ${combined.length}, After dedup: ${deduplicated.length}`);
  
  // Sort by time (newest first)
  return deduplicated.sort((a, b) => b.time.getTime() - a.time.getTime());
}

// Get stats from multi-source data
export interface MultiSourceStats {
  total: number;
  bySource: {
    usgs: number;
    emsc: number;
    jma: number;
    geonet: number;
  };
  m1Plus: number;
  m2Plus: number;
  m3Plus: number;
  m4Plus: number;
  m5Plus: number;
  m6Plus: number;
  largest: UnifiedEarthquake | null;
}

export function calculateMultiSourceStats(earthquakes: UnifiedEarthquake[]): MultiSourceStats {
  return {
    total: earthquakes.length,
    bySource: {
      usgs: earthquakes.filter(eq => eq.source === 'usgs').length,
      emsc: earthquakes.filter(eq => eq.source === 'emsc').length,
      jma: earthquakes.filter(eq => eq.source === 'jma').length,
      geonet: earthquakes.filter(eq => eq.source === 'geonet').length,
    },
    m1Plus: earthquakes.filter(eq => eq.magnitude >= 1).length,
    m2Plus: earthquakes.filter(eq => eq.magnitude >= 2).length,
    m3Plus: earthquakes.filter(eq => eq.magnitude >= 3).length,
    m4Plus: earthquakes.filter(eq => eq.magnitude >= 4).length,
    m5Plus: earthquakes.filter(eq => eq.magnitude >= 5).length,
    m6Plus: earthquakes.filter(eq => eq.magnitude >= 6).length,
    largest: earthquakes.length > 0
      ? earthquakes.reduce((max, eq) => eq.magnitude > max.magnitude ? eq : max)
      : null,
  };
}

// Fetch for specific region with preference for regional source
export async function fetchRegionEarthquakes(
  region: 'japan' | 'newzealand' | 'europe' | 'global',
  hours: number = 24,
  minMagnitude: number = 1.0
): Promise<UnifiedEarthquake[]> {
  const startTime = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
  
  switch (region) {
    case 'japan':
      // Prefer JMA for Japan, supplement with USGS
      const [jma, usgsJapan] = await Promise.all([
        fetchJMA(1000),
        fetchUSGS(startTime, minMagnitude, 1000),
      ]);
      const japanUSGS = usgsJapan.filter(eq => 
        eq.latitude >= 24 && eq.latitude <= 46 &&
        eq.longitude >= 122 && eq.longitude <= 154
      );
      return deduplicateEarthquakes([...jma, ...japanUSGS]);
      
    case 'newzealand':
      // Prefer GeoNet for NZ
      return fetchGeoNet(1000);
      
    case 'europe':
      // Prefer EMSC for Europe
      return fetchEMSC(startTime, minMagnitude, 2000);
      
    default:
      return fetchGlobalEarthquakesMultiSource(hours, minMagnitude);
  }
}

// Convert UnifiedEarthquake to ProcessedEarthquake format for components
export function convertToProcessed(eq: UnifiedEarthquake): {
  id: string;
  magnitude: number;
  magnitudeType: string;
  place: string;
  time: Date;
  timeAgo: string;
  latitude: number;
  longitude: number;
  depth: number;
  url: string;
  felt: number | null;
  tsunami: boolean;
  alert: string | null;
  intensity: string;
  significanceScore: number;
  source: string;
} {
  const now = Date.now();
  const timeDiff = now - eq.time.getTime();
  
  let timeAgo: string;
  if (timeDiff < 60000) timeAgo = 'Just now';
  else if (timeDiff < 3600000) timeAgo = `${Math.floor(timeDiff / 60000)}m ago`;
  else if (timeDiff < 86400000) timeAgo = `${Math.floor(timeDiff / 3600000)}h ago`;
  else timeAgo = `${Math.floor(timeDiff / 86400000)}d ago`;
  
  let intensity: string;
  if (eq.magnitude >= 7) intensity = 'extreme';
  else if (eq.magnitude >= 6) intensity = 'severe';
  else if (eq.magnitude >= 5) intensity = 'strong';
  else if (eq.magnitude >= 4) intensity = 'moderate';
  else if (eq.magnitude >= 3) intensity = 'light';
  else if (eq.magnitude >= 2) intensity = 'minor';
  else intensity = 'micro';
  
  return {
    id: eq.id,
    magnitude: eq.magnitude,
    magnitudeType: eq.magnitudeType,
    place: eq.place,
    time: eq.time,
    timeAgo,
    latitude: eq.latitude,
    longitude: eq.longitude,
    depth: eq.depth,
    url: eq.url,
    felt: eq.felt || null,
    tsunami: eq.tsunami || false,
    alert: null,
    intensity,
    significanceScore: Math.round(eq.magnitude * 100),
    source: eq.source,
  };
}
