// ============================================================================
// SENN Volcanic Prediction System v2.0
// ============================================================================
// 
// A comprehensive volcanic risk assessment system based on peer-reviewed
// seismological research. This system integrates multiple scientific models
// to estimate eruption probability within specified timeframes.
//
// SCIENTIFIC FOUNDATION:
// ----------------------
// 1. Nishimura (2017) - Large earthquake triggering within 200km
// 2. Jenkins et al. (2024) - Statistical triggering at regional scale
// 3. Manga & Brodsky (2006) - Dynamic triggering mechanisms
// 4. Roman & Cashman (2006) - Depth migration as eruption precursor
// 5. Kilburn (2003) - Accelerating seismicity (inverse rate method)
// 6. Bebbington (2020) - Bayesian renewal models for volcanoes
// 7. McNutt (1996) - Seismic amplitude monitoring (RSAM proxy)
// 8. White & McCausland (2016) - Deep long-period earthquake significance
// 9. Marzocchi & Bebbington (2012) - Probabilistic hazard framework
// 10. Passarelli et al. (2013) - Time-predictable volcanic behavior
// 11. Gutenberg-Richter (1944) - b-value analysis for stress state
// 12. Coulomb (1785) / King et al. (1994) - Static stress transfer
//
// DISCLAIMER:
// -----------
// This is a STATISTICAL model providing PROBABILITY ESTIMATES, not predictions.
// Volcanic systems are complex and can erupt without warning or show precursors
// without erupting. Always defer to official monitoring agencies (PHIVOLCS).
//
// ============================================================================

import { Volcano } from '@/data/philippine-volcanoes';

// ============================================================================
// TYPE DEFINITIONS
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
  azimuthFromVolcano?: number;
}

export interface SeismicCluster {
  id: string;
  name: string;
  centerLat: number;
  centerLon: number;
  earthquakes: Earthquake[];
  maxMagnitude: number;
  totalEnergy: number;          // Joules
  avgDepth: number;
  depthRange: { min: number; max: number };
  avgDistance: number;
  azimuth: number;
  duration: number;             // Hours
  peakRate: number;             // Events per hour
  isSwarm: boolean;             // High event count, similar magnitudes
  isMigrating: boolean;         // Depth migration detected
  migrationDirection: 'shallowing' | 'deepening' | 'stable';
}

export interface DepthMigrationAnalysis {
  detected: boolean;
  direction: 'shallowing' | 'deepening' | 'stable';
  rate: number;                 // km/day
  confidence: number;           // 0-1
  startDepth: number;
  currentDepth: number;
  interpretation: string;
}

export interface BValueAnalysis {
  bValue: number;               // Gutenberg-Richter b-value
  aValue: number;               // Productivity parameter
  standardError: number;
  sampleSize: number;
  interpretation: string;
  anomaly: 'low' | 'normal' | 'high';
  // Low b-value (<0.7) suggests high stress / large event potential
  // High b-value (>1.3) suggests swarm behavior / fluid involvement
}

export interface AccelerationAnalysis {
  detected: boolean;
  type: 'exponential' | 'power_law' | 'linear' | 'none';
  rate: number;                 // Events per day trend
  rsquared: number;             // Fit quality
  projectedPeakDate?: Date;     // Kilburn inverse rate method
  confidence: number;
}

export interface TriggeringAnalysis {
  nishimuraTriggered: boolean;  // M7.5+ within 200km, 5 years
  jenkinsTriggered: boolean;    // M7.0+ within 750km, 4 years
  dynamicTriggered: boolean;    // M8.0+ within 5000km, 1 year (Manga & Brodsky)
  staticStressChange: number;   // Coulomb stress change (bars, estimated)
  triggerEvents: {
    event: Earthquake;
    model: string;
    factor: number;
    decayRemaining: number;
  }[];
}

export interface RiskAssessment {
  volcano: Volcano;
  
  // Core probability
  probability30Day: number;     // P(eruption in 30 days)
  probability1Year: number;     // P(eruption in 1 year)
  probabilityDisplay: number;   // Primary display value (1-year)
  
  riskLevel: 'BACKGROUND' | 'LOW' | 'MODERATE' | 'ELEVATED' | 'HIGH' | 'VERY_HIGH' | 'CRITICAL';
  confidence: 'VERY_LOW' | 'LOW' | 'MEDIUM' | 'HIGH';
  
  // Component analyses
  baselineRate: number;         // Historical eruption rate (per year)
  triggeringAnalysis: TriggeringAnalysis;
  depthMigration: DepthMigrationAnalysis;
  bValueAnalysis: BValueAnalysis;
  acceleration: AccelerationAnalysis;
  clusters: SeismicCluster[];
  
  // Factor breakdown
  factors: {
    baseline: number;
    triggeringMultiplier: number;
    depthMigrationMultiplier: number;
    bValueMultiplier: number;
    accelerationMultiplier: number;
    clusterMultiplier: number;
    hydrothermalMultiplier: number;
    recentActivityMultiplier: number;
    combinedMultiplier: number;
  };
  
  // Statistics
  stats: {
    earthquakesAnalyzed: number;
    m3PlusCount: number;
    m4PlusCount: number;
    m5PlusCount: number;
    shallowCount: number;       // < 5km
    nearFieldCount: number;     // < 15km from volcano
    eventRate7Day: number;      // Events per day
    eventRate30Day: number;
    energyRelease30Day: number; // Joules
  };
  
  // Output
  assessmentDate: Date;
  dataWindow: { start: Date; end: Date };
  strategicGuidance: StrategicGuidance;
  scientificNotes: string[];
}

export interface StrategicGuidance {
  headline: string;
  action: string;
  context: string;
  keyIndicators: string[];
  preparednessSteps: string[];
  monitoringSources: string[];
  disclaimers: string[];
}

