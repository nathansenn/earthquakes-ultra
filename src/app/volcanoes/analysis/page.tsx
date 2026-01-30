import { Metadata } from "next";
import Link from "next/link";
import { PHILIPPINE_VOLCANOES } from "@/data/philippine-volcanoes";
import { GLOBAL_VOLCANOES, GlobalVolcano } from "@/data/global-volcanoes";
import { fetchAllPhilippineEarthquakes, fetchGlobalEarthquakes } from "@/lib/usgs-api";
import { assessAllVolcanoes, Earthquake } from "@/lib/volcanic-prediction";

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

// Risk category colors
const RISK_COLORS: Record<string, { bg: string; badge: string }> = {
  CRITICAL: { bg: 'bg-red-50 dark:bg-red-900/30', badge: 'bg-red-600 text-white animate-pulse' },
  HIGH: { bg: 'bg-orange-50 dark:bg-orange-900/30', badge: 'bg-orange-500 text-white' },
  ELEVATED: { bg: 'bg-yellow-50 dark:bg-yellow-900/30', badge: 'bg-yellow-500 text-black' },
  MODERATE: { bg: 'bg-lime-50 dark:bg-lime-900/30', badge: 'bg-lime-500 text-white' },
  LOW: { bg: 'bg-green-50 dark:bg-green-900/30', badge: 'bg-green-500 text-white' },
};

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
  
  try {
    // Fetch Philippine earthquakes for volcanic assessment
    const rawPhilippineEqs = await fetchAllPhilippineEarthquakes(30, 2.0);
    const philippineEqs: Earthquake[] = rawPhilippineEqs.map(eq => ({
      id: eq.id,
      magnitude: eq.properties.mag,
      depth_km: eq.geometry.coordinates[2],
      latitude: eq.geometry.coordinates[1],
      longitude: eq.geometry.coordinates[0],
      timestamp: new Date(eq.properties.time),
      location: eq.properties.place || 'Unknown',
    }));
    
    philippineAssessments = assessAllVolcanoes(PHILIPPINE_VOLCANOES, philippineEqs);
    
    // Fetch global significant earthquakes
    const globalEqs = await fetchGlobalEarthquakes(7, 5.0);
    recentGlobalEarthquakes = globalEqs.length;
  } catch (error) {
    console.error("Failed to fetch earthquake data:", error);
  }

  // Separate by risk level
  const criticalRisk = philippineAssessments.filter(a => a.probabilityPercent >= 35);
  const highRisk = philippineAssessments.filter(a => a.probabilityPercent >= 20 && a.probabilityPercent < 35);
  const elevatedRisk = philippineAssessments.filter(a => a.probabilityPercent >= 10 && a.probabilityPercent < 20);
  const normalRisk = philippineAssessments.filter(a => a.probabilityPercent < 10);

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
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
              <p className="text-3xl font-bold">{totalVolcanoes}</p>
              <p className="text-sm text-indigo-100">Volcanoes Tracked</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
              <p className="text-3xl font-bold">{criticalRisk.length + highRisk.length}</p>
              <p className="text-sm text-indigo-100">Elevated Risk (PH)</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
              <p className="text-3xl font-bold">{philippineAssessments[0]?.earthquakesAnalyzed || 0}</p>
              <p className="text-sm text-indigo-100">Earthquakes Analyzed</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
              <p className="text-3xl font-bold">{recentGlobalEarthquakes}</p>
              <p className="text-sm text-indigo-100">M5+ (7 days)</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
              <p className="text-3xl font-bold">{uniqueCountries}</p>
              <p className="text-sm text-indigo-100">Countries</p>
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
              <strong>AI Analysis Methodology:</strong> This system correlates real-time USGS seismic data with volcanic centers using 
              peer-reviewed models (Nishimura 2017, Jenkins 2024). Analysis includes earthquake frequency, depth migration patterns, 
              swarm detection, and historical eruption correlation. <strong>Not a deterministic prediction</strong> — probabilities 
              represent elevated risk over extended timeframes.
            </div>
          </div>
        </div>
      </section>

      {/* Critical & High Risk Philippine Volcanoes */}
      {(criticalRisk.length > 0 || highRisk.length > 0) && (
        <section className="py-8 bg-red-50/50 dark:bg-red-900/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                🚨 Elevated Risk Assessment - Philippines
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-3xl">
              Philippine volcanoes with elevated seismic indicators. Review emergency preparedness.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {[...criticalRisk, ...highRisk].map((assessment) => (
                <div 
                  key={assessment.volcano.id}
                  className={`rounded-xl p-6 border-2 ${RISK_COLORS[assessment.riskLevel]?.bg || 'bg-gray-50'} border-red-200 dark:border-red-800`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        🌋 {assessment.volcano.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {assessment.volcano.province}, {assessment.volcano.region}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${RISK_COLORS[assessment.riskLevel]?.badge || 'bg-gray-500 text-white'}`}>
                      {assessment.riskLevel.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Risk Score</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {assessment.probabilityPercent}%
                      </p>
                    </div>
                    <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Multiplier</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {assessment.factors.combinedMultiplier}x
                      </p>
                    </div>
                    <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Confidence</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                        {assessment.confidence.toLowerCase().replace('_', ' ')}
                      </p>
                    </div>
                  </div>

                  {/* Strategic Guidance */}
                  <div className="mb-4 p-3 bg-white/40 dark:bg-gray-800/40 rounded-lg">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      📋 {assessment.strategicGuidance.action}
                    </p>
                  </div>

                  {/* Key Factors */}
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-4">
                    <strong>Contributing factors:</strong>
                    <ul className="mt-1 space-y-1">
                      {assessment.factors.nishimuraFactor > 1.1 && (
                        <li>• Large earthquake trigger ({assessment.factors.nishimuraFactor.toFixed(2)}x)</li>
                      )}
                      {assessment.factors.seismicityAnomalyFactor > 1.5 && (
                        <li>• Seismicity anomaly ({assessment.factors.seismicityAnomalyFactor.toFixed(2)}x)</li>
                      )}
                      {assessment.factors.bracketingFactor > 1 && (
                        <li>• Dual-cluster stress concentration</li>
                      )}
                      {assessment.factors.hydrothermalSensitivity > 1.5 && (
                        <li>• Active hydrothermal system</li>
                      )}
                    </ul>
                  </div>

                  {/* Clusters */}
                  {assessment.clusters.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                        Active Seismic Clusters:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {assessment.clusters.slice(0, 3).map(cluster => (
                          <span key={cluster.id} className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">
                            {cluster.name} • {cluster.earthquakes.length} events • M{cluster.maxMagnitude.toFixed(1)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-600">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {assessment.volcano.monitoringStations} stations • 
                      {assessment.volcano.hasHazardMap ? ' Has hazard map' : ' No hazard map'}
                    </div>
                    <Link 
                      href={`/volcanoes/${assessment.volcano.name.toLowerCase().replace(/\s+/g, '-')}`}
                      className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Elevated Risk */}
      {elevatedRisk.length > 0 && (
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-yellow-500" />
              Elevated - Monitor Official Channels
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
              Above-background seismic activity. Maintain awareness.
            </p>

            <div className="grid md:grid-cols-3 gap-4">
              {elevatedRisk.map((assessment) => (
                <div 
                  key={assessment.volcano.id}
                  className="rounded-xl p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {assessment.volcano.name}
                    </h3>
                    <span className="text-sm font-medium text-yellow-700 dark:text-yellow-400">
                      {assessment.probabilityPercent}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    {assessment.volcano.province} • {assessment.volcano.type}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {assessment.strategicGuidance.action.split(' - ')[0]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Normal Risk - Compact Display */}
      <section className="py-8 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Standard Monitoring - Philippine Volcanoes
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
            Background-level activity. Standard volcanic area preparedness applies.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {normalRisk.map((assessment) => (
              <div 
                key={assessment.volcano.id}
                className="rounded-xl p-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <h3 className="font-medium text-gray-900 dark:text-white text-sm truncate">
                    {assessment.volcano.name}
                  </h3>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {assessment.volcano.province}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {assessment.probabilityPercent}% • {assessment.volcano.status}
                </p>
              </div>
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

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {highRiskGlobal.map((volcano) => (
              <div key={volcano.id} className="rounded-xl p-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">{volcano.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {volcano.country} • {volcano.subregion}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    volcano.status === 'active' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' : 
                    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                  }`}>
                    {volcano.status}
                  </span>
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
                  href={`/volcanoes/global/${volcano.id}`}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  View Details →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Scientific Methodology */}
      <section className="py-12 bg-white dark:bg-gray-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            📚 Scientific Methodology
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
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
                  <div><strong>USGS Earthquake Catalog:</strong> Real-time global seismic data</div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <div><strong>Smithsonian GVP:</strong> Global Volcanism Program database</div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <div><strong>Nishimura (2017):</strong> Large earthquake triggering model</div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <div><strong>Jenkins et al. (2024):</strong> Statistical triggering analysis</div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <div><strong>PHIVOLCS:</strong> Philippine Institute of Volcanology</div>
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
        <p className="text-sm text-gray-500 dark:text-gray-400">
          AI Analysis Last Updated: {new Date().toLocaleString('en-PH', { timeZone: 'Asia/Manila' })} PHT
        </p>
      </footer>
    </div>
  );
}
