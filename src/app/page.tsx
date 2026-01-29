import { Metadata } from "next";
import Link from "next/link";
import { fetchAllPhilippineEarthquakes, fetchGlobalEarthquakes, processEarthquake, ProcessedEarthquake, calculateStats, getMagnitudeColor } from "@/lib/usgs-api";
import { EarthquakeList } from "@/components/earthquake/EarthquakeList";
import { philippineCities, philippineRegions } from "@/data/philippine-cities";
import { PHILIPPINE_VOLCANOES, getVolcanoesByPriority } from "@/data/philippine-volcanoes";
import { philippineFaultLines } from "@/data/fault-lines";

export const metadata: Metadata = {
  title: "Lindol.ph — Real-Time Earthquake & Volcano Monitoring Philippines",
  description:
    "Track earthquakes and volcanic activity in the Philippines in real-time. Monitor M1+ seismic data, 24 active volcanoes, and stay prepared with comprehensive safety guides. Every tremor. Everywhere.",
  keywords: [
    "lindol",
    "lindol philippines",
    "earthquake tracker",
    "philippines earthquake",
    "earthquake monitor",
    "earthquake map",
    "volcano monitoring",
    "PHIVOLCS",
    "earthquake near me",
    "Philippine fault line",
    "real-time earthquake",
  ],
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
    
    // Get global M4.5+ earthquakes (last 7 days)
    const rawGlobal = await fetchGlobalEarthquakes(7, 4.5, 50);
    globalEarthquakes = rawGlobal.map(processEarthquake);
  } catch (error) {
    console.error("Failed to fetch earthquakes:", error);
  }

  // Calculate Philippine stats
  const phStats = calculateStats(philippineEarthquakes);
  
  // Calculate global stats
  const globalM5Plus = globalEarthquakes.filter(eq => eq.magnitude >= 5).length;
  const globalM6Plus = globalEarthquakes.filter(eq => eq.magnitude >= 6).length;

  // Get significant Philippine earthquakes
  const significantPH = philippineEarthquakes.filter((eq) => eq.magnitude >= 4.0).slice(0, 5);
  
  // Combined recent earthquakes for display (prioritize Philippines)
  const recentEarthquakes = [...philippineEarthquakes]
    .sort((a, b) => b.time.getTime() - a.time.getTime())
    .slice(0, 10);

  // Get volcanoes with elevated risk
  const prioritizedVolcanoes = getVolcanoesByPriority();
  const elevatedVolcanoes = prioritizedVolcanoes.filter(v => v.alertLevel > 0 || v.hydrothermalActivity >= 2).slice(0, 5);

  // Get active fault count
  const activeFaults = philippineFaultLines.filter(f => f.type === 'active').length;

  // Calculate average magnitude and depth
  const avgMagnitude = phStats.total > 0 
    ? (philippineEarthquakes.reduce((sum, eq) => sum + eq.magnitude, 0) / phStats.total).toFixed(1)
    : '0.0';
  
  const avgDepth = phStats.total > 0
    ? (philippineEarthquakes.reduce((sum, eq) => sum + eq.depth, 0) / phStats.total).toFixed(0)
    : '0';

  // Get largest earthquake this week
  const largestThisWeek = philippineEarthquakes.length > 0
    ? philippineEarthquakes.reduce((max, eq) => eq.magnitude > max.magnitude ? eq : max)
    : null;

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
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-sm mb-6 backdrop-blur-sm">
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
                Real-time earthquake and volcano monitoring for the Philippines. 
                Track M1+ earthquakes across {philippineCities.length} cities and {PHILIPPINE_VOLCANOES.length} active volcanoes.
              </p>

              {/* CTA Buttons */}
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/near-me"
                  className="px-6 py-3 bg-white text-gray-900 rounded-lg font-semibold hover:bg-yellow-300 transition-colors flex items-center gap-2 shadow-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Earthquakes Near Me
                </Link>
                <Link
                  href="/earthquakes"
                  className="px-6 py-3 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-colors border border-white/30 flex items-center gap-2 backdrop-blur-sm"
                >
                  <span>📊</span>
                  View All M1+ Data
                </Link>
              </div>

              {/* Hero Stats */}
              <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/5 rounded-lg p-4 backdrop-blur-sm border border-white/10">
                  <p className="text-3xl md:text-4xl font-bold">{phStats.total}</p>
                  <p className="text-sm text-gray-400">This Week</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4 backdrop-blur-sm border border-white/10">
                  <p className="text-3xl md:text-4xl font-bold">{phStats.last24h}</p>
                  <p className="text-sm text-gray-400">Last 24h</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4 backdrop-blur-sm border border-white/10">
                  <p className="text-3xl md:text-4xl font-bold text-yellow-400">{phStats.m4Plus}</p>
                  <p className="text-sm text-gray-400">M4+ Events</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4 backdrop-blur-sm border border-white/10">
                  <p className="text-3xl md:text-4xl font-bold text-orange-400">{phStats.maxMagnitude.toFixed(1)}</p>
                  <p className="text-sm text-gray-400">Largest</p>
                </div>
              </div>
            </div>

            {/* Right content - Live Feed */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  Latest Earthquakes
                </h2>
                <Link href="/earthquakes" className="text-sm text-orange-300 hover:text-white transition-colors">
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

      {/* Quick Stats Dashboard */}
      <section className="py-12 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Philippines Overview */}
          <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-2xl p-6 md:p-8 border border-red-100 dark:border-red-800/50 mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  🇵🇭 Philippines Earthquake Dashboard
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Complete seismic data for the past 7 days
                </p>
              </div>
              <Link
                href="/earthquakes"
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                View All Data →
              </Link>
            </div>
            
            {/* Magnitude Breakdown */}
            <div className="grid grid-cols-3 md:grid-cols-7 gap-3 mb-6">
              {[
                { label: 'M1+', count: phStats.m1Plus, color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
                { label: 'M2+', count: phStats.m2Plus, color: 'bg-lime-100 text-lime-800 dark:bg-lime-900/30 dark:text-lime-300' },
                { label: 'M3+', count: phStats.m3Plus, color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
                { label: 'M4+', count: phStats.m4Plus, color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' },
                { label: 'M5+', count: phStats.m5Plus, color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
                { label: 'M6+', count: phStats.m6Plus, color: 'bg-red-200 text-red-900 dark:bg-red-800/30 dark:text-red-200' },
                { label: 'Avg Depth', count: `${avgDepth}km`, color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
              ].map((item) => (
                <div key={item.label} className={`${item.color} rounded-xl p-3 text-center`}>
                  <p className="text-xl md:text-2xl font-bold">{item.count}</p>
                  <p className="text-xs font-medium">{item.label}</p>
                </div>
              ))}
            </div>

            {/* Additional Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                    <span className="text-lg">📍</span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Cities Covered</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{philippineCities.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                    <span className="text-lg">🌋</span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Active Volcanoes</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{PHILIPPINE_VOLCANOES.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                    <span className="text-lg">⚡</span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Active Faults</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{activeFaults}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <span className="text-lg">🗺️</span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Regions</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{philippineRegions.length}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Global + Volcano Split */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Global Stats */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-blue-900 dark:text-blue-200 flex items-center gap-2">
                  🌍 Global Activity (7 Days)
                </h3>
                <Link href="/countries" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                  View Countries →
                </Link>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-200">{globalEarthquakes.length}</p>
                  <p className="text-xs text-blue-700 dark:text-blue-400">M4.5+ Worldwide</p>
                </div>
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-orange-600">{globalM5Plus}</p>
                  <p className="text-xs text-blue-700 dark:text-blue-400">M5+ Events</p>
                </div>
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-red-600">{globalM6Plus}</p>
                  <p className="text-xs text-blue-700 dark:text-blue-400">M6+ Events</p>
                </div>
              </div>
            </div>

            {/* Volcano Watch */}
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-2xl p-6 border border-orange-200 dark:border-orange-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-orange-900 dark:text-orange-200 flex items-center gap-2">
                  🌋 Philippine Volcano Watch
                </h3>
                <Link href="/volcanoes" className="text-xs text-orange-600 dark:text-orange-400 hover:underline">
                  Full Monitor →
                </Link>
              </div>
              {elevatedVolcanoes.length > 0 ? (
                <div className="space-y-2">
                  {elevatedVolcanoes.slice(0, 3).map((volcano) => (
                    <div key={volcano.id} className="flex items-center justify-between bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
                      <div>
                        <p className="font-medium text-orange-900 dark:text-orange-200">{volcano.name}</p>
                        <p className="text-xs text-orange-700 dark:text-orange-400">{volcano.province}</p>
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
                  All volcanoes at normal alert levels.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Largest Earthquake Highlight */}
      {largestThisWeek && largestThisWeek.magnitude >= 4.0 && (
        <section className="py-8 bg-gray-100 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl p-6 md:p-8 text-white">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-red-100 mb-1">Largest Earthquake This Week</p>
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold shadow-lg"
                      style={{ backgroundColor: getMagnitudeColor(largestThisWeek.magnitude), color: 'white' }}
                    >
                      M{largestThisWeek.magnitude.toFixed(1)}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{largestThisWeek.place}</h3>
                      <p className="text-red-100">{largestThisWeek.timeAgo} • {largestThisWeek.depth.toFixed(0)}km deep</p>
                    </div>
                  </div>
                </div>
                <a
                  href={largestThisWeek.url}
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

      {/* Recent Earthquakes List */}
      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                Recent Philippine Earthquakes
              </h2>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Last 7 days • All magnitudes (M1+)
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

          <EarthquakeList earthquakes={philippineEarthquakes.slice(0, 12)} />

          <div className="mt-8 text-center sm:hidden">
            <Link
              href="/earthquakes"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-orange-600 text-white rounded-lg hover:from-red-600 hover:to-orange-700 transition-all"
            >
              View All Earthquakes
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Educational Section - Why Philippines Has Earthquakes */}
      <section className="py-16 bg-blue-50 dark:bg-blue-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Why Does the Philippines Have So Many Earthquakes?
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              The Philippines sits on the Pacific Ring of Fire, one of the most seismically active zones on Earth.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🌏</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Tectonic Plate Junction
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                The Philippines is located where the Philippine Sea Plate and Eurasian Plate meet. 
                These plates collide and grind against each other, creating stress that releases as earthquakes.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                The Philippine Fault Zone
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                A 1,200km fault running from Luzon to Mindanao. This left-lateral strike-slip fault 
                is capable of producing major earthquakes (M7+) and passes through densely populated areas.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🌊</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Multiple Trenches
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                The Manila Trench (west), Philippine Trench (east), and Cotabato Trench (south) 
                are subduction zones capable of generating massive earthquakes and tsunamis.
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

      {/* Browse by Region */}
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
              Why Lindol.ph?
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              The most comprehensive earthquake monitoring for Filipinos
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                M1+ Complete Data
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Track ALL earthquakes including micro-earthquakes. Most sites only show M4+. We show M1+ because even small earthquakes provide important seismic information.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🇵🇭</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Philippines Focus
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Detailed coverage for all {philippineCities.length} Philippine cities and {philippineRegions.length} regions. Local emergency contacts, fault line proximity, and risk assessments.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
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
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🗺️</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Interactive Maps & Globe
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Visualize earthquakes on 2D maps and an interactive 3D globe. See fault lines, tectonic plates, and earthquake clusters.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🌋</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Volcano Monitoring
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Track {PHILIPPINE_VOLCANOES.length} active Philippine volcanoes and 300+ worldwide. Scientific risk assessment based on seismic-volcanic correlation models.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl">
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📚</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Comprehensive Guides
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Complete preparedness guides, emergency kit checklists, DROP-COVER-HOLD instructions, and local emergency contacts.
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
          <p className="text-lg text-red-100 mb-8 max-w-2xl mx-auto">
            &quot;Lindol&quot; is Filipino for earthquake. We track every tremor so you can be prepared. 
            Knowledge saves lives—learn what to do before, during, and after an earthquake.
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
            alternateName: "Lindol Philippines Earthquake Monitor",
            description: "Real-time earthquake and volcano monitoring for the Philippines",
            url: "https://lindol.ph",
            inLanguage: ["en", "fil"],
            potentialAction: {
              "@type": "SearchAction",
              target: "https://lindol.ph/search?q={search_term_string}",
              "query-input": "required name=search_term_string",
            },
            about: {
              "@type": "Thing",
              name: "Earthquake Monitoring",
              description: "Real-time seismic activity monitoring for the Philippines and worldwide",
            },
          }),
        }}
      />
    </>
  );
}
