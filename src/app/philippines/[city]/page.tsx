import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getCityBySlug,
  getAllCitySlugs,
  getNearbyCities,
  getDistanceFromLatLonInKm,
} from "@/data/philippine-cities";
import {
  fetchEarthquakesNearLocation,
  processEarthquake,
  ProcessedEarthquake,
} from "@/lib/usgs-api";
import { EarthquakeList } from "@/components/earthquake/EarthquakeList";

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
    return {
      title: "City Not Found",
    };
  }

  return {
    title: `${city.name} Earthquakes | ${city.province}, Philippines`,
    description: `Track earthquakes near ${city.name}, ${city.province}. View recent seismic activity, historical data, and earthquake preparedness information for ${city.name}.`,
    openGraph: {
      title: `${city.name} Earthquakes | Lindol.ph`,
      description: `Real-time earthquake tracking for ${city.name}, ${city.province}. Stay informed about seismic activity in your area.`,
    },
  };
}

export const revalidate = 300; // 5 minutes

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
    }).sort((a, b) => a.distanceKm - b.distanceKm);
  } catch (error) {
    console.error("Failed to fetch earthquakes:", error);
  }

  // Get nearby cities
  const nearbyCities = getNearbyCities(city.latitude, city.longitude, 100)
    .filter((c) => c.slug !== city.slug)
    .slice(0, 6);

  // Stats
  const recentCount = earthquakes.filter(
    (eq) => Date.now() - eq.time.getTime() < 7 * 24 * 60 * 60 * 1000
  ).length;
  const significantCount = earthquakes.filter((eq) => eq.magnitude >= 4.5).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <section className="bg-gradient-to-br from-purple-600 to-purple-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-purple-200 mb-4">
            <Link href="/philippines" className="hover:text-white">
              Philippines
            </Link>
            <span>/</span>
            <Link href={`/region/${city.regionCode.toLowerCase()}`} className="hover:text-white">
              {city.region}
            </Link>
            <span>/</span>
            <span className="text-white">{city.name}</span>
          </nav>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                {city.name} Earthquakes
              </h1>
              <p className="text-lg text-purple-100">
                {city.province}, {city.region}
              </p>
              {city.isHCC && (
                <span className="inline-block mt-2 px-3 py-1 bg-yellow-400/20 text-yellow-200 rounded-full text-sm">
                  Highly Urbanized City
                </span>
              )}
              {city.isCapital && (
                <span className="inline-block mt-2 ml-2 px-3 py-1 bg-red-400/20 text-red-200 rounded-full text-sm">
                  National Capital
                </span>
              )}
            </div>
            <div className="text-right hidden md:block">
              <p className="text-sm text-purple-200">Coordinates</p>
              <p className="font-mono">
                {city.latitude.toFixed(4)}°N, {city.longitude.toFixed(4)}°E
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-8 max-w-lg">
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold">{earthquakes.length}</p>
              <p className="text-sm text-purple-100">Total (90 days)</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold">{recentCount}</p>
              <p className="text-sm text-purple-100">Last 7 days</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold">{significantCount}</p>
              <p className="text-sm text-purple-100">M4.5+ events</p>
            </div>
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
              href="/preparedness"
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
            >
              Preparedness Guide
            </Link>
          </div>
        </div>
      </section>

      {/* Earthquake List */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Earthquakes Within 200km
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
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
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
                    <dt className="text-gray-500 dark:text-gray-400">Coordinates</dt>
                    <dd className="font-mono text-xs text-gray-900 dark:text-white">
                      {city.latitude.toFixed(4)}, {city.longitude.toFixed(4)}
                    </dd>
                  </div>
                </dl>
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
                          <span className="text-gray-900 dark:text-white">{nearbyCity.name}</span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {dist.toFixed(0)} km
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quick Links */}
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-5">
                <h3 className="font-semibold text-purple-900 dark:text-purple-200 mb-3">
                  Quick Links
                </h3>
                <div className="space-y-2">
                  <Link
                    href="/preparedness"
                    className="block text-purple-700 dark:text-purple-300 hover:underline"
                  >
                    → Earthquake Preparedness
                  </Link>
                  <Link
                    href="/alerts"
                    className="block text-purple-700 dark:text-purple-300 hover:underline"
                  >
                    → Set Up Alerts
                  </Link>
                  <Link
                    href="/earthquakes"
                    className="block text-purple-700 dark:text-purple-300 hover:underline"
                  >
                    → All Philippines Earthquakes
                  </Link>
                </div>
              </div>
            </div>
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
            geo: {
              "@type": "GeoCoordinates",
              latitude: city.latitude,
              longitude: city.longitude,
            },
            containedInPlace: {
              "@type": "AdministrativeArea",
              name: city.province,
            },
          }),
        }}
      />
    </div>
  );
}
