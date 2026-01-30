import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  GLOBAL_VOLCANOES,
  getVolcanoesByCountry,
  getVolcanoCountries,
  volcanoToSlug,
  slugToCountry,
  countryToSlug,
  GlobalVolcano,
} from "@/data/global-volcanoes";

interface PageProps {
  params: Promise<{ country: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { country: countrySlug } = await params;
  const countryName = slugToCountry(countrySlug);
  
  if (!countryName) {
    return { title: "Country Not Found | QuakeGlobe" };
  }

  const volcanoes = getVolcanoesByCountry(countryName);
  
  return {
    title: `${countryName} Volcanoes (${volcanoes.length}) | QuakeGlobe`,
    description: `Explore ${volcanoes.length} active and potentially active volcanoes in ${countryName}. View eruption history, elevation, and population exposure data.`,
    openGraph: {
      title: `Volcanoes of ${countryName} | QuakeGlobe`,
      description: `${volcanoes.length} volcanoes in ${countryName} - eruption history, locations, and volcanic hazard information.`,
    },
  };
}

export async function generateStaticParams() {
  const countries = getVolcanoCountries();
  return countries.map((country) => ({
    country: countryToSlug(country),
  }));
}

function VolcanoCard({ volcano }: { volcano: GlobalVolcano }) {
  const statusColors: Record<string, string> = {
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
      className="block bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-red-300 dark:hover:border-red-700 transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold text-lg text-gray-900 dark:text-white">{volcano.name}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {volcano.region} • {volcano.type}
          </p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[volcano.status]}`}>
          {volcano.status.replace('_', ' ')}
        </span>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
        <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
          <p className="text-xs text-gray-500 dark:text-gray-400">Elevation</p>
          <p className="font-semibold text-gray-900 dark:text-white">{volcano.elevation.toLocaleString()}m</p>
        </div>
        <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
          <p className="text-xs text-gray-500 dark:text-gray-400">Last Eruption</p>
          <p className="font-semibold text-gray-900 dark:text-white">{volcano.lastEruption || 'Unknown'}</p>
        </div>
        <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
          <p className="text-xs text-gray-500 dark:text-gray-400">Pop. 30km</p>
          <p className="font-semibold text-gray-900 dark:text-white">{formatPopulation(volcano.population30km)}</p>
        </div>
        <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
          <p className="text-xs text-gray-500 dark:text-gray-400">Pop. 100km</p>
          <p className="font-semibold text-gray-900 dark:text-white">{formatPopulation(volcano.population100km)}</p>
        </div>
      </div>

      {volcano.vei && (
        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">Max VEI:</span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded ${
            volcano.vei >= 6 ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
            volcano.vei >= 4 ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' :
            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
          }`}>
            VEI {volcano.vei}
          </span>
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
        <p className="text-xs text-gray-400 dark:text-gray-500">
          📍 {volcano.latitude.toFixed(4)}°, {volcano.longitude.toFixed(4)}°
        </p>
      </div>
    </Link>
  );
}

export default async function CountryVolcanoesPage({ params }: PageProps) {
  const { country: countrySlug } = await params;
  const countryName = slugToCountry(countrySlug);
  
  if (!countryName) {
    notFound();
  }

  const volcanoes = getVolcanoesByCountry(countryName);
  
  if (volcanoes.length === 0) {
    notFound();
  }

  // Stats
  const activeCount = volcanoes.filter(v => v.status === 'active').length;
  const recentEruptions = volcanoes.filter(v => {
    if (!v.lastEruption) return false;
    const year = parseInt(v.lastEruption);
    return !isNaN(year) && year >= 2000;
  });
  const totalPop30km = volcanoes.reduce((sum, v) => sum + (v.population30km || 0), 0);
  const highestVolcano = volcanoes.reduce((a, b) => a.elevation > b.elevation ? a : b);

  // Group by region
  const regions = [...new Set(volcanoes.map(v => v.region))];
  const bySubregion = regions.map(sr => ({
    name: sr,
    volcanoes: volcanoes.filter(v => v.region === sr),
  }));

  // Nearby countries
  const allCountries = getVolcanoCountries();
  const region = volcanoes[0]?.region;
  const nearbyCountries = allCountries.filter(c => {
    const countryVolcanoes = getVolcanoesByCountry(c);
    return c !== countryName && countryVolcanoes.some(v => v.region === region);
  }).slice(0, 6);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <section className="bg-gradient-to-br from-red-700 via-red-600 to-orange-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm text-red-200 mb-4">
            <Link href="/volcanoes" className="hover:text-white">Volcanoes</Link>
            <span>/</span>
            <Link href="/volcanoes/global" className="hover:text-white">Global</Link>
            <span>/</span>
            <span className="text-white">{countryName}</span>
          </nav>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🌋</span>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Volcanoes of {countryName}</h1>
              <p className="text-red-100">{volcanoes.length} volcanoes in database</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold">{activeCount}</p>
              <p className="text-sm text-red-100">Active</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold">{recentEruptions.length}</p>
              <p className="text-sm text-red-100">Erupted Since 2000</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold">{highestVolcano.elevation.toLocaleString()}m</p>
              <p className="text-sm text-red-100">Highest Peak</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold">{(totalPop30km / 1000000).toFixed(1)}M</p>
              <p className="text-sm text-red-100">People Within 30km</p>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation */}
      <section className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-4 overflow-x-auto">
            <Link href="/volcanoes/global" className="text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 whitespace-nowrap">
              ← Global Database
            </Link>
            <span className="text-gray-300 dark:text-gray-600">|</span>
            {regions.map(sr => (
              <a 
                key={sr}
                href={`#${sr.toLowerCase().replace(/\s+/g, '-')}`} 
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 whitespace-nowrap"
              >
                {sr}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* All Volcanoes */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {bySubregion.length > 1 ? (
            // Multiple regions - group them
            bySubregion.map(({ name, volcanoes: subVolcanoes }) => (
              <div key={name} id={name.toLowerCase().replace(/\s+/g, '-')} className="mb-10">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  {name}
                  <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                    ({subVolcanoes.length} volcanoes)
                  </span>
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {subVolcanoes.map((volcano) => (
                    <VolcanoCard key={volcano.id} volcano={volcano} />
                  ))}
                </div>
              </div>
            ))
          ) : (
            // Single region - just list all
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {volcanoes.map((volcano) => (
                <VolcanoCard key={volcano.id} volcano={volcano} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Nearby Countries */}
      {nearbyCountries.length > 0 && (
        <section className="py-8 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Nearby Countries with Volcanoes
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {nearbyCountries.map((country) => {
                const count = getVolcanoesByCountry(country).length;
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
      )}

      {/* CTA */}
      <section className="py-8 bg-gradient-to-r from-gray-800 to-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl font-bold mb-2">Explore Global Volcanic Activity</h2>
          <p className="text-gray-300 mb-4">
            View all {GLOBAL_VOLCANOES.length} volcanoes in our database
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/volcanoes/global"
              className="inline-block px-6 py-2 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Global Database →
            </Link>
            <Link
              href="/volcanoes"
              className="inline-block px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
            >
              Philippine Monitoring
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
