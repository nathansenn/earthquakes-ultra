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

const USGS_BASE_URL = 'https://earthquake.usgs.gov/fdsnws/event/1/query';

export async function fetchEarthquakes(query: EarthquakeQuery = {}): Promise<USGSEarthquake[]> {
  const params = new URLSearchParams({
    format: 'geojson',
    ...Object.fromEntries(
      Object.entries(query)
        .filter(([_, v]) => v !== undefined)
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
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return fetchEarthquakes({
    starttime: startDate.toISOString().split('T')[0],
    endtime: endDate.toISOString().split('T')[0],
    minlatitude: PHILIPPINES_BOUNDS.minLatitude,
    maxlatitude: PHILIPPINES_BOUNDS.maxLatitude,
    minlongitude: PHILIPPINES_BOUNDS.minLongitude,
    maxlongitude: PHILIPPINES_BOUNDS.maxLongitude,
    minmagnitude: minMagnitude,
    orderby: 'time',
    limit: 1000,
  });
}

// Fetch earthquakes near a specific location
export async function fetchEarthquakesNearLocation(
  latitude: number,
  longitude: number,
  radiusKm: number = 200,
  days: number = 30,
  minMagnitude: number = 2.0
): Promise<USGSEarthquake[]> {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return fetchEarthquakes({
    starttime: startDate.toISOString().split('T')[0],
    endtime: endDate.toISOString().split('T')[0],
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
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return fetchEarthquakes({
    starttime: startDate.toISOString().split('T')[0],
    endtime: endDate.toISOString().split('T')[0],
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
function getTimeAgo(date: Date): string {
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
