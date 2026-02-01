import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  GLOBAL_VOLCANOES,
  volcanoToSlug,
  countryToSlug,
  GlobalVolcano,
} from "@/data/global-volcanoes";
import { PHILIPPINE_VOLCANOES } from "@/data/philippine-volcanoes";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Find volcano by slug
function getVolcanoBySlug(slug: string): GlobalVolcano | undefined {
  return GLOBAL_VOLCANOES.find((v) => volcanoToSlug(v) === slug);
}

// Get Philippine volcano data if available (has more details)
function getPhilippineVolcano(name: string) {
  return PHILIPPINE_VOLCANOES.find(
    (v) => v.name.toLowerCase() === name.toLowerCase()
  );
}

// Generate static params for all volcanoes
export async function generateStaticParams() {
  return GLOBAL_VOLCANOES.map((volcano) => ({
    slug: volcanoToSlug(volcano),
  }));
}

// Generate metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const volcano = getVolcanoBySlug(slug);
  
  if (!volcano) {
    return { title: "Volcano Not Found | QuakeGlobe" };
  }

  return {
    title: `${volcano.name} Volcano, ${volcano.country} | QuakeGlobe`,
    description: `${volcano.name} is a ${volcano.type} in ${volcano.country}. Elevation: ${volcano.elevation}m. Last eruption: ${volcano.lastEruption || "Unknown"}. View volcanic activity and risk information.`,
    openGraph: {
      title: `${volcano.name} Volcano | QuakeGlobe`,
      description: `${volcano.type} in ${volcano.subregion}, ${volcano.country}. Track volcanic activity and hazard information.`,
    },
  };
}

export default async function VolcanoDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const volcano = getVolcanoBySlug(slug);

  if (!volcano) {
    notFound();
  }

  // Try to get more detailed Philippine data
  const phVolcano = getPhilippineVolcano(volcano.name);

  const statusColors = {
    active: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
    potentially_active: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800",
    holocene: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
    historical: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600",
  };

  const formatPopulation = (pop?: number) => {
    if (!pop) return "N/A";
    if (pop >= 1000000) return `${(pop / 1000000).toFixed(1)}M`;
    if (pop >= 1000) return `${Math.round(pop / 1000)}K`;
    return pop.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <section className="bg-gradient-to-br from-orange-600 via-red-600 to-red-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-orange-100 mb-4">
            <Link href="/volcanoes/global" className="hover:text-white">
              Global Volcanoes
            </Link>
            <span>›</span>
            <Link
              href={`/volcanoes/country/${countryToSlug(volcano.country)}`}
              className="hover:text-white"
            >
              {volcano.country}
            </Link>
            <span>›</span>
            <span className="text-white">{volcano.name}</span>
          </nav>

          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center text-3xl">
              🌋
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl md:text-4xl font-bold">{volcano.name}</h1>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium border ${statusColors[volcano.status]}`}
                >
                  {volcano.status.replace("_", " ")}
                </span>
              </div>
              <p className="text-lg text-orange-100 mt-2">
                {volcano.type} • {volcano.subregion}, {volcano.country}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Key Stats */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Volcano Information
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {volcano.elevation.toLocaleString()}m
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Elevation
                    </p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {volcano.lastEruption || "Unknown"}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Last Eruption
                    </p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {volcano.vei ?? "N/A"}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      VEI (Last Major)
                    </p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {volcano.type.split(",")[0]}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Type
                    </p>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Location
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Coordinates
                    </p>
                    <p className="font-mono text-gray-900 dark:text-white">
                      {volcano.latitude.toFixed(4)}°N, {volcano.longitude.toFixed(4)}°E
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Region
                    </p>
                    <p className="text-gray-900 dark:text-white">
                      {volcano.region}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Subregion
                    </p>
                    <p className="text-gray-900 dark:text-white">
                      {volcano.subregion}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Country
                    </p>
                    <Link
                      href={`/volcanoes/country/${countryToSlug(volcano.country)}`}
                      className="text-red-600 dark:text-red-400 hover:underline"
                    >
                      {volcano.country}
                    </Link>
                  </div>
                </div>

                {/* Map Link */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <a
                    href={`https://www.google.com/maps?q=${volcano.latitude},${volcano.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    View on Google Maps
                  </a>
                </div>
              </div>

              {/* Philippine-specific details */}
              {phVolcano && (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    🇵🇭 PHIVOLCS Information
                  </h2>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">
                        Province
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        {phVolcano.province}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">
                        Alert Level
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded ${
                          phVolcano.alertLevel >= 2
                            ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                            : phVolcano.alertLevel === 1
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                            : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        }`}
                      >
                        Level {phVolcano.alertLevel}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">
                        Hydrothermal Activity
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        {phVolcano.hydrothermalActivity}/3
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Population Exposure */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  ⚠️ Population Exposure
                </h2>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-500 dark:text-gray-400">
                        Within 10 km
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {formatPopulation(volcano.population10km)}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-500"
                        style={{
                          width: `${Math.min(
                            100,
                            ((volcano.population10km || 0) / 100000) * 100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-500 dark:text-gray-400">
                        Within 30 km
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {formatPopulation(volcano.population30km)}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange-500"
                        style={{
                          width: `${Math.min(
                            100,
                            ((volcano.population30km || 0) / 1000000) * 100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-500 dark:text-gray-400">
                        Within 100 km
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {formatPopulation(volcano.population100km)}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-500"
                        style={{
                          width: `${Math.min(
                            100,
                            ((volcano.population100km || 0) / 10000000) * 100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Quick Links
                </h2>
                <div className="space-y-2">
                  <Link
                    href={`/near-me?lat=${volcano.latitude}&lng=${volcano.longitude}`}
                    className="block w-full px-4 py-2 bg-red-600 text-white text-center rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Earthquakes Near Here
                  </Link>
                  <Link
                    href="/volcanoes/analysis"
                    className="block w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-center rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Volcanic Analysis
                  </Link>
                  {volcano.gvpId && (
                    <a
                      href={`https://volcano.si.edu/volcano.cfm?vn=${volcano.gvpId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-center rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      Smithsonian GVP →
                    </a>
                  )}
                </div>
              </div>

              {/* Disclaimer */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Note:</strong> This is informational data from the
                  Smithsonian Global Volcanism Program. For official volcanic
                  alerts, consult your local volcanological agency.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
