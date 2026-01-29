// SENN Volcanic Prediction System
// Based on peer-reviewed models:
// - Nishimura (2017): Large earthquake triggering
// - Jenkins et al. (2024): Statistical triggering analysis
// - Alam-Kimura (2004): Distance-time relationships

import { Volcano } from '@/data/philippine-volcanoes';

// ============================================================================
// TYPES
// ============================================================================

export interface Earthquake {
  id: string;
  magnitude: number;
  depth_km: number;
  latitude: number;
  longitude: number;
  timestamp: Date;
  location: string;
  distanceToVolcano?: number;
  cluster?: string;
}

export interface SeismicCluster {
  id: string;
  name: string;
  centerLat: number;
  centerLon: number;
  earthquakes: Earthquake[];
  maxMagnitude: number;
  totalEnergy: number;
  avgDistance: number;
  azimuth: number;  // Direction from volcano
}

export interface RiskAssessment {
  volcano: Volcano;
  probability: number;
  probabilityPercent: number;
  riskLevel: 'LOW' | 'MODERATE' | 'ELEVATED' | 'HIGH' | 'VERY_HIGH';
  confidence: 'VERY_LOW' | 'LOW' | 'MEDIUM' | 'HIGH';
  factors: {
    baseProbability: number;
    nishimuraFactor: number;
    jenkinsFactor: number;
    seismicityAnomalyFactor: number;
    bracketingFactor: number;
    hydrothermalSensitivity: number;
    stateFactor: number;
    combinedMultiplier: number;
  };
  clusters: SeismicCluster[];
  m5Stats: {
    total: number;
    last48h: number;
    last7d: number;
    last30d: number;
    ratePerDay: number;
    anomalyFactor: number;
  };
  earthquakesAnalyzed: number;
  assessmentDate: Date;
  strategicGuidance: StrategicGuidance;
}

export interface StrategicGuidance {
  headline: string;
  action: string;
  context: string;
  preparednessSteps: string[];
  monitoringSources: string[];
  disclaimers: string[];
}

// ============================================================================
// CONSTANTS
// ============================================================================

// Nishimura (2017) parameters
const NISHIMURA_MAGNITUDE_THRESHOLD = 7.5;
const NISHIMURA_DISTANCE_THRESHOLD_KM = 200;
const NISHIMURA_PROBABILITY_INCREASE = 0.50;
const NISHIMURA_EFFECT_DURATION_YEARS = 5;

// Jenkins (2024) parameters
const JENKINS_MAGNITUDE_THRESHOLD = 7.0;
const JENKINS_DISTANCE_THRESHOLD_KM = 750;
const JENKINS_RATE_MULTIPLIER = 1.25;
const JENKINS_EFFECT_DURATION_YEARS = 4;

// Base probabilities by volcano type
const BASE_ANNUAL_PROBABILITY = {
  'active': 0.10,
  'potentially_active': 0.05,
  'dormant': 0.01,
};

// Maximum probability cap (epistemic uncertainty)
const MAX_PROBABILITY = 0.65;

// ============================================================================
// DISTANCE CALCULATION
// ============================================================================