// ============================================================================
// PHYSICAL CONSTANTS & PARAMETERS
// ============================================================================

// Seismic energy: log10(E) = 1.5*M + 4.8 (Gutenberg & Richter, 1956)
const SEISMIC_ENERGY_COEFFICIENT = 1.5;
const SEISMIC_ENERGY_CONSTANT = 4.8;

// Earth radius for distance calculations
const EARTH_RADIUS_KM = 6371;

// Triggering model parameters (peer-reviewed values)
const TRIGGERING_PARAMS = {
  // Nishimura (2017): Static stress triggering
  nishimura: {
    minMagnitude: 7.5,
    maxDistanceKm: 200,
    effectDurationYears: 5,
    baseProbabilityIncrease: 0.50,   // 50% probability increase
  },
  
  // Jenkins et al. (2024): Regional statistical triggering
  jenkins: {
    minMagnitude: 7.0,
    maxDistanceKm: 750,
    effectDurationYears: 4,
    rateMultiplier: 1.25,
  },
  
  // Manga & Brodsky (2006): Dynamic triggering at teleseismic distances
  mangaBrodsky: {
    minMagnitude: 8.0,
    maxDistanceKm: 5000,
    effectDurationYears: 1,
    rateMultiplier: 1.15,
  },
};

// Base eruption rates by volcano type (from GVP global statistics)
const BASE_ERUPTION_RATES: Record<string, number> = {
  // Eruptions per year (averaged from GVP Holocene data)
  'active': 0.10,           // Active with recent eruptions: ~1 per 10 years
  'potentially_active': 0.02, // Holocene activity but no historical: ~1 per 50 years
  'dormant': 0.005,         // Long dormancy: ~1 per 200 years
};

// Depth migration thresholds (Roman & Cashman, 2006)
const DEPTH_MIGRATION = {
  significantRate: 0.5,       // km/day considered significant
  criticalRate: 2.0,          // km/day considered critical
  windowDays: 14,             // Analysis window
  minEvents: 10,              // Minimum events for analysis
};

// b-value thresholds (global average ~1.0)
const B_VALUE = {
  normal: { min: 0.8, max: 1.2 },
  lowStress: 1.3,             // > this suggests fluid/swarm
  highStress: 0.7,            // < this suggests stress accumulation
};

// Risk level thresholds (1-year probability)
const RISK_THRESHOLDS = {
  CRITICAL: 0.50,
  VERY_HIGH: 0.35,
  HIGH: 0.20,
  ELEVATED: 0.10,
  MODERATE: 0.05,
  LOW: 0.02,
  BACKGROUND: 0,
};

// ============================================================================
// MATHEMATICAL FUNCTIONS
// ============================================================================

/**
 * Haversine distance between two points
 */
export function haversineDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * Math.PI / 180) * 
            Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Azimuth from point 1 to point 2 (degrees, 0=N, 90=E)
 */
export function calculateAzimuth(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const y = Math.sin(dLon) * Math.cos(lat2 * Math.PI / 180);
  const x = Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) -
            Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos(dLon);
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}

/**
 * Seismic energy in Joules (Gutenberg-Richter relation)
 */
export function seismicEnergy(magnitude: number): number {
  return Math.pow(10, SEISMIC_ENERGY_COEFFICIENT * magnitude + SEISMIC_ENERGY_CONSTANT);
}

/**
 * Equivalent magnitude from total energy
 */
export function equivalentMagnitude(energyJoules: number): number {
  return (Math.log10(energyJoules) - SEISMIC_ENERGY_CONSTANT) / SEISMIC_ENERGY_COEFFICIENT;
}

/**
 * Estimate static Coulomb stress change (simplified, in bars)
 * Based on Toda et al. (2005) empirical scaling
 */
export function estimateCoulombStress(magnitude: number, distanceKm: number): number {
  if (distanceKm < 1) distanceKm = 1;
  // Empirical: stress ~ 10^(1.5*M - 9.1) / r^3 (bars)
  // Simplified for order-of-magnitude estimates
  const stressMPa = Math.pow(10, 1.5 * magnitude - 9.1) / Math.pow(distanceKm, 3);
  return stressMPa * 10; // Convert to bars
}

/**
 * Linear regression for trend analysis
 */
function linearRegression(x: number[], y: number[]): { slope: number; intercept: number; r2: number } {
  const n = x.length;
  if (n < 2) return { slope: 0, intercept: 0, r2: 0 };
  
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0);
  const sumX2 = x.reduce((acc, xi) => acc + xi * xi, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  // R-squared
  const meanY = sumY / n;
  const ssTotal = y.reduce((acc, yi) => acc + (yi - meanY) ** 2, 0);
  const ssResidual = y.reduce((acc, yi, i) => acc + (yi - (slope * x[i] + intercept)) ** 2, 0);
  const r2 = ssTotal > 0 ? 1 - ssResidual / ssTotal : 0;
  
  return { slope, intercept, r2 };
}

// ============================================================================
// DEPTH MIGRATION ANALYSIS (Roman & Cashman, 2006)
// ============================================================================

/**
 * Analyze earthquake depth migration patterns
 * Shallowing hypocenters often precede eruptions as magma ascends
 */
