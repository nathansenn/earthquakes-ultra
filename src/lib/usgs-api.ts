// USGS Earthquake API Integration
// https://earthquake.usgs.gov/fdsnws/event/1/

export interface USGSEarthquake {
  id: string;
  properties: {
    mag: number;
    place: string;
    time: number;
    updated: number;
    url: string;
    detail: string;
    felt: number | null;
    cdi: number | null;
    mmi: number | null;
    alert: string | null;
    status: string;
    tsunami: number;
    sig: number;
    net: string;
    code: string;
    ids: string;
    sources: string;
    types: string;
    nst: number | null;
    dmin: number | null;
    rms: number | null;
    gap: number | null;
    magType: string;
    type: string;
    title: string;
  };
  geometry: {
    type: string;
    coordinates: [number, number, number]; // [longitude, latitude, depth]
  };
}

export interface USGSResponse {
  type: string;
  metadata: {
    generated: number;
    url: string;
    title: string;
    status: number;
    api: string;
    count: number;
  };
  features: USGSEarthquake[];
  bbox?: number[];
}

export interface EarthquakeQuery {
  starttime?: string;
  endtime?: string;
  minlatitude?: number;
  maxlatitude?: number;
  minlongitude?: number;
  maxlongitude?: number;
  latitude?: number;
  longitude?: number;
  maxradiuskm?: number;
  minmagnitude?: number;
  maxmagnitude?: number;
  limit?: number;
  orderby?: 'time' | 'time-asc' | 'magnitude' | 'magnitude-asc';
}

// Philippine bounding box
export const PHILIPPINES_BOUNDS = {
  minLatitude: 4.5,
  maxLatitude: 21.5,
  minLongitude: 116.0,
  maxLongitude: 127.0,
};

// Geographic bounds for different regions/countries
export interface GeoBounds {
  minLatitude: number;
  maxLatitude: number;
  minLongitude: number;
  maxLongitude: number;
}

const USGS_BASE_URL = 'https://earthquake.usgs.gov/fdsnws/event/1/query';

export async function fetchEarthquakes(query: EarthquakeQuery = {}): Promise<USGSEarthquake[]> {
  const params = new URLSearchParams({
    format: 'geojson',
    ...Object.fromEntries(
      Object.entries(query)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, String(v)])
    ),
  });

  const response = await fetch(`${USGS_BASE_URL}?${params}`, {
    next: { revalidate: 60 }, // Cache for 1 minute
  });

  if (!response.ok) {
    throw new Error(`USGS API error: ${response.status}`);
  }

  const data: USGSResponse = await response.json();
  return data.features;
}

// Fetch earthquakes for Philippines (last 30 days)
export async function fetchPhilippineEarthquakes(days: number = 30, minMagnitude: number = 2.5): Promise<USGSEarthquake[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Don't set endtime - USGS defaults to current time for latest data
  return fetchEarthquakes({
    starttime: startDate.toISOString().split('T')[0],
    minlatitude: PHILIPPINES_BOUNDS.minLatitude,
    maxlatitude: PHILIPPINES_BOUNDS.maxLatitude,
    minlongitude: PHILIPPINES_BOUNDS.minLongitude,
    maxlongitude: PHILIPPINES_BOUNDS.maxLongitude,
    minmagnitude: minMagnitude,
    orderby: 'time',
    limit: 1000,
  });
}

// ============================================
// GLOBAL EARTHQUAKE FUNCTIONS
// ============================================

// In-memory cache for global M1+ data (expensive query)
interface GlobalM1Cache {
  data: USGSEarthquake[];
  timestamp: number;
  days: number;
}

let globalM1Cache: GlobalM1Cache | null = null;
const GLOBAL_M1_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Fetch ALL global M1+ earthquakes with caching
export async function fetchGlobalM1Earthquakes(
  days: number = 1,
  limit: number = 10000
): Promise<USGSEarthquake[]> {
  const now = Date.now();
  
  // Check cache validity
  if (
    globalM1Cache && 
    globalM1Cache.days === days &&
    (now - globalM1Cache.timestamp) < GLOBAL_M1_CACHE_TTL
  ) {
    return globalM1Cache.data;
  }

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Don't set endtime - USGS defaults to current time for latest data
  const data = await fetchEarthquakes({
    starttime: startDate.toISOString().split('T')[0],
    minmagnitude: 1.0,
    orderby: 'time',
    limit,
  });

  // Update cache
  globalM1Cache = {
    data,
    timestamp: now,
    days,
  };

  return data;
}

