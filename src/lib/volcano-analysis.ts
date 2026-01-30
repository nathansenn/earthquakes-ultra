/**
 * VOLCANO ANALYSIS MODULE
 * AI-Powered Volcanic Risk Assessment System
 * 
 * Based on peer-reviewed scientific research:
 * - Nishimura (2017): Earthquake-triggered volcanic eruptions
 * - Jenkins et al. (2024): Statistical triggering analysis
 * - McNutt (2005): Volcanic tremor and seismic signals
 * - Chouet (1996): Long-period events in volcanic systems
 * - Roman & Cashman (2006): VT events as precursors
 * 
 * Key Indicators Analyzed:
 * - VT (Volcano-Tectonic) events: Brittle rock fracture from magma movement
 * - LP (Long-Period) events: Fluid movement in volcanic conduits
 * - Harmonic tremor: Sustained signal from continuous fluid/gas flow
 * - Earthquake swarms: Clustered seismicity indicating stress changes
 * - Depth migration: Shallowing seismicity suggests rising magma
 */

import { USGSEarthquake, fetchEarthquakesNearLocation } from './usgs-api';
import { 
  haversineDistance,
  seismicEnergy,
  equivalentMagnitude,
} from './volcanic-prediction';
import { Volcano, PHILIPPINE_VOLCANOES } from '@/data/philippine-volcanoes';
import { GLOBAL_VOLCANOES, GlobalVolcano } from '@/data/global-volcanoes';

// Type alias for combined volcano types
export type AnyVolcano = Volcano | GlobalVolcano;

// ============================================================================
// TYPES
// ============================================================================

export interface SeismicEventType {
  type: 'VT' | 'LP' | 'HYBRID' | 'TREMOR' | 'EXPLOSION' | 'UNKNOWN';
  confidence: number;
  indicators: string[];
}

export interface DepthMigration {
  trend: 'SHALLOWING' | 'DEEPENING' | 'STABLE' | 'OSCILLATING';
  avgDepthChange_kmPerDay: number;
  currentAvgDepth_km: number;
  previousAvgDepth_km: number;
  significance: 'HIGH' | 'MODERATE' | 'LOW';
}

export interface SwarmAnalysis {
  isSwarm: boolean;
  eventCount: number;
  durationHours: number;
  peakMagnitude: number;
  energyRelease_joules: number;
  equivalentMagnitude: number;
  spatialExtent_km: number;
  centroidLat: number;
  centroidLon: number;
  avgDepth_km: number;
}

export interface VolcanoRiskScore {
  score: number;  // 0-100
  confidence: number;  // 0-1
  category: 'CRITICAL' | 'HIGH' | 'ELEVATED' | 'ADVISORY' | 'NORMAL' | 'BACKGROUND';
  factors: RiskFactorBreakdown;
}

export interface RiskFactorBreakdown {
  seismicFrequency: number;  // 0-25 points
  depthDistribution: number;  // 0-20 points
  magnitudeTrend: number;  // 0-15 points
  swarmActivity: number;  // 0-15 points
  historicalPattern: number;  // 0-15 points
  monitoringGaps: number;  // -10 to 0 (penalty for poor monitoring)
  hydrothermalActivity: number;  // 0-10 points
}

export interface VolcanoAnalysis {
  volcano: AnyVolcano;
  timestamp: Date;
  earthquakes: ProcessedVolcanicEvent[];
  riskScore: VolcanoRiskScore;
  swarmAnalysis: SwarmAnalysis | null;
  depthMigration: DepthMigration | null;
  eventTypeClassification: Map<string, number>;
  prediction: AIPrediction;
  nearbyEarthquakes: {
    within10km: number;
    within25km: number;
    within50km: number;
    within100km: number;
  };
  seismicDensity: {
    current24h: number;
    previous24h: number;
    trend: 'INCREASING' | 'STABLE' | 'DECREASING';
    anomalyFactor: number;
  };
  dataQuality: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'MINIMAL';
}

export interface ProcessedVolcanicEvent {
  id: string;
  magnitude: number;
  depth_km: number;
  latitude: number;
  longitude: number;
  timestamp: Date;
  distanceToVolcano_km: number;
  azimuth: number;
  eventType: SeismicEventType;
  isWithinEdifice: boolean;
}

