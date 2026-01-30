import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getCityBySlug,
  getAllCitySlugs,
  getNearbyCities,
  getDistanceFromLatLonInKm,
  getCitiesByRegion,
} from "@/data/philippine-cities";
import {
  fetchEarthquakesNearLocation,
  processEarthquake,
  ProcessedEarthquake,
  calculateStats,
  getMagnitudeColor,
} from "@/lib/usgs-api";
import { EarthquakeList } from "@/components/earthquake/EarthquakeList";
import { getFaultLinesNearLocation, calculateSeismicRisk, philippineFaultLines } from "@/data/fault-lines";
import { NATIONAL_EMERGENCY_CONTACTS, REGIONAL_EMERGENCY_CONTACTS } from "@/data/educational-content";
import { PHILIPPINE_VOLCANOES } from "@/data/philippine-volcanoes";

interface Props {
  params: Promise<{ city: string }>;
}

export async function generateStaticParams() {
  const slugs = getAllCitySlugs();
  return slugs.map((city) => ({ city }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city: citySlug } = await params;
  const city = getCityBySlug(citySlug);

  if (!city) {
    return { title: "City Not Found" };
  }

  const seismicRisk = calculateSeismicRisk(city.latitude, city.longitude);

  return {
    title: `${city.name} Earthquake Risk & Activity | ${city.province}, Philippines`,
    description: `Comprehensive earthquake information for ${city.name}, ${city.province}. Current seismic risk: ${seismicRisk.level.toUpperCase()}. View recent earthquakes, nearby fault lines, emergency contacts, and preparedness tips. Population: ${city.population.toLocaleString()}.`,
    openGraph: {
      title: `${city.name} Earthquake Monitoring | QuakeGlobe`,
      description: `Real-time earthquake tracking for ${city.name}. Seismic risk level: ${seismicRisk.level}. ${city.population.toLocaleString()} residents. Stay informed about seismic activity.`,
    },
    keywords: [
      `${city.name} earthquake`,
      `${city.name} lindol`,
      `${city.province} earthquake`,
      `${city.name} fault line`,
      `earthquake near ${city.name}`,
      `seismic activity ${city.name}`,
    ],
  };
}

export const revalidate = 300; // 5 minutes

// Calculate TNT equivalent
function getTNTEquivalent(magnitude: number): string {
  const joules = Math.pow(10, 1.5 * magnitude + 4.8);
  const tntTons = joules / (4.184e9); // 1 ton TNT = 4.184e9 joules
  if (tntTons < 1) return `${(tntTons * 1000).toFixed(0)} kg of TNT`;
  if (tntTons < 1000) return `${tntTons.toFixed(0)} tons of TNT`;
  if (tntTons < 1000000) return `${(tntTons / 1000).toFixed(1)} kilotons of TNT`;
  return `${(tntTons / 1000000).toFixed(2)} megatons of TNT`;
}

export default async function CityPage({ params }: Props) {
  const { city: citySlug } = await params;
  const city = getCityBySlug(citySlug);

  if (!city) {
    notFound();
  }

  // Fetch M1+ earthquakes near this city
  let earthquakes: (ProcessedEarthquake & { distanceKm: number })[] = [];
  try {
    const raw = await fetchEarthquakesNearLocation(
      city.latitude,
      city.longitude,
      200, // 200km radius
      90,  // 90 days
      1.0  // M1+ earthquakes
    );
    earthquakes = raw.map((eq) => {
      const processed = processEarthquake(eq);
      const distanceKm = getDistanceFromLatLonInKm(
        city.latitude,
        city.longitude,
        processed.latitude,
        processed.longitude
      );
      return { ...processed, distanceKm };
    }).sort((a, b) => b.time.getTime() - a.time.getTime()); // Sort by time (most recent first)
  } catch (error) {
    console.error("Failed to fetch earthquakes:", error);
  }

  // Calculate stats
  const stats = calculateStats(earthquakes);
  
  // Calculate seismic risk
  const seismicRisk = calculateSeismicRisk(city.latitude, city.longitude);
  
  // Get nearby fault lines
  const nearbyFaults = getFaultLinesNearLocation(city.latitude, city.longitude, 150);
  
  // Get nearby volcanoes
  const nearbyVolcanoes = PHILIPPINE_VOLCANOES.filter(v => {
    const dist = getDistanceFromLatLonInKm(city.latitude, city.longitude, v.latitude, v.longitude);
    return dist <= 100;
  }).map(v => ({
    ...v,
    distance: getDistanceFromLatLonInKm(city.latitude, city.longitude, v.latitude, v.longitude),
  })).sort((a, b) => a.distance - b.distance);

  // Get nearby cities
  const nearbyCities = getNearbyCities(city.latitude, city.longitude, 100)
    .filter((c) => c.slug !== city.slug)
    .slice(0, 8);

  // Get other cities in same region
  const regionCities = getCitiesByRegion(city.regionCode)
    .filter((c) => c.slug !== city.slug)
    .slice(0, 6);

  // Get regional emergency contacts
  const regionalContacts = REGIONAL_EMERGENCY_CONTACTS[city.regionCode] || [];

  // Calculate depth distribution
  const shallowCount = earthquakes.filter(eq => eq.depth <= 70).length;
  const intermediateCount = earthquakes.filter(eq => eq.depth > 70 && eq.depth <= 300).length;
  const deepCount = earthquakes.filter(eq => eq.depth > 300).length;

  // Get largest earthquake
  const largestEq = earthquakes.length > 0 
    ? earthquakes.reduce((max, eq) => eq.magnitude > max.magnitude ? eq : max)
    : null;

  // Risk level styling
  const riskColors: Record<string, string> = {
    'very-high': 'bg-red-600 text-white',
    'high': 'bg-orange-500 text-white',
    'moderate': 'bg-yellow-500 text-gray-900',
    'low': 'bg-green-500 text-white',
  };

  const riskBgColors: Record<string, string> = {
    'very-high': 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    'high': 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
    'moderate': 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
    'low': 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <section className="bg-gradient-to-br from-purple-600 to-purple-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-purple-200 mb-4">
            <Link href="/philippines" className="hover:text-white transition-colors">Philippines</Link>
            <span>/</span>
            <Link href={`/region/${city.regionCode.toLowerCase().replace(/\s+/g, '-')}`} className="hover:text-white transition-colors">
              {city.region}
            </Link>
            <span>/</span>
            <span className="text-white">{city.name}</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Title & Info */}
            <div>
              <div className="flex items-start gap-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">
                    {city.name} Earthquakes
                  </h1>
                  <p className="text-lg text-purple-100">
                    {city.province}, {city.region}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-3">
                {city.isHCC && (
                  <span className="px-3 py-1 bg-yellow-400/20 text-yellow-200 rounded-full text-sm">
                    Highly Urbanized City
                  </span>
                )}
                {city.isCapital && (
                  <span className="px-3 py-1 bg-red-400/20 text-red-200 rounded-full text-sm">
                    National Capital
                  </span>
                )}
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${riskColors[seismicRisk.level]}`}>
                  {seismicRisk.level.replace('-', ' ').toUpperCase()} SEISMIC RISK
                </span>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-purple-200">Population</p>
                  <p className="text-xl font-semibold">{city.population.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-purple-200">Coordinates</p>
                  <p className="font-mono">{city.latitude.toFixed(4)}°N, {city.longitude.toFixed(4)}°E</p>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white/10 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold">{earthquakes.length}</p>
                <p className="text-sm text-purple-100">Total (90 days)</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold">{stats.last24h}</p>
                <p className="text-sm text-purple-100">Last 24 hours</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold">{stats.m4Plus}</p>
                <p className="text-sm text-purple-100">M4+ events</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold">{stats.maxMagnitude.toFixed(1)}</p>
                <p className="text-sm text-purple-100">Largest</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Risk Assessment Banner */}
      <section className={`border-b ${riskBgColors[seismicRisk.level]}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${riskColors[seismicRisk.level]}`}>
                <span className="text-xl font-bold">{seismicRisk.score}</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  Seismic Risk Score: {seismicRisk.score}/100
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {seismicRisk.nearestFault 
                    ? `${seismicRisk.nearestFaultDistance.toFixed(0)}km from ${seismicRisk.nearestFault.name}`
                    : 'Based on proximity to active faults'}
                </p>
              </div>
            </div>
            <Link
              href="/preparedness"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
            >
              View Preparedness Guide
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap gap-3">
            <Link
              href="/alerts"
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2 text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              Get Alerts for {city.name}
            </Link>
            <Link
              href="/map"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              View on Map
            </Link>
            <Link
              href="/near-me"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              Use My Location
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Largest Earthquake Highlight */}
              {largestEq && largestEq.magnitude >= 3.5 && (
                <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl p-6 text-white">
                  <h3 className="text-sm font-medium text-red-100 mb-2">Largest Earthquake (Past 90 Days)</h3>
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold"
                      style={{ backgroundColor: getMagnitudeColor(largestEq.magnitude) }}
                    >
                      {largestEq.magnitude.toFixed(1)}
                    </div>
                    <div>
                      <p className="font-semibold">{largestEq.place}</p>
                      <p className="text-sm text-red-100">{largestEq.timeAgo} • {largestEq.depth.toFixed(0)}km deep</p>
                      <p className="text-xs text-red-200 mt-1">Energy: ~{getTNTEquivalent(largestEq.magnitude)}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Earthquake Depth Analysis */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Earthquake Depth Analysis
                </h2>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <p className="text-2xl font-bold text-red-600">{shallowCount}</p>
                    <p className="text-sm text-red-700 dark:text-red-400">Shallow (&lt;70km)</p>
                    <p className="text-xs text-gray-500">Most damaging</p>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <p className="text-2xl font-bold text-yellow-600">{intermediateCount}</p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-400">Intermediate</p>
                    <p className="text-xs text-gray-500">70-300km</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{deepCount}</p>
                    <p className="text-sm text-green-700 dark:text-green-400">Deep (&gt;300km)</p>
                    <p className="text-xs text-gray-500">Less damage</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Shallow earthquakes (&lt;70km) typically cause the most damage as seismic waves travel 
                  a shorter distance to the surface. {shallowCount > 0 ? `${city.name} has experienced ${shallowCount} shallow earthquakes in the past 90 days.` : ''}
                </p>
              </div>

              {/* Magnitude Distribution */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Magnitude Distribution
                </h2>
                <div className="space-y-3">
                  {[
                    { label: 'M1-1.9', count: earthquakes.filter(eq => eq.magnitude >= 1 && eq.magnitude < 2).length, color: 'bg-green-400' },
                    { label: 'M2-2.9', count: earthquakes.filter(eq => eq.magnitude >= 2 && eq.magnitude < 3).length, color: 'bg-lime-400' },
                    { label: 'M3-3.9', count: earthquakes.filter(eq => eq.magnitude >= 3 && eq.magnitude < 4).length, color: 'bg-yellow-400' },
                    { label: 'M4-4.9', count: earthquakes.filter(eq => eq.magnitude >= 4 && eq.magnitude < 5).length, color: 'bg-orange-400' },
                    { label: 'M5+', count: earthquakes.filter(eq => eq.magnitude >= 5).length, color: 'bg-red-500' },
                  ].map(({ label, count, color }) => (
                    <div key={label} className="flex items-center gap-3">
                      <span className="w-16 text-sm text-gray-600 dark:text-gray-400">{label}</span>
                      <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                        <div 
                          className={`h-full ${color} transition-all duration-500`}
                          style={{ width: `${Math.min(100, (count / Math.max(1, earthquakes.length)) * 100)}%` }}
                        />
                      </div>
                      <span className="w-12 text-right text-sm font-medium text-gray-900 dark:text-white">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Earthquakes List */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Recent Earthquakes Within 200km
                </h2>
                {earthquakes.length > 0 ? (
                  <EarthquakeList earthquakes={earthquakes.slice(0, 20)} />
                ) : (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-8 text-center">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
                      No Recent Earthquakes
                    </h3>
                    <p className="text-green-700 dark:text-green-300">
                      Good news! No significant earthquakes detected near {city.name} in the past 90 days.
                    </p>
                  </div>
                )}
                
                {earthquakes.length > 20 && (
                  <div className="mt-4 text-center">
                    <Link
                      href="/earthquakes"
                      className="text-purple-600 dark:text-purple-400 hover:underline"
                    >
                      View all {earthquakes.length} earthquakes →
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Nearby Fault Lines */}
              {nearbyFaults.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    ⚠️ Nearby Fault Lines
                  </h3>
                  <div className="space-y-3">
                    {nearbyFaults.slice(0, 4).map((fault) => (
                      <div key={fault.name} className="border-l-4 border-red-500 pl-3 py-2">
                        <p className="font-medium text-gray-900 dark:text-white text-sm">{fault.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {fault.type === 'active' ? '🔴 Active' : '🟡 Potentially Active'} • {fault.length}km long
                        </p>
                        {fault.maxHistoricalMagnitude && (
                          <p className="text-xs text-red-600 dark:text-red-400">
                            Max historical: M{fault.maxHistoricalMagnitude}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                    Proximity to active faults increases earthquake risk. Always be prepared.
                  </p>
                </div>
              )}

              {/* Nearby Volcanoes */}
              {nearbyVolcanoes.length > 0 && (
                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-800 p-5">
                  <h3 className="font-semibold text-orange-900 dark:text-orange-200 mb-4 flex items-center gap-2">
                    🌋 Nearby Volcanoes
                  </h3>
                  <div className="space-y-3">
                    {nearbyVolcanoes.slice(0, 3).map((volcano) => (
                      <div key={volcano.id} className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-orange-800 dark:text-orange-200 text-sm">{volcano.name}</p>
                          <p className="text-xs text-orange-600 dark:text-orange-400">
                            {volcano.type} • {volcano.elevation_m}m
                          </p>
                        </div>
                        <span className="text-xs text-orange-700 dark:text-orange-300">
                          {volcano.distance.toFixed(0)}km
                        </span>
                      </div>
                    ))}
                  </div>
                  <Link href="/volcanoes" className="text-xs text-orange-700 dark:text-orange-300 hover:underline mt-3 block">
                    View volcano monitoring →
                  </Link>
                </div>
              )}

              {/* City Info */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  About {city.name}
                </h3>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-500 dark:text-gray-400">Province</dt>
                    <dd className="font-medium text-gray-900 dark:text-white">{city.province}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500 dark:text-gray-400">Region</dt>
                    <dd className="font-medium text-gray-900 dark:text-white">{city.region}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500 dark:text-gray-400">Population</dt>
                    <dd className="font-medium text-gray-900 dark:text-white">
                      {city.population.toLocaleString()}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500 dark:text-gray-400">Seismic Risk</dt>
                    <dd className={`font-medium px-2 py-0.5 rounded text-xs ${riskColors[seismicRisk.level]}`}>
                      {seismicRisk.level.replace('-', ' ').toUpperCase()}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500 dark:text-gray-400">Coordinates</dt>
                    <dd className="font-mono text-xs text-gray-900 dark:text-white">
                      {city.latitude.toFixed(4)}, {city.longitude.toFixed(4)}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Emergency Contacts */}
              <div className="bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 p-5">
                <h3 className="font-semibold text-red-900 dark:text-red-200 mb-4">
                  🚨 Emergency Contacts
                </h3>
                <div className="space-y-2">
                  {NATIONAL_EMERGENCY_CONTACTS.national.slice(0, 4).map((contact) => (
                    <div key={contact.number} className="flex justify-between">
                      <span className="text-sm text-red-800 dark:text-red-300">{contact.name}</span>
                      <span className="font-mono font-bold text-red-900 dark:text-red-200">{contact.number}</span>
                    </div>
                  ))}
                </div>
                {regionalContacts.length > 0 && (
                  <>
                    <hr className="my-3 border-red-200 dark:border-red-700" />
                    <p className="text-xs font-medium text-red-800 dark:text-red-300 mb-2">Regional:</p>
                    {regionalContacts.slice(0, 2).map((contact) => (
                      <div key={contact.number} className="flex justify-between">
                        <span className="text-xs text-red-700 dark:text-red-400">{contact.name}</span>
                        <span className="font-mono text-xs text-red-800 dark:text-red-300">{contact.number}</span>
                      </div>
                    ))}
                  </>
                )}
              </div>

              {/* Nearby Cities */}
              {nearbyCities.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                    Nearby Cities
                  </h3>
                  <div className="space-y-2">
                    {nearbyCities.map((nearbyCity) => {
                      const dist = getDistanceFromLatLonInKm(
                        city.latitude,
                        city.longitude,
                        nearbyCity.latitude,
                        nearbyCity.longitude
                      );
                      return (
                        <Link
                          key={nearbyCity.slug}
                          href={`/philippines/${nearbyCity.slug}`}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <span className="text-gray-900 dark:text-white text-sm">{nearbyCity.name}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {dist.toFixed(0)} km
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Other Cities in Region */}
              {regionCities.length > 0 && (
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800 p-5">
                  <h3 className="font-semibold text-purple-900 dark:text-purple-200 mb-3">
                    More in {city.region}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {regionCities.map((regionCity) => (
                      <Link
                        key={regionCity.slug}
                        href={`/philippines/${regionCity.slug}`}
                        className="px-3 py-1 bg-white dark:bg-gray-800 border border-purple-200 dark:border-purple-700 rounded-lg text-sm text-purple-700 dark:text-purple-300 hover:border-purple-400 transition-colors"
                      >
                        {regionCity.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Preparedness CTA */}
              <div className="bg-gradient-to-br from-yellow-400 to-orange-400 rounded-xl p-5 text-center">
                <h3 className="font-bold text-white mb-2">Be Prepared</h3>
                <p className="text-sm text-yellow-100 mb-4">
                  Know what to do before, during, and after an earthquake.
                </p>
                <Link
                  href="/preparedness"
                  className="inline-block px-4 py-2 bg-white text-orange-600 rounded-lg font-medium hover:bg-orange-50 transition-colors text-sm"
                >
                  Read Preparedness Guide
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Educational Footer */}
      <section className="py-8 bg-gray-100 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Understanding Earthquake Risk in {city.name}
          </h2>
          <div className="prose dark:prose-invert max-w-none text-sm text-gray-600 dark:text-gray-400">
            <p>
              {city.name} is located in the {city.region} of the Philippines, a country that sits on the Pacific Ring of Fire—one 
              of the most seismically active zones on Earth. The Philippines experiences an average of 20 earthquakes per day, 
              though most are too small to be felt.
            </p>
            {seismicRisk.nearestFault && (
              <p className="mt-2">
                The nearest major fault to {city.name} is the <strong>{seismicRisk.nearestFault.name}</strong>, 
                located approximately {seismicRisk.nearestFaultDistance.toFixed(0)} km away. 
                {seismicRisk.nearestFault.lastMajorEvent && ` The last major event on this fault was the ${seismicRisk.nearestFault.lastMajorEvent}.`}
              </p>
            )}
            <p className="mt-2">
              With a population of {city.population.toLocaleString()}, earthquake preparedness is crucial for {city.name} residents. 
              We recommend having an emergency kit ready, knowing the safest spots in your home, and practicing DROP-COVER-HOLD ON 
              with your family.
            </p>
          </div>
        </div>
      </section>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Place",
            name: city.name,
            description: `Earthquake monitoring and seismic risk information for ${city.name}, ${city.province}`,
            geo: {
              "@type": "GeoCoordinates",
              latitude: city.latitude,
              longitude: city.longitude,
            },
            containedInPlace: {
              "@type": "AdministrativeArea",
              name: city.province,
            },
            additionalProperty: [
              {
                "@type": "PropertyValue",
                name: "Seismic Risk Level",
                value: seismicRisk.level,
              },
              {
                "@type": "PropertyValue",
                name: "Population",
                value: city.population,
              },
            ],
          }),
        }}
      />
    </div>
  );
}
