import { Metadata } from "next";
import Link from "next/link";
import { fetchAllPhilippineEarthquakes, fetchGlobalM1Earthquakes, fetchGlobalEarthquakes, processEarthquake, ProcessedEarthquake, calculateStats, getMagnitudeColor, getTimeAgo, getMagnitudeIntensity } from "@/lib/usgs-api";
import { fetchGlobalEarthquakesMultiSource, calculateMultiSourceStats, UnifiedEarthquake } from "@/lib/multi-source-api";
import { EarthquakeList } from "@/components/earthquake/EarthquakeList";
import { philippineCities, philippineRegions } from "@/data/philippine-cities";
import { PHILIPPINE_VOLCANOES, getVolcanoesByPriority } from "@/data/philippine-volcanoes";
import { philippineFaultLines } from "@/data/fault-lines";

export const metadata: Metadata = {
  title: "QuakeGlobe — Real-Time Global Earthquake Monitoring",
  description:
    "Track earthquakes worldwide in real-time. Monitor M1+ seismic activity across the globe, from micro-tremors to major events. Every tremor. Everywhere.",
  keywords: [
    "earthquake tracker",
    "global earthquake",
    "earthquake monitor",
    "earthquake map",
    "seismic activity",
    "USGS earthquake",
    "earthquake near me",
    "real-time earthquake",
    "earthquake alert",
    "world earthquake",
    "live earthquake",
    "quake tracker",
  ],
};

// Revalidate every 5 minutes
export const revalidate = 300;