export interface AIPrediction {
  summary: string;
  riskLevel: string;
  confidenceInterval: { lower: number; upper: number };
  timeframe: string;
  keyIndicators: string[];
  recommendations: string[];
  caveats: string[];
  scientificBasis: string[];
  lastUpdated: Date;
}

// ============================================================================
// TYPE HELPERS
// ============================================================================

// Helper to check if volcano is Philippine type (has specific PH fields)
function isPhilippineVolcano(volcano: AnyVolcano): volcano is Volcano {
  return 'hydrothermalActivity' in volcano && 'monitoringStations' in volcano;
}

// Helper to get monitoring stations count
function getMonitoringStations(volcano: AnyVolcano): number {
  if (isPhilippineVolcano(volcano)) {
    return volcano.monitoringStations;
  }
  // For global volcanoes, estimate based on country/status
  if (volcano.status === 'active') {
    const wellMonitoredCountries = ['Japan', 'USA', 'Italy', 'Iceland', 'New Zealand'];
    if (wellMonitoredCountries.includes(volcano.country)) {
      return 10;
    }
    return 3;
  }
  return 1;
}

// Helper to get hydrothermal activity level (0-3)
function getHydrothermalActivity(volcano: AnyVolcano): number {
  if (isPhilippineVolcano(volcano)) {
    return volcano.hydrothermalActivity;
  }
  if (volcano.status === 'active') {
    if (volcano.type.toLowerCase().includes('caldera')) return 3;
    return 2;
  }
  return 1;
}

// Helper to get last eruption year
function getLastEruptionYear(volcano: AnyVolcano): number | null {
  const eruption = isPhilippineVolcano(volcano) 
    ? volcano.lastEruption 
    : volcano.lastEruption;
  if (!eruption || eruption === 'Holocene') return null;
  const year = parseInt(eruption);
  return isNaN(year) ? null : year;
}

