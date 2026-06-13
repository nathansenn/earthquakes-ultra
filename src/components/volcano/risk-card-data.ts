// Server-side mapper: RiskAssessment (from the volcanic prediction model) →
// the serializable RiskCardData the client RiskCard renders. Shared by the
// analysis dashboard and individual volcano detail pages so both show the
// identical evidence/reasoning. Imports the model only for types (erased), so
// this stays out of the client bundle.
import type { RiskAssessment } from '@/lib/volcanic-prediction-v2';
import { getEruptionRecord } from '@/data/eruption-history';
import type { RiskCardData, FactorRow } from './RiskCard';

const ALERT_TEXT: Record<number, string> = {
  0: 'Normal — no significant unrest',
  1: 'Low-level unrest (abnormal)',
  2: 'Increasing / probable magmatic unrest',
  3: 'Magma near surface — hazardous eruption possible within days–weeks',
  4: 'Intense unrest — hazardous eruption imminent',
  5: 'Hazardous eruption in progress',
};

function buildFactors(a: RiskAssessment): FactorRow[] {
  const f = a.factors;
  const bv = a.bValueAnalysis;
  const dm = a.depthMigration;
  const ac = a.acceleration;
  const trig = a.triggeringAnalysis;
  return [
    {
      key: 'alert', kind: 'alert',
      label: `PHIVOLCS alert (Level ${a.volcano.alertLevel})`,
      value: f.alertMultiplier,
      detail: ALERT_TEXT[a.volcano.alertLevel] ?? '',
    },
    {
      key: 'trigger', kind: 'seismic', label: 'Earthquake triggering', value: f.triggeringMultiplier,
      detail: trig.triggerEvents.length
        ? `${trig.triggerEvents.length} qualifying large quake(s); static ΔCFS ~${trig.staticStressChange.toFixed(3)} bar`
        : 'No qualifying large earthquakes in range/time window',
    },
    {
      key: 'recent', kind: 'seismic', label: 'Recent local seismicity', value: f.recentActivityMultiplier,
      detail: `${a.stats.nearFieldCount} events within 15 km · ${a.stats.eventRate30Day.toFixed(1)}/day`,
    },
    {
      key: 'bvalue', kind: 'seismic', label: 'b-value anomaly', value: f.bValueMultiplier,
      detail: bv.sampleSize >= 20
        ? `b=${bv.bValue.toFixed(2)} (${bv.anomaly}) · Mc ${bv.mc.toFixed(1)} · n=${bv.sampleSize}`
        : 'Insufficient events for a reliable b-value',
    },
    {
      key: 'cluster', kind: 'seismic', label: 'Seismic clusters / swarms', value: f.clusterMultiplier,
      detail: a.clusters.length
        ? `${a.clusters.length} cluster(s); ${a.clusters.filter(c => c.isSwarm).length} swarm-like`
        : 'No significant clustering',
    },
    {
      key: 'depth', kind: 'seismic', label: 'Magma depth migration', value: f.depthMigrationMultiplier,
      detail: dm.detected ? `${Math.abs(dm.rate).toFixed(2)} km/day ${dm.direction}` : 'No coherent migration',
    },
    {
      key: 'accel', kind: 'seismic', label: 'Accelerating seismicity', value: f.accelerationMultiplier,
      detail: ac.detected ? `${ac.type.replace('_', ' ')} (R²=${ac.rsquared.toFixed(2)})` : 'No acceleration detected',
    },
    {
      key: 'hydro', kind: 'static', label: 'Hydrothermal system', value: f.hydrothermalMultiplier,
      detail: `Activity level ${a.volcano.hydrothermalActivity}/3`,
    },
  ];
}

