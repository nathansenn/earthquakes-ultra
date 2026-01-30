import { Metadata } from 'next';
import { fetchAllPhilippineEarthquakes, processEarthquake } from '@/lib/usgs-api';
import EarthquakeGlobe from '@/components/globe/EarthquakeGlobe';
import Link from 'next/link';
import EarthquakeTicker from '@/components/globe/EarthquakeTicker';

export const metadata: Metadata = {
  title: '3D Earthquake Globe',
  description: 'View earthquakes around the world on an interactive 3D globe. Watch real-time seismic activity with pulsing indicators for recent earthquakes. M1+ data available.',
  openGraph: {
    title: '3D Earthquake Globe | QuakeGlobe',
    description: 'Interactive 3D visualization of global earthquake activity',
  },
};

export const revalidate = 1800; // 30 minutes

export default async function GlobePage() {
  // Get M1+ earthquakes from the last 24 hours
  const rawEarthquakes = await fetchAllPhilippineEarthquakes(1, 1.0);
  const earthquakes = rawEarthquakes.map(processEarthquake);

  const lastHourCount = earthquakes.filter(
    eq => new Date(eq.time) > new Date(Date.now() - 60 * 60 * 1000)
  ).length;

  const significantCount = earthquakes.filter(eq => eq.magnitude >= 5.0).length;

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <nav className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                <Link href="/" className="hover:text-red-400 transition-colors">Home</Link>
                <span>/</span>
                <span className="text-white">3D Globe</span>
              </nav>
              <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
                <span className="text-4xl">🌍</span>
                Live Earthquake Globe
              </h1>
              <p className="mt-2 text-gray-400">
                Real-time visualization of seismic activity in the Philippines
              </p>
            </div>
            <div className="flex gap-4">
              <div className="bg-gray-800/50 rounded-xl px-4 py-3 text-center">
                <p className="text-2xl font-bold text-red-400">{earthquakes.length}</p>
                <p className="text-xs text-gray-400">M1+ (24h)</p>
              </div>
              <div className="bg-gray-800/50 rounded-xl px-4 py-3 text-center">
                <p className="text-2xl font-bold text-orange-400">{lastHourCount}</p>
                <p className="text-xs text-gray-400">Last Hour</p>
              </div>
              <div className="bg-gray-800/50 rounded-xl px-4 py-3 text-center">
                <p className="text-2xl font-bold text-yellow-400">{significantCount}</p>
                <p className="text-xs text-gray-400">M5.0+</p>
              </div>
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
