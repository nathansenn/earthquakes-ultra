import { Metadata } from "next";
import Link from "next/link";
import { fetchGlobalEarthquakesMultiSource, convertToProcessed, calculateMultiSourceStats } from "@/lib/multi-source-api";
import { EarthquakeList } from "@/components/earthquake/EarthquakeList";

export const metadata: Metadata = {
  title: "Global Earthquakes - Multi-Source Real-Time Data",
  description:
    "View all earthquakes worldwide in real-time from 5 sources: USGS, EMSC, JMA, GeoNet, and PHIVOLCS. Comprehensive M1+ global seismic monitoring.",
};

export const revalidate = 1800;

export default async function GlobalPage() {
  // Fetch from all sources - 7 days of M2.5+ data
  const rawEarthquakes = await fetchGlobalEarthquakesMultiSource(168, 2.5);
  const earthquakes = rawEarthquakes.map(convertToProcessed);
  const stats = calculateMultiSourceStats(rawEarthquakes);

  // Stats by magnitude
  const m4Plus = earthquakes.filter(eq => eq.magnitude >= 4).length;
  const m5Plus = earthquakes.filter(eq => eq.magnitude >= 5).length;
  const m6Plus = earthquakes.filter(eq => eq.magnitude >= 6).length;
  const m7Plus = earthquakes.filter(eq => eq.magnitude >= 7).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <section className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">🌍</span>
            <h1 className="text-3xl md:text-4xl font-bold">Global Earthquakes</h1>
          </div>
          <p className="text-gray-300 max-w-2xl">
            Real-time earthquake data from 5 sources: USGS, EMSC, JMA, GeoNet & PHIVOLCS. 
            Showing M2.5+ earthquakes from the last 7 days.
          </p>
          
          {/* Quick Stats */}
          <div className="mt-6 flex flex-wrap gap-4">
            <div className="bg-white/10 rounded-lg px-4 py-2">
              <span className="text-2xl font-bold">{earthquakes.length}</span>
              <span className="text-sm text-gray-300 ml-2">Total M2.5+</span>
            </div>
            <div className="bg-white/10 rounded-lg px-4 py-2">
              <span className="text-2xl font-bold">{m4Plus}</span>
              <span className="text-sm text-gray-300 ml-2">M4+</span>
            </div>
            <div className="bg-white/10 rounded-lg px-4 py-2">
              <span className="text-2xl font-bold">{m5Plus}</span>
              <span className="text-sm text-gray-300 ml-2">M5+</span>
            </div>
            <div className="bg-orange-500/30 rounded-lg px-4 py-2">
              <span className="text-2xl font-bold">{m6Plus}</span>
              <span className="text-sm text-gray-300 ml-2">M6+ Significant</span>
            </div>
            {m7Plus > 0 && (
              <div className="bg-red-500/30 rounded-lg px-4 py-2">
                <span className="text-2xl font-bold">{m7Plus}</span>
                <span className="text-sm text-gray-300 ml-2">M7+ Major</span>
              </div>
            )}
          </div>
          
          {/* Source Breakdown */}
          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            {Object.entries(stats.bySource).map(([source, count]) => (
              <span key={source} className="bg-white/5 px-2 py-1 rounded text-gray-400">
                {source.toUpperCase()}: {count}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Navigation */}
          <div className="mb-8 flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-2">
              <Link
                href="/globe"
                className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 border border-gray-200 dark:border-gray-700"
              >
                <span>🌐</span>
                3D Globe View
              </Link>
              <Link
                href="/map"
                className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 border border-gray-200 dark:border-gray-700"
              >
                <span>🗺️</span>
                Map View
              </Link>
              <Link
                href="/earthquakes"
                className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 border border-gray-200 dark:border-gray-700"
              >
                <span>📊</span>
                M1+ Data
              </Link>
              <Link
                href="/countries"
                className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 border border-gray-200 dark:border-gray-700"
              >
                Browse by Country
              </Link>
            </div>
          </div>

          {/* Earthquake List */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              All Earthquakes ({earthquakes.length})
            </h2>
            <EarthquakeList earthquakes={earthquakes} />
          </div>

          {/* Info Box */}
          <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Multi-Source Data Coverage
            </h3>
            <ul className="text-blue-800 dark:text-blue-200 text-sm space-y-1">
              <li>• <strong>USGS:</strong> Global M2.5+ coverage, US M1+ detailed</li>
              <li>• <strong>EMSC:</strong> Europe, Mediterranean, Middle East M1.5+</li>
              <li>• <strong>JMA:</strong> Japan full M1+ coverage</li>
              <li>• <strong>GeoNet:</strong> New Zealand full M1+ coverage</li>
              <li>• <strong>PHIVOLCS:</strong> Philippines M1+ (via EMSC)</li>
            </ul>
            <p className="text-blue-800 dark:text-blue-200 text-sm mt-3">
              Data is deduplicated automatically. For M1+ micro-earthquakes in specific regions, 
              visit the individual country pages.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
