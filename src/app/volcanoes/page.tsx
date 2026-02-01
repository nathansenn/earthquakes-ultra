import { Metadata } from "next";
import Link from "next/link";
import { PHILIPPINE_VOLCANOES, getVolcanoesByPriority, RISK_LEVEL_DESCRIPTIONS } from "@/data/philippine-volcanoes";
import { getPhilippinesEarthquakes } from "@/lib/db-queries";
import { assessAllVolcanoes, Earthquake } from "@/lib/volcanic-prediction";

export const metadata: Metadata = {
  title: "Philippine Volcanoes | Strategic Monitoring Dashboard",
  description:
    "Strategic preparedness monitoring for Philippine volcanoes. Risk assessments based on peer-reviewed seismic-volcanic correlation models. M1+ seismicity analysis.",
  openGraph: {
    title: "Philippine Volcano Monitoring | QuakeGlobe",
    description: "Strategic preparedness tool for Philippine volcanic hazards with M1+ seismic data.",
  },
};

export const revalidate = 1800; // 30 minutes

export default async function VolcanoesPage() {
  // Fetch recent earthquakes for assessment
  let assessments: Awaited<ReturnType<typeof assessAllVolcanoes>> = [];
  
  try {
    // Fetch M2+ earthquakes for volcanic assessment from local database (includes PHIVOLCS)
    const rawEarthquakes = getPhilippinesEarthquakes(30, 2.0, 5000);
    const earthquakes: Earthquake[] = rawEarthquakes.map(eq => ({
      id: eq.id,
      magnitude: eq.magnitude,
      depth_km: eq.depth,
      latitude: eq.latitude,
      longitude: eq.longitude,
      timestamp: eq.time,
      location: eq.place || 'Unknown',
    }));
    
    assessments = assessAllVolcanoes(PHILIPPINE_VOLCANOES, earthquakes);
  } catch (error) {
    console.error("Failed to fetch earthquakes for volcanic assessment:", error);
  }

  // Separate by risk level
  const veryHighRisk = assessments.filter(a => a.riskLevel === 'VERY_HIGH');
  const highRisk = assessments.filter(a => a.riskLevel === 'HIGH');
  const elevatedRisk = assessments.filter(a => a.riskLevel === 'ELEVATED');
  const moderateAndLow = assessments.filter(a => 
    a.riskLevel === 'MODERATE' || a.riskLevel === 'LOW'
  );

  const getRiskColor = (level: string) => {
    const colors: Record<string, string> = {
      'VERY_HIGH': 'bg-red-600',
      'HIGH': 'bg-orange-500',
      'ELEVATED': 'bg-yellow-500',
      'MODERATE': 'bg-lime-500',
      'LOW': 'bg-green-500',
    };
    return colors[level] || 'bg-gray-500';
  };

  const getRiskBg = (level: string) => {
    const colors: Record<string, string> = {
      'VERY_HIGH': 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
      'HIGH': 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
      'ELEVATED': 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
      'MODERATE': 'bg-lime-50 dark:bg-lime-900/20 border-lime-200 dark:border-lime-800',
      'LOW': 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    };
    return colors[level] || 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <section className="bg-gradient-to-br from-orange-600 via-red-600 to-red-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🌋</span>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Philippine Volcano Monitoring</h1>
              <p className="text-orange-100">Strategic Preparedness Dashboard</p>
            </div>
          </div>

          {/* Philosophy Banner */}
          <div className="mt-6 p-4 bg-white/10 rounded-xl border border-white/20">
            <p className="text-sm text-orange-100">
              <strong className="text-white">This is a preparedness tool, not a fear generator.</strong>{" "}
              Probabilities are statistical models based on peer-reviewed research (Nishimura 2017, Jenkins 2024). 
              They represent elevated risk over multi-year windows, not imminent predictions. 
              Always defer to official PHIVOLCS bulletins.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold">{PHILIPPINE_VOLCANOES.length}</p>
              <p className="text-sm text-orange-100">Volcanoes Monitored</p>
            </div>
            <div className={`${veryHighRisk.length > 0 ? 'bg-red-500/30' : 'bg-white/10'} rounded-xl p-4 text-center`}>
              <p className="text-2xl font-bold">{veryHighRisk.length + highRisk.length}</p>
              <p className="text-sm text-orange-100">Elevated Attention</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold">{assessments[0]?.earthquakesAnalyzed || 0}</p>
              <p className="text-sm text-orange-100">Earthquakes Analyzed</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold">24h</p>
              <p className="text-sm text-orange-100">Update Frequency</p>
            </div>
          </div>
        </div>
      </section>

      {/* Important Disclaimer */}
      <section className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Understanding the Model:</strong> These assessments combine seismic data with peer-reviewed triggering models. 
              &quot;Very High&quot; means ~35-65% probability over a multi-year window - NOT that an eruption is imminent. 
              The purpose is strategic planning, not panic. PHIVOLCS is the official authority for volcanic hazards.
            </div>
          </div>
        </div>
      </section>

      {/* Risk Legend */}
      <section className="py-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-4 uppercase tracking-wide">
            Risk Level Guide (Strategic Planning)
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(RISK_LEVEL_DESCRIPTIONS).map(([key, desc]) => (
              <div key={key} className="flex items-start gap-2">
                <div className={`w-3 h-3 rounded-full ${getRiskColor(key)} mt-1`} />
                <div>
                  <p className="font-medium text-sm text-gray-900 dark:text-white">{desc.label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{desc.action.split(' - ')[0]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Very High & High Risk Volcanoes */}
      {(veryHighRisk.length > 0 || highRisk.length > 0) && (
        <section className="py-8 bg-red-50/50 dark:bg-red-900/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Heightened Monitoring Recommended
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
              These volcanoes have elevated statistical indicators. Review your emergency plans.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              {[...veryHighRisk, ...highRisk].map((assessment) => (
                <div 
                  key={assessment.volcano.id}
                  className={`rounded-xl p-6 border-2 ${getRiskBg(assessment.riskLevel)}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {assessment.volcano.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {assessment.volcano.province}, {assessment.volcano.region}
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-white text-sm font-medium ${getRiskColor(assessment.riskLevel)}`}>
                      {assessment.riskLevel.replace('_', ' ')}
                    </div>
                  </div>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-2 text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Probability</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {assessment.probabilityPercent}%
                      </p>
                    </div>
                    <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-2 text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Multiplier</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {assessment.factors.combinedMultiplier}x
                      </p>
                    </div>
                    <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-2 text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Confidence</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {assessment.confidence.replace('_', ' ')}
                      </p>
                    </div>
                  </div>

                  {/* Strategic Guidance */}
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {assessment.strategicGuidance.action}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {assessment.strategicGuidance.context}
                    </p>
                  </div>

                  {/* Key Factors */}
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                    <strong>Contributing factors:</strong>{" "}
                    {assessment.factors.nishimuraFactor > 1.1 && `Large EQ trigger (${assessment.factors.nishimuraFactor}x) • `}
                    {assessment.factors.seismicityAnomalyFactor > 2 && `Seismic anomaly (${assessment.factors.seismicityAnomalyFactor}x) • `}
                    {assessment.factors.bracketingFactor > 1 && `Dual-cluster bracketing • `}
                    {assessment.factors.hydrothermalSensitivity > 1.5 && `Active hydrothermal system`}
                  </div>

                  {/* Clusters if present */}
                  {assessment.clusters.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Active seismic clusters:</p>
                      <div className="flex flex-wrap gap-2">
                        {assessment.clusters.map(cluster => (
                          <span key={cluster.id} className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">
                            {cluster.name} ({cluster.earthquakes.length} events, M{cluster.maxMagnitude.toFixed(1)} max)
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Monitoring Info */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-600">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      <span className={assessment.volcano.monitoringStations < 3 ? 'text-orange-600 font-medium' : ''}>
                        {assessment.volcano.monitoringStations} monitoring station{assessment.volcano.monitoringStations !== 1 ? 's' : ''}
                      </span>
                      {!assessment.volcano.hasHazardMap && (
                        <span className="text-red-600 ml-2">• No hazard map</span>
                      )}
                    </div>
                    <Link 
                      href={`/volcanoes/${assessment.volcano.name.toLowerCase().replace(/\s+/g, '-')}`}
                      className="text-sm text-red-600 dark:text-red-400 hover:underline"
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
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Elevated - Stay Informed
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
              Above-normal indicators. Maintain awareness through official channels.
            </p>
            
            <div className="grid md:grid-cols-3 gap-4">
              {elevatedRisk.map((assessment) => (
                <div 
                  key={assessment.volcano.id}
                  className={`rounded-xl p-4 border ${getRiskBg(assessment.riskLevel)}`}
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
                    {assessment.strategicGuidance.action}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Moderate & Low Risk */}
      <section className="py-8 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Standard Monitoring
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
            Normal background conditions. Maintain standard volcanic area preparedness.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {moderateAndLow.map((assessment) => (
              <div 
                key={assessment.volcano.id}
                className="rounded-xl p-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-2 h-2 rounded-full ${getRiskColor(assessment.riskLevel)}`} />
                  <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                    {assessment.volcano.name}
                  </h3>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {assessment.volcano.province}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {assessment.probabilityPercent}% • {assessment.volcano.status.replace('_', ' ')}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Methodology */}
      <section className="py-12 bg-gray-100 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            About This Assessment
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Scientific Basis</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                <li>• <strong>Nishimura (2017)</strong>: M7.5+ earthquakes within 200km increase eruption probability by 50%</li>
                <li>• <strong>Jenkins et al. (2024)</strong>: M7+ within 750km = 1.25x eruption rate for 4 years</li>
                <li>• <strong>Hydrothermal sensitivity</strong>: Active systems more susceptible to triggering</li>
                <li>• <strong>Dual-cluster bracketing</strong>: Stress concentration from opposing seismic activity</li>
              </ul>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Key Limitations</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                <li>• Probabilities are <strong>statistical estimates</strong>, not deterministic predictions</li>
                <li>• Timeframe is <strong>multi-year</strong>, not days or weeks</li>
                <li>• <strong>No volcanic unrest</strong> (tremor, gas, deformation) data included yet</li>
                <li>• <strong>PHIVOLCS</strong> remains the official authority for Philippine volcanic hazards</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Data sources: USGS Earthquake Catalog, Global Volcanism Program, PHIVOLCS
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              Last updated: {new Date().toLocaleString('en-PH', { timeZone: 'Asia/Manila' })} PHT
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-red-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Know Before You Need To Know</h2>
          <p className="text-red-100 mb-6">
            Strategic awareness enables rational preparation. Set up earthquake alerts for your area.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/alerts"
              className="px-8 py-3 bg-white text-red-600 rounded-xl font-semibold hover:bg-red-50 transition-colors"
            >
              Set Up Alerts
            </Link>
            <Link
              href="/preparedness"
              className="px-8 py-3 bg-red-500/30 text-white rounded-xl font-semibold hover:bg-red-500/50 transition-colors border border-white/30"
            >
              Preparedness Guide
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
// Build trigger 1769671906
