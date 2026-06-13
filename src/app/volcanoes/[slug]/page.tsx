import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  GLOBAL_VOLCANOES,
  volcanoToSlug,
  countryToSlug,
  GlobalVolcano,
} from "@/data/global-volcanoes";
import { PHILIPPINE_VOLCANOES, Volcano as PhVolcano, volcanoNameToSlug } from "@/data/philippine-volcanoes";
import { getPhilippinesEarthquakes, getDataFreshness, getDataReferenceTime } from "@/lib/db-queries";
import { getDistanceFromLatLonInKm, philippineCities } from "@/data/philippine-cities";
import { DataFreshness } from "@/components/ui/DataFreshness";
import { getEruptionRecord, type NotableEruption, type UnrestSignal, type ScienceRef } from "@/data/eruption-history";
import { philippineBaseAnnualRate, reposeAnalysis, assessGlobalVolcano, type RiskLevel } from "@/lib/eruption-forecast";
import { assessVolcanoRisk, type Earthquake } from "@/lib/volcanic-prediction-v2";
import { RiskCard, type RiskCardData } from "@/components/volcano/RiskCard";
import { toRiskCardData } from "@/components/volcano/risk-card-data";

const RISK_TEXT: Record<RiskLevel, string> = {
  CRITICAL: 'text-red-700 dark:text-red-300',
  VERY_HIGH: 'text-red-600 dark:text-red-400',
  HIGH: 'text-orange-600 dark:text-orange-400',
  ELEVATED: 'text-yellow-600 dark:text-yellow-400',
  MODERATE: 'text-lime-600 dark:text-lime-400',
  LOW: 'text-green-600 dark:text-green-400',
  BACKGROUND: 'text-gray-500 dark:text-gray-400',
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Unified volcano type for display
interface UnifiedVolcano {
  id: string;
  name: string;
  country: string;
  region: string;
  subregion: string;
  latitude: number;
  longitude: number;
  elevation: number;
  type: string;
  status: string;
  lastEruption: string | null;
  vei?: number;
  population10km?: number;
  population30km?: number;
  population100km?: number;
  gvpId?: string;
  // Philippine-specific
  province?: string;
  alertLevel?: number;
  hydrothermalActivity?: number;
  monitoringStations?: number;
  hasHazardMap?: boolean;
  riskFactors?: string[];
  description?: string;
  isPhilippine: boolean;
  // Eruption history (GVP ground-truth, Philippine volcanoes)
  recordedEruptions?: number;
  recordStartYear?: number;
  recurrenceYears?: number;
  // Historical & scientific context
  eruptionStyle?: string;
  dominantVEI?: number;
  notableEruptions?: NotableEruption[];
  recentUnrest?: UnrestSignal[];
  references?: ScienceRef[];
  reposeStatus?: string;
  reposeInterpretation?: string;
  reposeYearsSinceLast?: number | null;
  reposeMeanRecurrence?: number | null;
}

// Find volcano by slug from both databases
function getVolcanoBySlug(slug: string): UnifiedVolcano | undefined {
  // Check Philippine volcanoes first (more detailed data)
  const phVolcano = PHILIPPINE_VOLCANOES.find((v) => volcanoNameToSlug(v.name) === slug);
  if (phVolcano) {
    const rec = getEruptionRecord(phVolcano.name);
    const baseRate = philippineBaseAnnualRate(phVolcano);
    const rp = reposeAnalysis(rec);
    return {
      id: phVolcano.id,
      name: phVolcano.name,
      country: 'Philippines',
      region: 'Philippines and SE Asia',
      subregion: phVolcano.region,
      latitude: phVolcano.latitude,
      longitude: phVolcano.longitude,
      elevation: phVolcano.elevation_m,
      type: phVolcano.type,
      status: phVolcano.status,
      lastEruption: phVolcano.lastEruption,
      population30km: phVolcano.nearbyPopulation,
      // Verified GVP number (legacy ids in the dataset were placeholders).
      gvpId: rec?.gvpNumber ? String(rec.gvpNumber) : undefined,
      province: phVolcano.province,
      recordedEruptions: rec?.historicalEruptions,
      recordStartYear: rec?.recordStartYear,
      recurrenceYears: Math.round(1 / baseRate),
      eruptionStyle: rec?.eruptionStyle,
      dominantVEI: rec?.dominantVEI,
      notableEruptions: rec?.notableEruptions,
      recentUnrest: rec?.recentUnrest,
      references: rec?.references,
      reposeStatus: rp.status,
      reposeInterpretation: rp.interpretation,
      reposeYearsSinceLast: rp.yearsSinceLast,
      reposeMeanRecurrence: rp.meanRecurrenceYears,
      alertLevel: phVolcano.alertLevel,
      hydrothermalActivity: phVolcano.hydrothermalActivity,
      monitoringStations: phVolcano.monitoringStations,
      hasHazardMap: phVolcano.hasHazardMap,
      riskFactors: phVolcano.riskFactors,
      description: phVolcano.description,
      isPhilippine: true,
    };
  }

  // Check global volcanoes
  const globalVolcano = GLOBAL_VOLCANOES.find((v) => volcanoToSlug(v) === slug);
  if (globalVolcano) {
    return {
      id: globalVolcano.id,
      name: globalVolcano.name,
      country: globalVolcano.country,
      region: globalVolcano.region,
      subregion: globalVolcano.subregion,
      latitude: globalVolcano.latitude,
      longitude: globalVolcano.longitude,
      elevation: globalVolcano.elevation,
      type: globalVolcano.type,
      status: globalVolcano.status,
      lastEruption: globalVolcano.lastEruption || null,
      vei: globalVolcano.vei,
      population10km: globalVolcano.population10km,
      population30km: globalVolcano.population30km,
      population100km: globalVolcano.population100km,
      gvpId: globalVolcano.gvpId,
      isPhilippine: false,
    };
  }

  return undefined;
}

// Generate static params for ALL volcanoes (global + Philippine)
export async function generateStaticParams() {
  const globalSlugs = GLOBAL_VOLCANOES.map((volcano) => ({
    slug: volcanoToSlug(volcano),
  }));
  
  const phSlugs = PHILIPPINE_VOLCANOES.map((volcano) => ({
    slug: volcanoNameToSlug(volcano.name),
  }));
  
  // Combine and deduplicate
  const allSlugs = [...globalSlugs];
  for (const ph of phSlugs) {
    if (!allSlugs.some(g => g.slug === ph.slug)) {
      allSlugs.push(ph);
    }
  }
  
  return allSlugs;
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
    description: `${volcano.name} is a ${volcano.type} in ${volcano.country}. Elevation: ${volcano.elevation}m. ${volcano.description || `Last eruption: ${volcano.lastEruption || "Unknown"}.`}`,
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

  // Get nearby earthquakes for Philippine volcanoes
  let nearbyEarthquakes: any[] = [];
  if (volcano.isPhilippine) {
    try {
      const allEqs = getPhilippinesEarthquakes(30, 1.0, 5000);
      nearbyEarthquakes = allEqs
        .map(eq => ({
          ...eq,
          distance: getDistanceFromLatLonInKm(volcano.latitude, volcano.longitude, eq.latitude, eq.longitude)
        }))
        .filter(eq => eq.distance <= 50) // Within 50km
        .sort((a, b) => b.time.getTime() - a.time.getTime())
        .slice(0, 10);
    } catch (e) {
      console.error('Failed to fetch earthquakes:', e);
    }
  }

  // Run this volcano through the prediction model.
  const referenceTime = getDataReferenceTime();
  let phRiskCard: RiskCardData | null = null;
  let globalAssessment: ReturnType<typeof assessGlobalVolcano> | null = null;
  let nearbyCities: { name: string; slug: string; distance: number; population: number }[] = [];

  if (volcano.isPhilippine) {
    const phRaw = PHILIPPINE_VOLCANOES.find((v) => volcanoNameToSlug(v.name) === slug);
    if (phRaw) {
      try {
        const rawEqs = getPhilippinesEarthquakes(30, 2.0, 5000);
        const eqs: Earthquake[] = rawEqs.map((e) => ({
          id: e.id, magnitude: e.magnitude, depth_km: e.depth,
          latitude: e.latitude, longitude: e.longitude, timestamp: e.time, location: e.place || 'Unknown',
        }));
        const assessment = assessVolcanoRisk(phRaw, eqs, new Date(referenceTime));
        phRiskCard = toRiskCardData(assessment, slug, referenceTime);
      } catch (e) {
        console.error('Risk assessment failed:', e);
      }
    }
    nearbyCities = philippineCities
      .map((c) => ({ name: c.name, slug: c.slug, population: c.population, distance: getDistanceFromLatLonInKm(volcano.latitude, volcano.longitude, c.latitude, c.longitude) }))
      .filter((c) => c.distance <= 100)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 6);
  } else {
    const gRaw = GLOBAL_VOLCANOES.find((v) => volcanoToSlug(v) === slug);
    if (gRaw) globalAssessment = assessGlobalVolcano(gRaw);
  }

  // How fresh the nearby-earthquake data is (Philippine volcanoes only).
  const freshness = getDataFreshness();

  const statusColors: Record<string, string> = {
    active: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
    potentially_active: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800",
    holocene: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
    dormant: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
    historical: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600",
  };

  const formatPopulation = (pop?: number) => {
    if (!pop) return "N/A";
    if (pop >= 1000000) return `${(pop / 1000000).toFixed(1)}M`;
    if (pop >= 1000) return `${Math.round(pop / 1000)}K`;
    return pop.toLocaleString();
  };

  const alertLevelColors = [
    'bg-green-500 text-white',
    'bg-yellow-500 text-black',
    'bg-orange-500 text-white',
    'bg-red-500 text-white',
    'bg-red-700 text-white',
    'bg-purple-700 text-white',
  ];

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
              href={volcano.isPhilippine ? "/volcanoes" : `/volcanoes/country/${countryToSlug(volcano.country)}`}
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
                  className={`px-3 py-1 rounded-full text-sm font-medium border ${statusColors[volcano.status] || statusColors.historical}`}
                >
                  {volcano.status.replace("_", " ")}
                </span>
                {volcano.alertLevel !== undefined && volcano.alertLevel > 0 && (
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${alertLevelColors[volcano.alertLevel]}`}>
                    Alert Level {volcano.alertLevel}
                  </span>
                )}
              </div>
              <p className="text-lg text-orange-100 mt-2">
                {volcano.type} • {volcano.subregion}, {volcano.country}
              </p>
              {volcano.description && (
                <p className="text-sm text-orange-200 mt-2 max-w-3xl">
                  {volcano.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Live risk assessment — every volcano is run through the model */}
              {phRiskCard && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    🔮 Eruption Risk Assessment
                  </h2>
                  <RiskCard data={phRiskCard} />
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                    Modeled from PHIVOLCS alert level + live seismicity + eruption history.
                    See the <Link href="/volcanoes/analysis" className="text-indigo-600 dark:text-indigo-400 hover:underline">Risk Analysis dashboard</Link> for all volcanoes side by side.
                  </p>
                </div>
              )}

              {/* Baseline eruption probability (global volcanoes — no live seismic feed) */}
              {globalAssessment && (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    🔮 Eruption Risk Assessment
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <p className={`text-2xl font-bold ${RISK_TEXT[globalAssessment.riskLevel]}`}>{globalAssessment.probability1Year}%</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">1-year probability</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{globalAssessment.probability30Day}%</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">30-day</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">~{globalAssessment.recurrenceYears}y</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Avg. recurrence</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <p className={`text-base font-bold capitalize ${RISK_TEXT[globalAssessment.riskLevel]}`}>{globalAssessment.riskLevel.replace('_', ' ').toLowerCase()}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Risk level</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                    Baseline Poisson estimate from eruption status, recency of last eruption and explosivity
                    (VEI). Confidence: {globalAssessment.confidence.toLowerCase()} — no live seismic monitoring feed for this volcano.
                    Philippine volcanoes additionally use live PHIVOLCS alert levels and seismicity — see the{" "}
                    <Link href="/volcanoes/analysis" className="text-indigo-600 dark:text-indigo-400 hover:underline">Risk Analysis dashboard</Link>.
                  </p>
                </div>
              )}

              {/* Nearby population centres (Philippine volcanoes) */}
              {nearbyCities.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">🏙️ Nearby cities</h2>
                  <ul className="grid grid-cols-2 gap-x-4 gap-y-2">
                    {nearbyCities.map((c) => (
                      <li key={c.slug}>
                        <Link href={`/philippines/${c.slug}`} className="flex items-center justify-between gap-2 text-sm group">
                          <span className="text-gray-700 dark:text-gray-200 group-hover:text-red-600 dark:group-hover:text-red-400 truncate">{c.name}</span>
                          <span className="text-gray-400 shrink-0">{c.distance.toFixed(0)} km</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

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
                      {volcano.lastEruption || "No Record"}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Last Eruption
                    </p>
                  </div>
                  {volcano.vei !== undefined && (
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        VEI {volcano.vei}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Explosivity Index
                      </p>
                    </div>
                  )}
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

              {/* Philippine-specific: PHIVOLCS Data */}
              {volcano.isPhilippine && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    🇵🇭 PHIVOLCS Monitoring Data
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Alert Level</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${alertLevelColors[volcano.alertLevel || 0]}`}>
                          Level {volcano.alertLevel || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Province</span>
                        <span className="font-medium text-gray-900 dark:text-white">{volcano.province}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Monitoring Stations</span>
                        <span className="font-medium text-gray-900 dark:text-white">{volcano.monitoringStations || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Hazard Map Available</span>
                        <span className={`font-medium ${volcano.hasHazardMap ? 'text-green-600' : 'text-red-600'}`}>
                          {volcano.hasHazardMap ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Hydrothermal Activity</span>
                        <div className="flex gap-1">
                          {[1, 2, 3].map(i => (
                            <div
                              key={i}
                              className={`w-4 h-4 rounded ${
                                i <= (volcano.hydrothermalActivity || 0)
                                  ? 'bg-orange-500'
                                  : 'bg-gray-300 dark:bg-gray-600'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      {volcano.riskFactors && volcano.riskFactors.length > 0 && (
                        <div>
                          <span className="text-gray-600 dark:text-gray-400 block mb-2">Risk Factors</span>
                          <div className="flex flex-wrap gap-1">
                            {volcano.riskFactors.map((factor, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs rounded"
                              >
                                {factor.replace(/_/g, ' ')}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Eruption history (Philippine volcanoes, GVP ground-truth) */}
              {volcano.isPhilippine && volcano.recurrenceYears !== undefined && (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    📜 Eruption History
                  </h2>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {volcano.recordedEruptions ?? '—'}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Recorded Eruptions{volcano.recordStartYear ? ` (since ${volcano.recordStartYear})` : ''}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        ~{volcano.recurrenceYears}y
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Avg. Recurrence
                      </p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {volcano.lastEruption || '—'}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Last Eruption
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
                    Baseline eruption rate derived from Smithsonian GVP confirmed-eruption frequency.
                    Current eruption probability (incorporating PHIVOLCS alert level and live seismicity)
                    is on the <Link href="/volcanoes/analysis" className="text-indigo-600 dark:text-indigo-400 hover:underline">Risk Analysis dashboard</Link>.
                  </p>
                </div>
              )}

              {/* Historical & scientific context (Philippine volcanoes) */}
              {volcano.isPhilippine && (volcano.eruptionStyle || (volcano.notableEruptions?.length ?? 0) > 0 || (volcano.recentUnrest?.length ?? 0) > 0) && (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    🔬 Historical &amp; Scientific Context
                  </h2>

                  {volcano.eruptionStyle && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-700 dark:text-gray-200">{volcano.eruptionStyle}</p>
                      {volcano.dominantVEI != null && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Typical explosivity ≈ VEI {volcano.dominantVEI}</p>
                      )}
                    </div>
                  )}

                  {/* Repose / "overdue" */}
                  {volcano.reposeStatus && volcano.reposeStatus !== 'unknown' && (
                    <div className="mb-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/40">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-gray-800 dark:text-gray-100">🕰️ Repose status</span>
                        <span className="capitalize font-semibold text-gray-700 dark:text-gray-200">{volcano.reposeStatus.replace('-', ' ')}</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{volcano.reposeInterpretation}</p>
                    </div>
                  )}

                  {/* Current unrest signals */}
                  {(volcano.recentUnrest?.length ?? 0) > 0 && (
                    <div className="mb-4">
                      <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-2">📍 Current unrest signals (PHIVOLCS, 2026)</h3>
                      <ul className="space-y-1.5">
                        {volcano.recentUnrest!.map((u, i) => (
                          <li key={i} className="text-xs text-gray-600 dark:text-gray-300 flex items-start gap-2">
                            <span className="font-semibold capitalize text-gray-700 dark:text-gray-200 shrink-0">{u.kind === 'so2' ? 'SO₂' : u.kind}:</span>
                            <span>{u.note}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Notable past eruptions */}
                  {(volcano.notableEruptions?.length ?? 0) > 0 && (
                    <div className="mb-4">
                      <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-2">⚡ Notable past eruptions</h3>
                      <ul className="space-y-1.5">
                        {volcano.notableEruptions!.map((n) => (
                          <li key={n.year} className="flex items-start gap-2 text-xs">
                            <span className="font-semibold tabular-nums text-gray-700 dark:text-gray-200 w-10 shrink-0">{n.year}</span>
                            {n.vei != null && (
                              <span className="px-1.5 rounded bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 shrink-0">VEI {n.vei}</span>
                            )}
                            <span className="text-gray-600 dark:text-gray-300">{n.note}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* References */}
                  {(volcano.references?.length ?? 0) > 0 && (
                    <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
                      <span className="text-xs text-gray-500 dark:text-gray-400">References: </span>
                      {volcano.references!.map((r, i) => (
                        <a key={i} href={r.url} target="_blank" rel="noopener noreferrer"
                          className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline mr-3">
                          {r.label} ↗
                        </a>
                      ))}
                    </div>
                  )}

                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
                    Live risk direction, the full evidence ledger and seismic precursors are on the{' '}
                    <Link href="/volcanoes/analysis" className="text-indigo-600 dark:text-indigo-400 hover:underline">Risk Analysis dashboard</Link>.
                  </p>
                </div>
              )}

              {/* Nearby Earthquakes (Philippine volcanoes) */}
              {volcano.isPhilippine && nearbyEarthquakes.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      🔴 Recent Earthquakes Within 50km
                    </h2>
                    <DataFreshness
                      latest={freshness.latest}
                      ageDays={freshness.ageDays}
                      isStale={freshness.isStale}
                      label="Data"
                    />
                  </div>
                  <div className="space-y-2">
                    {nearbyEarthquakes.map((eq: any) => (
                      <div
                        key={eq.id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white ${
                              eq.magnitude >= 4 ? 'bg-red-500' :
                              eq.magnitude >= 3 ? 'bg-orange-500' :
                              eq.magnitude >= 2 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                          >
                            {eq.magnitude.toFixed(1)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white text-sm">
                              {eq.place}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {eq.depth.toFixed(1)}km deep • {eq.distance.toFixed(0)}km away
                            </p>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {eq.time.toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                  <Link
                    href={`/near-me?lat=${volcano.latitude}&lng=${volcano.longitude}`}
                    className="mt-4 block text-center text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    View all earthquakes near {volcano.name} →
                  </Link>
                </div>
              )}

              {/* Location */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Location
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Coordinates</p>
                    <p className="font-mono text-gray-900 dark:text-white">
                      {volcano.latitude.toFixed(4)}°N, {volcano.longitude.toFixed(4)}°E
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Region</p>
                    <p className="text-gray-900 dark:text-white">{volcano.region}</p>
                  </div>
                </div>

                {/* Satellite View */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Satellite View</p>
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={`https://www.google.com/maps?q=${volcano.latitude},${volcano.longitude}&t=k`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors text-sm"
                    >
                      🛰️ Google Satellite
                    </a>
                    <a
                      href={`https://zoom.earth/#view=${volcano.latitude},${volcano.longitude},12z`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors text-sm"
                    >
                      🌍 Zoom Earth Live
                    </a>
                    <a
                      href={`https://apps.sentinel-hub.com/eo-browser/?zoom=12&lat=${volcano.latitude}&lng=${volcano.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors text-sm"
                    >
                      🔬 Sentinel Hub
                    </a>
                    <a
                      href={`https://worldview.earthdata.nasa.gov/?v=${volcano.longitude - 0.5},${volcano.latitude - 0.5},${volcano.longitude + 0.5},${volcano.latitude + 0.5}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors text-sm"
                    >
                      🚀 NASA Worldview
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Population Exposure */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  ⚠️ Population Exposure
                </h2>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">Bars are relative to the 100 km total.</p>
                <div className="space-y-4">
                  {volcano.population10km !== undefined && (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-500 dark:text-gray-400">Within 10 km</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {formatPopulation(volcano.population10km)}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-red-500"
                          style={{ width: `${Math.min(100, ((volcano.population10km || 0) / (volcano.population100km || volcano.population30km || volcano.population10km || 1)) * 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-500 dark:text-gray-400">Within 30 km</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {formatPopulation(volcano.population30km)}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange-500"
                        style={{ width: `${Math.min(100, ((volcano.population30km || 0) / (volcano.population100km || volcano.population30km || 1)) * 100)}%` }}
                      />
                    </div>
                  </div>
                  {volcano.population100km !== undefined && (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-500 dark:text-gray-400">Within 100 km</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {formatPopulation(volcano.population100km)}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-500"
                          style={{ width: `${Math.min(100, ((volcano.population100km || 0) / (volcano.population100km || 1)) * 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
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
                    Risk Analysis Dashboard
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
                  {volcano.isPhilippine && (
                    <a
                      href="https://www.phivolcs.dost.gov.ph/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-center rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                    >
                      PHIVOLCS Official →
                    </a>
                  )}
                </div>
              </div>

              {/* Science Note */}
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  <strong>📊 Scientific Note:</strong> Volcanic risk assessments use peer-reviewed 
                  seismic-volcanic correlation models (Nishimura 2017, Jenkins 2024). These represent 
                  statistical probabilities, not predictions. Always follow official PHIVOLCS advisories.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