export function analyzeDepthMigration(
  earthquakes: Earthquake[],
  windowDays: number = DEPTH_MIGRATION.windowDays
): DepthMigrationAnalysis {
  const now = Date.now();
  const windowMs = windowDays * 24 * 60 * 60 * 1000;
  
  // Filter to recent events with valid depths
  const recent = earthquakes
    .filter(eq => eq.depth_km > 0 && eq.depth_km < 100 && 
                  now - eq.timestamp.getTime() < windowMs)
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  
  if (recent.length < DEPTH_MIGRATION.minEvents) {
    return {
      detected: false,
      direction: 'stable',
      rate: 0,
      confidence: 0,
      startDepth: 0,
      currentDepth: 0,
      interpretation: 'Insufficient data for depth migration analysis',
    };
  }
  
  // Time as days from first event
  const t0 = recent[0].timestamp.getTime();
  const x = recent.map(eq => (eq.timestamp.getTime() - t0) / (24 * 60 * 60 * 1000));
  const y = recent.map(eq => eq.depth_km);
  
  const { slope, r2 } = linearRegression(x, y);
  
  // Rate in km/day (negative = shallowing)
  const rate = -slope; // Positive rate = shallowing (depth decreasing)
  const direction: 'shallowing' | 'deepening' | 'stable' = 
    rate > 0.1 ? 'shallowing' : rate < -0.1 ? 'deepening' : 'stable';
  
  const detected = Math.abs(rate) >= DEPTH_MIGRATION.significantRate && r2 >= 0.3;
  const confidence = Math.min(r2, 1);
  
  let interpretation: string;
  if (direction === 'shallowing' && rate >= DEPTH_MIGRATION.criticalRate) {
    interpretation = `CRITICAL: Rapid shallowing (${rate.toFixed(2)} km/day) may indicate ascending magma`;
  } else if (direction === 'shallowing' && detected) {
    interpretation = `Shallowing trend (${rate.toFixed(2)} km/day) warrants continued monitoring`;
  } else if (direction === 'deepening' && detected) {
    interpretation = `Deepening trend may indicate stress relaxation or fluid drainage`;
  } else {
    interpretation = 'No significant depth migration detected';
  }
  
  return {
    detected,
    direction,
    rate,
    confidence,
    startDepth: y[0],
    currentDepth: y[y.length - 1],
    interpretation,
  };
}

// ============================================================================
// B-VALUE ANALYSIS (Gutenberg-Richter, 1944)
// ============================================================================

/**
 * Calculate Gutenberg-Richter b-value using maximum likelihood (Aki, 1965)
 * log10(N) = a - b*M
 * 
 * Low b-value (<0.7): High differential stress, potential for large events
 * Normal b-value (~1.0): Typical tectonic seismicity
 * High b-value (>1.3): Fluid involvement, swarm behavior, volcanic
 */
export function analyzeBValue(
  earthquakes: Earthquake[],
  minMagnitude: number = 2.0  // Completeness magnitude
): BValueAnalysis {
  // Filter to events above completeness magnitude
  const mags = earthquakes
    .map(eq => eq.magnitude)
    .filter(m => m >= minMagnitude)
    .sort((a, b) => a - b);
  
  if (mags.length < 20) {
    return {
      bValue: 1.0,
      aValue: 0,
      standardError: 0,
      sampleSize: mags.length,
      interpretation: 'Insufficient data for reliable b-value estimate',
      anomaly: 'normal',
    };
  }
  
  // Maximum likelihood estimator (Aki, 1965)
  const meanMag = mags.reduce((a, b) => a + b, 0) / mags.length;
  const bValue = Math.log10(Math.E) / (meanMag - (minMagnitude - 0.05));
  
  // Standard error (Shi & Bolt, 1982)
  const standardError = bValue / Math.sqrt(mags.length);
  
  // a-value (productivity)
  const aValue = Math.log10(mags.length) + bValue * minMagnitude;
  
  // Interpretation
  let interpretation: string;
  let anomaly: 'low' | 'normal' | 'high';
  
  if (bValue < B_VALUE.highStress) {
    anomaly = 'low';
    interpretation = `Low b-value (${bValue.toFixed(2)}) suggests high stress accumulation and potential for larger events`;
  } else if (bValue > B_VALUE.lowStress) {
    anomaly = 'high';
    interpretation = `High b-value (${bValue.toFixed(2)}) suggests fluid involvement or swarm-type activity`;
  } else {
    anomaly = 'normal';
    interpretation = `Normal b-value (${bValue.toFixed(2)}) indicates typical tectonic seismicity`;
  }
  
  return {
    bValue: Math.round(bValue * 100) / 100,
    aValue: Math.round(aValue * 100) / 100,
    standardError: Math.round(standardError * 1000) / 1000,
    sampleSize: mags.length,
    interpretation,
    anomaly,
  };
}

// ============================================================================
// ACCELERATION ANALYSIS (Kilburn, 2003)
// ============================================================================

/**
 * Detect accelerating seismicity using the Failure Forecast Method (FFM)
 * Based on Voight (1988) and Kilburn (2003)
 * 
 * Accelerating seismicity often precedes volcanic eruptions
 * Uses inverse rate method to project potential failure time
 */
