// Regional Earthquake Data API
// Provides optimized data fetching for specific countries/regions
// Uses the best available data source for each region

import { UnifiedEarthquake } from './multi-source-api';
import { getPhilippinesEarthquakes } from './db-queries';

// Country/Region configurations with bounds and preferred data sources
export const REGIONS: Record<string, {
  name: string;
  bounds: { minLat: number; maxLat: number; minLon: number; maxLon: number };
  sources: ('usgs' | 'emsc' | 'jma' | 'geonet')[];
  minMagAvailable: number; // Minimum magnitude typically available
}> = {
  // Asia-Pacific
  philippines: {
    name: 'Philippines',
    bounds: { minLat: 4.5, maxLat: 21.5, minLon: 116.0, maxLon: 127.0 },
    sources: ['emsc', 'usgs'],
    minMagAvailable: 2.0,
  },
  japan: {
    name: 'Japan',
    bounds: { minLat: 24.0, maxLat: 46.0, minLon: 122.0, maxLon: 154.0 },
    sources: ['jma', 'usgs', 'emsc'],
    minMagAvailable: 1.0,
  },
  indonesia: {
    name: 'Indonesia',
    bounds: { minLat: -11.0, maxLat: 6.0, minLon: 95.0, maxLon: 141.0 },
    sources: ['emsc', 'usgs'],
    minMagAvailable: 2.0,
  },
  taiwan: {
    name: 'Taiwan',
    bounds: { minLat: 21.5, maxLat: 25.5, minLon: 119.0, maxLon: 122.5 },
    sources: ['emsc', 'usgs'],
    minMagAvailable: 2.0,
  },
  'new-zealand': {
    name: 'New Zealand',
    bounds: { minLat: -48.0, maxLat: -34.0, minLon: 165.0, maxLon: 179.0 },
    sources: ['geonet', 'usgs'],
    minMagAvailable: 1.0,
  },
  
  // Americas
  'united-states': {
    name: 'United States',
    bounds: { minLat: 24.0, maxLat: 50.0, minLon: -125.0, maxLon: -66.0 },
    sources: ['usgs'],
    minMagAvailable: 1.0,
  },
  alaska: {
    name: 'Alaska',
    bounds: { minLat: 51.0, maxLat: 71.5, minLon: -180.0, maxLon: -129.0 },
    sources: ['usgs'],
    minMagAvailable: 1.0,
  },
  california: {
    name: 'California',
    bounds: { minLat: 32.0, maxLat: 42.0, minLon: -125.0, maxLon: -114.0 },
    sources: ['usgs'],
    minMagAvailable: 1.0,
  },
  mexico: {
    name: 'Mexico',
    bounds: { minLat: 14.0, maxLat: 33.0, minLon: -118.0, maxLon: -86.0 },
    sources: ['usgs', 'emsc'],
    minMagAvailable: 3.0,
  },
  chile: {
    name: 'Chile',
    bounds: { minLat: -56.0, maxLat: -17.5, minLon: -76.0, maxLon: -66.0 },
    sources: ['usgs', 'emsc'],
    minMagAvailable: 3.0,
  },
  peru: {
    name: 'Peru',
    bounds: { minLat: -18.5, maxLat: 0.0, minLon: -81.5, maxLon: -68.5 },
    sources: ['usgs', 'emsc'],
    minMagAvailable: 3.0,
  },
  
  // Europe & Mediterranean
  italy: {
    name: 'Italy',
    bounds: { minLat: 35.5, maxLat: 47.5, minLon: 6.5, maxLon: 19.0 },
    sources: ['emsc', 'usgs'],
    minMagAvailable: 1.5,
  },
  greece: {
    name: 'Greece',
    bounds: { minLat: 34.5, maxLat: 42.0, minLon: 19.0, maxLon: 30.0 },
    sources: ['emsc', 'usgs'],
    minMagAvailable: 2.0,
  },
  turkey: {
    name: 'Turkey',
    bounds: { minLat: 35.5, maxLat: 42.5, minLon: 25.5, maxLon: 45.0 },
    sources: ['emsc', 'usgs'],
    minMagAvailable: 2.0,
  },
  iceland: {
    name: 'Iceland',
    bounds: { minLat: 63.0, maxLat: 67.0, minLon: -25.0, maxLon: -13.0 },
    sources: ['emsc', 'usgs'],
    minMagAvailable: 1.0,
  },
  
  // Other
  iran: {
    name: 'Iran',
    bounds: { minLat: 25.0, maxLat: 40.0, minLon: 44.0, maxLon: 63.5 },
    sources: ['emsc', 'usgs'],
    minMagAvailable: 3.0,
  },
  pakistan: {
    name: 'Pakistan',
    bounds: { minLat: 23.5, maxLat: 37.5, minLon: 60.5, maxLon: 77.5 },
    sources: ['emsc', 'usgs'],
    minMagAvailable: 3.0,
  },
  nepal: {
    name: 'Nepal',
    bounds: { minLat: 26.0, maxLat: 30.5, minLon: 80.0, maxLon: 88.5 },
    sources: ['emsc', 'usgs'],
    minMagAvailable: 3.0,
  },
  india: {
    name: 'India',
    bounds: { minLat: 6.0, maxLat: 36.0, minLon: 68.0, maxLon: 98.0 },
    sources: ['emsc', 'usgs'],
    minMagAvailable: 3.0,
  },
};