// Fetch global earthquakes (no geographic bounds)
export async function fetchGlobalEarthquakes(
  days: number = 7,
  minMagnitude: number = 4.5,
  limit: number = 500
): Promise<USGSEarthquake[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Don't set endtime - USGS defaults to current time for latest data
  return fetchEarthquakes({
    starttime: startDate.toISOString().split('T')[0],
    minmagnitude: minMagnitude,
    orderby: 'time',
    limit,
  });
}

// Fetch earthquakes by geographic bounds (for country/region)
export async function fetchEarthquakesByBounds(
  bounds: GeoBounds,
  days: number = 30,
  minMagnitude: number = 2.5,
  limit: number = 1000
): Promise<USGSEarthquake[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Don't set endtime - USGS defaults to current time for latest data
  return fetchEarthquakes({
    starttime: startDate.toISOString().split('T')[0],
    minlatitude: bounds.minLatitude,
    maxlatitude: bounds.maxLatitude,
    minlongitude: bounds.minLongitude,
    maxlongitude: bounds.maxLongitude,
    minmagnitude: minMagnitude,
    orderby: 'time',
    limit,
  });
}

// Fetch earthquakes near a city (by coordinates and radius)
export async function fetchEarthquakesNearCity(
  lat: number,
  lon: number,
  radiusKm: number = 200,
  days: number = 30,
  minMagnitude: number = 2.0,
  limit: number = 500
): Promise<USGSEarthquake[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Don't set endtime - USGS defaults to current time for latest data
  return fetchEarthquakes({
    starttime: startDate.toISOString().split('T')[0],
    latitude: lat,
    longitude: lon,
    maxradiuskm: radiusKm,
    minmagnitude: minMagnitude,
    orderby: 'time',
    limit,
  });
}

// Fetch significant global earthquakes (M5+)
export async function fetchSignificantGlobalEarthquakes(days: number = 30): Promise<USGSEarthquake[]> {
  return fetchGlobalEarthquakes(days, 5.0, 500);
}

// Fetch recent large earthquakes (M6+) for alerts
export async function fetchLargeEarthquakes(hours: number = 24): Promise<USGSEarthquake[]> {
  const startDate = new Date();
  startDate.setTime(startDate.getTime() - hours * 60 * 60 * 1000);

  // Don't set endtime - USGS defaults to current time for latest data
  return fetchEarthquakes({
    starttime: startDate.toISOString(),
    minmagnitude: 6.0,
    orderby: 'time',
    limit: 100,
  });
}

// Fetch earthquakes for statistics (global overview)
export async function fetchGlobalStats(days: number = 7): Promise<{
  total: number;
  m4Plus: number;
  m5Plus: number;
  m6Plus: number;
  m7Plus: number;
  largest: USGSEarthquake | null;
}> {
  const earthquakes = await fetchGlobalEarthquakes(days, 4.0, 2000);
  
  const m4Plus = earthquakes.filter(eq => eq.properties.mag >= 4).length;
  const m5Plus = earthquakes.filter(eq => eq.properties.mag >= 5).length;
  const m6Plus = earthquakes.filter(eq => eq.properties.mag >= 6).length;
  const m7Plus = earthquakes.filter(eq => eq.properties.mag >= 7).length;
  
  const largest = earthquakes.length > 0
    ? earthquakes.reduce((max, eq) => eq.properties.mag > max.properties.mag ? eq : max)
    : null;

  return {
    total: earthquakes.length,
    m4Plus,
    m5Plus,
    m6Plus,
    m7Plus,
    largest,
  };
}

// Time range options for filtering
export type TimeRange = '24h' | '7d' | '30d' | '90d' | '1yr' | '5yr' | '10yr' | 'all';

export function getTimeRangeDays(range: TimeRange): number {
  switch (range) {
    case '24h': return 1;
    case '7d': return 7;
    case '30d': return 30;
    case '90d': return 90;
    case '1yr': return 365;
    case '5yr': return 365 * 5;
    case '10yr': return 365 * 10;
    case 'all': return 365 * 125; // Since 1900
    default: return 7;
  }
}

