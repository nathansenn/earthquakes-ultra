import { NextRequest, NextResponse } from 'next/server';

// Multi-source earthquake fetching for global data
// Returns GeoJSON format for map compatibility

interface UnifiedEarthquake {
  id: string;
  source: string;
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
}

// USGS API
async function fetchUSGS(hours: number, minMag: number): Promise<UnifiedEarthquake[]> {
  const startTime = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
  const url = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&minmagnitude=${minMag}&starttime=${startTime}&limit=2000&orderby=time`;
  
  try {
    const response = await fetch(url, { next: { revalidate: 60 } });
    if (!response.ok) throw new Error(`USGS: ${response.status}`);
    
    const data = await response.json();
    return data.features.map((f: any) => ({
      id: `usgs_${f.id}`,
      source: 'usgs',
      magnitude: f.properties.mag,
      magnitudeType: f.properties.magType || 'ml',
      place: f.properties.place || 'Unknown',
      time: new Date(f.properties.time),
      latitude: f.geometry.coordinates[1],
      longitude: f.geometry.coordinates[0],
      depth: f.geometry.coordinates[2] || 10,
      url: f.properties.url || `https://earthquake.usgs.gov/earthquakes/eventpage/${f.id}`,
      felt: f.properties.felt,
      tsunami: f.properties.tsunami === 1,
    }));
  } catch (error) {
    console.error('USGS fetch error:', error);
    return [];
  }
}

// EMSC API (Europe-Mediterranean)
async function fetchEMSC(hours: number, minMag: number): Promise<UnifiedEarthquake[]> {
  const startTime = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
  const url = `https://www.seismicportal.eu/fdsnws/event/1/query?format=json&minmagnitude=${minMag}&starttime=${startTime}&limit=1000&orderby=time`;
  
  try {
    const response = await fetch(url, { next: { revalidate: 60 } });
    if (!response.ok) return [];
    
    const data = await response.json();
    return (data.features || []).map((f: any) => ({
      id: `emsc_${f.properties.source_id || f.id}`,
      source: 'emsc',
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
    console.error('EMSC fetch error:', error);
    return [];
  }
}

// Deduplicate earthquakes (same event reported by multiple sources)
function deduplicateEarthquakes(earthquakes: UnifiedEarthquake[]): UnifiedEarthquake[] {
  const seen = new Map<string, UnifiedEarthquake>();
  
  for (const eq of earthquakes) {
    // Create a fuzzy key based on location and time (within 60 seconds and 0.5 degrees)
    const timeKey = Math.round(eq.time.getTime() / 60000); // Round to minute
    const latKey = Math.round(eq.latitude * 2) / 2; // Round to 0.5 degrees
    const lonKey = Math.round(eq.longitude * 2) / 2;
    const magKey = Math.round(eq.magnitude * 10) / 10;
    const key = `${timeKey}_${latKey}_${lonKey}_${magKey}`;
    
    // Prefer USGS data, then EMSC
    const existing = seen.get(key);
    if (!existing || (eq.source === 'usgs' && existing.source !== 'usgs')) {
      seen.set(key, eq);
    }
  }
  
  return Array.from(seen.values()).sort((a, b) => b.time.getTime() - a.time.getTime());
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  const days = parseInt(searchParams.get('days') || '7');
  const minMag = parseFloat(searchParams.get('minmag') || '2.5');
  const hours = days * 24;
  
  try {
    // Fetch from multiple sources in parallel
    const [usgsData, emscData] = await Promise.all([
      fetchUSGS(hours, minMag),
      fetchEMSC(hours, minMag),
    ]);
    
    console.log(`Global API: USGS=${usgsData.length}, EMSC=${emscData.length}`);
    
    // Combine and deduplicate
    const allEarthquakes = [...usgsData, ...emscData];
    const deduplicated = deduplicateEarthquakes(allEarthquakes);
    
    // Convert to GeoJSON
    return NextResponse.json({
      type: 'FeatureCollection',
      metadata: {
        generated: new Date().toISOString(),
        count: deduplicated.length,
        sources: {
          usgs: usgsData.length,
          emsc: emscData.length,
        },
        params: { days, minMag },
      },
      features: deduplicated.map(eq => ({
        type: 'Feature',
        id: eq.id,
        properties: {
          mag: eq.magnitude,
          magType: eq.magnitudeType,
          place: eq.place,
          time: eq.time.getTime(),
          depth: eq.depth,
          source: eq.source,
          felt: eq.felt || null,
          tsunami: eq.tsunami || false,
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
  } catch (error: any) {
    console.error('Global earthquake API error:', error);
    return NextResponse.json({
      error: error.message || 'Failed to fetch global earthquakes',
    }, { status: 500 });
  }
}
