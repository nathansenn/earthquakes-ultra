import { Metadata } from "next";
import Link from "next/link";
import { fetchAllPhilippineEarthquakes, fetchGlobalEarthquakes, processEarthquake, ProcessedEarthquake, calculateStats } from "@/lib/usgs-api";
import { EarthquakeList } from "@/components/earthquake/EarthquakeList";
import { philippineCities, philippineRegions } from "@/data/philippine-cities";

export const metadata: Metadata = {
  title: "Lindol.ph — Real-Time Global Earthquake Monitoring",
  description:
    "Track earthquakes worldwide in real-time. Monitor M1+ seismic activity in the Philippines and globally. Every tremor. Everywhere.",
};

// Revalidate every 5 minutes
export const revalidate = 300;

export default async function HomePage() {
  // Fetch Philippines M1+ earthquakes
  let philippineEarthquakes: ProcessedEarthquake[] = [];
  let globalEarthquakes: ProcessedEarthquake[] = [];
  
  try {
    // Get M1+ earthquakes for Philippines (last 7 days)
    const rawPhilippine = await fetchAllPhilippineEarthquakes(7, 1.0);
    philippineEarthquakes = rawPhilippine.map(processEarthquake);
    
    // Get global M4+ earthquakes (last 7 days)
    const rawGlobal = await fetchGlobalEarthquakes(7, 4.5, 50);
    globalEarthquakes = rawGlobal.map(processEarthquake);
  } catch (error) {
    console.error("Failed to fetch earthquakes:", error);
  }

  // Calculate Philippine stats
  const phStats = calculateStats(philippineEarthquakes);

  // Get significant Philippine earthquakes
  const significantPH = philippineEarthquakes.filter((eq) => eq.magnitude >= 4.0).slice(0, 5);
  
  // Combined recent earthquakes for display
  const recentEarthquakes = [...philippineEarthquakes, ...globalEarthquakes]
    .sort((a, b) => b.time.getTime() - a.time.getTime())
    .slice(0, 10);

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 via-red-900 to-orange-900 text-white overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left content */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-sm mb-6">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                Live M1+ Monitoring
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Every
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400">Tremor.</span>
                <br />
                Everywhere.
              </h1>
              <p className="mt-6 text-lg md:text-xl text-gray-300 max-w-lg">
                Real-time earthquake monitoring for the Philippines and the world. 
                Track M1+ earthquakes across {philippineCities.length} cities and {philippineRegions.length} regions.
              </p>

              {/* CTA Buttons */}
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/near-me"
                  className="px-6 py-3 bg-white text-gray-900 rounded-lg font-semibold hover:bg-yellow-300 transition-colors flex items-center gap-2 shadow-lg"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Earthquakes Near Me
                </Link>
                <Link
                  href="/earthquakes"
                  className="px-6 py-3 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-colors border border-white/30 flex items-center gap-2"
                >
                  <span>📊</span>
                  View All M1+ Data
                </Link>
              </div>

              {/* Stats - M1+ focused */}
              <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                <div className="bg-white/5 rounded-lg p-4 backdrop-blur-sm">
                  <p className="text-3xl md:text-4xl font-bold">{phStats.total}</p>
                  <p className="text-sm text-gray-400">M1+ this week</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4 backdrop-blur-sm">
                  <p className="text-3xl md:text-4xl font-bold">{phStats.last24h}</p>
                  <p className="text-sm text-gray-400">Last 24 hours</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4 backdrop-blur-sm">
                  <p className="text-3xl md:text-4xl font-bold">{phStats.m4Plus}</p>
                  <p className="text-sm text-gray-400">M4+ events</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4 backdrop-blur-sm">
                  <p className="text-3xl md:text-4xl font-bold">{phStats.maxMagnitude.toFixed(1)}</p>
                  <p className="text-sm text-gray-400">Largest</p>
                </div>
              </div>
            </div>

            {/* Right content - Latest Earthquakes */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  Latest Earthquakes
                </h2>
                <Link
                  href="/earthquakes"
                  className="text-sm text-orange-300 hover:text-white transition-colors"
                >
                  View all →
                </Link>
              </div>
              <div className="space-y-3">
                {recentEarthquakes.slice(0, 6).map((eq) => (
                  <a
                    key={eq.id}
                    href={eq.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-sm ${
                        eq.magnitude >= 6
                          ? "bg-gradient-to-br from-red-500 to-red-700 text-white shadow-lg shadow-red-500/30"
                          : eq.magnitude >= 5
                          ? "bg-gradient-to-br from-orange-400 to-orange-600 text-white"
                          : eq.magnitude >= 4
                          ? "bg-gradient-to-br from-yellow-400 to-yellow-600 text-gray-900"
                          : eq.magnitude >= 3
                          ? "bg-gradient-to-br from-green-400 to-green-600 text-white"
                          : "bg-white/20 text-white"
                      }`}
                    >
                      {eq.magnitude.toFixed(1)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{eq.place}</p>
                      <p className="text-xs text-gray-400">{eq.timeAgo} • {eq.depth.toFixed(0)}km deep</p>
                    </div>
                    {eq.tsunami && (
                      <span className="text-xs bg-blue-500/30 text-blue-300 px-2 py-1 rounded">
                        🌊 Tsunami
                      </span>
                    )}
                  </a>
                ))}
                {recentEarthquakes.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-4">
                    Loading earthquake data...
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Wave decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full"
          >
            <path
              d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="white"
              className="dark:fill-gray-950"
            />
          </svg>
        </div>
      </section>

      {/* M1+ Philippine Stats Section */}
      <section className="py-12 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-2xl p-6 md:p-8 border border-red-100 dark:border-red-800/50">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  🇵🇭 Philippines M1+ Earthquakes
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Complete seismic data including micro-earthquakes
                </p>
              </div>
              <Link
                href="/earthquakes"
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                View All Data →
              </Link>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-sm">
                <p className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{phStats.m1Plus}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">M1+</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-sm">
                <p className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{phStats.m2Plus}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">M2+</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-sm">
                <p className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{phStats.m3Plus}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">M3+</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-sm">
                <p className="text-2xl md:text-3xl font-bold text-yellow-600">{phStats.m4Plus}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">M4+</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-sm">
                <p className="text-2xl md:text-3xl font-bold text-orange-600">{phStats.m5Plus}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">M5+</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-sm">
                <p className="text-2xl md:text-3xl font-bold text-red-600">{phStats.m6Plus}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">M6+</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Earthquakes Section */}
      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                Recent Earthquakes
              </h2>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Last 7 days • All magnitudes
              </p>
            </div>
            <Link
              href="/earthquakes"
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              View All
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>

          <EarthquakeList earthquakes={philippineEarthquakes.slice(0, 10)} />

          <div className="mt-8 text-center sm:hidden">
            <Link
              href="/earthquakes"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-orange-600 text-white rounded-lg hover:from-red-600 hover:to-orange-700 transition-all"
            >
              View All Earthquakes
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Browse by Region Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Browse by Region
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Monitor seismic activity in Philippine regions
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {philippineRegions.slice(0, 8).map((region) => (
              <Link
                key={region.slug}
                href={`/region/${region.slug}`}
                className="group p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-600 hover:shadow-lg transition-all"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                  {region.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Region {region.code}
                </p>
              </Link>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/philippines"
              className="inline-flex items-center gap-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium"
            >
              View all {philippineRegions.length} regions
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Why Lindol.ph?
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Complete earthquake information at your fingertips
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                M1+ Comprehensive Data
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Track ALL earthquakes including micro-earthquakes. Most sites only show M4+. We show M1+.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🇵🇭</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Philippines Focus
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Detailed coverage for all {philippineCities.length} Philippine cities and {philippineRegions.length} regions. Built for Filipinos.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Real-time Updates
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Data refreshed every minute from USGS. Get the latest seismic activity as it happens.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🗺️</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Interactive Maps
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Visualize earthquakes on 2D maps and 3D globe with tectonic plate boundaries.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🌋</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Volcano Monitoring
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Track volcanic activity and seismic-volcanic correlations for Philippine volcanoes.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl">
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📚</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Safety Resources
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Access earthquake preparedness guides and learn what to do before, during, and after.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-red-600 to-orange-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Stay Informed, Stay Safe
          </h2>
          <p className="text-lg text-red-100 mb-8">
            &quot;Lindol&quot; is Filipino for earthquake. We track every tremor so you don&apos;t have to worry.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/near-me"
              className="px-8 py-3 bg-white text-red-600 rounded-lg font-semibold hover:bg-yellow-300 transition-colors"
            >
              Find Earthquakes Near Me
            </Link>
            <Link
              href="/preparedness"
              className="px-8 py-3 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-colors border border-white/30"
            >
              Preparedness Guide
            </Link>
          </div>
        </div>
      </section>

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "Lindol.ph",
            alternateName: "Lindol Philippines",
            description: "Real-time earthquake monitoring for the Philippines",
            url: "https://lindol.ph",
            inLanguage: ["en", "fil"],
            potentialAction: {
              "@type": "SearchAction",
              target: "https://lindol.ph/search?q={search_term_string}",
              "query-input": "required name=search_term_string",
            },
          }),
        }}
      />
    </>
  );
}
