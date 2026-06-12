import { Metadata } from "next";
import Link from "next/link";
import { PHILIPPINE_VOLCANOES, volcanoNameToSlug } from "@/data/philippine-volcanoes";
import { GLOBAL_VOLCANOES, GlobalVolcano } from "@/data/global-volcanoes";
import { getPhilippinesEarthquakes, getDataReferenceTime, getDataFreshness } from "@/lib/db-queries";
import { fetchGlobalEarthquakes } from "@/lib/usgs-api";
import { assessAllVolcanoes, Earthquake, RiskAssessment } from "@/lib/volcanic-prediction-v2";
import { assessGlobalVolcano } from "@/lib/eruption-forecast";
import { DataFreshness, StaleDataBanner } from "@/components/ui/DataFreshness";
import { RiskCard } from "@/components/volcano/RiskCard";
import { toRiskCardData } from "@/components/volcano/risk-card-data";
import { MiniRiskChip, MiniRiskData } from "@/components/volcano/MiniRiskChip";
import { CountUpStat } from "@/components/volcano/CountUpStat";

export const metadata: Metadata = {
  title: "AI Volcano Risk Analysis | Global Volcanic Prediction System",
  description:
    "AI-powered volcanic risk assessment using seismic data analysis. Real-time earthquake correlation, depth migration tracking, and eruption probability modeling.",
  openGraph: {
    title: "AI Volcano Risk Analysis | Global Prediction System",
    description: "AI-powered volcanic eruption risk assessment with seismic data analysis.",
  },
};

export const revalidate = 1800; // 30 minutes

// toRiskCardData / buildFactors now live in @/components/volcano/risk-card-data

function toMiniRiskData(a: RiskAssessment, slug: string): MiniRiskData {
  return {
    id: a.volcano.id,
    name: a.volcano.name,
    province: a.volcano.province ?? '',
    status: a.volcano.status,
    slug,
    alertLevel: a.volcano.alertLevel,
    riskLevel: a.riskLevel,
    p1Year: a.probability1Year,
    baseAnnualRate: a.factors.baseline,
    recurrenceYears: Math.max(1, Math.round(1 / a.factors.baseline)),
    lastEruption: a.volcano.lastEruption ?? '',
    trend: a.riskDirection.trend,
    reposeStatus: a.repose.status,
  };
}

function formatPopulation(pop: number | undefined): string {
  if (!pop) return 'N/A';
  if (pop >= 1000000) return `${(pop / 1000000).toFixed(1)}M`;
  if (pop >= 1000) return `${(pop / 1000).toFixed(0)}K`;
  return pop.toString();
}