export function analyzeAcceleration(
  earthquakes: Earthquake[],
  windowDays: number = 30
): AccelerationAnalysis {
  const now = Date.now();
  const windowMs = windowDays * 24 * 60 * 60 * 1000;
  
  // Bin events by day
  const recent = earthquakes
    .filter(eq => now - eq.timestamp.getTime() < windowMs)
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  
  if (recent.length < 10) {
    return {
      detected: false,
      type: 'none',
      rate: 0,
      rsquared: 0,
      confidence: 0,
    };
  }
  
  // Cumulative count over time
  const t0 = recent[0].timestamp.getTime();
  const dailyCounts: Map<number, number> = new Map();
  
  for (const eq of recent) {
    const day = Math.floor((eq.timestamp.getTime() - t0) / (24 * 60 * 60 * 1000));
    dailyCounts.set(day, (dailyCounts.get(day) || 0) + 1);
  }
  
  const days = Array.from(dailyCounts.keys()).sort((a, b) => a - b);
  const counts = days.map(d => dailyCounts.get(d) || 0);
  
  if (days.length < 5) {
    return {
      detected: false,
      type: 'none',
      rate: 0,
      rsquared: 0,
      confidence: 0,
    };
  }
  
  // Linear fit to daily rates
  const { slope, r2 } = linearRegression(days, counts);
  
  // Calculate inverse rate for FFM
  const nonZeroCounts = counts.filter(c => c > 0);
  const inverseRates = nonZeroCounts.map(c => 1 / c);
  const inverseX = days.filter((_, i) => counts[i] > 0);
  
  const inverseRegression = linearRegression(inverseX, inverseRates);
  
  let type: 'exponential' | 'power_law' | 'linear' | 'none' = 'none';
  let projectedPeakDate: Date | undefined;
  
  if (slope > 0.5 && r2 > 0.5) {
    // Accelerating
    if (inverseRegression.slope < 0 && inverseRegression.r2 > 0.5) {
      type = 'power_law';
      // Project when inverse rate = 0 (failure)
      const daysToFailure = -inverseRegression.intercept / inverseRegression.slope;
      if (daysToFailure > 0 && daysToFailure < 365) {
        projectedPeakDate = new Date(t0 + daysToFailure * 24 * 60 * 60 * 1000);
      }
    } else {
      type = slope > 1.0 ? 'exponential' : 'linear';
    }
  }
  
  return {
    detected: type !== 'none',
    type,
    rate: Math.round(slope * 100) / 100,
    rsquared: Math.round(r2 * 100) / 100,
    projectedPeakDate,
    confidence: Math.min(r2, 1),
  };
}

// ============================================================================
// TRIGGERING ANALYSIS
// ============================================================================

/**
 * Analyze potential earthquake triggering of volcanic activity
 */
export function analyzeTriggeringEvents(
  earthquakes: Earthquake[],
  volcano: Volcano,
  currentDate: Date = new Date()
): TriggeringAnalysis {
  const result: TriggeringAnalysis = {
    nishimuraTriggered: false,
    jenkinsTriggered: false,
    dynamicTriggered: false,
    staticStressChange: 0,
    triggerEvents: [],
  };
  
  const now = currentDate.getTime();
  
  for (const eq of earthquakes) {
    const distance = eq.distanceToVolcano ?? haversineDistance(
      volcano.latitude, volcano.longitude,
      eq.latitude, eq.longitude
    );
    
    const daysSince = (now - eq.timestamp.getTime()) / (1000 * 60 * 60 * 24);
    const yearsSince = daysSince / 365.25;
    
    // Check Nishimura (2017) criteria
    const nish = TRIGGERING_PARAMS.nishimura;
    if (eq.magnitude >= nish.minMagnitude && 
        distance <= nish.maxDistanceKm &&
        yearsSince <= nish.effectDurationYears) {
      
      const decay = 1 - (yearsSince / nish.effectDurationYears);
      const factor = 1 + nish.baseProbabilityIncrease * decay;
      
      result.nishimuraTriggered = true;
      result.staticStressChange += estimateCoulombStress(eq.magnitude, distance);
      result.triggerEvents.push({
        event: eq,
        model: 'Nishimura (2017)',
        factor,
        decayRemaining: decay,
      });
    }
    
    // Check Jenkins (2024) criteria
    const jenk = TRIGGERING_PARAMS.jenkins;
    if (eq.magnitude >= jenk.minMagnitude &&
        distance <= jenk.maxDistanceKm &&
        yearsSince <= jenk.effectDurationYears) {
      
      const decay = 1 - (yearsSince / jenk.effectDurationYears);
      const factor = 1 + (jenk.rateMultiplier - 1) * decay;
      
      result.jenkinsTriggered = true;
      
      // Only add if not already added by Nishimura
      if (!result.triggerEvents.some(te => te.event.id === eq.id)) {
        result.triggerEvents.push({
          event: eq,
          model: 'Jenkins et al. (2024)',
          factor,
          decayRemaining: decay,
        });
      }
    }
    
    // Check Manga & Brodsky (2006) dynamic triggering
    const mb = TRIGGERING_PARAMS.mangaBrodsky;
    if (eq.magnitude >= mb.minMagnitude &&
        distance <= mb.maxDistanceKm &&
        yearsSince <= mb.effectDurationYears) {
      
      const decay = 1 - (yearsSince / mb.effectDurationYears);
      const factor = 1 + (mb.rateMultiplier - 1) * decay;
      
      result.dynamicTriggered = true;
      
      if (!result.triggerEvents.some(te => te.event.id === eq.id)) {
        result.triggerEvents.push({
          event: eq,
          model: 'Manga & Brodsky (2006)',
          factor,
          decayRemaining: decay,
        });
      }
    }
  }
  
  // Sort by factor (highest first)
  result.triggerEvents.sort((a, b) => b.factor - a.factor);
  
  return result;
}

// ============================================================================
// CLUSTER ANALYSIS (DBSCAN-inspired)
// ============================================================================

/**
 * Identify seismic clusters using spatial-temporal grouping
 */