// Fetch from USGS
async function fetchUSGSRegion(
  bounds: typeof REGIONS['philippines']['bounds'],
  startTime: string,
  minMag: number,
  limit: number
): Promise<UnifiedEarthquake[]> {
  const url = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&minmagnitude=${minMag}&minlatitude=${bounds.minLat}&maxlatitude=${bounds.maxLat}&minlongitude=${bounds.minLon}&maxlongitude=${bounds.maxLon}&starttime=${startTime}&limit=${limit}&orderby=time`;
  
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
    console.error('USGS regional fetch error:', error);
    return [];
  }
}

// Fetch from EMSC
async function fetchEMSCRegion(
  bounds: typeof REGIONS['philippines']['bounds'],
  startTime: string,
  minMag: number,
  limit: number
): Promise<UnifiedEarthquake[]> {
  const url = `https://www.seismicportal.eu/fdsnws/event/1/query?format=json&minmagnitude=${minMag}&minlatitude=${bounds.minLat}&maxlatitude=${bounds.maxLat}&minlongitude=${bounds.minLon}&maxlongitude=${bounds.maxLon}&starttime=${startTime}&limit=${limit}&orderby=time`;
  
  try {
    const response = await fetch(url, { next: { revalidate: 60 } });
    if (!response.ok) return [];
    const data = await response.json();
    
    return (data.features || []).map((f: any) => ({
      id: `emsc_${f.properties.source_id || f.id}`,
      source: 'emsc' as const,
      magnitude: f.properties.mag,
      magnitudeType: f.properties.magtype || 'ml',
      place: f.properties.flynn_region || 'Unknown',
      time: new Date(f.properties.time),
      latitude: f.geometry.coordinates[1],
      longitude: f.geometry.coordinates[0],
      depth: f.geometry.coordinates[2] || 10,
      url: f.properties.unid ? `https://www.emsc-csem.org/Earthquake/earthquake.php?id=${f.properties.unid}` : '#',
    }));
  } catch (error) {
    console.error('EMSC regional fetch error:', error);
    return [];
  }
}

