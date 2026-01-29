import { Metadata } from "next";
import Link from "next/link";
import { majorCities, formatPopulation } from "@/data/major-cities";
import { seismicCountries } from "@/data/countries";

export const metadata: Metadata = {
  title: "Major Cities - Earthquake Monitoring in Global Urban Centers",
  description:
    "Track earthquakes near major cities worldwide. Monitor seismic activity in Tokyo, Los Angeles, Istanbul, Manila, Lima, and 100+ cities in high-risk zones.",
};

export default function CitiesPage() {
  // Group cities by country
  const citiesByCountry = majorCities.reduce((acc, city) => {
    if (!acc[city.country]) {
      acc[city.country] = [];
    }
    acc[city.country].push(city);
    return acc;
  }, {} as Record<string, typeof majorCities>);

  // Sort countries by number of cities
  const sortedCountries = Object.entries(citiesByCountry)
    .sort((a, b) => b[1].length - a[1].length);

  // Get largest cities
  const largestCities = [...majorCities]
    .sort((a, b) => b.population - a.population)
    .slice(0, 20);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <section className="bg-gradient-to-r from-orange-600 to-red-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Major Cities in Seismic Zones
          </h1>
          <p className="text-orange-100 max-w-2xl">
            Monitor earthquake activity near {majorCities.length}+ major cities across {Object.keys(citiesByCountry).length} countries in high-risk seismic regions.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Largest Cities */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Largest Cities at Risk
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The world's most populous metropolitan areas in seismic zones.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {largestCities.map((city, idx) => (
              <Link
                key={city.slug}
                href={`/city/${city.slug}`}
                className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:border-orange-400 dark:hover:border-orange-500 hover:shadow-lg transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center text-sm font-bold text-orange-600 dark:text-orange-400">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                      {city.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {city.country}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      Pop: {formatPopulation(city.population)}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Cities by Country */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Cities by Country
          </h2>
          <div className="space-y-8">
            {sortedCountries.map(([country, cities]) => {
              const countryData = seismicCountries.find(c => c.name === country);
              return (
                <div key={country}>
                  <div className="flex items-center gap-3 mb-4">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {country}
                    </h3>
                    {countryData && (
                      <Link
                        href={`/country/${countryData.slug}`}
                        className="text-sm text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                      >
                        View country →
                      </Link>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      countryData?.riskLevel === 'extreme' 
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                        : countryData?.riskLevel === 'high'
                        ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                    }`}>
                      {countryData?.riskLevel || 'moderate'} risk
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                    {cities.map((city) => (
                      <Link
                        key={city.slug}
                        href={`/city/${city.slug}`}
                        className="group bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 hover:border-orange-300 dark:hover:border-orange-500 hover:shadow-md transition-all"
                      >
                        <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                          {city.name}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatPopulation(city.population)} pop
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Info Box */}
        <div className="mt-12 bg-orange-50 dark:bg-orange-900/20 rounded-xl p-6 border border-orange-200 dark:border-orange-800">
          <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">
            About City Earthquake Monitoring
          </h3>
          <p className="text-orange-800 dark:text-orange-200 text-sm">
            Each city page shows earthquakes within a specific radius (typically 100-200km) based on the city's 
            location. This includes all earthquakes that could potentially be felt in the metropolitan area. 
            Data is sourced from USGS and updated in real-time.
          </p>
        </div>
      </div>
    </div>
  );
}