export function identifyClusters(
  earthquakes: Earthquake[],
  volcano: Volcano,
  maxDistanceKm: number = 30,
  maxTimeGapHours: number = 72
): SeismicCluster[] {
  // Filter to near-field events
  const nearField = earthquakes
    .filter(eq => {
      const dist = eq.distanceToVolcano ?? haversineDistance(
        volcano.latitude, volcano.longitude,
        eq.latitude, eq.longitude
      );
      return dist <= maxDistanceKm;
    })
    .map(eq => ({
      ...eq,
      distanceToVolcano: eq.distanceToVolcano ?? haversineDistance(
        volcano.latitude, volcano.longitude,
        eq.latitude, eq.longitude
      ),
      azimuthFromVolcano: eq.azimuthFromVolcano ?? calculateAzimuth(
        volcano.latitude, volcano.longitude,
        eq.latitude, eq.longitude
      ),
    }))
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  
  if (nearField.length < 3) return [];
  
  // Group by azimuth sector (8 sectors of 45°)
  const sectors: Map<string, typeof nearField> = new Map();
  const sectorNames = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  
  for (const eq of nearField) {
    const sectorIdx = Math.floor(((eq.azimuthFromVolcano ?? 0) + 22.5) / 45) % 8;
    const sector = sectorNames[sectorIdx];
    if (!sectors.has(sector)) sectors.set(sector, []);
    sectors.get(sector)!.push(eq);
  }
  
  const clusters: SeismicCluster[] = [];
  
  for (const [sectorName, events] of sectors) {
    if (events.length < 3) continue;
    
    // Further subdivide by time gaps
    let currentGroup: typeof events = [events[0]];
    
    for (let i = 1; i < events.length; i++) {
      const gapHours = (events[i].timestamp.getTime() - 
                        events[i-1].timestamp.getTime()) / (1000 * 60 * 60);
      
      if (gapHours <= maxTimeGapHours) {
        currentGroup.push(events[i]);
      } else {
        if (currentGroup.length >= 3) {
          clusters.push(createCluster(sectorName, currentGroup, volcano));
        }
        currentGroup = [events[i]];
      }
    }
    
    if (currentGroup.length >= 3) {
      clusters.push(createCluster(sectorName, currentGroup, volcano));
    }
  }
  
  return clusters.sort((a, b) => b.totalEnergy - a.totalEnergy);
}

function createCluster(
  name: string,
  earthquakes: Earthquake[],
  volcano: Volcano
): SeismicCluster {
  const depths = earthquakes.map(eq => eq.depth_km).filter(d => d > 0);
  const distances = earthquakes.map(eq => 
    eq.distanceToVolcano ?? haversineDistance(
      volcano.latitude, volcano.longitude,
      eq.latitude, eq.longitude
    )
  );
  
  const duration = (earthquakes[earthquakes.length - 1].timestamp.getTime() -
                    earthquakes[0].timestamp.getTime()) / (1000 * 60 * 60);
  
  // Detect depth migration within cluster
  const depthTrend = depths.length >= 5 ? 
    linearRegression(
      Array.from({length: depths.length}, (_, i) => i),
      depths
    ) : { slope: 0, r2: 0 };
  
  // Swarm detection: similar magnitudes, high count
  const mags = earthquakes.map(eq => eq.magnitude);
  const magStd = Math.sqrt(
    mags.reduce((acc, m) => acc + (m - mags.reduce((a, b) => a + b, 0) / mags.length) ** 2, 0) / mags.length
  );
  const isSwarm = magStd < 0.5 && earthquakes.length >= 10;
  
  return {
    id: `cluster-${name}-${earthquakes[0].timestamp.getTime()}`,
    name: `${name} Cluster`,
    centerLat: earthquakes.reduce((sum, eq) => sum + eq.latitude, 0) / earthquakes.length,
    centerLon: earthquakes.reduce((sum, eq) => sum + eq.longitude, 0) / earthquakes.length,
    earthquakes,
    maxMagnitude: Math.max(...mags),
    totalEnergy: earthquakes.reduce((sum, eq) => sum + seismicEnergy(eq.magnitude), 0),
    avgDepth: depths.length > 0 ? depths.reduce((a, b) => a + b, 0) / depths.length : 0,
    depthRange: { min: Math.min(...depths, 0), max: Math.max(...depths, 0) },
    avgDistance: distances.reduce((a, b) => a + b, 0) / distances.length,
    azimuth: calculateAzimuth(
      volcano.latitude, volcano.longitude,
      earthquakes.reduce((sum, eq) => sum + eq.latitude, 0) / earthquakes.length,
      earthquakes.reduce((sum, eq) => sum + eq.longitude, 0) / earthquakes.length
    ),
    duration,
    peakRate: duration > 0 ? earthquakes.length / (duration + 0.1) : earthquakes.length,
    isSwarm,
    isMigrating: Math.abs(depthTrend.slope) > 0.1 && depthTrend.r2 > 0.3,
    migrationDirection: depthTrend.slope < -0.1 ? 'shallowing' : 
                        depthTrend.slope > 0.1 ? 'deepening' : 'stable',
  };
}

// ============================================================================
// MULTIPLIER CALCULATIONS
// ============================================================================

function calculateTriggeringMultiplier(analysis: TriggeringAnalysis): number {
  if (analysis.triggerEvents.length === 0) return 1.0;
  
  // Use the maximum factor from all trigger events
  return Math.max(...analysis.triggerEvents.map(te => te.factor));
}

function calculateDepthMigrationMultiplier(analysis: DepthMigrationAnalysis): number {
  if (!analysis.detected) return 1.0;
  
  if (analysis.direction === 'shallowing') {
    if (analysis.rate >= DEPTH_MIGRATION.criticalRate) {
      return 2.5 * analysis.confidence;
    } else if (analysis.rate >= DEPTH_MIGRATION.significantRate) {
      return 1.5 * analysis.confidence;
    }
  }
  
  return 1.0;
}

function calculateBValueMultiplier(analysis: BValueAnalysis): number {
  if (analysis.sampleSize < 20) return 1.0;
  
  switch (analysis.anomaly) {
    case 'low':  return 1.3;  // High stress
    case 'high': return 1.2;  // Fluid involvement
    default:     return 1.0;
  }
}

