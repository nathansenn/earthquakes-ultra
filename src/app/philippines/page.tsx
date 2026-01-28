import { Metadata } from "next";
import Link from "next/link";
import { philippineCities, philippineRegions, getCitiesByRegion } from "@/data/philippine-cities";

export const metadata: Metadata = {
  title: "Earthquakes by City & Region | Philippines",
  description:
    "Find earthquake information for any city or municipality in the Philippines. Browse by region or search for your location.",
  openGraph: {
    title: "Earthquakes by City & Region | Lindol.ph",
    description: "Track earthquakes for any city in the Philippines. Complete coverage of all 17 regions.",
  },
};

export default function PhilippinesPage() {
  // Get top cities by population
  const topCities = [...philippineCities]
    .sort((a, b) => b.population - a.population)
    .slice(0, 20);

  // Get HCC cities
  const hccCities = philippineCities.filter((c) => c.isHCC);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <section className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Earthquakes by Location
          </h1>
          <p className="text-lg text-emerald-100 max-w-2xl">
            Track earthquake activity for any city or region in the Philippines.
            We cover all {philippineCities.length} cities across 17 regions.
          </p>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mt-8 max-w-md">
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold">{philippineCities.length}</p>
              <p className="text-sm text-emerald-100">Cities</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold">{philippineRegions.length}</p>
              <p className="text-sm text-emerald-100">Regions</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold">{hccCities.length}</p>
              <p className="text-sm text-emerald-100">Major Cities</p>
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-8 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/near-me"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              Use My Location
            </Link>
            <Link
              href="/map"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              View Map
            </Link>
          </div>
        </div>
      </section>

      {/* Popular Cities */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Popular Cities
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {topCities.map((city) => (
              <Link
                key={city.slug}
                href={`/philippines/${city.slug}`}
                className="group p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-lg transition-all"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {city.name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {city.province}
                </p>
                {city.isHCC && (
                  <span className="inline-block mt-2 px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs rounded-full">
                    Major City
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Browse by Region */}
      <section className="py-12 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Browse by Region
          </h2>
          <div className="space-y-8">
            {philippineRegions.map((region) => {
              const cities = getCitiesByRegion(region.code);
              if (cities.length === 0) return null;

              return (
                <div key={region.code} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <Link
                        href={`/region/${region.slug}`}
                        className="text-lg font-semibold text-gray-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                      >
                        {region.name}
                      </Link>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Region {region.code} • {cities.length} cities
                      </p>
                    </div>
                    <Link
                      href={`/region/${region.slug}`}
                      className="text-emerald-600 dark:text-emerald-400 hover:underline text-sm"
                    >
                      View all →
                    </Link>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {cities.slice(0, 8).map((city) => (
                      <Link
                        key={city.slug}
                        href={`/philippines/${city.slug}`}
                        className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                      >
                        {city.name}
                      </Link>
                    ))}
                    {cities.length > 8 && (
                      <Link
                        href={`/region/${region.slug}`}
                        className="px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-lg text-sm"
                      >
                        +{cities.length - 8} more
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-red-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Stay Informed About Earthquakes</h2>
          <p className="text-red-100 mb-6">
            Set up alerts to get notified when earthquakes occur near your location.
          </p>
          <Link
            href="/alerts"
            className="inline-block px-8 py-3 bg-white text-red-600 rounded-xl font-semibold hover:bg-red-50 transition-colors"
          >
            Set Up Alerts
          </Link>
        </div>
      </section>
    </div>
  );
}
