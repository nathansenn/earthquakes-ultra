import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { philippineRegions, getCitiesByRegion, City } from "@/data/philippine-cities";
import { getPhilippinesEarthquakes, ProcessedEarthquake as DBEarthquake } from "@/lib/db-queries";
import { getTimeAgo, getMagnitudeIntensity } from "@/lib/usgs-api";

// Extend the DB earthquake to match the ProcessedEarthquake interface used in this page
interface ProcessedEarthquake {
  id: string;
  magnitude: number;
  magnitudeType: string;
  place: string;
  time: Date;
  timeAgo: string;
  latitude: number;
  longitude: number;
  depth: number;
  url: string;
  felt: number | null;
  tsunami: boolean;
  alert: string | null;
  intensity: string;
  significanceScore: number;
}

interface Props {
  params: Promise<{ region: string }>;
}

function getRegionBySlug(slug: string) {
  return philippineRegions.find((r) => r.slug === slug);
}

export async function generateStaticParams() {
  return philippineRegions.map((region) => ({ region: region.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { region: regionSlug } = await params;
  const region = getRegionBySlug(regionSlug);

  if (!region) {
    return { title: "Region Not Found" };
  }

  return {
    title: `${region.name} Earthquakes | Region ${region.code}`,
    description: `Track earthquakes in ${region.name} (Region ${region.code}), Philippines. View recent seismic activity and earthquake history for all cities in the region.`,
    openGraph: {
      title: `${region.name} Earthquakes | QuakeGlobe`,
      description: `Real-time earthquake tracking for ${region.name}, Philippines.`,
    },
  };
}

export const revalidate = 1800;

export default async function RegionPage({ params }: Props) {
  const { region: regionSlug } = await params;
  const region = getRegionBySlug(regionSlug);

  if (!region) {
    notFound();
  }

  const cities = getCitiesByRegion(region.code);

  // Fetch recent M1+ earthquakes for Philippines from local database
  let earthquakes: ProcessedEarthquake[] = [];
  try {
    const raw = getPhilippinesEarthquakes(30, 1.0, 5000);
    earthquakes = raw.map(eq => ({
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
    }));
  } catch (error) {
    console.error("Failed to fetch earthquakes:", error);
  }

  // Filter earthquakes that are near cities in this region
  const regionEarthquakes = earthquakes.filter((eq) => {
    return cities.some((city) => {
      const latDiff = Math.abs(eq.latitude - city.latitude);
      const lngDiff = Math.abs(eq.longitude - city.longitude);
      return latDiff < 2 && lngDiff < 2; // Rough bounding box
    });
  });

  // Sort cities by population
  const sortedCities = [...cities].sort((a, b) => b.population - a.population);
  const majorCities = sortedCities.filter((c) => c.isHCC);
  const totalPopulation = cities.reduce((sum, c) => sum + c.population, 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <section className="bg-gradient-to-br from-indigo-600 to-indigo-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-indigo-200 mb-4">
            <Link href="/philippines" className="hover:text-white">
              Philippines
            </Link>
            <span>/</span>
            <span className="text-white">{region.name}</span>
          </nav>

          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 bg-white/20 rounded-lg text-sm font-medium">
              Region {region.code}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{region.name}</h1>
          <p className="text-lg text-indigo-100">
            Earthquake activity and monitoring
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-2xl font-bold">{cities.length}</p>
              <p className="text-sm text-indigo-100">Cities</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-2xl font-bold">{majorCities.length}</p>
              <p className="text-sm text-indigo-100">Major Cities</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-2xl font-bold">{regionEarthquakes.length}</p>
              <p className="text-sm text-indigo-100">Recent Quakes</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-2xl font-bold">
                {(totalPopulation / 1000000).toFixed(1)}M
              </p>
              <p className="text-sm text-indigo-100">Population</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap gap-3">
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

      {/* Cities Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Cities in {region.name}
          </h2>

          {majorCities.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4 uppercase tracking-wide">
                Major Cities (HUC)
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {majorCities.map((city) => (
                  <CityCard key={city.slug} city={city} featured />
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4 uppercase tracking-wide">
              All Cities
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {sortedCities.map((city) => (
                <CityCard key={city.slug} city={city} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Recent Earthquakes in Region */}
      {regionEarthquakes.length > 0 && (
        <section className="py-12 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Recent Earthquakes Near {region.name}
              </h2>
              <Link
                href="/earthquakes"
                className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm"
              >
                View all →
              </Link>
            </div>
            <div className="grid gap-4">
              {regionEarthquakes.slice(0, 5).map((eq) => (
                <div
                  key={eq.id}
                  className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl"
                >
                  <div
                    className={`w-14 h-14 rounded-lg flex items-center justify-center font-bold text-white ${
                      eq.magnitude >= 5
                        ? "bg-red-600"
                        : eq.magnitude >= 4
                        ? "bg-orange-500"
                        : "bg-yellow-500 text-gray-900"
                    }`}
                  >
                    {eq.magnitude.toFixed(1)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">{eq.place}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {eq.timeAgo} • {eq.depth.toFixed(1)} km deep
                    </p>
                  </div>
                  <a
                    href={eq.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-indigo-600 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Other Regions */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Other Regions
          </h2>
          <div className="flex flex-wrap gap-2">
            {philippineRegions
              .filter((r) => r.slug !== region.slug)
              .map((r) => (
                <Link
                  key={r.slug}
                  href={`/region/${r.slug}`}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/30 hover:text-indigo-700 dark:hover:text-indigo-400 transition-colors text-sm"
                >
                  {r.name}
                </Link>
              ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function CityCard({ city, featured = false }: { city: City; featured?: boolean }) {
  return (
    <Link
      href={`/philippines/${city.slug}`}
      className={`group p-4 bg-white dark:bg-gray-800 rounded-xl border transition-all hover:shadow-lg ${
        featured
          ? "border-indigo-200 dark:border-indigo-800 hover:border-indigo-400"
          : "border-gray-200 dark:border-gray-700 hover:border-indigo-300"
      }`}
    >
      <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
        {city.name}
      </h4>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
        {city.province}
      </p>
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
        Pop: {(city.population / 1000).toFixed(0)}K
      </p>
      {city.isHCC && (
        <span className="inline-block mt-2 px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-xs rounded-full">
          HUC
        </span>
      )}
    </Link>
  );
}
