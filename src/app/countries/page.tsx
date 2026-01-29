import { Metadata } from "next";
import Link from "next/link";
import { seismicCountries, seismicRegions, getCountriesInRegion } from "@/data/countries";

export const metadata: Metadata = {
  title: "Countries - Earthquake Monitoring by Country",
  description:
    "Track earthquakes in seismically active countries worldwide. Browse 60+ countries on the Pacific Ring of Fire, Alpine-Himalayan belt, and other major fault zones.",
};

export default function CountriesPage() {
  const extremeRisk = seismicCountries.filter(c => c.riskLevel === 'extreme');
  const highRisk = seismicCountries.filter(c => c.riskLevel === 'high');
  const moderateRisk = seismicCountries.filter(c => c.riskLevel === 'moderate');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <section className="bg-gradient-to-r from-red-700 to-red-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Earthquake Monitoring by Country
          </h1>
          <p className="text-red-100 max-w-2xl">
            Track seismic activity in {seismicCountries.length} countries across the world's most active tectonic regions.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Extreme Risk Countries */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-4 h-4 bg-red-600 rounded-full" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Extreme Seismic Risk ({extremeRisk.length})
            </h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Countries located directly on the Pacific Ring of Fire or major subduction zones with frequent large earthquakes.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {extremeRisk.map((country) => (
              <Link
                key={country.slug}
                href={`/country/${country.slug}`}
                className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:border-red-400 dark:hover:border-red-500 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                      {country.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Capital: {country.capital.name}
                    </p>
                  </div>
                  <span className="text-2xl">{country.code === 'JP' ? '🇯🇵' : country.code === 'ID' ? '🇮🇩' : country.code === 'PH' ? '🇵🇭' : country.code === 'US' ? '🇺🇸' : country.code === 'CL' ? '🇨🇱' : country.code === 'MX' ? '🇲🇽' : '🌍'}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-1">
                  {country.seismicZones.slice(0, 2).map((zone) => (
                    <span
                      key={zone}
                      className="text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-2 py-0.5 rounded"
                    >
                      {zone}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* High Risk Countries */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-4 h-4 bg-orange-500 rounded-full" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              High Seismic Risk ({highRisk.length})
            </h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Countries on the Alpine-Himalayan belt and other active tectonic boundaries with significant earthquake history.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {highRisk.map((country) => (
              <Link
                key={country.slug}
                href={`/country/${country.slug}`}
                className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:border-orange-400 dark:hover:border-orange-500 hover:shadow-lg transition-all"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                  {country.name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {country.capital.name}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* Moderate Risk Countries */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-4 h-4 bg-yellow-500 rounded-full" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Moderate Seismic Risk ({moderateRisk.length})
            </h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Countries with notable seismic activity from regional fault systems or rift zones.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {moderateRisk.map((country) => (
              <Link
                key={country.slug}
                href={`/country/${country.slug}`}
                className="group bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 hover:border-yellow-400 dark:hover:border-yellow-500 hover:shadow-md transition-all text-center"
              >
                <h3 className="font-medium text-sm text-gray-900 dark:text-white group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors">
                  {country.name}
                </h3>
              </Link>
            ))}
          </div>
        </section>

        {/* By Region */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Browse by Region
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {seismicRegions.map((region) => {
              const countries = getCountriesInRegion(region.slug);
              return (
                <Link
                  key={region.slug}
                  href={`/region/${region.slug}`}
                  className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all"
                >
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                    {region.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    {region.countries.length} countries
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {countries.slice(0, 5).map((c) => (
                      <span
                        key={c.code}
                        className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded"
                      >
                        {c.name}
                      </span>
                    ))}
                    {countries.length > 5 && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        +{countries.length - 5} more
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
