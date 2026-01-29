import { Metadata } from "next";
import Link from "next/link";
import { fetchGlobalEarthquakes, fetchGlobalStats, processEarthquake, ProcessedEarthquake } from "@/lib/usgs-api";
import { EarthquakeList } from "@/components/earthquake/EarthquakeList";
import { seismicCountries, seismicRegions } from "@/data/countries";
import { majorCities, getCitiesByPopulation } from "@/data/major-cities";

export const metadata: Metadata = {
  title: "QuakeWatch - Global Earthquake Monitoring in Real-Time",
  description:
    "Track earthquakes worldwide in real-time. Monitor seismic activity across all countries, major cities, and tectonic regions. Get instant alerts and stay prepared.",
};

// Revalidate every 5 minutes
export const revalidate = 300;

export default async function HomePage() {
  // Fetch global earthquakes
  let earthquakes: ProcessedEarthquake[] = [];
  let stats = { total: 0, m4Plus: 0, m5Plus: 0, m6Plus: 0, m7Plus: 0, largest: null as ProcessedEarthquake | null };
  
  try {
    const rawEarthquakes = await fetchGlobalEarthquakes(7, 4.5, 100);
    earthquakes = rawEarthquakes.map(processEarthquake);
    
    const globalStats = await fetchGlobalStats(7);
    stats = {
      ...globalStats,
      largest: globalStats.largest ? processEarthquake(globalStats.largest) : null,
    };
  } catch (error) {
    console.error("Failed to fetch earthquakes:", error);
  }

  // Get significant earthquakes
  const significantEarthquakes = earthquakes.filter((eq) => eq.magnitude >= 5.5).slice(0, 5);
  
  // Get top cities by population
  const topCities = getCitiesByPopulation(12);
  
  // Get extreme risk countries
  const extremeRiskCountries = seismicCountries.filter(c => c.riskLevel === 'extreme').slice(0, 12);

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
                Live Global Monitoring
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Global
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400">Earthquake</span>
                <br />
                Monitoring
              </h1>
              <p className="mt-6 text-lg md:text-xl text-gray-300 max-w-lg">
                Track seismic activity worldwide in real-time. Monitor {seismicCountries.length} countries, {majorCities.length}+ major cities, and get instant alerts for significant earthquakes.
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
                  href="/globe"
                  className="px-6 py-3 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-colors border border-white/30 flex items-center gap-2"
                >
                  <span>🌐</span>
                  View 3D Globe
                </Link>
              </div>

              {/* Stats */}
              <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                <div className="bg-white/5 rounded-lg p-4 backdrop-blur-sm">
                  <p className="text-3xl md:text-4xl font-bold">{stats.m4Plus || earthquakes.length}</p>
                  <p className="text-sm text-gray-400">M4+ this week</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4 backdrop-blur-sm">
                  <p className="text-3xl md:text-4xl font-bold">{stats.m5Plus || significantEarthquakes.length}</p>
                  <p className="text-sm text-gray-400">M5+ events</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4 backdrop-blur-sm">
                  <p className="text-3xl md:text-4xl font-bold">{seismicCountries.length}</p>
                  <p className="text-sm text-gray-400">Countries monitored</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4 backdrop-blur-sm">
                  <p className="text-3xl md:text-4xl font-bold">{majorCities.length}+</p>
                  <p className="text-sm text-gray-400">Cities tracked</p>
                </div>
              </div>
            </div>

            {/* Right content - Latest Significant Earthquakes */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  Latest Significant Earthquakes
                </h2>
                <Link
                  href="/global"
                  className="text-sm text-orange-300 hover:text-white transition-colors"
                >
                  View all →
                </Link>
              </div>
              <div className="space-y-3">
                {earthquakes.slice(0, 6).map((eq) => (
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
                {earthquakes.length === 0 && (
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

      {/* Recent Global Earthquakes Section */}
      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                Recent Global Earthquakes
              </h2>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Last 7 days • Magnitude 4.5 and above
              </p>
            </div>
            <Link
              href="/global"
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

          <EarthquakeList earthquakes={earthquakes.slice(0, 10)} />

          <div className="mt-8 text-center sm:hidden">
            <Link
              href="/global"
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
              Explore by Region
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Monitor seismic activity in specific geographic regions
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {seismicRegions.map((region) => (
              <Link
                key={region.slug}
                href={`/region/${region.slug}`}
                className="group p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-600 hover:shadow-lg transition-all"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                  {region.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {region.countries.length} countries
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* High-Risk Countries Section */}
      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Highest Seismic Risk Countries
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Countries on the Pacific Ring of Fire and major fault zones
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {extremeRiskCountries.map((country) => (
              <Link
                key={country.slug}
                href={`/country/${country.slug}`}
                className="group p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-600 hover:shadow-lg transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center group-hover:bg-red-200 dark:group-hover:bg-red-800/30 transition-colors">
                    <span className="text-lg">🌍</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                      {country.name}
                    </h3>
                    <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                      Extreme Risk
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/countries"
              className="inline-flex items-center gap-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium"
            >
              View all {seismicCountries.length} countries
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

      {/* Major Cities Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Major Cities in Seismic Zones
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Track earthquakes near the world's most at-risk metropolitan areas
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {topCities.map((city) => (
              <Link
                key={city.slug}
                href={`/city/${city.slug}`}
                className="group p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-600 hover:shadow-lg transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center group-hover:bg-orange-200 dark:group-hover:bg-orange-800/30 transition-colors">
                    <svg
                      className="w-5 h-5 text-orange-600 dark:text-orange-400"
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
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                      {city.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {city.country}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/cities"
              className="inline-flex items-center gap-2 text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-medium"
            >
              View all {majorCities.length} cities
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
              Why Use QuakeWatch?
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Comprehensive global earthquake information at your fingertips
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🌍</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Global Coverage
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Monitor earthquakes worldwide with data from USGS covering every continent and ocean.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Real-time Updates
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Data refreshed every minute with automatic alerts for significant seismic events.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🗺️</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Interactive Maps
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Visualize earthquakes on 2D maps and 3D globe with tectonic plate boundaries.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📍</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Location-based
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Find earthquakes near any city or use your current location for personalized monitoring.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Statistical Analysis
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                View trends, historical data, and seismic risk assessments for any region.
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
            Whether you're in Tokyo, Los Angeles, Istanbul, or Manila — QuakeWatch keeps you informed about seismic activity in real-time.
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
            name: "QuakeWatch",
            description: "Global earthquake monitoring in real-time",
            url: "https://quakewatch.io",
            potentialAction: {
              "@type": "SearchAction",
              target: "https://quakewatch.io/search?q={search_term_string}",
              "query-input": "required name=search_term_string",
            },
          }),
        }}
      />
    </>
  );
}