// Helper to get volcano elevation
function getElevation(volcano: AnyVolcano): number {
  return isPhilippineVolcano(volcano) ? volcano.elevation_m : volcano.elevation;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const EVENT_TYPE_THRESHOLDS = {
  VT_MIN_DEPTH_KM: 1,
  VT_MAX_DEPTH_KM: 10,
  LP_FREQ_INDICATOR: 0.5,
  SHALLOW_THRESHOLD_KM: 5,
  VERY_SHALLOW_THRESHOLD_KM: 2,
};

const SWARM_THRESHOLDS = {
  MIN_EVENTS: 10,
  MAX_DURATION_HOURS: 72,
  MAX_SPATIAL_EXTENT_KM: 30,
};

// ============================================================================
// CORE ANALYSIS FUNCTIONS
// ============================================================================

/**
 * Analyze volcanic risk for a specific volcano
 */
export async function analyzeVolcanoRisk(
  volcanoId: string,
  options: {
    days?: number;
    radiusKm?: number;
    includeGlobal?: boolean;
  } = {}
): Promise<VolcanoAnalysis | null> {
  const { days = 30, radiusKm = 100, includeGlobal = true } = options;

  // Find volcano in database
  let volcano: AnyVolcano | undefined = 
    PHILIPPINE_VOLCANOES.find(v => v.id === volcanoId);
  
  if (!volcano && includeGlobal) {
    volcano = GLOBAL_VOLCANOES.find(v => v.id === volcanoId);
  }

  if (!volcano) {
    console.error(`Volcano not found: ${volcanoId}`);
    return null;
  }

  try {
    const rawEarthquakes = await fetchEarthquakesNearLocation(
      volcano.latitude,
      volcano.longitude,
      radiusKm,
      days,
      1.0
    );

    const events = processEarthquakesForVolcano(rawEarthquakes, volcano);
    const correlation = correlateEarthquakes(volcano, events);
    const riskScore = calculateRiskScore(correlation, volcano, events);
    const prediction = generatePrediction(volcano, riskScore, correlation, events);

    return {
      volcano,
      timestamp: new Date(),
      earthquakes: events,
      riskScore,
      swarmAnalysis: correlation.swarmAnalysis,
      depthMigration: correlation.depthMigration,
      eventTypeClassification: correlation.eventTypeCounts,
      prediction,
      nearbyEarthquakes: correlation.nearbyCount,
      seismicDensity: correlation.seismicDensity,
      dataQuality: assessDataQuality(events, volcano),
    };
  } catch (error) {
    console.error(`Error analyzing volcano ${volcanoId}:`, error);
    return null;
  }
}

/**
 * Process raw USGS earthquakes into volcanic events
 */
function processEarthquakesForVolcano(
  earthquakes: USGSEarthquake[],
  volcano: AnyVolcano
): ProcessedVolcanicEvent[] {
  return earthquakes.map(eq => {
    const lat = eq.geometry.coordinates[1];
    const lon = eq.geometry.coordinates[0];
    const depth = eq.geometry.coordinates[2];
    
    const distance = haversineDistance(volcano.latitude, volcano.longitude, lat, lon);
    const azimuth = calculateAzimuth(volcano.latitude, volcano.longitude, lat, lon);
    
    return {
      id: eq.id,
      magnitude: eq.properties.mag,
      depth_km: depth,
      latitude: lat,
      longitude: lon,
      timestamp: new Date(eq.properties.time),
      distanceToVolcano_km: distance,
      azimuth,
      eventType: classifyEventType(eq.properties.mag, depth, distance),
      isWithinEdifice: distance <= 10,
    };
  }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

/**
 * Classify seismic event type based on characteristics
 */
function classifyEventType(magnitude: number, depth_km: number, distance_km: number): SeismicEventType {
  const indicators: string[] = [];
  let type: SeismicEventType['type'] = 'UNKNOWN';
  let confidence = 0.3;

  if (depth_km >= EVENT_TYPE_THRESHOLDS.VT_MIN_DEPTH_KM && 
      depth_km <= EVENT_TYPE_THRESHOLDS.VT_MAX_DEPTH_KM) {
    if (magnitude >= 1.0) {
      indicators.push('Depth consistent with VT');
      indicators.push('Magnitude suggests brittle failure');
      type = 'VT';
      confidence = 0.6;
    }
  }

  if (depth_km < EVENT_TYPE_THRESHOLDS.VT_MIN_DEPTH_KM) {
    if (distance_km < 5) {
      indicators.push('Very shallow depth');
      indicators.push('Near-edifice location');
      type = magnitude >= 2.0 ? 'EXPLOSION' : 'LP';
      confidence = 0.5;
    }
  }

  if (depth_km > 10 && depth_km < 30) {
    indicators.push('Mid-crustal depth');
    type = 'VT';
    confidence = 0.5;
  }

  return { type, confidence, indicators };
}

/**
 * Calculate azimuth from volcano to earthquake
 */
function calculateAzimuth(
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
// CORRELATION ANALYSIS
// ============================================================================

interface CorrelationResult {
  swarmAnalysis: SwarmAnalysis | null;
  depthMigration: DepthMigration | null;
  eventTypeCounts: Map<string, number>;
  nearbyCount: VolcanoAnalysis['nearbyEarthquakes'];
  seismicDensity: VolcanoAnalysis['seismicDensity'];
  magnitudeTrend: 'INCREASING' | 'STABLE' | 'DECREASING';
  frequencyTrend: 'INCREASING' | 'STABLE' | 'DECREASING';
}

/**
 * Correlate earthquakes with volcanic activity patterns
 */
export function correlateEarthquakes(
  volcano: AnyVolcano,
  events: ProcessedVolcanicEvent[]
): CorrelationResult {
  const nearbyCount = {
    within10km: events.filter(e => e.distanceToVolcano_km <= 10).length,
    within25km: events.filter(e => e.distanceToVolcano_km <= 25).length,
    within50km: events.filter(e => e.distanceToVolcano_km <= 50).length,
    within100km: events.filter(e => e.distanceToVolcano_km <= 100).length,
  };

  const eventTypeCounts = new Map<string, number>();
  for (const event of events) {
    const type = event.eventType.type;
    eventTypeCounts.set(type, (eventTypeCounts.get(type) || 0) + 1);
  }

  const swarmAnalysis = analyzeSwarmActivity(events.filter(e => e.distanceToVolcano_km <= 50));
  const depthMigration = analyzeDepthMigration(events.filter(e => e.distanceToVolcano_km <= 30));

  const now = Date.now();
  const h24 = 24 * 60 * 60 * 1000;
  const current24h = events.filter(e => now - e.timestamp.getTime() <= h24).length;
  const previous24h = events.filter(e => {
    const age = now - e.timestamp.getTime();
    return age > h24 && age <= 2 * h24;
  }).length;

  const densityTrend = current24h > previous24h * 1.5 ? 'INCREASING' :
                       current24h < previous24h * 0.5 ? 'DECREASING' : 'STABLE';
  
  const anomalyFactor = previous24h > 0 ? current24h / previous24h : 
                        current24h > 5 ? 2.0 : 1.0;

  const magnitudeTrend = analyzeMagnitudeTrend(events);

  return {
    swarmAnalysis,
    depthMigration,
    eventTypeCounts,
    nearbyCount,
    seismicDensity: {
      current24h,
      previous24h,
      trend: densityTrend,
      anomalyFactor,
    },
    magnitudeTrend,
    frequencyTrend: densityTrend,
  };
}

/**
 * Analyze swarm activity in seismic data
 */
function analyzeSwarmActivity(events: ProcessedVolcanicEvent[]): SwarmAnalysis | null {
  if (events.length < SWARM_THRESHOLDS.MIN_EVENTS) {
    return null;
  }

  const sorted = [...events].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  const duration = sorted.length > 0 ?
    (sorted[sorted.length - 1].timestamp.getTime() - sorted[0].timestamp.getTime()) / (1000 * 60 * 60) : 0;

  if (duration > SWARM_THRESHOLDS.MAX_DURATION_HOURS) {
    return null;
  }

  const centroidLat = events.reduce((sum, e) => sum + e.latitude, 0) / events.length;
  const centroidLon = events.reduce((sum, e) => sum + e.longitude, 0) / events.length;

  const distances = events.map(e => 
    haversineDistance(centroidLat, centroidLon, e.latitude, e.longitude)
  );
  const spatialExtent = Math.max(...distances);

  if (spatialExtent > SWARM_THRESHOLDS.MAX_SPATIAL_EXTENT_KM) {
    return null;
  }

  const totalEnergy = events.reduce((sum, e) => sum + seismicEnergy(e.magnitude), 0);
  const eqMag = equivalentMagnitude(totalEnergy);

  return {
    isSwarm: true,
    eventCount: events.length,
    durationHours: duration,
    peakMagnitude: Math.max(...events.map(e => e.magnitude)),
    energyRelease_joules: totalEnergy,
    equivalentMagnitude: eqMag,
    spatialExtent_km: spatialExtent,
    centroidLat,
    centroidLon,
    avgDepth_km: events.reduce((sum, e) => sum + e.depth_km, 0) / events.length,
  };
}

/**
 * Analyze depth migration patterns
 */
function analyzeDepthMigration(events: ProcessedVolcanicEvent[]): DepthMigration | null {
  if (events.length < 10) {
    return null;
  }

  const sorted = [...events].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  const midpoint = Math.floor(sorted.length / 2);
  
  const recent = sorted.slice(0, midpoint);
  const older = sorted.slice(midpoint);

  const recentAvgDepth = recent.reduce((sum, e) => sum + e.depth_km, 0) / recent.length;
  const olderAvgDepth = older.reduce((sum, e) => sum + e.depth_km, 0) / older.length;

  const depthChange = olderAvgDepth - recentAvgDepth;
  
  const timeSpan = (recent[0].timestamp.getTime() - older[older.length - 1].timestamp.getTime()) / (1000 * 60 * 60 * 24);
  const ratePerDay = timeSpan > 0 ? depthChange / timeSpan : 0;

  let trend: DepthMigration['trend'] = 'STABLE';
  if (depthChange > 1) trend = 'SHALLOWING';
  else if (depthChange < -1) trend = 'DEEPENING';

  const depths = sorted.map(e => e.depth_km);
  let oscillations = 0;
  for (let i = 1; i < depths.length - 1; i++) {
    if ((depths[i] > depths[i-1] && depths[i] > depths[i+1]) ||
        (depths[i] < depths[i-1] && depths[i] < depths[i+1])) {
      oscillations++;
    }
  }
  if (oscillations > depths.length * 0.3) {
    trend = 'OSCILLATING';
  }

  const significance: DepthMigration['significance'] = 
    Math.abs(depthChange) > 3 ? 'HIGH' :
    Math.abs(depthChange) > 1 ? 'MODERATE' : 'LOW';

  return {
    trend,
    avgDepthChange_kmPerDay: ratePerDay,
    currentAvgDepth_km: recentAvgDepth,
    previousAvgDepth_km: olderAvgDepth,
    significance,
  };
}

/**
 * Analyze magnitude trend over time
 */
function analyzeMagnitudeTrend(events: ProcessedVolcanicEvent[]): 'INCREASING' | 'STABLE' | 'DECREASING' {
  if (events.length < 5) return 'STABLE';

  const sorted = [...events].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  const midpoint = Math.floor(sorted.length / 2);
  
  const earlierAvg = sorted.slice(0, midpoint).reduce((sum, e) => sum + e.magnitude, 0) / midpoint;
  const laterAvg = sorted.slice(midpoint).reduce((sum, e) => sum + e.magnitude, 0) / (sorted.length - midpoint);

  const change = laterAvg - earlierAvg;
  
  if (change > 0.3) return 'INCREASING';
  if (change < -0.3) return 'DECREASING';
  return 'STABLE';
}

// ============================================================================
// RISK SCORE CALCULATION
// ============================================================================

/**
 * Calculate comprehensive risk score (0-100)
 */
export function calculateRiskScore(
  correlation: CorrelationResult,
  volcano: AnyVolcano,
  events: ProcessedVolcanicEvent[]
): VolcanoRiskScore {
  const factors: RiskFactorBreakdown = {
    seismicFrequency: 0,
    depthDistribution: 0,
    magnitudeTrend: 0,
    swarmActivity: 0,
    historicalPattern: 0,
    monitoringGaps: 0,
    hydrothermalActivity: 0,
  };

  // 1. Seismic Frequency (0-25 points)
  const within50km = correlation.nearbyCount.within50km;
  if (within50km >= 100) factors.seismicFrequency = 25;
  else if (within50km >= 50) factors.seismicFrequency = 20;
  else if (within50km >= 25) factors.seismicFrequency = 15;
  else if (within50km >= 10) factors.seismicFrequency = 10;
  else if (within50km >= 5) factors.seismicFrequency = 5;

  if (correlation.frequencyTrend === 'INCREASING') {
    factors.seismicFrequency = Math.min(25, factors.seismicFrequency + 5);
  }

  // 2. Depth Distribution (0-20 points)
  const shallowEvents = events.filter(e => 
    e.depth_km < EVENT_TYPE_THRESHOLDS.SHALLOW_THRESHOLD_KM && 
    e.distanceToVolcano_km < 30
  );
  const veryShallowEvents = events.filter(e => 
    e.depth_km < EVENT_TYPE_THRESHOLDS.VERY_SHALLOW_THRESHOLD_KM &&
    e.distanceToVolcano_km < 20
  );

  if (veryShallowEvents.length >= 10) factors.depthDistribution = 20;
  else if (veryShallowEvents.length >= 5) factors.depthDistribution = 15;
  else if (shallowEvents.length >= 20) factors.depthDistribution = 12;
  else if (shallowEvents.length >= 10) factors.depthDistribution = 8;
  else if (shallowEvents.length >= 5) factors.depthDistribution = 4;

  if (correlation.depthMigration?.trend === 'SHALLOWING') {
    const bonus = correlation.depthMigration.significance === 'HIGH' ? 5 : 3;
    factors.depthDistribution = Math.min(20, factors.depthDistribution + bonus);
  }

  // 3. Magnitude Trend (0-15 points)
  if (correlation.magnitudeTrend === 'INCREASING') {
    factors.magnitudeTrend = 15;
  } else if (correlation.magnitudeTrend === 'STABLE') {
    const maxMag = events.length > 0 ? Math.max(...events.map(e => e.magnitude)) : 0;
    if (maxMag >= 5.0) factors.magnitudeTrend = 12;
    else if (maxMag >= 4.0) factors.magnitudeTrend = 8;
    else if (maxMag >= 3.0) factors.magnitudeTrend = 4;
  }

  // 4. Swarm Activity (0-15 points)
  if (correlation.swarmAnalysis) {
    const swarm = correlation.swarmAnalysis;
    if (swarm.eventCount >= 50) factors.swarmActivity = 15;
    else if (swarm.eventCount >= 30) factors.swarmActivity = 12;
    else if (swarm.eventCount >= 20) factors.swarmActivity = 9;
    else if (swarm.eventCount >= 10) factors.swarmActivity = 6;

    if (swarm.equivalentMagnitude >= 4.5) {
      factors.swarmActivity = Math.min(15, factors.swarmActivity + 3);
    }
  }

  // 5. Historical Pattern (0-15 points)
  const lastEruptionYear = getLastEruptionYear(volcano);
  const currentYear = new Date().getFullYear();
  
  if (lastEruptionYear) {
    const yearsSince = currentYear - lastEruptionYear;
    if (yearsSince <= 5) factors.historicalPattern = 15;
    else if (yearsSince <= 20) factors.historicalPattern = 10;
    else if (yearsSince <= 50) factors.historicalPattern = 5;
  }

  // 6. Monitoring Gaps (penalty up to -10)
  const stations = getMonitoringStations(volcano);
  if (stations === 0) factors.monitoringGaps = -10;
  else if (stations < 3) factors.monitoringGaps = -5;
  else if (stations < 5) factors.monitoringGaps = -2;

  // 7. Hydrothermal Activity (0-10 points)
  const hydrothermal = getHydrothermalActivity(volcano);
  if (hydrothermal === 3) factors.hydrothermalActivity = 10;
  else if (hydrothermal === 2) factors.hydrothermalActivity = 6;
  else if (hydrothermal === 1) factors.hydrothermalActivity = 3;

  // Calculate total score
  const rawScore = 
    factors.seismicFrequency +
    factors.depthDistribution +
    factors.magnitudeTrend +
    factors.swarmActivity +
    factors.historicalPattern +
    factors.monitoringGaps +
    factors.hydrothermalActivity;

  const score = Math.max(0, Math.min(100, rawScore));

  // Determine category
  let category: VolcanoRiskScore['category'];
  if (score >= 80) category = 'CRITICAL';
  else if (score >= 60) category = 'HIGH';
  else if (score >= 40) category = 'ELEVATED';
  else if (score >= 25) category = 'ADVISORY';
  else if (score >= 10) category = 'NORMAL';
  else category = 'BACKGROUND';

  // Calculate confidence
  const dataPoints = events.length;
  let confidence = 0.3;
  if (dataPoints >= 100) confidence = 0.8;
  else if (dataPoints >= 50) confidence = 0.7;
  else if (dataPoints >= 20) confidence = 0.6;
  else if (dataPoints >= 10) confidence = 0.5;
  else if (dataPoints >= 5) confidence = 0.4;

  if (stations >= 10) confidence = Math.min(0.9, confidence + 0.1);
  if (stations === 0) confidence = Math.max(0.2, confidence - 0.2);

  return {
    score,
    confidence,
    category,
    factors,
  };
}

// ============================================================================
// AI PREDICTION GENERATION
// ============================================================================

/**
 * Generate AI-powered prediction text
 */
export function generatePrediction(
  volcano: AnyVolcano,
  riskScore: VolcanoRiskScore,
  correlation: CorrelationResult,
  events: ProcessedVolcanicEvent[]
): AIPrediction {
  const keyIndicators: string[] = [];
  const recommendations: string[] = [];
  const caveats: string[] = [];
  const scientificBasis: string[] = [];

  if (correlation.seismicDensity.trend === 'INCREASING') {
    keyIndicators.push(`Seismic activity increasing (${correlation.seismicDensity.anomalyFactor.toFixed(1)}x normal)`);
    scientificBasis.push('Increasing seismicity often precedes volcanic unrest (McNutt, 2005)');
  }

  if (correlation.depthMigration?.trend === 'SHALLOWING') {
    keyIndicators.push(`Earthquake depths shallowing (${correlation.depthMigration.avgDepthChange_kmPerDay.toFixed(2)} km/day)`);
    scientificBasis.push('Shallowing seismicity can indicate ascending magma (Roman & Cashman, 2006)');
  }

  if (correlation.swarmAnalysis) {
    keyIndicators.push(`Active swarm: ${correlation.swarmAnalysis.eventCount} events, M${correlation.swarmAnalysis.equivalentMagnitude.toFixed(1)} equivalent`);
    scientificBasis.push('Earthquake swarms frequently precede eruptions (Chouet, 1996)');
  }

  if (correlation.magnitudeTrend === 'INCREASING') {
    keyIndicators.push('Magnitude trend increasing over time period');
    scientificBasis.push('Escalating magnitudes may indicate increasing stress/magma intrusion');
  }

  const within10km = correlation.nearbyCount.within10km;
  if (within10km >= 10) {
    keyIndicators.push(`${within10km} earthquakes within 10km of edifice`);
    scientificBasis.push('Near-edifice seismicity indicates processes within volcanic system');
  }

  const vtCount = correlation.eventTypeCounts.get('VT') || 0;
  const lpCount = correlation.eventTypeCounts.get('LP') || 0;
  if (vtCount >= 10) {
    keyIndicators.push(`${vtCount} VT-type events (rock fracturing)`);
  }
  if (lpCount >= 5) {
    keyIndicators.push(`${lpCount} LP-type events (fluid movement)`);
    scientificBasis.push('LP events indicate fluid/gas movement in volcanic conduit');
  }

  // Recommendations based on risk level
  switch (riskScore.category) {
    case 'CRITICAL':
      recommendations.push('Immediate review of evacuation plans recommended');
      recommendations.push('Monitor official bulletins closely');
      recommendations.push('Ensure emergency supplies are prepared');
      recommendations.push('Identify evacuation routes and assembly points');
      break;
    case 'HIGH':
      recommendations.push('Review and update emergency plans');
      recommendations.push('Check emergency kit supplies');
      recommendations.push('Stay informed through official channels');
      recommendations.push('Know evacuation center locations');
      break;
    case 'ELEVATED':
      recommendations.push('Maintain awareness of volcanic activity');
      recommendations.push('Ensure emergency contacts are current');
      recommendations.push('Review general preparedness');
      break;
    case 'ADVISORY':
      recommendations.push('Continue standard preparedness');
      recommendations.push('Follow official updates periodically');
      break;
    default:
      recommendations.push('Maintain general awareness');
  }

  // Standard caveats
  caveats.push('Statistical model, not deterministic forecast');
  caveats.push('Probabilities represent risk over extended timeframes');
  caveats.push('Always defer to official bulletins');
  caveats.push('Volcanic systems can change rapidly');
  
  if (riskScore.confidence < 0.5) {
    caveats.push('Limited data reduces prediction confidence');
  }

  const stations = getMonitoringStations(volcano);
  if (stations < 3) {
    caveats.push('Sparse monitoring limits detection of subtle changes');
  }

  // Generate summary
  const confidenceText = riskScore.confidence >= 0.7 ? 'moderate-to-high' :
                        riskScore.confidence >= 0.5 ? 'moderate' : 'low';

  let summary: string;
  switch (riskScore.category) {
    case 'CRITICAL':
      summary = `${volcano.name} shows significantly elevated seismic indicators. ` +
                `Multiple factors suggest increased probability of volcanic activity. ` +
                `Assessment carries ${confidenceText} confidence.`;
      break;
    case 'HIGH':
      summary = `${volcano.name} exhibits elevated seismic activity above baseline. ` +
                `Current patterns indicate increased probability. Preparedness review recommended.`;
      break;
    case 'ELEVATED':
      summary = `${volcano.name} shows some indicators above normal levels. ` +
                `Continued monitoring advised. Maintain awareness.`;
      break;
    case 'ADVISORY':
      summary = `${volcano.name} shows minor deviations from background seismicity. ` +
                `No immediate concern, standard preparedness applies.`;
      break;
    default:
      summary = `${volcano.name} is showing background-level seismic activity. ` +
                `No significant indicators detected. Continue standard monitoring.`;
  }

  const baseProb = riskScore.score / 100;
  const margin = (1 - riskScore.confidence) * 0.2;
  const confidenceInterval = {
    lower: Math.max(0, baseProb - margin) * 100,
    upper: Math.min(1, baseProb + margin) * 100,
  };

  let timeframe = '1-5 years';
  if (riskScore.category === 'CRITICAL' && correlation.seismicDensity.trend === 'INCREASING') {
    timeframe = 'weeks to months';
  } else if (riskScore.category === 'HIGH') {
    timeframe = 'months to 1-2 years';
  }

  return {
    summary,
    riskLevel: riskScore.category,
    confidenceInterval,
    timeframe,
    keyIndicators: keyIndicators.length > 0 ? keyIndicators : ['No significant indicators'],
    recommendations,
    caveats,
    scientificBasis: scientificBasis.length > 0 ? scientificBasis : ['Background seismicity within normal parameters'],
    lastUpdated: new Date(),
  };
}

// ============================================================================
// DATA QUALITY ASSESSMENT
// ============================================================================

function assessDataQuality(
  events: ProcessedVolcanicEvent[],
  volcano: AnyVolcano
): VolcanoAnalysis['dataQuality'] {
  const stations = getMonitoringStations(volcano);
  const eventCount = events.length;

  if (stations >= 10 && eventCount >= 50) return 'EXCELLENT';
  if (stations >= 5 && eventCount >= 20) return 'GOOD';
  if (stations >= 2 && eventCount >= 10) return 'FAIR';
  if (stations >= 1 || eventCount >= 5) return 'POOR';
  return 'MINIMAL';
}

// ============================================================================
// BATCH ANALYSIS
// ============================================================================

/**
 * Analyze all volcanoes in a region
 */
export async function analyzeAllVolcanoes(
  options: {
    region?: 'philippines' | 'global';
    minRiskScore?: number;
  } = {}
): Promise<VolcanoAnalysis[]> {
  const { region = 'philippines', minRiskScore = 0 } = options;
  
  const volcanoes = region === 'philippines' ? PHILIPPINE_VOLCANOES : GLOBAL_VOLCANOES;
  const analyses: VolcanoAnalysis[] = [];

  for (const volcano of volcanoes) {
    const analysis = await analyzeVolcanoRisk(volcano.id);
    if (analysis && analysis.riskScore.score >= minRiskScore) {
      analyses.push(analysis);
    }
  }

  return analyses.sort((a, b) => b.riskScore.score - a.riskScore.score);
}

/**
 * Quick risk summary for dashboard display
 */
export interface QuickRiskSummary {
  volcanoId: string;
  volcanoName: string;
  score: number;
  category: VolcanoRiskScore['category'];
  trendIndicator: 'UP' | 'DOWN' | 'STABLE';
  keyMetric: string;
}

export function getQuickRiskSummary(analysis: VolcanoAnalysis): QuickRiskSummary {
  const trend = analysis.seismicDensity.trend === 'INCREASING' ? 'UP' :
                analysis.seismicDensity.trend === 'DECREASING' ? 'DOWN' : 'STABLE';

  let keyMetric = `${analysis.nearbyEarthquakes.within50km} events/30d`;
  if (analysis.swarmAnalysis) {
    keyMetric = `Swarm: ${analysis.swarmAnalysis.eventCount} events`;
  }

  return {
    volcanoId: analysis.volcano.id,
    volcanoName: analysis.volcano.name,
    score: analysis.riskScore.score,
    category: analysis.riskScore.category,
    trendIndicator: trend,
    keyMetric,
  };
}