export default async function HomePage() {
  // Fetch global M1+ earthquakes from multiple sources (last 24h)
  let globalM1Earthquakes: ProcessedEarthquake[] = [];
  let multiSourceEarthquakes: UnifiedEarthquake[] = [];
  let philippineEarthquakes: ProcessedEarthquake[] = [];
  let significantGlobal: ProcessedEarthquake[] = [];
  
  try {
    // Get global M1+ earthquakes from ALL sources (USGS, EMSC, JMA, GeoNet)
    multiSourceEarthquakes = await fetchGlobalEarthquakesMultiSource(24, 1.0);
    
    // Convert to ProcessedEarthquake format for compatibility
    globalM1Earthquakes = multiSourceEarthquakes.map(eq => ({
      id: eq.id,
      magnitude: eq.magnitude,
      magnitudeType: eq.magnitudeType,
      place: eq.place,
      time: eq.time,
      timeAgo: getTimeAgo(eq.time),
      latitude: eq.latitude,
      longitude: eq.longitude,
      depth: eq.depth,
      url: eq.url,
      felt: eq.felt || null,
      tsunami: eq.tsunami || false,
      alert: null,
      intensity: getMagnitudeIntensity(eq.magnitude),
      significanceScore: Math.round(eq.magnitude * 100),
    }));
    
    // Get M1+ earthquakes for Philippines (last 7 days) - featured region
    const rawPhilippine = await fetchAllPhilippineEarthquakes(7, 1.0);
    philippineEarthquakes = rawPhilippine.map(processEarthquake);
    
    // Get global M4.5+ earthquakes (last 7 days) for significant events
    const rawSignificant = await fetchGlobalEarthquakes(7, 4.5, 100);
    significantGlobal = rawSignificant.map(processEarthquake);
  } catch (error) {
    console.error("Failed to fetch earthquakes:", error);
  }

  // Calculate global stats from multi-source data (last 24h)
  const multiStats = calculateMultiSourceStats(multiSourceEarthquakes);
  const globalStats = {
    total: multiStats.total,
    last24h: multiStats.total,
    m1Plus: multiStats.m1Plus,
    m2Plus: multiStats.m2Plus,
    m3Plus: multiStats.m3Plus,
    m4Plus: multiStats.m4Plus,
    m5Plus: multiStats.m5Plus,
    m6Plus: multiStats.m6Plus,
    avgMagnitude: globalM1Earthquakes.length > 0 
      ? globalM1Earthquakes.reduce((sum, eq) => sum + eq.magnitude, 0) / globalM1Earthquakes.length 
      : 0,
    maxMagnitude: multiStats.largest?.magnitude || 0,
    avgDepth: globalM1Earthquakes.length > 0
      ? globalM1Earthquakes.reduce((sum, eq) => sum + eq.depth, 0) / globalM1Earthquakes.length
      : 0,
  };
  
  // Calculate Philippine stats (last 7 days)
  const phStats = calculateStats(philippineEarthquakes);
  
  // Significant earthquake stats
  const globalM5Plus = significantGlobal.filter(eq => eq.magnitude >= 5).length;
  const globalM6Plus = significantGlobal.filter(eq => eq.magnitude >= 6).length;

  // Recent earthquakes - prioritize larger magnitudes for global view
  const recentEarthquakes = [...globalM1Earthquakes]
    .sort((a, b) => b.time.getTime() - a.time.getTime())
    .slice(0, 10);

  // Get volcanoes with elevated risk
  const prioritizedVolcanoes = getVolcanoesByPriority();
  const elevatedVolcanoes = prioritizedVolcanoes.filter(v => v.alertLevel > 0 || v.hydrothermalActivity >= 2).slice(0, 5);

  // Get active fault count (Philippines)
  const activeFaults = philippineFaultLines.filter(f => f.type === 'active').length;

  // Get largest earthquake today
  const largestToday = globalM1Earthquakes.length > 0
    ? globalM1Earthquakes.reduce((max, eq) => eq.magnitude > max.magnitude ? eq : max)
    : null;

  // Count by continent/region (rough approximation by longitude)
  const regionCounts = {
    americas: globalM1Earthquakes.filter(eq => eq.longitude >= -180 && eq.longitude < -30).length,
    europe: globalM1Earthquakes.filter(eq => eq.longitude >= -30 && eq.longitude < 60 && eq.latitude > 35).length,
    asia: globalM1Earthquakes.filter(eq => eq.longitude >= 60 && eq.longitude < 150).length,
    pacific: globalM1Earthquakes.filter(eq => eq.longitude >= 150 || eq.longitude < -120).length,
  };

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 text-white overflow-hidden">
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
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-sm mb-6 backdrop-blur-sm">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                Live Global M1+ Monitoring
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Every
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400">Tremor.</span>
                <br />
                Everywhere.
              </h1>
              <p className="mt-6 text-lg md:text-xl text-gray-300 max-w-lg">
                Real-time earthquake monitoring for the entire planet. 
                Track M1+ seismic activity from micro-tremors to major quakes, updated every minute.
              </p>

              {/* CTA Buttons */}
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/near-me"
                  className="px-6 py-3 bg-white text-gray-900 rounded-lg font-semibold hover:bg-cyan-300 transition-colors flex items-center gap-2 shadow-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Earthquakes Near Me
                </Link>
                <Link
                  href="/globe"
                  className="px-6 py-3 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-colors border border-white/30 flex items-center gap-2 backdrop-blur-sm"
                >
                  <span>🌍</span>
                  View 3D Globe
                </Link>
              </div>

              {/* Hero Stats - Global */}
              <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/5 rounded-lg p-4 backdrop-blur-sm border border-white/10">
                  <p className="text-3xl md:text-4xl font-bold">{globalStats.total.toLocaleString()}</p>
                  <p className="text-sm text-gray-400">Last 24h</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4 backdrop-blur-sm border border-white/10">
                  <p className="text-3xl md:text-4xl font-bold">{globalStats.m4Plus}</p>
                  <p className="text-sm text-gray-400">M4+ Today</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4 backdrop-blur-sm border border-white/10">
                  <p className="text-3xl md:text-4xl font-bold text-yellow-400">{globalM5Plus}</p>
                  <p className="text-sm text-gray-400">M5+ (7d)</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4 backdrop-blur-sm border border-white/10">
                  <p className="text-3xl md:text-4xl font-bold text-orange-400">{largestToday?.magnitude.toFixed(1) || '0.0'}</p>
                  <p className="text-sm text-gray-400">Largest Today</p>
                </div>
              </div>
            </div>

            {/* Right content - Live Global Feed */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  Latest Earthquakes Worldwide
                </h2>
                <Link href="/earthquakes" className="text-sm text-cyan-300 hover:text-white transition-colors">
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
                      className="w-12 h-12 rounded-lg flex items-center justify-center font-bold text-sm shadow-lg"
                      style={{ backgroundColor: getMagnitudeColor(eq.magnitude), color: eq.magnitude >= 4 ? 'white' : '#1f2937' }}
                    >
                      {eq.magnitude.toFixed(1)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{eq.place}</p>
                      <p className="text-xs text-gray-400">{eq.timeAgo} • {eq.depth.toFixed(0)}km deep</p>
                    </div>
                    {eq.tsunami && (
                      <span className="text-xs bg-blue-500/30 text-blue-300 px-2 py-1 rounded">
                        🌊
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
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path
              d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="white"
              className="dark:fill-gray-950"
            />
          </svg>
        </div>
      </section>

      {/* Global Dashboard */}
      <section className="py-12 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Global Overview */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 md:p-8 border border-blue-100 dark:border-blue-800/50 mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  🌍 Global Earthquake Dashboard
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Complete seismic data from around the world — last 24 hours
                </p>
              </div>
              <Link
                href="/global"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                View Global Map →
              </Link>
            </div>
            
            {/* Magnitude Breakdown */}
            <div className="grid grid-cols-3 md:grid-cols-7 gap-3 mb-6">
              {[
                { label: 'M1+', count: globalStats.m1Plus, color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
                { label: 'M2+', count: globalStats.m2Plus, color: 'bg-lime-100 text-lime-800 dark:bg-lime-900/30 dark:text-lime-300' },
                { label: 'M3+', count: globalStats.m3Plus, color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
                { label: 'M4+', count: globalStats.m4Plus, color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' },
                { label: 'M5+', count: globalStats.m5Plus, color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
                { label: 'M6+', count: globalStats.m6Plus, color: 'bg-red-200 text-red-900 dark:bg-red-800/30 dark:text-red-200' },
                { label: 'Avg Depth', count: `${globalStats.avgDepth.toFixed(0)}km`, color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
              ].map((item) => (
                <div key={item.label} className={`${item.color} rounded-xl p-3 text-center`}>
                  <p className="text-xl md:text-2xl font-bold">{typeof item.count === 'number' ? item.count.toLocaleString() : item.count}</p>
                  <p className="text-xs font-medium">{item.label}</p>
                </div>
              ))}
            </div>

            {/* Regional Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <span className="text-lg">🌎</span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Americas</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{regionCounts.americas}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <span className="text-lg">🌍</span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Europe/Africa</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{regionCounts.europe}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                    <span className="text-lg">🌏</span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Asia</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{regionCounts.asia}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center">
                    <span className="text-lg">🏝️</span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Pacific</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{regionCounts.pacific}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Featured Region + Volcano Split */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Philippines Featured Region */}
            <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-6 border border-red-200 dark:border-red-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-red-900 dark:text-red-200 flex items-center gap-2">
                  🇵🇭 Featured: Philippines (7 Days)
                </h3>
                <Link href="/philippines" className="text-xs text-red-600 dark:text-red-400 hover:underline">
                  View Region →
                </Link>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-red-900 dark:text-red-200">{phStats.total}</p>
                  <p className="text-xs text-red-700 dark:text-red-400">M1+ Events</p>
                </div>
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-orange-600">{phStats.m4Plus}</p>
                  <p className="text-xs text-red-700 dark:text-red-400">M4+ Events</p>
                </div>
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-red-600">{phStats.maxMagnitude.toFixed(1)}</p>
                  <p className="text-xs text-red-700 dark:text-red-400">Largest</p>
                </div>
              </div>
              <div className="mt-4 text-sm text-red-700 dark:text-red-400">
                <p>Monitoring {philippineCities.length} cities • {PHILIPPINE_VOLCANOES.length} volcanoes • {activeFaults} active faults</p>
              </div>
            </div>

            {/* Volcano Watch */}
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-2xl p-6 border border-orange-200 dark:border-orange-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-orange-900 dark:text-orange-200 flex items-center gap-2">
                  🌋 Global Volcano Watch
                </h3>
                <Link href="/volcanoes/global" className="text-xs text-orange-600 dark:text-orange-400 hover:underline">
                  Full Monitor →
                </Link>
              </div>
              {elevatedVolcanoes.length > 0 ? (
                <div className="space-y-2">
                  {elevatedVolcanoes.slice(0, 3).map((volcano) => (
                    <div key={volcano.id} className="flex items-center justify-between bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
                      <div>
                        <p className="font-medium text-orange-900 dark:text-orange-200">{volcano.name}</p>
                        <p className="text-xs text-orange-700 dark:text-orange-400">{volcano.province}, Philippines</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        volcano.alertLevel >= 2 ? 'bg-red-500 text-white' :
                        volcano.alertLevel === 1 ? 'bg-yellow-500 text-gray-900' :
                        'bg-green-500 text-white'
                      }`}>
                        Alert {volcano.alertLevel}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-orange-700 dark:text-orange-400">
                  All monitored volcanoes at normal alert levels.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Largest Earthquake Highlight */}
      {largestToday && largestToday.magnitude >= 4.0 && (
        <section className="py-8 bg-gray-100 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 md:p-8 text-white">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-blue-100 mb-1">Largest Earthquake Today</p>
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold shadow-lg"
                      style={{ backgroundColor: getMagnitudeColor(largestToday.magnitude), color: 'white' }}
                    >
                      M{largestToday.magnitude.toFixed(1)}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{largestToday.place}</h3>
                      <p className="text-blue-100">{largestToday.timeAgo} • {largestToday.depth.toFixed(0)}km deep</p>
                    </div>
                  </div>
                </div>
                <a
                  href={largestToday.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-white/20 rounded-lg text-white hover:bg-white/30 transition-colors"
                >
                  View on USGS →
                </a>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Recent Global Earthquakes List */}
      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                Recent Global Earthquakes
              </h2>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Last 24 hours • All magnitudes (M1+)
              </p>
            </div>
            <Link
              href="/earthquakes"
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              View All
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <EarthquakeList earthquakes={globalM1Earthquakes.slice(0, 12)} />

          <div className="mt-8 text-center sm:hidden">
            <Link
              href="/earthquakes"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all"
            >
              View All Earthquakes
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Educational Section - Ring of Fire */}
      <section className="py-16 bg-blue-50 dark:bg-blue-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Why Do Earthquakes Happen?
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Earth&apos;s crust is made of tectonic plates that constantly move, collide, and grind against each other.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🔥</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Pacific Ring of Fire
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                A 40,000 km horseshoe-shaped zone around the Pacific Ocean where 90% of the world&apos;s 
                earthquakes occur. Home to 450+ volcanoes and the most seismically active zone on Earth.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🌏</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Plate Boundaries
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Most earthquakes occur at the edges of tectonic plates. When plates collide (convergent), 
                pull apart (divergent), or slide past each other (transform), stress builds and releases as quakes.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Magnitude Scale
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                The Richter scale is logarithmic — each whole number increase represents 10x more shaking 
                and ~31x more energy. An M7 releases 1,000x more energy than an M5.
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/preparedness"
              className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              Learn how to stay safe →
            </Link>
          </div>
        </div>
      </section>

      {/* Browse by Country */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Browse by Country
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Monitor seismic activity in countries around the world
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { name: 'Philippines', code: 'PH', emoji: '🇵🇭', slug: 'philippines' },
              { name: 'Japan', code: 'JP', emoji: '🇯🇵', slug: 'japan' },
              { name: 'Indonesia', code: 'ID', emoji: '🇮🇩', slug: 'indonesia' },
              { name: 'USA', code: 'US', emoji: '🇺🇸', slug: 'united-states' },
              { name: 'Chile', code: 'CL', emoji: '🇨🇱', slug: 'chile' },
              { name: 'Mexico', code: 'MX', emoji: '🇲🇽', slug: 'mexico' },
              { name: 'Turkey', code: 'TR', emoji: '🇹🇷', slug: 'turkey' },
              { name: 'New Zealand', code: 'NZ', emoji: '🇳🇿', slug: 'new-zealand' },
              { name: 'Italy', code: 'IT', emoji: '🇮🇹', slug: 'italy' },
              { name: 'Peru', code: 'PE', emoji: '🇵🇪', slug: 'peru' },
              { name: 'Taiwan', code: 'TW', emoji: '🇹🇼', slug: 'taiwan' },
              { name: 'Greece', code: 'GR', emoji: '🇬🇷', slug: 'greece' },
            ].map((country) => (
              <Link
                key={country.code}
                href={`/country/${country.slug}`}
                className="group p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-lg transition-all text-center"
              >
                <span className="text-2xl">{country.emoji}</span>
                <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mt-2">
                  {country.name}
                </h3>
              </Link>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/countries"
              className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
            >
              View all countries
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Why QuakeGlobe?
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              The most comprehensive global earthquake monitoring platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🌍</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                True Global Coverage
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Monitor earthquakes from every continent, every ocean, every tectonic boundary. From micro-tremors to mega-quakes.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                M1+ Complete Data
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Track ALL earthquakes including micro-earthquakes. Most sites only show M4+. We show M1+ because patterns in small quakes reveal seismic trends.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl">
              <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Real-time Updates
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Data refreshed every minute from USGS. Get the latest seismic activity as it happens, not hours later.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🗺️</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Interactive 3D Globe
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Visualize earthquakes on an interactive 3D globe. See tectonic plate boundaries, earthquake clusters, and global patterns.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🌋</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Volcano Monitoring
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Track 300+ active volcanoes worldwide. Scientific risk assessment based on seismic-volcanic correlation models.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl">
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📚</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Safety Resources
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Comprehensive preparedness guides, emergency kit checklists, DROP-COVER-HOLD instructions, and regional safety info.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Stay Informed, Stay Safe
          </h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Earth experiences over 500,000 detectable earthquakes each year. Knowledge is your first line of defense — learn what to do before, during, and after an earthquake.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/near-me"
              className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-cyan-300 transition-colors"
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
            name: "QuakeGlobe",
            alternateName: "QuakeGlobe Global Earthquake Monitor",
            description: "Real-time global earthquake monitoring. Track M1+ seismic activity worldwide.",
            url: "https://quakeglobe.com",
            inLanguage: ["en"],
            potentialAction: {
              "@type": "SearchAction",
              target: "https://quakeglobe.com/search?q={search_term_string}",
              "query-input": "required name=search_term_string",
            },
            about: {
              "@type": "Thing",
              name: "Global Earthquake Monitoring",
              description: "Real-time seismic activity monitoring for the entire planet",
            },
          }),
        }}
      />
    </>
  );
}
