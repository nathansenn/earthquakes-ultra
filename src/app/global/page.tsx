import { Metadata } from "next";
import Link from "next/link";
import { fetchGlobalEarthquakes, processEarthquake } from "@/lib/usgs-api";
import { EarthquakeList } from "@/components/earthquake/EarthquakeList";
import EarthquakeFilters from "@/components/filters/EarthquakeFilters";

export const metadata: Metadata = {
  title: "Global Earthquakes - All Worldwide Seismic Activity",
  description:
    "View all earthquakes worldwide in real-time. Filter by magnitude, time range, and region. Comprehensive global seismic monitoring from USGS data.",
};

export const revalidate = 60;

export default async function GlobalPage() {
  const rawEarthquakes = await fetchGlobalEarthquakes(7, 4.0, 500);
  const earthquakes = rawEarthquakes.map(processEarthquake);

  // Stats
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
            Real-time earthquake data from around the world. Showing M4.0+ earthquakes from the last 7 days.
          </p>
          
          {/* Quick Stats */}
          <div className="mt-6 flex flex-wrap gap-4">
            <div className="bg-white/10 rounded-lg px-4 py-2">
              <span className="text-2xl font-bold">{earthquakes.length}</span>
              <span className="text-sm text-gray-300 ml-2">Total M4+</span>
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
              About This Data
            </h3>
            <p className="text-blue-800 dark:text-blue-200 text-sm">
              Earthquake data is sourced from the United States Geological Survey (USGS) and updated every minute. 
              This page shows M4.0+ earthquakes from the past 7 days. For smaller earthquakes, visit specific 
              country or city pages where M2.5+ data is available.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
