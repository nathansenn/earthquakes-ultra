import { Metadata } from "next";
import Link from "next/link";
import { fetchPhilippineEarthquakes, processEarthquake, ProcessedEarthquake } from "@/lib/usgs-api";
import { EarthquakeList } from "@/components/earthquake/EarthquakeList";

export const metadata: Metadata = {
  title: "Recent Earthquakes in the Philippines",
  description:
    "View all recent earthquakes in the Philippines. Complete list with magnitude, location, depth, and time. Updated in real-time from USGS data.",
  openGraph: {
    title: "Recent Earthquakes in the Philippines | Lindol.ph",
    description: "View all recent earthquakes in the Philippines with real-time data from USGS.",
  },
};

export const revalidate = 60; // Revalidate every minute

export default async function EarthquakesPage() {
  let earthquakes: ProcessedEarthquake[] = [];
  let error: string | null = null;

  try {
    const rawEarthquakes = await fetchPhilippineEarthquakes(30, 2.0);
    earthquakes = rawEarthquakes.map(processEarthquake);
  } catch (err) {
    error = "Failed to fetch earthquake data. Please try again later.";
    console.error("Failed to fetch earthquakes:", err);
  }

  // Stats
  const totalCount = earthquakes.length;
  const significantCount = earthquakes.filter((eq) => eq.magnitude >= 5.0).length;
  const strongCount = earthquakes.filter((eq) => eq.magnitude >= 4.0 && eq.magnitude < 5.0).length;
  const avgMagnitude = earthquakes.length > 0
    ? earthquakes.reduce((sum, eq) => sum + eq.magnitude, 0) / earthquakes.length
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <section className="bg-gradient-to-br from-red-600 to-red-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Recent Earthquakes</h1>
              <p className="text-red-100">Last 30 days • Philippines</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-3xl font-bold">{totalCount}</p>
              <p className="text-sm text-red-100">Total earthquakes</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-3xl font-bold">{significantCount}</p>
              <p className="text-sm text-red-100">M5.0+ events</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-3xl font-bold">{strongCount}</p>
              <p className="text-sm text-red-100">M4.0-4.9 events</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-3xl font-bold">{avgMagnitude.toFixed(1)}</p>
              <p className="text-sm text-red-100">Avg. magnitude</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap gap-3">
            <Link
              href="/near-me"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              Near Me
            </Link>
            <Link
              href="/map"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              View Map
            </Link>
            <Link
              href="/alerts"
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2 text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              Set Up Alerts
            </Link>
          </div>
        </div>
      </section>

      {/* Earthquake List */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {error ? (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
              <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-800 dark:text-red-200">{error}</p>
            </div>
          ) : earthquakes.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Recent Earthquakes</h2>
              <p className="text-gray-600 dark:text-gray-400">No earthquakes detected in the Philippines in the past 30 days.</p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <p className="text-gray-600 dark:text-gray-400">
                  Showing {earthquakes.length} earthquakes from the past 30 days. Data from USGS.
                </p>
              </div>
              <EarthquakeList earthquakes={earthquakes} />
            </>
          )}
        </div>
      </section>

      {/* Educational Section */}
      <section className="py-12 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Understanding Earthquake Magnitudes
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold">2-3</div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Minor</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Generally not felt</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center text-gray-900 font-bold">3-4</div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Light</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Felt by many, no damage</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold">4-5</div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Moderate</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Minor damage possible</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold">5+</div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Strong to Major</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Serious damage possible</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 text-center">
            <Link
              href="/preparedness"
              className="text-red-600 dark:text-red-400 hover:underline font-medium"
            >
              Learn how to prepare for earthquakes →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
