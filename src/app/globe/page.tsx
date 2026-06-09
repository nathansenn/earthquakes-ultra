import { Metadata } from 'next';
import { fetchGlobalEarthquakesMultiSource, convertToProcessed } from '@/lib/multi-source-api';
import EarthquakeGlobe from '@/components/globe/EarthquakeGlobe';
import Link from 'next/link';
import EarthquakeTicker from '@/components/globe/EarthquakeTicker';

export const metadata: Metadata = {
  title: '3D Earthquake Globe - Global Real-Time View',
  description: 'View earthquakes around the world on an interactive 3D globe. Watch real-time seismic activity from 5 data sources with pulsing indicators for recent earthquakes.',
  openGraph: {
    title: '3D Earthquake Globe | QuakeGlobe',
    description: 'Interactive 3D visualization of global earthquake activity from multiple sources',
  },
};

export const revalidate = 1800; // 30 minutes

export default async function GlobePage() {
  // Get M1+ earthquakes from the last 24 hours - multi-source
  const rawEarthquakes = await fetchGlobalEarthquakesMultiSource(24, 1.0);
  const earthquakes = rawEarthquakes.map(convertToProcessed);

  const lastHourCount = earthquakes.filter(
    eq => eq.time > new Date(Date.now() - 60 * 60 * 1000)
  ).length;

  const significantCount = earthquakes.filter(eq => eq.magnitude >= 5.0).length;
  
  // Count by source
  const sourceCount = rawEarthquakes.reduce((acc, eq) => {
    acc[eq.source] = (acc[eq.source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="border-b border-white/10 bg-gradient-to-b from-gray-900 to-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
            <div>
              <nav className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                <Link href="/" className="hover:text-red-400 transition-colors">Home</Link>
                <span className="text-gray-600">/</span>
                <span className="text-gray-200">3D Globe</span>
              </nav>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/15 px-2.5 py-1 text-xs font-semibold text-red-300 ring-1 ring-red-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                  LIVE
                </span>
                Earthquake Globe
              </h1>
              <p className="mt-2 text-sm text-gray-400">
                Real-time global seismic activity · USGS, EMSC, JMA &amp; GeoNet
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 lg:gap-3">
              {[
                { v: earthquakes.length, l: 'M1+ · 24h', c: 'text-red-400' },
                { v: lastHourCount, l: 'Last hour', c: 'text-orange-400' },
                { v: significantCount, l: 'M5.0+', c: 'text-yellow-400' },
                { v: Object.keys(sourceCount).length, l: 'Sources', c: 'text-sky-400' },
              ].map((s) => (
                <div
                  key={s.l}
                  className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-center min-w-[88px]"
                >
                  <p className={`text-2xl font-bold tabular-nums ${s.c}`}>{s.v}</p>
                  <p className="text-[11px] uppercase tracking-wide text-gray-500">{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Globe Container */}
      <div className="h-[calc(100vh-180px)] min-h-[600px] p-4">
        <EarthquakeGlobe 
          earthquakes={earthquakes.map(eq => ({
            id: eq.id,
            latitude: eq.latitude,
            longitude: eq.longitude,
            magnitude: eq.magnitude,
            place: eq.place,
            time: eq.time,
            depth: eq.depth,
          }))}
          autoRotate={true}
          showLabels={true}
        />
      </div>

      {/* Recent Earthquakes Ticker */}
      <EarthquakeTicker earthquakes={earthquakes.slice(0, 20)} />
    </div>
  );
}