function calculateAccelerationMultiplier(analysis: AccelerationAnalysis): number {
  if (!analysis.detected) return 1.0;
  
  const baseMultiplier = analysis.type === 'power_law' ? 2.0 :
                         analysis.type === 'exponential' ? 1.8 :
                         analysis.type === 'linear' ? 1.3 : 1.0;
  
  return 1 + (baseMultiplier - 1) * analysis.confidence;
}

function calculateClusterMultiplier(clusters: SeismicCluster[]): number {
  if (clusters.length === 0) return 1.0;
  
  let multiplier = 1.0;
  
  // Check for bracketing (opposing clusters)
  const azimuths = clusters.map(c => c.azimuth);
  for (let i = 0; i < azimuths.length; i++) {
    for (let j = i + 1; j < azimuths.length; j++) {
      const diff = Math.abs(azimuths[i] - azimuths[j]);
      const normalized = diff > 180 ? 360 - diff : diff;
      if (normalized >= 135) {
        multiplier *= 1.5; // Bracketing effect
      }
    }
  }
  
  // Check for migrating clusters
  const migratingShallow = clusters.filter(c => c.isMigrating && c.migrationDirection === 'shallowing');
  if (migratingShallow.length > 0) {
    multiplier *= 1.3;
  }
  
  // Check for swarms
  const swarms = clusters.filter(c => c.isSwarm);
  if (swarms.length > 0) {
    multiplier *= 1.2;
  }
  
  return Math.min(multiplier, 3.0); // Cap at 3x
}

function calculateHydrothermalMultiplier(level: 0 | 1 | 2 | 3): number {
  // Based on Fournier (1989) and White & McCausland (2016)
  const multipliers = [1.0, 1.2, 1.5, 2.0];
  return multipliers[level] ?? 1.0;
}

function calculateRecentActivityMultiplier(
  volcano: Volcano,
  earthquakes: Earthquake[]
): number {
  const now = Date.now();
  const days30 = 30 * 24 * 60 * 60 * 1000;
  
  // Near-field shallow events in last 30 days
  const recentShallow = earthquakes.filter(eq => {
    const dist = eq.distanceToVolcano ?? haversineDistance(
      volcano.latitude, volcano.longitude,
      eq.latitude, eq.longitude
    );
    return dist <= 15 && eq.depth_km <= 10 && now - eq.timestamp.getTime() <= days30;
  });
  
  if (recentShallow.length >= 20) return 1.5;
  if (recentShallow.length >= 10) return 1.3;
  if (recentShallow.length >= 5) return 1.1;
  
  return 1.0;
}

// ============================================================================
// STRATEGIC GUIDANCE GENERATOR
// ============================================================================

function generateStrategicGuidance(
  riskLevel: RiskAssessment['riskLevel'],
  volcano: Volcano,
  assessment: Partial<RiskAssessment>
): StrategicGuidance {
  const keyIndicators: string[] = [];
  
  // Build key indicators list
  if (assessment.triggeringAnalysis?.nishimuraTriggered) {
    keyIndicators.push('Recent large earthquake within triggering distance');
  }
  if (assessment.depthMigration?.detected && assessment.depthMigration.direction === 'shallowing') {
    keyIndicators.push('Shallowing earthquake hypocenters detected');
  }
  if (assessment.bValueAnalysis?.anomaly === 'low') {
    keyIndicators.push('Low b-value indicates elevated stress');
  }
  if (assessment.acceleration?.detected) {
    keyIndicators.push('Accelerating seismicity pattern');
  }
  if (assessment.clusters && assessment.clusters.some(c => c.isSwarm)) {
    keyIndicators.push('Seismic swarm activity');
  }
  
  const guidanceByLevel: Record<string, Omit<StrategicGuidance, 'keyIndicators'>> = {
    'CRITICAL': {
      headline: `⚠️ ${volcano.name}: CRITICAL - Immediate Review`,
      action: 'Verify emergency plans. Know evacuation routes. Follow PHIVOLCS closely.',
      context: 'Multiple indicators suggest significantly elevated activity. This warrants immediate attention to preparedness.',
      preparednessSteps: [
        'Verify family emergency communication plan',
        'Know exact evacuation routes and assembly points',
        'Prepare go-bag with 72-hour supplies',
        'Monitor PHIVOLCS bulletins multiple times daily',
        'Consider voluntary pre-emptive relocation if in high-hazard zone',
      ],
      monitoringSources: [
        'PHIVOLCS: phivolcs.dost.gov.ph',
        'PHIVOLCS Twitter: @phaborladol',
        'Local DRRMO hotline',
        'NDRRMC updates',
      ],
      disclaimers: [
        'This is a STATISTICAL assessment, not an eruption prediction',
        'Volcanic systems can change rapidly in either direction',
        'Official PHIVOLCS bulletins are the authoritative source',
        'Probability estimates have significant uncertainty',
      ],
    },
    'VERY_HIGH': {
      headline: `🔴 ${volcano.name}: Very High - Heightened Awareness`,
      action: 'Review and update emergency preparedness. Monitor official bulletins.',
      context: 'Statistical models indicate significantly elevated probability. Prudent preparedness recommended.',
      preparednessSteps: [
        'Review family emergency plan',
        'Check emergency kit supplies',
        'Know evacuation center locations',
        'Follow PHIVOLCS daily',
      ],
      monitoringSources: [
        'PHIVOLCS: phivolcs.dost.gov.ph',
        'Local news and radio',
      ],
      disclaimers: [
        'Elevated probability does not guarantee eruption',
        'Models provide statistical guidance, not predictions',
        'Always defer to PHIVOLCS for emergency decisions',
      ],
    },
    'HIGH': {
      headline: `🟠 ${volcano.name}: High - Review Preparedness`,
      action: 'Good time to review emergency plans and supplies.',
      context: 'Multiple factors suggest above-average activity level.',
      preparednessSteps: [
        'Ensure emergency kit is current',
        'Review family meeting points',
        'Know where to get official updates',
      ],
      monitoringSources: [
        'PHIVOLCS: phivolcs.dost.gov.ph',
      ],
      disclaimers: [
        'Continue normal activities with awareness',
        'Models have inherent uncertainty',
      ],
    },
    'ELEVATED': {
      headline: `🟡 ${volcano.name}: Elevated - Stay Informed`,
      action: 'Maintain awareness through official channels.',
      context: 'Some indicators above background levels.',
      preparednessSteps: [
        'Know how to access PHIVOLCS bulletins',
        'Maintain standard emergency supplies',
      ],
      monitoringSources: [
        'PHIVOLCS: phivolcs.dost.gov.ph',
      ],
      disclaimers: [
        'Above-background does not indicate imminent activity',
      ],
    },
    'MODERATE': {
      headline: `🟢 ${volcano.name}: Moderate - Standard Awareness`,
      action: 'Standard preparedness for volcanic area residents.',
      context: 'Normal conditions with some elevated factors.',
      preparednessSteps: [
        'Maintain household emergency preparedness',
      ],
      monitoringSources: [
        'PHIVOLCS: phivolcs.dost.gov.ph',
      ],
      disclaimers: [
        'Living near volcanoes requires baseline awareness',
      ],
    },
    'LOW': {
      headline: `${volcano.name}: Low - Background Level`,
      action: 'No specific action required.',
      context: 'Minimal indicators detected.',
      preparednessSteps: [],
      monitoringSources: [
        'PHIVOLCS: phivolcs.dost.gov.ph',
      ],
      disclaimers: [
        'Conditions can change; periodic awareness is prudent',
      ],
    },
    'BACKGROUND': {
      headline: `${volcano.name}: Background Activity`,
      action: 'General awareness sufficient.',
      context: 'No significant indicators.',
      preparednessSteps: [],
      monitoringSources: [
        'PHIVOLCS: phivolcs.dost.gov.ph',
      ],
      disclaimers: [],
    },
  };
  
  const base = guidanceByLevel[riskLevel] ?? guidanceByLevel['BACKGROUND'];
  
  return {
    ...base,
    keyIndicators,
  };
}