export const TIME_RANGE_OPTIONS: { value: TimeRange; label: string }[] = [
  { value: '24h', label: 'Last 24 Hours' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
  { value: '1yr', label: 'Last Year' },
  { value: '5yr', label: 'Last 5 Years' },
  { value: '10yr', label: 'Last 10 Years' },
  { value: 'all', label: 'All Time (1900+)' },
];

// Magnitude filter options
export type MagnitudeFilter = 1 | 2 | 3 | 4 | 5 | 6;

export const MAGNITUDE_OPTIONS: { value: MagnitudeFilter; label: string }[] = [
  { value: 1, label: 'M1.0+' },
  { value: 2, label: 'M2.0+' },
  { value: 3, label: 'M3.0+' },
  { value: 4, label: 'M4.0+' },
  { value: 5, label: 'M5.0+' },
  { value: 6, label: 'M6.0+' },
];

// Fetch M1+ earthquakes for comprehensive data
export async function fetchAllPhilippineEarthquakes(
  days: number = 7, 
  minMagnitude: number = 1.0
): Promise<USGSEarthquake[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // For M1+ we can get a LOT of data, limit appropriately
  const limit = minMagnitude <= 2 ? 5000 : 2000;

  // Don't set endtime - USGS defaults to current time for latest data
  return fetchEarthquakes({
    starttime: startDate.toISOString().split('T')[0],
    minlatitude: PHILIPPINES_BOUNDS.minLatitude,
    maxlatitude: PHILIPPINES_BOUNDS.maxLatitude,
    minlongitude: PHILIPPINES_BOUNDS.minLongitude,
    maxlongitude: PHILIPPINES_BOUNDS.maxLongitude,
    minmagnitude: minMagnitude,
    orderby: 'time',
    limit,
  });
}

// Fetch with configurable parameters
export async function fetchEarthquakesConfigurable(options: {
  days?: number;
  minMagnitude?: number;
  maxMagnitude?: number;
  limit?: number;
  orderBy?: 'time' | 'time-asc' | 'magnitude' | 'magnitude-asc';
}): Promise<USGSEarthquake[]> {
  const { 
    days = 7, 
    minMagnitude = 1.0, 
    maxMagnitude,
    limit = 2000,
    orderBy = 'time'
  } = options;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Don't set endtime - USGS defaults to current time for latest data
  return fetchEarthquakes({
    starttime: startDate.toISOString().split('T')[0],
    minlatitude: PHILIPPINES_BOUNDS.minLatitude,
    maxlatitude: PHILIPPINES_BOUNDS.maxLatitude,
    minlongitude: PHILIPPINES_BOUNDS.minLongitude,
    maxlongitude: PHILIPPINES_BOUNDS.maxLongitude,
    minmagnitude: minMagnitude,
    maxmagnitude: maxMagnitude,
    orderby: orderBy,
    limit,
  });
}

// Get earthquake statistics
export interface EarthquakeStats {
  total: number;
  last24h: number;
  m1Plus: number;
  m2Plus: number;
  m3Plus: number;
  m4Plus: number;
  m5Plus: number;
  m6Plus: number;
  avgMagnitude: number;
  maxMagnitude: number;
  avgDepth: number;
}

export function calculateStats(earthquakes: ProcessedEarthquake[]): EarthquakeStats {
  const now = Date.now();
  const oneDayAgo = now - 24 * 60 * 60 * 1000;

  const last24h = earthquakes.filter(eq => eq.time.getTime() > oneDayAgo);
  
  return {
    total: earthquakes.length,
    last24h: last24h.length,
    m1Plus: earthquakes.filter(eq => eq.magnitude >= 1).length,
    m2Plus: earthquakes.filter(eq => eq.magnitude >= 2).length,
    m3Plus: earthquakes.filter(eq => eq.magnitude >= 3).length,
    m4Plus: earthquakes.filter(eq => eq.magnitude >= 4).length,
    m5Plus: earthquakes.filter(eq => eq.magnitude >= 5).length,
    m6Plus: earthquakes.filter(eq => eq.magnitude >= 6).length,
    avgMagnitude: earthquakes.length > 0
      ? earthquakes.reduce((sum, eq) => sum + eq.magnitude, 0) / earthquakes.length
      : 0,
    maxMagnitude: earthquakes.length > 0
      ? Math.max(...earthquakes.map(eq => eq.magnitude))
      : 0,
    avgDepth: earthquakes.length > 0
      ? earthquakes.reduce((sum, eq) => sum + eq.depth, 0) / earthquakes.length
      : 0,
  };
}

// Fetch earthquakes near a specific location
export async function fetchEarthquakesNearLocation(
  latitude: number,
  longitude: number,
  radiusKm: number = 200,
  days: number = 30,
  minMagnitude: number = 2.0
): Promise<USGSEarthquake[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Don't set endtime - USGS defaults to current time for latest data
  return fetchEarthquakes({
    starttime: startDate.toISOString().split('T')[0],
    latitude,
    longitude,
    maxradiuskm: radiusKm,
    minmagnitude: minMagnitude,
    orderby: 'time',
    limit: 500,
  });
}

// Fetch significant earthquakes (M5+)
export async function fetchSignificantEarthquakes(days: number = 365): Promise<USGSEarthquake[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Don't set endtime - USGS defaults to current time for latest data
  return fetchEarthquakes({
    starttime: startDate.toISOString().split('T')[0],
    minlatitude: PHILIPPINES_BOUNDS.minLatitude,
    maxlatitude: PHILIPPINES_BOUNDS.maxLatitude,
    minlongitude: PHILIPPINES_BOUNDS.minLongitude,
    maxlongitude: PHILIPPINES_BOUNDS.maxLongitude,
    minmagnitude: 5.0,
    orderby: 'time',
    limit: 100,
  });
}

// Fetch historical earthquakes (for a specific year or range)
export async function fetchHistoricalEarthquakes(
  startYear: number,
  endYear: number,
  minMagnitude: number = 5.0
): Promise<USGSEarthquake[]> {
  return fetchEarthquakes({
    starttime: `${startYear}-01-01`,
    endtime: `${endYear}-12-31`,
    minlatitude: PHILIPPINES_BOUNDS.minLatitude,
    maxlatitude: PHILIPPINES_BOUNDS.maxLatitude,
    minlongitude: PHILIPPINES_BOUNDS.minLongitude,
    maxlongitude: PHILIPPINES_BOUNDS.maxLongitude,
    minmagnitude: minMagnitude,
    orderby: 'time',
    limit: 20000,
  });
}

// Process earthquake for display
export interface ProcessedEarthquake {
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
}

export function processEarthquake(eq: USGSEarthquake): ProcessedEarthquake {
  const time = new Date(eq.properties.time);
  
  return {
    id: eq.id,
    magnitude: eq.properties.mag,
    magnitudeType: eq.properties.magType,
    place: eq.properties.place,
    time,
    timeAgo: getTimeAgo(time),
    latitude: eq.geometry.coordinates[1],
    longitude: eq.geometry.coordinates[0],
    depth: eq.geometry.coordinates[2],
    url: eq.properties.url,
    felt: eq.properties.felt,
    tsunami: eq.properties.tsunami === 1,
    alert: eq.properties.alert,
    intensity: getMagnitudeIntensity(eq.properties.mag),
    significanceScore: eq.properties.sig,
  };
}

// Get time ago string
export function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 604800)} weeks ago`;
  if (seconds < 31536000) return `${Math.floor(seconds / 2592000)} months ago`;
  return `${Math.floor(seconds / 31536000)} years ago`;
}

// Get intensity description based on magnitude
export function getMagnitudeIntensity(magnitude: number): string {
  if (magnitude < 2.5) return 'Minor';
  if (magnitude < 4.0) return 'Light';
  if (magnitude < 5.0) return 'Moderate';
  if (magnitude < 6.0) return 'Strong';
  if (magnitude < 7.0) return 'Major';
  if (magnitude < 8.0) return 'Great';
  return 'Extreme';
}

// Get color for magnitude
export function getMagnitudeColor(magnitude: number): string {
  if (magnitude < 2.5) return '#00ff00';
  if (magnitude < 4.0) return '#ffff00';
  if (magnitude < 5.0) return '#ffa500';
  if (magnitude < 6.0) return '#ff6600';
  if (magnitude < 7.0) return '#ff0000';
  if (magnitude < 8.0) return '#990000';
  return '#660000';
}

// Calculate estimated felt distance
export function estimateFeltDistance(magnitude: number): number {
  // Rough estimate: felt distance in km ≈ 10^(0.5*M)
  return Math.round(Math.pow(10, 0.5 * magnitude));
}

// Calculate intensity at distance (simplified MMI calculation)
export function calculateIntensityAtDistance(magnitude: number, distanceKm: number, depthKm: number): number {
  // Simplified Gutenberg-Richter intensity calculation
  const hypocentralDistance = Math.sqrt(distanceKm ** 2 + depthKm ** 2);
  const intensity = 1.5 * magnitude - 2.5 * Math.log10(hypocentralDistance) + 2.5;
  return Math.max(1, Math.min(12, Math.round(intensity)));
}

// Get MMI description
export function getMMIDescription(intensity: number): string {
  const descriptions: { [key: number]: string } = {
    1: 'Not felt',
    2: 'Weak',
    3: 'Weak',
    4: 'Light',
    5: 'Moderate',
    6: 'Strong',
    7: 'Very strong',
    8: 'Severe',
    9: 'Violent',
    10: 'Extreme',
    11: 'Extreme',
    12: 'Extreme',
  };
  return descriptions[intensity] || 'Unknown';
}
