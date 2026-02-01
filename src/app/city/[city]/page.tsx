import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getCityBySlug, getAllCitySlugs, formatPopulation } from "@/data/major-cities";
import { getCountryByCode } from "@/data/countries";
import { fetchEarthquakesNearCity, processEarthquake, ProcessedEarthquake, getTimeAgo, getMagnitudeIntensity } from "@/lib/usgs-api";
import { getPhilippinesEarthquakes } from "@/lib/db-queries";
import { EarthquakeList } from "@/components/earthquake/EarthquakeList";
import { getDistanceFromLatLonInKm } from "@/data/philippine-cities";

interface Props {
  params: Promise<{ city: string }>;
}

export async function generateStaticParams() {
  return getAllCitySlugs().map((city) => ({ city }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city: slug } = await params;
  const city = getCityBySlug(slug);
  
  if (!city) {
    return { title: "City Not Found" };
  }

  return {
    title: `${city.name} Earthquakes - Seismic Activity Near ${city.name}, ${city.country}`,
    description: `Track earthquakes near ${city.name}, ${city.country} in real-time. Monitor seismic activity within ${city.searchRadiusKm}km radius. ${city.description}`,
  };
}

export const revalidate = 1800;

export default async function CityPage({ params }: Props) {
  const { city: slug } = await params;
  const city = getCityBySlug(slug);

  if (!city) {
    notFound();
  }

  // Get country info
  const country = getCountryByCode(city.countryCode);

  // Fetch earthquakes near this city
  let earthquakes: ProcessedEarthquake[] = [];
  try {
    // Check if city is in the Philippines - use local database for better coverage
    const isPhilippines = city.countryCode === 'PH' || 
      (city.lat >= 4.5 && city.lat <= 21.5 && city.lon >= 116 && city.lon <= 127);
    
    if (isPhilippines) {
      // Use local database (includes PHIVOLCS data)
      const rawEarthquakes = getPhilippinesEarthquakes(30, 2.0, 5000);
      earthquakes = rawEarthquakes
        .map(eq => {
          const distance = getDistanceFromLatLonInKm(city.lat, city.lon, eq.latitude, eq.longitude);
          return {
            id: eq.id,
            magnitude: eq.magnitude,
            magnitudeType: eq.magnitudeType,
            place: eq.place,
            time: eq.time,
            timeAgo: getTimeAgo(eq.time),
            latitude: eq.latitude,
            longitude: eq.longitude,
            depth: eq.depth,
            url: eq.url || '#',
            felt: eq.felt,
            tsunami: eq.tsunami,
            alert: null,
            intensity: getMagnitudeIntensity(eq.magnitude),
            significanceScore: Math.round(eq.magnitude * 100),
            _distance: distance,
          };
        })
        .filter((eq: any) => eq._distance <= city.searchRadiusKm)
        .map(({ _distance, ...eq }: any) => eq as ProcessedEarthquake);
    } else {
      // Use USGS for non-Philippine cities
      const rawEarthquakes = await fetchEarthquakesNearCity(
        city.lat,
        city.lon,
        city.searchRadiusKm,
        30,
        2.0,
        500
      );
      earthquakes = rawEarthquakes.map(processEarthquake);
    }
  } catch (error) {
    console.error("Failed to fetch earthquakes:", error);
    earthquakes = [];
  }

  // Stats
  const last24h = earthquakes.filter(eq => 
    eq.time.getTime() > Date.now() - 24 * 60 * 60 * 1000
  ).length;
  const last7d = earthquakes.filter(eq => 
    eq.time.getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
  ).length;
  const m4Plus = earthquakes.filter(eq => eq.magnitude >= 4).length;
  const m5Plus = earthquakes.filter(eq => eq.magnitude >= 5).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <section className="bg-gradient-to-r from-orange-600 to-red-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-white/70 mb-4">
            <Link href="/cities" className="hover:text-white">Cities</Link>
            <span>/</span>
            {country && (
              <>
                <Link href={`/country/${country.slug}`} className="hover:text-white">{country.name}</Link>
                <span>/</span>
              </>
            )}
            <span className="text-white">{city.name}</span>
          </div>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                {city.name} Earthquakes
              </h1>
              <p className="text-white/80 flex items-center gap-2">
                <span>{city.country}</span>
                <span>•</span>
                <span>Pop: {formatPopulation(city.population)}</span>
                <span>•</span>
                <span>{city.searchRadiusKm}km radius</span>
              </p>
            </div>
          </div>

          <p className="mt-4 text-white/80 max-w-2xl">
            {city.description}
          </p>

          {/* Stats */}
          <div className="mt-6 flex flex-wrap gap-4">
            <div className="bg-white/10 rounded-lg px-4 py-2">
              <span className="text-2xl font-bold">{earthquakes.length}</span>
              <span className="text-sm text-white/70 ml-2">Last 30 days</span>
            </div>
            <div className="bg-white/10 rounded-lg px-4 py-2">
              <span className="text-2xl font-bold">{last7d}</span>
              <span className="text-sm text-white/70 ml-2">Last 7 days</span>
            </div>
            <div className="bg-white/10 rounded-lg px-4 py-2">
              <span className="text-2xl font-bold">{last24h}</span>
              <span className="text-sm text-white/70 ml-2">Last 24h</span>
            </div>
            {m4Plus > 0 && (
              <div className="bg-white/20 rounded-lg px-4 py-2">
                <span className="text-2xl font-bold">{m4Plus}</span>
                <span className="text-sm text-white/70 ml-2">M4+</span>
              </div>
            )}
            {m5Plus > 0 && (
              <div className="bg-red-500/30 rounded-lg px-4 py-2">
                <span className="text-2xl font-bold">{m5Plus}</span>
                <span className="text-sm text-white/70 ml-2">M5+ Significant</span>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Recent Earthquakes ({earthquakes.length})
                </h2>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Within {city.searchRadiusKm}km
                </span>
              </div>
              {earthquakes.length > 0 ? (
                <EarthquakeList earthquakes={earthquakes} />
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    No earthquakes M2.0+ recorded within {city.searchRadiusKm}km in the last 30 days.
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                    This is a good sign for seismic safety!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* City Info */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Location Details
              </h3>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">Coordinates</dt>
                  <dd className="text-gray-900 dark:text-white font-mono">
                    {city.lat.toFixed(4)}°, {city.lon.toFixed(4)}°
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">Search Radius</dt>
                  <dd className="text-gray-900 dark:text-white">{city.searchRadiusKm} km</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">Timezone</dt>
                  <dd className="text-gray-900 dark:text-white">{city.timezone}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">Population</dt>
                  <dd className="text-gray-900 dark:text-white">{formatPopulation(city.population)}</dd>
                </div>
              </dl>
            </div>

            {/* Country Link */}
            {country && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Country
                </h3>
                <Link
                  href={`/country/${country.slug}`}
                  className="block p-4 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <p className="font-medium text-gray-900 dark:text-white">{country.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {country.riskLevel.charAt(0).toUpperCase() + country.riskLevel.slice(1)} seismic risk
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {country.seismicZones.slice(0, 2).map((zone) => (
                      <span
                        key={zone}
                        className="text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded"
                      >
                        {zone}
                      </span>
                    ))}
                  </div>
                </Link>
              </div>
            )}

            {/* Safety Tip */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800 p-6">
              <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2 flex items-center gap-2">
                <span>⚠️</span>
                Earthquake Safety
              </h3>
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                If you're in {city.name}, make sure you know the local emergency procedures. 
                Drop, Cover, and Hold On during shaking.
              </p>
              <Link
                href="/preparedness"
                className="inline-block mt-3 text-sm font-medium text-yellow-700 dark:text-yellow-300 hover:underline"
              >
                View Safety Guide →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