export default async function VolcanoAnalysisPage() {
  // Fetch earthquake data for analysis
  let philippineAssessments: Awaited<ReturnType<typeof assessAllVolcanoes>> = [];
  let recentGlobalEarthquakes = 0;

  // Anchor the analysis to the freshest available data and report its age.
  const referenceTime = getDataReferenceTime();
  const freshness = getDataFreshness();

  try {
    // Fetch Philippine earthquakes for volcanic assessment from local database
    const rawPhilippineEqs = getPhilippinesEarthquakes(30, 2.0, 5000);
    const philippineEqs: Earthquake[] = rawPhilippineEqs.map(eq => ({
      id: eq.id,
      magnitude: eq.magnitude,
      depth_km: eq.depth,
      latitude: eq.latitude,
      longitude: eq.longitude,
      timestamp: eq.time,
      location: eq.place || 'Unknown',
    }));

    philippineAssessments = assessAllVolcanoes(PHILIPPINE_VOLCANOES, philippineEqs, new Date(referenceTime));
    
    // Fetch global significant earthquakes (still from USGS for global data)
    const globalEqs = await fetchGlobalEarthquakes(7, 5.0);
    recentGlobalEarthquakes = globalEqs.length;
  } catch (error) {
    console.error("Failed to fetch earthquake data:", error);
  }

  // Separate by risk level (assessments are pre-sorted by probability desc)
  const ACTIVE_LEVELS = ['CRITICAL', 'VERY_HIGH', 'HIGH', 'ELEVATED'];
  const activeRisk = philippineAssessments.filter(a => ACTIVE_LEVELS.includes(a.riskLevel));
  const normalRisk = philippineAssessments.filter(a => !ACTIVE_LEVELS.includes(a.riskLevel));
  const criticalRisk = philippineAssessments.filter(a => a.riskLevel === 'CRITICAL');

  // High-risk global volcanoes (sort by population exposure)
  const highRiskGlobal = GLOBAL_VOLCANOES
    .filter(v => v.status === 'active' && (v.population30km || 0) >= 500000)
    .sort((a, b) => (b.population30km || 0) - (a.population30km || 0))
    .slice(0, 12);

  const totalVolcanoes = PHILIPPINE_VOLCANOES.length + GLOBAL_VOLCANOES.length;
  const uniqueCountries = [...new Set(GLOBAL_VOLCANOES.map(v => v.country))].length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <span className="text-4xl">🤖</span>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">AI Volcano Risk Analysis</h1>
              <p className="text-indigo-100 mt-1">Real-Time Seismic Pattern Recognition & Eruption Probability Modeling</p>
            </div>
          </div>

          {/* Key Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-8">
            <div className="bg-white/10 backdrop-blur rounded-xl p-3 sm:p-4 text-center">
              <p className="text-2xl sm:text-3xl font-bold"><CountUpStat value={totalVolcanoes} /></p>
              <p className="text-xs sm:text-sm text-indigo-100">Volcanoes Tracked</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-3 sm:p-4 text-center">
              <p className="text-2xl sm:text-3xl font-bold"><CountUpStat value={activeRisk.length} /></p>
              <p className="text-xs sm:text-sm text-indigo-100">Elevated Risk (PH)</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-3 sm:p-4 text-center">
              <p className="text-2xl sm:text-3xl font-bold"><CountUpStat value={philippineAssessments[0]?.stats.earthquakesAnalyzed || 0} /></p>
              <p className="text-xs sm:text-sm text-indigo-100">Earthquakes Analyzed</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-3 sm:p-4 text-center">
              <p className="text-2xl sm:text-3xl font-bold"><CountUpStat value={recentGlobalEarthquakes} /></p>
              <p className="text-xs sm:text-sm text-indigo-100">M5+ (7 days)</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-3 sm:p-4 text-center col-span-2 sm:col-span-1">
              <p className="text-2xl sm:text-3xl font-bold"><CountUpStat value={uniqueCountries} /></p>
              <p className="text-xs sm:text-sm text-indigo-100">Countries</p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Methodology Banner */}
      <section className="bg-indigo-50 dark:bg-indigo-900/20 border-b border-indigo-200 dark:border-indigo-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-start gap-3">
            <span className="text-xl">🧠</span>
            <div className="text-sm text-indigo-800 dark:text-indigo-200">
              <strong>Methodology:</strong> Each Philippine volcano starts from a per-volcano baseline
              eruption rate (Smithsonian GVP eruption history), then weighs the full body of evidence —
              its PHIVOLCS alert level, the time since its last eruption (Weibull/renewal repose model),
              recent eruptive-episode clustering, and live seismicity (earthquake triggering — Nishimura
              2017 / Jenkins 2024, depth migration, b-value, accelerating seismicity, swarms) — converting
              the result to a probability with a Poisson event model. Every signal is shown below as an
              <strong> evidence ledger</strong> with its direction (raises / lowers) and source, so you can
              see exactly why each risk is higher or lower. <strong>Not a deterministic prediction</strong>;
              probabilities are statistical estimates. PHIVOLCS remains the authoritative source.
            </div>
          </div>
        </div>
      </section>

      {/* Stale-data warning (only when the snapshot is behind) */}
      <StaleDataBanner latest={freshness.latest} ageDays={freshness.ageDays} isStale={freshness.isStale} />

      {/* Active Risk — interactive, animated cards showing exactly what drives each number */}
      {activeRisk.length > 0 && (
        <section className="py-8 bg-red-50/40 dark:bg-red-900/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-2">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {criticalRisk.length > 0 ? '⚠️ Critical Alert' : '🚨 Elevated Risk Assessment'} — Philippines
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-3xl text-sm">
              Each card shows how the probability is built — baseline rate × PHIVOLCS alert × live
              seismicity → Poisson — and expands to reveal the exact data the model is reading.
              Tap a card to drill in.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {activeRisk.map((assessment, i) => (
                <RiskCard
                  key={assessment.volcano.id}
                  index={i}
                  data={toRiskCardData(assessment, volcanoNameToSlug(assessment.volcano.name), referenceTime)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Standard Monitoring — compact, animated, tap to expand */}
      <section className="py-8 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Standard Monitoring — Philippine Volcanoes
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
            Background-level activity — probability reflects the long-run baseline rate. Tap any volcano
            to see how its baseline is derived.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {normalRisk.map((assessment, i) => (
              <MiniRiskChip
                key={assessment.volcano.id}
                index={i}
                data={toMiniRiskData(assessment, volcanoNameToSlug(assessment.volcano.name))}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Global High-Exposure Volcanoes */}
      <section className="py-12 bg-gray-100 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                🌍 Global High-Exposure Volcanoes
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Active volcanoes with highest population exposure (GVP data)
              </p>
            </div>
            <Link href="/volcanoes/global" className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm">
              View All →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {highRiskGlobal.map((volcano) => (
              <div key={volcano.id} className="rounded-xl p-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">{volcano.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {volcano.country} • {volcano.subregion}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      volcano.status === 'active' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                      'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                    }`}>
                      {volcano.status}
                    </span>
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-300" title="Modeled 1-year eruption probability (baseline)">
                      <CountUpStat value={assessGlobalVolcano(volcano).probability1Year} decimals={1} suffix="% / yr" />
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
                  <div>
                    <span className="text-gray-400">Type:</span>
                    <span className="ml-1 text-gray-700 dark:text-gray-300">{volcano.type}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Elevation:</span>
                    <span className="ml-1 text-gray-700 dark:text-gray-300">{volcano.elevation.toLocaleString()}m</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Last Eruption:</span>
                    <span className="ml-1 text-gray-700 dark:text-gray-300">{volcano.lastEruption || 'Unknown'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">VEI Max:</span>
                    <span className="ml-1 text-gray-700 dark:text-gray-300">{volcano.vei ?? 'Unknown'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                  <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                    <p className="text-gray-400">Pop. 10km</p>
                    <p className="font-semibold text-gray-700 dark:text-gray-300">{formatPopulation(volcano.population10km)}</p>
                  </div>
                  <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                    <p className="text-gray-400">Pop. 30km</p>
                    <p className="font-semibold text-gray-700 dark:text-gray-300">{formatPopulation(volcano.population30km)}</p>
                  </div>
                  <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                    <p className="text-gray-400">Pop. 100km</p>
                    <p className="font-semibold text-gray-700 dark:text-gray-300">{formatPopulation(volcano.population100km)}</p>
                  </div>
                </div>

                <Link 
                  href={`/volcanoes/${volcano.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  View Details →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Real-Time Monitoring Resources */}
      <section className="py-12 bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold mb-2 text-center">🛰️ Real-Time Monitoring Resources</h2>
          <p className="text-center text-indigo-200 mb-8">Live satellite imagery and official volcanic monitoring</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <a
              href="https://zoom.earth/#view=12.5,122,5z/layers=fires"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/10 hover:bg-white/20 rounded-xl p-4 text-center transition-all group"
            >
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">🌍</div>
              <h3 className="font-semibold">Zoom Earth Live</h3>
              <p className="text-sm text-indigo-200 mt-1">Real-time satellite & thermal hotspots</p>
            </a>
            
            <a
              href="https://worldview.earthdata.nasa.gov/?v=115,4,130,22&l=Reference_Labels_15m,MODIS_Terra_Thermal_Anomalies_All,Coastlines_15m,VIIRS_NOAA20_CorrectedReflectance_TrueColor"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/10 hover:bg-white/20 rounded-xl p-4 text-center transition-all group"
            >
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">🚀</div>
              <h3 className="font-semibold">NASA Worldview</h3>
              <p className="text-sm text-indigo-200 mt-1">MODIS thermal anomalies</p>
            </a>
            
            <a
              href="https://apps.sentinel-hub.com/eo-browser/?zoom=7&lat=12.5&lng=122&themeId=DEFAULT-THEME&visualizationUrl=https%3A%2F%2Fservices.sentinel-hub.com%2Fogc%2Fwms%2Fbd86bcc0-f318-402b-a145-015f85b9427e&datasetId=S2L2A"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/10 hover:bg-white/20 rounded-xl p-4 text-center transition-all group"
            >
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">🔬</div>
              <h3 className="font-semibold">Sentinel Hub</h3>
              <p className="text-sm text-indigo-200 mt-1">High-res Copernicus imagery</p>
            </a>
            
            <a
              href="https://www.phivolcs.dost.gov.ph/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/10 hover:bg-white/20 rounded-xl p-4 text-center transition-all group"
            >
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">🇵🇭</div>
              <h3 className="font-semibold">PHIVOLCS Official</h3>
              <p className="text-sm text-indigo-200 mt-1">Official volcano bulletins</p>
            </a>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            <a
              href="https://firms.modaps.eosdis.nasa.gov/map/#d:24hrs;@122,12.5,6z"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-orange-500/20 hover:bg-orange-500/30 rounded-xl p-4 text-center transition-all group border border-orange-400/30"
            >
              <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">🔥</div>
              <h3 className="font-semibold text-orange-200">NASA FIRMS</h3>
              <p className="text-xs text-orange-300 mt-1">Fire/thermal detection within 3 hours</p>
            </a>
            
            <a
              href="https://earthquake.usgs.gov/earthquakes/map/?extent=4.39,115.31&extent=21.94,127.97&map=terrain"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-red-500/20 hover:bg-red-500/30 rounded-xl p-4 text-center transition-all group border border-red-400/30"
            >
              <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">📊</div>
              <h3 className="font-semibold text-red-200">USGS Live Map</h3>
              <p className="text-xs text-red-300 mt-1">Real-time earthquake detection</p>
            </a>
            
            <a
              href="https://volcano.si.edu/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-purple-500/20 hover:bg-purple-500/30 rounded-xl p-4 text-center transition-all group border border-purple-400/30"
            >
              <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">🌋</div>
              <h3 className="font-semibold text-purple-200">Smithsonian GVP</h3>
              <p className="text-xs text-purple-300 mt-1">Global eruption reports</p>
            </a>
          </div>
        </div>
      </section>

      {/* Scientific Methodology */}
      <section className="py-12 bg-white dark:bg-gray-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            📚 Scientific Methodology
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-4">
                Risk Factors Analyzed
              </h3>
              <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500 mt-0.5">●</span>
                  <div><strong>Seismic Frequency:</strong> Earthquake count within 50km radius</div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500 mt-0.5">●</span>
                  <div><strong>Depth Distribution:</strong> Shallow events (&lt;5km) indicate rising magma</div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500 mt-0.5">●</span>
                  <div><strong>Magnitude Trends:</strong> Increasing magnitudes suggest escalating activity</div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500 mt-0.5">●</span>
                  <div><strong>Swarm Detection:</strong> Clustered events in space and time</div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500 mt-0.5">●</span>
                  <div><strong>Historical Patterns:</strong> Eruption recurrence intervals</div>
                </li>
              </ul>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-4">
                Data Sources & References
              </h3>
              <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <div><strong>Smithsonian GVP:</strong> per-volcano eruption histories &rarr; baseline rates</div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <div><strong>PHIVOLCS:</strong> official alert levels + live M1+ seismicity</div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <div><strong>Nishimura (2017), <em>GRL</em> 44:</strong> M&ge;7.5 within 200 km &rarr; ~50% higher eruption probability for 5 yr</div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <div><strong>Jenkins et al. (2024), <em>Volcanica</em>:</strong> M&ge;7 within 750 km &rarr; ~1.25&times; eruption rate (1&ndash;4 yr)</div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <div><strong>Aki (1965) / Wiemer &amp; Wyss (2000):</strong> b-value with data-driven completeness magnitude</div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <div><strong>Poisson event model</strong> (Bebbington; Marzocchi &amp; Bebbington 2012): rate &rarr; probability</div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <div><strong>Repose-time / renewal model</strong> (Bebbington &amp; Lai 1996; Connor et al.): time-since-last-eruption &rarr; conditional &ldquo;overdue&rdquo; probability</div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <div><strong>Multi-parameter unrest</strong> (Newhall; Sparks 2003): SO&#8322;, deformation, seismicity &amp; thermal as eruption precursors</div>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Important Disclaimer</h4>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  This AI analysis provides <strong>statistical probability assessments</strong>, not deterministic eruption predictions. 
                  Volcanic systems are complex and can change rapidly. Always defer to official PHIVOLCS bulletins and local authorities. 
                  Probabilities shown represent elevated risk over <strong>multi-year timeframes</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-indigo-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Stay Informed, Stay Prepared</h2>
          <p className="text-indigo-100 mb-6">
            AI-powered monitoring helps you plan strategically. Set up alerts for earthquakes near you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/alerts" className="px-8 py-3 bg-white text-indigo-600 rounded-xl font-semibold hover:bg-indigo-50 transition-colors">
              Set Up Alerts
            </Link>
            <Link href="/volcanoes" className="px-8 py-3 bg-indigo-500/30 text-white rounded-xl font-semibold hover:bg-indigo-500/50 transition-colors border border-white/30">
              Philippine Volcanoes
            </Link>
          </div>
        </div>
      </section>

      <footer className="py-4 bg-gray-100 dark:bg-gray-900 text-center">
        <div className="flex flex-col items-center gap-1">
          <DataFreshness
            latest={freshness.latest}
            ageDays={freshness.ageDays}
            isStale={freshness.isStale}
            label="Seismic data"
          />
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Page generated {new Date().toLocaleString('en-PH', { timeZone: 'Asia/Manila' })} PHT
          </p>
        </div>
      </footer>
    </div>
  );
}
