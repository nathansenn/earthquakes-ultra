import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getCountryBySlug, getAllCountrySlugs, seismicRegions } from "@/data/countries";
import { getCitiesByCountry } from "@/data/major-cities";
import { fetchEarthquakesByBounds, processEarthquake, ProcessedEarthquake, getTimeAgo, getMagnitudeIntensity } from "@/lib/usgs-api";
import { fetchRegionEarthquakes, getRegionInfo } from "@/lib/regional-api";
import { EarthquakeList } from "@/components/earthquake/EarthquakeList";

interface Props {
  params: Promise<{ country: string }>;
}

export async function generateStaticParams() {
  return getAllCountrySlugs().map((country) => ({ country }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { country: slug } = await params;
  const country = getCountryBySlug(slug);
  
  if (!country) {
    return { title: "Country Not Found" };
  }

  return {
    title: `${country.name} Earthquakes - Real-time Seismic Activity`,
    description: `Track earthquakes in ${country.name} in real-time. Monitor seismic activity near ${country.capital.name} and view historical earthquake data. ${country.description}`,
  };
}

export const revalidate = 300;

export default async function CountryPage({ params }: Props) {
  const { country: slug } = await params;
  const country = getCountryBySlug(slug);

  if (!country) {
    notFound();
  }

  // Fetch earthquakes for this country using multi-source regional API
  const bounds = {
    minLatitude: country.bounds.minLat,
    maxLatitude: country.bounds.maxLat,
    minLongitude: country.bounds.minLon,
    maxLongitude: country.bounds.maxLon,
  };

  let earthquakes: ProcessedEarthquake[] = [];
  try {
    // Try regional API first (multi-source: EMSC, USGS, JMA, GeoNet)
    const regionInfo = getRegionInfo(slug);
    if (regionInfo) {
      const multiSourceData = await fetchRegionEarthquakes(slug, 30, 1.0);
      earthquakes = multiSourceData.map(eq => ({
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
    } else {
      // Fallback to USGS bounds query
      const rawEarthquakes = await fetchEarthquakesByBounds(bounds, 30, 1.0, 500);
      earthquakes = rawEarthquakes.map(processEarthquake);
    }
  } catch (error) {
    console.error("Failed to fetch earthquakes:", error);
    // Fallback to USGS
    try {
      const rawEarthquakes = await fetchEarthquakesByBounds(bounds, 30, 1.0, 500);
      earthquakes = rawEarthquakes.map(processEarthquake);
    } catch (e) {
      console.error("Fallback also failed:", e);
    }
  }

  // Get cities in this country
  const cities = getCitiesByCountry(country.code);

  // Find which region this country belongs to
  const region = seismicRegions.find(r => r.countries.includes(country.code));

  // Stats
  const last24h = earthquakes.filter(eq => 
    eq.time.getTime() > Date.now() - 24 * 60 * 60 * 1000
  ).length;
  const m4Plus = earthquakes.filter(eq => eq.magnitude >= 4).length;
  const m5Plus = earthquakes.filter(eq => eq.magnitude >= 5).length;

  const riskColors = {
    extreme: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    moderate: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <section className={`py-12 ${
        country.riskLevel === 'extreme' 
          ? 'bg-gradient-to-r from-red-700 to-red-900' 
          : country.riskLevel === 'high'
          ? 'bg-gradient-to-r from-orange-600 to-red-700'
          : 'bg-gradient-to-r from-yellow-600 to-orange-600'
      } text-white`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-white/70 mb-4">
            <Link href="/countries" className="hover:text-white">Countries</Link>
            <span>/</span>
            {region && (
              <>
                <Link href={`/region/${region.slug}`} className="hover:text-white">{region.name}</Link>
                <span>/</span>
              </>
            )}
            <span className="text-white">{country.name}</span>
          </div>

          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl md:text-4xl font-bold">{country.name}</h1>
                <span className={`text-sm px-3 py-1 rounded-full ${riskColors[country.riskLevel]}`}>
                  {country.riskLevel.charAt(0).toUpperCase() + country.riskLevel.slice(1)} Risk
                </span>
              </div>
              <p className="text-white/80 max-w-2xl">
                {country.description}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 flex flex-wrap gap-4">
            <div className="bg-white/10 rounded-lg px-4 py-2">
              <span className="text-2xl font-bold">{earthquakes.length}</span>
              <span className="text-sm text-white/70 ml-2">Last 30 days</span>
            </div>
            <div className="bg-white/10 rounded-lg px-4 py-2">
              <span className="text-2xl font-bold">{last24h}</span>
              <span className="text-sm text-white/70 ml-2">Last 24h</span>
            </div>
            <div className="bg-white/10 rounded-lg px-4 py-2">
              <span className="text-2xl font-bold">{m4Plus}</span>
              <span className="text-sm text-white/70 ml-2">M4+</span>
            </div>
            {m5Plus > 0 && (
              <div className="bg-white/20 rounded-lg px-4 py-2">
                <span className="text-2xl font-bold">{m5Plus}</span>
                <span className="text-sm text-white/70 ml-2">M5+ Significant</span>
              </div>
            )}
          </div>

          {/* Seismic Zones */}
          <div className="mt-4 flex flex-wrap gap-2">
            {country.seismicZones.map((zone) => (
              <span
                key={zone}
                className="text-sm bg-white/10 px-3 py-1 rounded-full"
              >
                {zone}
              </span>
            ))}
          </div>

          {/* Historical Data Link */}
          <div className="mt-6">
            <Link
              href={`/country/${slug}/history`}
              className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <span>📜</span>
              <span>View Historical Earthquakes & Volcanoes</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Recent Earthquakes ({earthquakes.length})
              </h2>
              {earthquakes.length > 0 ? (
                <EarthquakeList earthquakes={earthquakes} />
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No earthquakes M2.5+ recorded in the last 30 days.
                </p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Capital Info */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Capital City
              </h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{country.capital.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {country.capital.lat.toFixed(2)}°, {country.capital.lon.toFixed(2)}°
                  </p>
                </div>
              </div>
            </div>

            {/* Cities in Country */}
            {cities.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Major Cities ({cities.length})
                </h3>
                <div className="space-y-2">
                  {cities.map((city) => (
                    <Link
                      key={city.slug}
                      href={`/city/${city.slug}`}
                      className="block p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <p className="font-medium text-gray-900 dark:text-white">{city.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Pop: {(city.population / 1000000).toFixed(1)}M
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Related */}
            {region && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Region
                </h3>
                <Link
                  href={`/region/${region.slug}`}
                  className="block p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <p className="font-medium text-gray-900 dark:text-white">{region.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {region.countries.length} countries
                  </p>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