export function toRiskCardData(a: RiskAssessment, slug: string, refTime: number): RiskCardData {
  const bv = a.bValueAnalysis;
  const rec = getEruptionRecord(a.volcano.name);
  return {
    id: a.volcano.id,
    name: a.volcano.name,
    province: a.volcano.province ?? '',
    region: a.volcano.region ?? '',
    type: a.volcano.type,
    status: a.volcano.status,
    slug,
    alertLevel: a.volcano.alertLevel,
    monitoringStations: a.volcano.monitoringStations,
    hasHazardMap: a.volcano.hasHazardMap,
    riskLevel: a.riskLevel,
    confidence: a.confidence,
    p1Year: a.probability1Year,
    p30Day: a.probability30Day,
    baseAnnualRate: a.factors.baseline,
    effectiveAnnualRate: a.factors.effectiveAnnualRate,
    recurrenceYears: Math.max(1, Math.round(1 / a.factors.baseline)),
    alertMultiplier: a.factors.alertMultiplier,
    seismicMultiplier: a.factors.combinedMultiplier,
    factors: buildFactors(a),
    triggerEvents: a.triggeringAnalysis.triggerEvents.slice(0, 4).map(t => ({
      magnitude: t.event.magnitude,
      distanceKm: t.event.distanceToVolcano ?? 0,
      model: t.model,
      decayRemaining: t.decayRemaining,
      daysAgo: Math.max(0, Math.round((refTime - new Date(t.event.timestamp).getTime()) / 86400000)),
    })),
    bValue: bv.sampleSize >= 20 ? {
      value: bv.bValue, mc: bv.mc, anomaly: bv.anomaly,
      sampleSize: bv.sampleSize, stdErr: bv.standardError, interpretation: bv.interpretation,
    } : null,
    depthMigration: {
      detected: a.depthMigration.detected, direction: a.depthMigration.direction,
      rate: a.depthMigration.rate, startDepth: a.depthMigration.startDepth,
      currentDepth: a.depthMigration.currentDepth, interpretation: a.depthMigration.interpretation,
    },
    acceleration: {
      detected: a.acceleration.detected, type: a.acceleration.type,
      rsquared: a.acceleration.rsquared,
      projectedPeak: a.acceleration.projectedPeakDate
        ? new Date(a.acceleration.projectedPeakDate).toLocaleDateString('en-PH', { timeZone: 'Asia/Manila' })
        : null,
    },
    clusters: a.clusters.slice(0, 4).map(c => ({
      name: c.name, count: c.earthquakes.length, maxMagnitude: c.maxMagnitude,
      avgDepth: c.avgDepth, isSwarm: c.isSwarm, isMigrating: c.isMigrating,
      migrationDirection: c.migrationDirection,
    })),
    stats: {
      earthquakesAnalyzed: a.stats.earthquakesAnalyzed, m3PlusCount: a.stats.m3PlusCount,
      m4PlusCount: a.stats.m4PlusCount, m5PlusCount: a.stats.m5PlusCount,
      shallowCount: a.stats.shallowCount, nearFieldCount: a.stats.nearFieldCount,
      eventRate30Day: a.stats.eventRate30Day, energyRelease30Day: a.stats.energyRelease30Day,
    },
    scientificNotes: a.scientificNotes,
    guidanceAction: a.strategicGuidance.action,
    guidanceContext: a.strategicGuidance.context,
    preparednessSteps: a.strategicGuidance.preparednessSteps ?? [],
    // Reasoning, evidence & historical/scientific context
    riskDirection: a.riskDirection,
    evidence: a.evidence,
    repose: {
      hasData: a.repose.hasData, status: a.repose.status,
      yearsSinceLast: a.repose.yearsSinceLast, meanRecurrenceYears: a.repose.meanRecurrenceYears,
      reposeRatio: a.repose.reposeRatio, interpretation: a.repose.interpretation,
    },
    eruptionStyle: rec?.eruptionStyle,
    dominantVEI: rec?.dominantVEI,
    notableEruptions: (rec?.notableEruptions ?? []).map(n => ({ year: n.year, vei: n.vei, note: n.note })),
    recentUnrest: (rec?.recentUnrest ?? []).map(u => ({ kind: u.kind, note: u.note })),
    references: (rec?.references ?? []).map(r => ({ label: r.label, url: r.url })),
  };
}
