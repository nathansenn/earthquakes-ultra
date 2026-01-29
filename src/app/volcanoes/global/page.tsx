import { Metadata } from "next";
import Link from "next/link";
import { 
  GLOBAL_VOLCANOES, 
  getGlobalVolcanoStats, 
  getVolcanoCountries,
  getVolcanoRegions,
  getRecentlyEruptedVolcanoes,
  getVolcanoesByPopulationRisk,
  volcanoToSlug,
  countryToSlug,
  GlobalVolcano
} from "@/data/global-volcanoes";

export const metadata: Metadata = {
  title: "Global Volcano Database | Lindol.ph",
  description: "Explore over 250 active and potentially active volcanoes worldwide. Interactive database with eruption history, population exposure, and volcanic hazard information.",
  openGraph: {
    title: "Global Volcano Database | Lindol.ph",
    description: "Over 250 volcanoes worldwide - from the Ring of Fire to Iceland. Track volcanic activity globally.",
  },
};

function VolcanoCard({ volcano }: { volcano: GlobalVolcano }) {
  const statusColors = {
    active: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    potentially_active: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    holocene: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    historical: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  };

  const formatPopulation = (pop?: number) => {
    if (!pop) return 'N/A';
    if (pop >= 1000000) return `${(pop / 1000000).toFixed(1)}M`;
    if (pop >= 1000) return `${(pop / 1000).toFixed(0)}K`;
    return pop.toString();
  };

  return (
    <Link 
      href={`/volcanoes/${volcanoToSlug(volcano)}`}
      className="block bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-red-300 dark:hover:border-red-700 transition-all"
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">{volcano.name}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {volcano.country} • {volcano.subregion}
          </p>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[volcano.status]}`}>
          {volcano.status.replace('_', ' ')}
        </span>
      </div>
      
      <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
        <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
          <p className="text-gray-500 dark:text-gray-400">Elevation</p>
          <p className="font-semibold text-gray-900 dark:text-white">{volcano.elevation.toLocaleString()}m</p>
        </div>
        <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
          <p className="text-gray-500 dark:text-gray-400">Last Eruption</p>
          <p className="font-semibold text-gray-900 dark:text-white">{volcano.lastEruption || 'Unknown'}</p>
        </div>
        <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
          <p className="text-gray-500 dark:text-gray-400">Pop. 30km</p>
          <p className="font-semibold text-gray-900 dark:text-white">{formatPopulation(volcano.population30km)}</p>
        </div>
      </div>
      
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">{volcano.type}</p>
    </Link>
  );
}

export default function GlobalVolcanoesPage() {
  const stats = getGlobalVolcanoStats();
  const countries = getVolcanoCountries();
  const regions = getVolcanoRegions();
  const recentEruptions = getRecentlyEruptedVolcanoes(2020);
  const highRisk = getVolcanoesByPopulationRisk().slice(0, 20);

  // Group volcanoes by region
  const volcanoesGroupedByRegion = regions.reduce((acc, region) => {
    acc[region] = GLOBAL_VOLCANOES.filter(v => v.region === region);
    return acc;
  }, {} as Record<string, GlobalVolcano[]>);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <section className="bg-gradient-to-br from-red-700 via-orange-600 to-yellow-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🌋</span>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Global Volcano Database</h1>
              <p className="text-orange-100">Active &amp; Potentially Active Volcanoes Worldwide</p>
            </div>
          </div>

          {/* Global Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8">
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold">{stats.total}</p>
              <p className="text-sm text-orange-100">Total Volcanoes</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold">{stats.active}</p>
              <p className="text-sm text-orange-100">Active</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold">{stats.recentEruptions}</p>
              <p className="text-sm text-orange-100">Erupted Since 2020</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold">{stats.countries}</p>
              <p className="text-sm text-orange-100">Countries</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold">{stats.regions}</p>
              <p className="text-sm text-orange-100">Regions</p>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation */}
      <section className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-4 overflow-x-auto">
            <Link href="/volcanoes" className="text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 whitespace-nowrap">
              ← Philippines
            </Link>
            <span className="text-gray-300 dark:text-gray-600">|</span>
            <a href="#recent" className="text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 whitespace-nowrap">
              Recent Eruptions
            </a>
            <a href="#risk" className="text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 whitespace-nowrap">
              Population Risk
            </a>
            <a href="#countries" className="text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 whitespace-nowrap">
              By Country
            </a>
            <a href="#regions" className="text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 whitespace-nowrap">
              By Region
            </a>
          </div>
        </div>
      </section>

      {/* Recent Eruptions */}
      <section id="recent" className="py-8 bg-red-50 dark:bg-red-900/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Recently Erupted (Since 2020)
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
            {recentEruptions.length} volcanoes have erupted in the past 5 years
          </p>
          
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
            {recentEruptions.slice(0, 12).map((volcano) => (
              <VolcanoCard key={volcano.id} volcano={volcano} />
            ))}
          </div>
          
          {recentEruptions.length > 12 && (
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                + {recentEruptions.length - 12} more recently erupted volcanoes
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Population Risk */}
      <section id="risk" className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            🚨 Highest Population Exposure
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
            Volcanoes with the most people living nearby (weighted by distance)
          </p>
          
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
            {highRisk.slice(0, 12).map((volcano, index) => (
              <div key={volcano.id} className="relative">
                <span className="absolute -top-2 -left-2 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold z-10">
                  {index + 1}
                </span>
                <VolcanoCard volcano={volcano} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Countries */}
      <section id="countries" className="py-8 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            🌍 Browse by Country
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
            {countries.length} countries with active or potentially active volcanoes
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {countries.map((country) => {
              const count = GLOBAL_VOLCANOES.filter(v => v.country === country).length;
              return (
                <Link
                  key={country}
                  href={`/volcanoes/country/${countryToSlug(country)}`}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <span className="font-medium text-gray-900 dark:text-white text-sm truncate">
                    {country}
                  </span>
                  <span className="text-xs bg-gray-200 dark:bg-gray-600 px-2 py-0.5 rounded-full text-gray-600 dark:text-gray-300">
                    {count}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Regions */}
      <section id="regions" className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            🗺️ Volcanoes by Region
          </h2>
          
          {regions.map((region) => {
            const regionVolcanoes = volcanoesGroupedByRegion[region] || [];
            if (regionVolcanoes.length === 0) return null;
            
            return (
              <div key={region} className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-orange-500" />
                  {region}
                  <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                    ({regionVolcanoes.length} volcanoes)
                  </span>
                </h3>
                
                <div className="grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                  {regionVolcanoes.slice(0, 10).map((volcano) => (
                    <Link
                      key={volcano.id}
                      href={`/volcanoes/${volcanoToSlug(volcano)}`}
                      className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-700 transition-colors"
                    >
                      <span className={`w-2 h-2 rounded-full ${volcano.status === 'active' ? 'bg-red-500' : 'bg-orange-400'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                          {volcano.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {volcano.country}
                        </p>
                      </div>
                    </Link>
                  ))}
                  {regionVolcanoes.length > 10 && (
                    <div className="flex items-center justify-center p-2 text-sm text-gray-500 dark:text-gray-400">
                      + {regionVolcanoes.length - 10} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Data Source */}
      <section className="py-8 bg-gray-100 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Data Sources
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Volcano data sourced from the{" "}
            <a 
              href="https://volcano.si.edu/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-red-600 hover:underline"
            >
              Smithsonian Global Volcanism Program
            </a>
            {", "}
            <a 
              href="https://www.usgs.gov/programs/volcano-hazards" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-red-600 hover:underline"
            >
              USGS Volcano Hazards Program
            </a>
            , and various national geological surveys.
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
            Population data is approximate and based on LandScan global population database.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-8 bg-gradient-to-r from-red-600 to-orange-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl font-bold mb-2">Monitor Philippine Volcanoes</h2>
          <p className="text-red-100 mb-4">
            Get seismic-volcanic correlation analysis for Philippine volcanoes
          </p>
          <Link
            href="/volcanoes"
            className="inline-block px-6 py-2 bg-white text-red-600 rounded-lg font-semibold hover:bg-red-50 transition-colors"
          >
            View Philippine Dashboard →
          </Link>
        </div>
      </section>
    </div>
  );
}