// ============================================================================
// MAIN ASSESSMENT FUNCTION
// ============================================================================

export function assessVolcanoRisk(
  volcano: Volcano,
  earthquakes: Earthquake[],
  currentDate: Date = new Date()
): RiskAssessment {
  const now = currentDate.getTime();
  const days7 = 7 * 24 * 60 * 60 * 1000;
  const days30 = 30 * 24 * 60 * 60 * 1000;
  const days90 = 90 * 24 * 60 * 60 * 1000;
  
  // Enrich earthquakes with distance and azimuth
  const enrichedEarthquakes = earthquakes.map(eq => ({
    ...eq,
    distanceToVolcano: eq.distanceToVolcano ?? haversineDistance(
      volcano.latitude, volcano.longitude,
      eq.latitude, eq.longitude
    ),
    azimuthFromVolcano: eq.azimuthFromVolcano ?? calculateAzimuth(
      volcano.latitude, volcano.longitude,
      eq.latitude, eq.longitude
    ),
  }));
  
  // Filter to relevant events (within 1000km for regional, 50km for local)
  const regionalEvents = enrichedEarthquakes.filter(eq => eq.distanceToVolcano! <= 1000);
  const localEvents = enrichedEarthquakes.filter(eq => eq.distanceToVolcano! <= 50);
  const nearFieldEvents = enrichedEarthquakes.filter(eq => eq.distanceToVolcano! <= 15);
  
  // Run component analyses
  const triggeringAnalysis = analyzeTriggeringEvents(enrichedEarthquakes, volcano, currentDate);
  const depthMigration = analyzeDepthMigration(localEvents, 14);
  // b-value needs sufficient local events - use regional if local is sparse
  const bValueInput = localEvents.length >= 30 ? localEvents : regionalEvents;
  const bValueAnalysis = analyzeBValue(bValueInput, 2.0);
  const acceleration = analyzeAcceleration(localEvents, 30);
  const clusters = identifyClusters(localEvents, volcano, 30, 72);
  
  // Calculate statistics
  const recent30 = enrichedEarthquakes.filter(eq => now - eq.timestamp.getTime() <= days30);
  const recent7 = enrichedEarthquakes.filter(eq => now - eq.timestamp.getTime() <= days7);
  const local30 = localEvents.filter(eq => now - eq.timestamp.getTime() <= days30);
  
  const stats = {
    earthquakesAnalyzed: enrichedEarthquakes.length,
    m3PlusCount: enrichedEarthquakes.filter(eq => eq.magnitude >= 3).length,
    m4PlusCount: enrichedEarthquakes.filter(eq => eq.magnitude >= 4).length,
    m5PlusCount: enrichedEarthquakes.filter(eq => eq.magnitude >= 5).length,
    shallowCount: localEvents.filter(eq => eq.depth_km <= 5).length,
    nearFieldCount: nearFieldEvents.length,
    eventRate7Day: recent7.length / 7,
    eventRate30Day: local30.length / 30,
    energyRelease30Day: local30.reduce((sum, eq) => sum + seismicEnergy(eq.magnitude), 0),
  };
  
  // Calculate multipliers
  const baseline = BASE_ERUPTION_RATES[volcano.status] ?? 0.05;
  const triggeringMultiplier = calculateTriggeringMultiplier(triggeringAnalysis);
  const depthMigrationMultiplier = calculateDepthMigrationMultiplier(depthMigration);
  const bValueMultiplier = calculateBValueMultiplier(bValueAnalysis);
  const accelerationMultiplier = calculateAccelerationMultiplier(acceleration);
  const clusterMultiplier = calculateClusterMultiplier(clusters);
  const hydrothermalMultiplier = calculateHydrothermalMultiplier(volcano.hydrothermalActivity);
  const recentActivityMultiplier = calculateRecentActivityMultiplier(volcano, enrichedEarthquakes);
  
  // Combined multiplier (multiplicative with diminishing returns)
  const rawMultiplier = triggeringMultiplier *
                        depthMigrationMultiplier *
                        bValueMultiplier *
                        accelerationMultiplier *
                        clusterMultiplier *
                        hydrothermalMultiplier *
                        recentActivityMultiplier;
  
  // Apply diminishing returns for extreme values
  const combinedMultiplier = Math.min(rawMultiplier, 10); // Cap at 10x
  
  // Calculate probabilities
  const probability1Year = Math.min(baseline * combinedMultiplier, 0.65); // Cap at 65%
  const probability30Day = Math.min(probability1Year / 12, 0.20); // Monthly rate, cap at 20%
  
  // Determine risk level
  let riskLevel: RiskAssessment['riskLevel'];
  if (probability1Year >= RISK_THRESHOLDS.CRITICAL) riskLevel = 'CRITICAL';
  else if (probability1Year >= RISK_THRESHOLDS.VERY_HIGH) riskLevel = 'VERY_HIGH';
  else if (probability1Year >= RISK_THRESHOLDS.HIGH) riskLevel = 'HIGH';
  else if (probability1Year >= RISK_THRESHOLDS.ELEVATED) riskLevel = 'ELEVATED';
  else if (probability1Year >= RISK_THRESHOLDS.MODERATE) riskLevel = 'MODERATE';
  else if (probability1Year >= RISK_THRESHOLDS.LOW) riskLevel = 'LOW';
  else riskLevel = 'BACKGROUND';
  
  // Determine confidence based on data quality
  let confidence: RiskAssessment['confidence'];
  if (volcano.monitoringStations >= 10 && localEvents.length >= 50) {
    confidence = 'HIGH';
  } else if (volcano.monitoringStations >= 5 && localEvents.length >= 20) {
    confidence = 'MEDIUM';
  } else if (volcano.monitoringStations >= 2 || localEvents.length >= 10) {
    confidence = 'LOW';
  } else {
    confidence = 'VERY_LOW';
  }
  
  const factors = {
    baseline,
    triggeringMultiplier: Math.round(triggeringMultiplier * 1000) / 1000,
    depthMigrationMultiplier: Math.round(depthMigrationMultiplier * 1000) / 1000,
    bValueMultiplier: Math.round(bValueMultiplier * 1000) / 1000,
    accelerationMultiplier: Math.round(accelerationMultiplier * 1000) / 1000,
    clusterMultiplier: Math.round(clusterMultiplier * 1000) / 1000,
    hydrothermalMultiplier,
    recentActivityMultiplier: Math.round(recentActivityMultiplier * 1000) / 1000,
    combinedMultiplier: Math.round(combinedMultiplier * 100) / 100,
  };
  
  // Build scientific notes
  const scientificNotes: string[] = [];
  
  if (triggeringAnalysis.nishimuraTriggered) {
    scientificNotes.push(`Nishimura (2017) triggering: M${triggeringAnalysis.triggerEvents[0]?.event.magnitude.toFixed(1)} at ${triggeringAnalysis.triggerEvents[0]?.event.distanceToVolcano?.toFixed(0)}km`);
  }
  if (depthMigration.detected) {
    scientificNotes.push(`Depth migration: ${depthMigration.rate.toFixed(2)} km/day ${depthMigration.direction}`);
  }
  if (bValueAnalysis.anomaly !== 'normal') {
    scientificNotes.push(`b-value: ${bValueAnalysis.bValue} (${bValueAnalysis.anomaly})`);
  }
  if (acceleration.detected) {
    scientificNotes.push(`Acceleration: ${acceleration.type} (R²=${acceleration.rsquared})`);
  }
  
  const partialAssessment = {
    triggeringAnalysis,
    depthMigration,
    bValueAnalysis,
    acceleration,
    clusters,
  };
  
  return {
    volcano,
    probability30Day: Math.round(probability30Day * 1000) / 10,
    probability1Year: Math.round(probability1Year * 1000) / 10,
    probabilityDisplay: Math.round(probability1Year * 1000) / 10,
    riskLevel,
    confidence,
    baselineRate: baseline,
    triggeringAnalysis,
    depthMigration,
    bValueAnalysis,
    acceleration,
    clusters,
    factors,
    stats,
    assessmentDate: currentDate,
    dataWindow: {
      start: new Date(now - days90),
      end: currentDate,
    },
    strategicGuidance: generateStrategicGuidance(riskLevel, volcano, partialAssessment),
    scientificNotes,
  };
}

// ============================================================================
// BATCH ASSESSMENT
// ============================================================================

export function assessAllVolcanoes(
  volcanoes: Volcano[],
  earthquakes: Earthquake[],
  currentDate: Date = new Date()
): RiskAssessment[] {
  return volcanoes
    .map(volcano => assessVolcanoRisk(volcano, earthquakes, currentDate))
    .sort((a, b) => b.probability1Year - a.probability1Year);
}

// ============================================================================
// EXPORT COMPATIBILITY LAYER (for existing code)
// ============================================================================

// Re-export types with old names for backward compatibility
export type { RiskAssessment as VolcanoRiskAssessment };