export function haversineDistance(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export function calculateAzimuth(
  volcanoLat: number,
  volcanoLon: number,
  earthquakeLat: number,
  earthquakeLon: number
): number {
  const dLon = (earthquakeLon - volcanoLon) * Math.PI / 180;
  const lat1 = volcanoLat * Math.PI / 180;
  const lat2 = earthquakeLat * Math.PI / 180;
  
  const x = Math.sin(dLon) * Math.cos(lat2);
  const y = Math.cos(lat1) * Math.sin(lat2) - 
            Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  
  let azimuth = Math.atan2(x, y) * 180 / Math.PI;
  return (azimuth + 360) % 360;
}

// ============================================================================
// SEISMIC ENERGY CALCULATION
// ============================================================================

export function seismicEnergy(magnitude: number): number {
  // Energy in joules: log10(E) = 1.5*M + 4.8
  return Math.pow(10, 1.5 * magnitude + 4.8);
}

export function equivalentMagnitude(totalEnergy: number): number {
  return (Math.log10(totalEnergy) - 4.8) / 1.5;
}

// ============================================================================
// NISHIMURA (2017) FACTOR
// ============================================================================

export function calculateNishimuraFactor(
  earthquakes: Earthquake[],
  volcano: Volcano,
  currentDate: Date = new Date()
): number {
  const qualifying = earthquakes.filter(eq => {
    const distance = eq.distanceToVolcano ?? 
      haversineDistance(volcano.latitude, volcano.longitude, eq.latitude, eq.longitude);
    return eq.magnitude >= NISHIMURA_MAGNITUDE_THRESHOLD && 
           distance <= NISHIMURA_DISTANCE_THRESHOLD_KM;
  });

  if (qualifying.length === 0) return 1.0;

  let factor = 1.0;
  for (const eq of qualifying) {
    const daysSince = (currentDate.getTime() - eq.timestamp.getTime()) / (1000 * 60 * 60 * 24);
    const yearsSince = daysSince / 365.25;
    
    if (yearsSince <= NISHIMURA_EFFECT_DURATION_YEARS) {
      const decay = 1 - (yearsSince / NISHIMURA_EFFECT_DURATION_YEARS);
      factor += NISHIMURA_PROBABILITY_INCREASE * decay;
    }
  }

  return factor;
}

// ============================================================================
// JENKINS (2024) FACTOR
// ============================================================================

export function calculateJenkinsFactor(
  earthquakes: Earthquake[],
  volcano: Volcano,
  currentDate: Date = new Date()
): number {
  const qualifying = earthquakes.filter(eq => {
    const distance = eq.distanceToVolcano ?? 
      haversineDistance(volcano.latitude, volcano.longitude, eq.latitude, eq.longitude);
    return eq.magnitude >= JENKINS_MAGNITUDE_THRESHOLD && 
           distance <= JENKINS_DISTANCE_THRESHOLD_KM;
  });

  if (qualifying.length === 0) return 1.0;

  // Use most recent qualifying earthquake
  const mostRecent = qualifying.reduce((a, b) => 
    a.timestamp > b.timestamp ? a : b
  );

  const daysSince = (currentDate.getTime() - mostRecent.timestamp.getTime()) / (1000 * 60 * 60 * 24);
  const yearsSince = daysSince / 365.25;

  if (yearsSince <= JENKINS_EFFECT_DURATION_YEARS) {
    const decay = 1 - (yearsSince / JENKINS_EFFECT_DURATION_YEARS);
    return 1 + (JENKINS_RATE_MULTIPLIER - 1) * decay;
  }

  return 1.0;
}

// ============================================================================
// M5+ SEISMICITY ANALYSIS
// ============================================================================

export function calculateM5Stats(
  earthquakes: Earthquake[],
  currentDate: Date = new Date()
): RiskAssessment['m5Stats'] {
  const m5Events = earthquakes.filter(eq => eq.magnitude >= 5.0);
  
  const now = currentDate.getTime();
  const h48 = 48 * 60 * 60 * 1000;
  const d7 = 7 * 24 * 60 * 60 * 1000;
  const d30 = 30 * 24 * 60 * 60 * 1000;

  const last48h = m5Events.filter(eq => now - eq.timestamp.getTime() <= h48).length;
  const last7d = m5Events.filter(eq => now - eq.timestamp.getTime() <= d7).length;
  const last30d = m5Events.filter(eq => now - eq.timestamp.getTime() <= d30).length;

  // Normal rate for Philippines: ~6 M5+ per month nationally
  // For local region: ~0.1 per day
  const normalRatePerDay = 0.1;
  const observedRatePerDay = last7d / 7;
  const anomalyFactor = normalRatePerDay > 0 ? observedRatePerDay / normalRatePerDay : 1.0;

  return {
    total: m5Events.length,
    last48h,
    last7d,
    last30d,
    ratePerDay: observedRatePerDay,
    anomalyFactor: Math.min(anomalyFactor, 10.0), // Cap at 10x
  };
}

// ============================================================================
// CLUSTER ANALYSIS
// ============================================================================

export function identifyClusters(
  earthquakes: Earthquake[],
  volcano: Volcano,
  clusterRadiusKm: number = 50
): SeismicCluster[] {
  // Simple spatial clustering based on location
  const clusters: Map<string, Earthquake[]> = new Map();
  
  for (const eq of earthquakes) {
    const azimuth = calculateAzimuth(
      volcano.latitude, volcano.longitude,
      eq.latitude, eq.longitude
    );
    
    // Group by compass direction (8 sectors)
    const sector = Math.floor((azimuth + 22.5) / 45) % 8;
    const sectorNames = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const clusterKey = sectorNames[sector];
    
    if (!clusters.has(clusterKey)) {
      clusters.set(clusterKey, []);
    }
    clusters.get(clusterKey)!.push(eq);
  }

  return Array.from(clusters.entries())
    .filter(([_, eqs]) => eqs.length >= 3) // Minimum 3 events for cluster
    .map(([name, eqs]) => {
      const centerLat = eqs.reduce((sum, eq) => sum + eq.latitude, 0) / eqs.length;
      const centerLon = eqs.reduce((sum, eq) => sum + eq.longitude, 0) / eqs.length;
      
      const distances = eqs.map(eq => 
        eq.distanceToVolcano ?? 
        haversineDistance(volcano.latitude, volcano.longitude, eq.latitude, eq.longitude)
      );
      
      return {
        id: `cluster-${name}`,
        name: `${name} Cluster`,
        centerLat,
        centerLon,
        earthquakes: eqs,
        maxMagnitude: Math.max(...eqs.map(eq => eq.magnitude)),
        totalEnergy: eqs.reduce((sum, eq) => sum + seismicEnergy(eq.magnitude), 0),
        avgDistance: distances.reduce((a, b) => a + b, 0) / distances.length,
        azimuth: calculateAzimuth(volcano.latitude, volcano.longitude, centerLat, centerLon),
      };
    });
}

// ============================================================================
// BRACKETING FACTOR
// ============================================================================

export function calculateBracketingFactor(clusters: SeismicCluster[]): number {
  if (clusters.length < 2) return 1.0;

  // Check if clusters are on opposite sides (180° apart ± 45°)
  const azimuths = clusters.map(c => c.azimuth);
  
  for (let i = 0; i < azimuths.length; i++) {
    for (let j = i + 1; j < azimuths.length; j++) {
      const diff = Math.abs(azimuths[i] - azimuths[j]);
      const normalizedDiff = diff > 180 ? 360 - diff : diff;
      
      // If clusters are roughly opposite (135-180° apart)
      if (normalizedDiff >= 135) {
        return 1.5; // 50% increase for bracketing effect
      }
    }
  }

  return 1.0;
}

// ============================================================================
// SENSITIVITY FACTORS
// ============================================================================

export function hydrothermalSensitivity(level: number): number {
  const factors = [1.0, 1.2, 1.5, 2.0]; // 0=none, 1=minor, 2=moderate, 3=vigorous
  return factors[level] ?? 1.0;
}

export function volcanicStateFactor(status: string): number {
  const factors: Record<string, number> = {
    'dormant': 0.5,
    'potentially_active': 1.0,
    'active': 1.5,
  };
  return factors[status] ?? 1.0;
}

// ============================================================================
// STRATEGIC GUIDANCE GENERATOR
// ============================================================================

function generateStrategicGuidance(
  riskLevel: RiskAssessment['riskLevel'],
  volcano: Volcano,
  factors: RiskAssessment['factors']
): StrategicGuidance {
  const baseGuidance: Record<string, StrategicGuidance> = {
    'VERY_HIGH': {
      headline: `${volcano.name}: Heightened Monitoring Recommended`,
      action: 'Review and update your family emergency plan. Know evacuation routes.',
      context: 'Statistical models indicate significantly elevated probability over baseline. This is NOT a prediction of imminent eruption, but a signal for increased preparedness.',
      preparednessSteps: [
        'Review your family emergency communication plan',
        'Know the location of evacuation centers',
        'Prepare or refresh your emergency go-bag',
        'Follow official PHIVOLCS bulletins',
        'If within hazard zones, review evacuation routes',
      ],
      monitoringSources: [
        'PHIVOLCS Official Website: phivolcs.dost.gov.ph',
        'PHIVOLCS Twitter/X: @phaborladol',
        'Local DRRMO announcements',
        'NDRRMC bulletins',
      ],
      disclaimers: [
        'This is a statistical model based on peer-reviewed research, not a deterministic prediction',
        'Probability represents elevated risk over a multi-year window',
        'Always defer to official PHIVOLCS bulletins for emergency decisions',
        'No volcanic unrest indicators may be present even at elevated probability',
      ],
    },
    'HIGH': {
      headline: `${volcano.name}: Elevated Awareness`,
      action: 'Good time to review your emergency preparedness.',
      context: 'Multiple risk factors are present. Standard preparedness measures are recommended.',
      preparednessSteps: [
        'Ensure your emergency kit is complete and accessible',
        'Review family meeting points',
        'Check that emergency contact numbers are up to date',
        'Stay informed via official channels',
      ],
      monitoringSources: [
        'PHIVOLCS Official Website: phivolcs.dost.gov.ph',
        'Local news updates',
      ],
      disclaimers: [
        'Elevated probability does not mean eruption is imminent',
        'Continue normal activities while maintaining awareness',
        'Follow official guidance from PHIVOLCS and local authorities',
      ],
    },
    'ELEVATED': {
      headline: `${volcano.name}: Above Background Activity`,
      action: 'Stay informed through official channels.',
      context: 'Some indicators are above normal levels. Maintain general awareness.',
      preparednessSteps: [
        'Check that your emergency kit is ready',
        'Know where to find official updates',
      ],
      monitoringSources: [
        'PHIVOLCS Official Website: phivolcs.dost.gov.ph',
      ],
      disclaimers: [
        'Above-background does not indicate imminent hazard',
        'Normal daily activities can continue',
      ],
    },
    'MODERATE': {
      headline: `${volcano.name}: Standard Monitoring`,
      action: 'Maintain general preparedness as for any volcanic area.',
      context: 'Normal monitoring conditions. Standard preparedness applies.',
      preparednessSteps: [
        'Keep emergency supplies on hand (standard for volcanic areas)',
        'Know general evacuation procedures for your area',
      ],
      monitoringSources: [
        'PHIVOLCS Official Website: phivolcs.dost.gov.ph',
      ],
      disclaimers: [
        'Low probability does not mean zero probability',
        'Living near volcanoes requires baseline preparedness',
      ],
    },
    'LOW': {
      headline: `${volcano.name}: Background Level`,
      action: 'No specific action required. General awareness sufficient.',
      context: 'No significant indicators detected. Normal conditions.',
      preparednessSteps: [
        'Maintain general household emergency preparedness',
      ],
      monitoringSources: [
        'PHIVOLCS Official Website: phivolcs.dost.gov.ph',
      ],
      disclaimers: [
        'Conditions can change; periodic awareness is prudent',
      ],
    },
  };

  return baseGuidance[riskLevel] ?? baseGuidance['LOW'];
}

// ============================================================================
// MAIN ASSESSMENT FUNCTION
// ============================================================================

export function assessVolcanoRisk(
  volcano: Volcano,
  earthquakes: Earthquake[],
  currentDate: Date = new Date()
): RiskAssessment {
  // Calculate distances to volcano for all earthquakes
  const earthquakesWithDistance = earthquakes.map(eq => ({
    ...eq,
    distanceToVolcano: haversineDistance(
      volcano.latitude, volcano.longitude,
      eq.latitude, eq.longitude
    ),
  }));

  // Filter to earthquakes within analysis range (750km per Jenkins)
  const relevantEarthquakes = earthquakesWithDistance.filter(
    eq => eq.distanceToVolcano! <= 750
  );

  // Calculate factors
  const baseProbability = BASE_ANNUAL_PROBABILITY[volcano.status] ?? 0.05;
  const nishimuraFactor = calculateNishimuraFactor(relevantEarthquakes, volcano, currentDate);
  const jenkinsFactor = calculateJenkinsFactor(relevantEarthquakes, volcano, currentDate);
  const m5Stats = calculateM5Stats(relevantEarthquakes, currentDate);
  const clusters = identifyClusters(relevantEarthquakes, volcano);
  const bracketingFactor = calculateBracketingFactor(clusters);
  const hydroSensitivity = hydrothermalSensitivity(volcano.hydrothermalActivity);
  const stateFactor = volcanicStateFactor(volcano.status);

  // Combine factors
  const combinedMultiplier = 
    Math.max(nishimuraFactor, jenkinsFactor) *
    (1 + (m5Stats.anomalyFactor - 1) * 0.3) * // 30% weight for seismicity anomaly
    bracketingFactor *
    hydroSensitivity *
    stateFactor;

  // Calculate probability with cap
  const rawProbability = baseProbability * combinedMultiplier;
  const probability = Math.min(rawProbability, MAX_PROBABILITY);
  const probabilityPercent = Math.round(probability * 1000) / 10;

  // Determine risk level
  let riskLevel: RiskAssessment['riskLevel'];
  if (probability >= 0.35) riskLevel = 'VERY_HIGH';
  else if (probability >= 0.20) riskLevel = 'HIGH';
  else if (probability >= 0.10) riskLevel = 'ELEVATED';
  else if (probability >= 0.05) riskLevel = 'MODERATE';
  else riskLevel = 'LOW';

  // Determine confidence
  let confidence: RiskAssessment['confidence'];
  if (volcano.monitoringStations >= 10 && relevantEarthquakes.length >= 50) {
    confidence = 'HIGH';
  } else if (volcano.monitoringStations >= 5 && relevantEarthquakes.length >= 20) {
    confidence = 'MEDIUM';
  } else if (volcano.monitoringStations >= 2) {
    confidence = 'LOW';
  } else {
    confidence = 'VERY_LOW';
  }

  const factors = {
    baseProbability,
    nishimuraFactor: Math.round(nishimuraFactor * 1000) / 1000,
    jenkinsFactor: Math.round(jenkinsFactor * 1000) / 1000,
    seismicityAnomalyFactor: Math.round(m5Stats.anomalyFactor * 100) / 100,
    bracketingFactor,
    hydrothermalSensitivity: hydroSensitivity,
    stateFactor,
    combinedMultiplier: Math.round(combinedMultiplier * 100) / 100,
  };

  return {
    volcano,
    probability,
    probabilityPercent,
    riskLevel,
    confidence,
    factors,
    clusters,
    m5Stats,
    earthquakesAnalyzed: relevantEarthquakes.length,
    assessmentDate: currentDate,
    strategicGuidance: generateStrategicGuidance(riskLevel, volcano, factors),
  };
}

// ============================================================================
// BATCH ASSESSMENT FOR ALL VOLCANOES
// ============================================================================

export function assessAllVolcanoes(
  volcanoes: Volcano[],
  earthquakes: Earthquake[],
  currentDate: Date = new Date()
): RiskAssessment[] {
  return volcanoes
    .map(volcano => assessVolcanoRisk(volcano, earthquakes, currentDate))
    .sort((a, b) => b.probability - a.probability); // Sort by risk
}