// Fetch from JMA (Japan)
async function fetchJMARegion(
  bounds: typeof REGIONS['japan']['bounds'],
  days: number
): Promise<UnifiedEarthquake[]> {
  try {
    const response = await fetch('https://www.jma.go.jp/bosai/quake/data/list.json', {
      next: { revalidate: 60 }
    });
    if (!response.ok) return [];
    
    const data = await response.json();
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    
    return data
      .filter((item: any) => {
        const time = new Date(item.at).getTime();
        return time >= cutoff;
      })
      .map((item: any) => {
        const coords = parseJMACoords(item.cod);
        return {
          id: `jma_${item.eid}`,
          source: 'jma' as const,
          magnitude: parseFloat(item.mag) || 0,
          magnitudeType: 'mj',
          place: item.en_anm || item.anm || 'Japan',
          time: new Date(item.at),
          latitude: coords.lat,
          longitude: coords.lon,
          depth: coords.depth,
          url: `https://www.jma.go.jp/bosai/quake/data/${item.json}`,
        };
      })
      .filter((eq: UnifiedEarthquake) => 
        eq.latitude >= bounds.minLat && eq.latitude <= bounds.maxLat &&
        eq.longitude >= bounds.minLon && eq.longitude <= bounds.maxLon
      );
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
async function fetchGeoNetRegion(days: number): Promise<UnifiedEarthquake[]> {
  try {
    const response = await fetch('https://api.geonet.org.nz/quake?MMI=-1', {
      next: { revalidate: 60 }
    });
    if (!response.ok) return [];
    
    const data = await response.json();
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    
    return (data.features || [])
      .filter((f: any) => new Date(f.properties.time).getTime() >= cutoff)
      .map((f: any) => ({
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
      }));
  } catch (error) {
    console.error('GeoNet fetch error:', error);
    return [];
  }
}

// Deduplicate earthquakes
function deduplicateRegional(earthquakes: UnifiedEarthquake[]): UnifiedEarthquake[] {
  const sorted = [...earthquakes].sort((a, b) => b.time.getTime() - a.time.getTime());
  const unique: UnifiedEarthquake[] = [];
  
  for (const eq of sorted) {
    const isDuplicate = unique.some(existing => {
      const timeDiff = Math.abs(existing.time.getTime() - eq.time.getTime());
      const magDiff = Math.abs(existing.magnitude - eq.magnitude);
      const distance = haversine(existing.latitude, existing.longitude, eq.latitude, eq.longitude);
      return timeDiff < 120000 && distance < 50 && magDiff < 0.3;
    });
    if (!isDuplicate) unique.push(eq);
  }
  
  return unique;
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// Fetch PHIVOLCS data from local database
function fetchPHIVOLCSRegion(days: number, minMag: number): UnifiedEarthquake[] {
  try {
    const earthquakes = getPhilippinesEarthquakes(days, minMag, 5000);
    return earthquakes.map(eq => ({
      id: eq.id,
      source: 'phivolcs' as any,
      magnitude: eq.magnitude,
      magnitudeType: eq.magnitudeType || 'Ms',
      place: eq.place,
      time: eq.time,
      latitude: eq.latitude,
      longitude: eq.longitude,
      depth: eq.depth,
      url: eq.url || 'https://earthquake.phivolcs.dost.gov.ph/',
      felt: eq.felt,
      tsunami: eq.tsunami,
    }));
  } catch (error) {
    console.error('PHIVOLCS fetch error:', error);
    return [];
  }
}

// Main function: Fetch earthquakes for a specific region
export async function fetchRegionEarthquakes(
  regionKey: string,
  days: number = 7,
  minMagnitude: number = 1.0
): Promise<UnifiedEarthquake[]> {
  const region = REGIONS[regionKey.toLowerCase()];
  if (!region) {
    console.error(`Unknown region: ${regionKey}`);
    return [];
  }
  
  const startTime = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const effectiveMinMag = Math.max(minMagnitude, region.minMagAvailable);
  
  // Special case: Philippines uses local PHIVOLCS database for comprehensive M1+ coverage
  if (regionKey.toLowerCase() === 'philippines') {
    const phivolcsData = fetchPHIVOLCSRegion(days, effectiveMinMag);
    
    // Also fetch from USGS/EMSC for completeness
    const [usgsData, emscData] = await Promise.all([
      fetchUSGSRegion(region.bounds, startTime.split('T')[0], effectiveMinMag, 1000),
      fetchEMSCRegion(region.bounds, startTime, effectiveMinMag, 1000),
    ]);
    
    const combined = [...phivolcsData, ...usgsData, ...emscData];
    console.log(`Region Philippines: ${phivolcsData.length} PHIVOLCS + ${usgsData.length} USGS + ${emscData.length} EMSC = ${combined.length} total`);
    
    return deduplicateRegional(combined).sort((a, b) => b.time.getTime() - a.time.getTime());
  }
  
  // Fetch from all configured sources in parallel for other regions
  const fetchPromises: Promise<UnifiedEarthquake[]>[] = [];
  
  for (const source of region.sources) {
    switch (source) {
      case 'usgs':
        fetchPromises.push(fetchUSGSRegion(region.bounds, startTime.split('T')[0], effectiveMinMag, 1000));
        break;
      case 'emsc':
        fetchPromises.push(fetchEMSCRegion(region.bounds, startTime, effectiveMinMag, 1000));
        break;
      case 'jma':
        fetchPromises.push(fetchJMARegion(region.bounds, days));
        break;
      case 'geonet':
        fetchPromises.push(fetchGeoNetRegion(days));
        break;
    }
  }
  
  const results = await Promise.all(fetchPromises);
  const combined = results.flat();
  
  console.log(`Region ${region.name}: ${combined.length} earthquakes from ${region.sources.join(', ')}`);
  
  return deduplicateRegional(combined).sort((a, b) => b.time.getTime() - a.time.getTime());
}

// Get region info
export function getRegionInfo(regionKey: string) {
  return REGIONS[regionKey.toLowerCase()];
}

// List all available regions
export function listRegions() {
  return Object.entries(REGIONS).map(([key, value]) => ({
    key,
    name: value.name,
    sources: value.sources,
    minMagAvailable: value.minMagAvailable,
  }));
}
