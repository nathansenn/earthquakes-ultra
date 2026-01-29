#!/usr/bin/env npx tsx
/**
 * SENN Volcanic Risk Forward Analysis
 * 
 * This script performs FORWARD calculations - we collect data and see where
 * the math leads. No predetermined conclusions.
 * 
 * Data sources:
 * - USGS Earthquake Catalog (1900-present for M7+, 30 days for M4+)
 * - Philippine volcano database
 * - Peer-reviewed triggering models
 * 
 * Models applied:
 * - Nishimura (2017): M7.5+ within 200km = +50% eruption probability over 5 years
 * - Jenkins et al. (2024): M7+ within 750km = 1.25x eruption rate for 4 years
 * - Alam-Kimura (2004): Distance-time triggering relationships
 * - Seismic energy accumulation analysis
 * - Cluster bracketing effects
 */

import { PHILIPPINE_VOLCANOES, Volcano } from '../src/data/philippine-volcanoes';

// ============================================================================
// CONFIGURATION
// ============================================================================

const USGS_BASE = 'https://earthquake.usgs.gov/fdsnws/event/1/query';

// Philippine bounding box (expanded for regional effects)
const PH_BOUNDS = {
  minLat: 4.0,
  maxLat: 22.0,
  minLon: 114.0,
  maxLon: 130.0,
};

// Extended bounds for far-field triggering (Jenkins 750km radius)
const EXTENDED_BOUNDS = {
  minLat: 0.0,
  maxLat: 26.0,
  minLon: 110.0,
  maxLon: 135.0,
};

// ============================================================================
// DATA FETCHING
// ============================================================================

interface USGSFeature {
  id: string;
  properties: {
    mag: number;
    place: string;
    time: number;
    depth?: number;
  };
  geometry: {
    coordinates: [number, number, number]; // lon, lat, depth
  };
}

interface USGSResponse {
  features: USGSFeature[];
  metadata: {
    count: number;
    generated: number;
  };
}

async function fetchUSGSEarthquakes(
  startDate: string,
  endDate: string,
  minMagnitude: number,
  bounds: typeof PH_BOUNDS
): Promise<USGSFeature[]> {
  const params = new URLSearchParams({
    format: 'geojson',
    starttime: startDate,
    endtime: endDate,
    minmagnitude: minMagnitude.toString(),
    minlatitude: bounds.minLat.toString(),
    maxlatitude: bounds.maxLat.toString(),
    minlongitude: bounds.minLon.toString(),
    maxlongitude: bounds.maxLon.toString(),
    orderby: 'time-asc',
  });

  const url = `${USGS_BASE}?${params}`;
  console.log(`  Fetching: M${minMagnitude}+ from ${startDate} to ${endDate}...`);
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`USGS API error: ${response.status}`);
  }
  
  const data: USGSResponse = await response.json();
  console.log(`  → Retrieved ${data.features.length} earthquakes`);
  return data.features;
}

// ============================================================================
// DISTANCE & GEOMETRY
// ============================================================================

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function seismicEnergy(magnitude: number): number {
  // Energy in joules: log10(E) = 1.5*M + 4.8
  return Math.pow(10, 1.5 * magnitude + 4.8);
}

function equivalentMagnitude(totalEnergy: number): number {
  return (Math.log10(totalEnergy) - 4.8) / 1.5;
}

// ============================================================================
// CORE ANALYSIS FUNCTIONS
// ============================================================================

interface ProcessedEarthquake {
  id: string;
  magnitude: number;
  depth: number;
  lat: number;
  lon: number;
  time: Date;
  place: string;
  energy: number;
}

function processEarthquakes(features: USGSFeature[]): ProcessedEarthquake[] {
  return features.map(f => ({
    id: f.id,
    magnitude: f.properties.mag,
    depth: f.geometry.coordinates[2] || 0,
    lat: f.geometry.coordinates[1],
    lon: f.geometry.coordinates[0],
    time: new Date(f.properties.time),
    place: f.properties.place || 'Unknown',
    energy: seismicEnergy(f.properties.mag),
  }));
}

interface VolcanoAnalysis {
  volcano: Volcano;
  
  // Earthquakes within range
  within50km: ProcessedEarthquake[];
  within200km: ProcessedEarthquake[];
  within750km: ProcessedEarthquake[];
  
  // Energy accumulation
  totalEnergy50km: number;
  totalEnergy200km: number;
  equivalentMag50km: number;
  equivalentMag200km: number;
  
  // Triggering events (per model criteria)
  nishimuraTriggers: ProcessedEarthquake[]; // M7.5+ within 200km
  jenkinsTriggers: ProcessedEarthquake[];   // M7+ within 750km
  
  // Time-based analysis
  recent30d: {
    m4Plus: number;
    m5Plus: number;
    m6Plus: number;
    totalEnergy: number;
  };
  
  // Model outputs
  baseProbability: number;
  nishimuraFactor: number;
  jenkinsFactor: number;
  combinedProbability: number;
  
  // Cluster analysis
  clusters: {
    direction: string;
    count: number;
    maxMag: number;
    avgDist: number;
  }[];
  bracketingFactor: number;
}

function analyzeVolcano(
  volcano: Volcano,
  allEarthquakes: ProcessedEarthquake[],
  recentEarthquakes: ProcessedEarthquake[], // Last 30 days
  analysisDate: Date
): VolcanoAnalysis {
  
  // Calculate distances to this volcano for all earthquakes
  const withDistance = allEarthquakes.map(eq => ({
    ...eq,
    distance: haversineDistance(volcano.latitude, volcano.longitude, eq.lat, eq.lon),
    azimuth: Math.atan2(
      eq.lon - volcano.longitude,
      eq.lat - volcano.latitude
    ) * 180 / Math.PI,
  }));
  
  const recentWithDistance = recentEarthquakes.map(eq => ({
    ...eq,
    distance: haversineDistance(volcano.latitude, volcano.longitude, eq.lat, eq.lon),
  }));
  
  // Filter by distance
  const within50km = withDistance.filter(eq => eq.distance <= 50);
  const within200km = withDistance.filter(eq => eq.distance <= 200);
  const within750km = withDistance.filter(eq => eq.distance <= 750);
  
  // Energy accumulation
  const totalEnergy50km = within50km.reduce((sum, eq) => sum + eq.energy, 0);
  const totalEnergy200km = within200km.reduce((sum, eq) => sum + eq.energy, 0);
  
  // Triggering events per model criteria
  const nishimuraTriggers = within200km.filter(eq => eq.magnitude >= 7.5);
  const jenkinsTriggers = within750km.filter(eq => eq.magnitude >= 7.0);
  
  // Recent activity (30 days)
  const recent30dWithin200 = recentWithDistance.filter(eq => eq.distance <= 200);
  const recent30d = {
    m4Plus: recent30dWithin200.filter(eq => eq.magnitude >= 4.0).length,
    m5Plus: recent30dWithin200.filter(eq => eq.magnitude >= 5.0).length,
    m6Plus: recent30dWithin200.filter(eq => eq.magnitude >= 6.0).length,
    totalEnergy: recent30dWithin200.reduce((sum, eq) => sum + eq.energy, 0),
  };
  
  // Base probability by status
  const baseProbabilities: Record<string, number> = {
    'active': 0.10,
    'potentially_active': 0.05,
    'dormant': 0.01,
  };
  const baseProbability = baseProbabilities[volcano.status] || 0.05;
  
  // Nishimura factor: +50% per qualifying event, decaying over 5 years
  let nishimuraFactor = 1.0;
  for (const eq of nishimuraTriggers) {
    const daysSince = (analysisDate.getTime() - eq.time.getTime()) / (1000 * 60 * 60 * 24);
    const yearsSince = daysSince / 365.25;
    if (yearsSince <= 5) {
      const decay = 1 - (yearsSince / 5);
      nishimuraFactor += 0.50 * decay;
    }
  }
  
  // Jenkins factor: 1.25x rate multiplier, decaying over 4 years
  let jenkinsFactor = 1.0;
  if (jenkinsTriggers.length > 0) {
    const mostRecent = jenkinsTriggers.reduce((a, b) => 
      a.time > b.time ? a : b
    );
    const daysSince = (analysisDate.getTime() - mostRecent.time.getTime()) / (1000 * 60 * 60 * 24);
    const yearsSince = daysSince / 365.25;
    if (yearsSince <= 4) {
      const decay = 1 - (yearsSince / 4);
      jenkinsFactor = 1 + (0.25 * decay);
    }
  }
  
  // Cluster analysis (8 compass directions)
  const clusters: Map<string, typeof withDistance> = new Map();
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  
  for (const eq of within200km) {
    let azimuth = eq.azimuth;
    if (azimuth < 0) azimuth += 360;
    const sector = Math.floor((azimuth + 22.5) / 45) % 8;
    const dir = directions[sector];
    if (!clusters.has(dir)) clusters.set(dir, []);
    clusters.get(dir)!.push(eq);
  }
  
  const clusterData = Array.from(clusters.entries())
    .filter(([_, eqs]) => eqs.length >= 3)
    .map(([dir, eqs]) => ({
      direction: dir,
      count: eqs.length,
      maxMag: Math.max(...eqs.map(eq => eq.magnitude)),
      avgDist: eqs.reduce((sum, eq) => sum + eq.distance, 0) / eqs.length,
    }));
  
  // Bracketing factor: if clusters exist on opposite sides
  let bracketingFactor = 1.0;
  const clusterDirs = clusterData.map(c => directions.indexOf(c.direction));
  for (let i = 0; i < clusterDirs.length; i++) {
    for (let j = i + 1; j < clusterDirs.length; j++) {
      const diff = Math.abs(clusterDirs[i] - clusterDirs[j]);
      if (diff === 4 || diff === 3 || diff === 5) { // Roughly opposite
        bracketingFactor = 1.5;
        break;
      }
    }
  }
  
  // Hydrothermal sensitivity
  const hydroFactors = [1.0, 1.2, 1.5, 2.0];
  const hydroFactor = hydroFactors[volcano.hydrothermalActivity] || 1.0;
  
  // State factor
  const stateFactors: Record<string, number> = {
    'dormant': 0.5,
    'potentially_active': 1.0,
    'active': 1.5,
  };
  const stateFactor = stateFactors[volcano.status] || 1.0;
  
  // Combined probability (forward calculation)
  const combinedMultiplier = 
    Math.max(nishimuraFactor, jenkinsFactor) *
    bracketingFactor *
    hydroFactor *
    stateFactor;
  
  const combinedProbability = Math.min(baseProbability * combinedMultiplier, 0.65);
  
  return {
    volcano,
    within50km,
    within200km,
    within750km,
    totalEnergy50km,
    totalEnergy200km,
    equivalentMag50km: totalEnergy50km > 0 ? equivalentMagnitude(totalEnergy50km) : 0,
    equivalentMag200km: totalEnergy200km > 0 ? equivalentMagnitude(totalEnergy200km) : 0,
    nishimuraTriggers,
    jenkinsTriggers,
    recent30d,
    baseProbability,
    nishimuraFactor,
    jenkinsFactor,
    combinedProbability,
    clusters: clusterData,
    bracketingFactor,
  };
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  const analysisDate = new Date();
  
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                    SENN VOLCANIC RISK FORWARD ANALYSIS                       ║');
  console.log('║                                                                              ║');
  console.log('║  Forward calculations only. Data determines conclusions.                    ║');
  console.log('╚══════════════════════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`Analysis Date: ${analysisDate.toISOString()}`);
  console.log(`Volcanoes to analyze: ${PHILIPPINE_VOLCANOES.length}`);
  console.log('');
  
  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE 1: DATA COLLECTION
  // ═══════════════════════════════════════════════════════════════════════════
  
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log('PHASE 1: DATA COLLECTION');
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log('');
  
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
  const fiveYearsAgo = new Date(now.getTime() - 5 * 365 * 24 * 60 * 60 * 1000);
  const tenYearsAgo = new Date(now.getTime() - 10 * 365 * 24 * 60 * 60 * 1000);
  
  // Fetch data in stages
  console.log('[1.1] Fetching historical M7+ earthquakes (10 years - for triggering analysis)...');
  const historicalM7 = await fetchUSGSEarthquakes(
    tenYearsAgo.toISOString().split('T')[0],
    now.toISOString().split('T')[0],
    7.0,
    EXTENDED_BOUNDS
  );
  
  console.log('[1.2] Fetching M6+ earthquakes (5 years - for stress accumulation)...');
  const fiveYearM6 = await fetchUSGSEarthquakes(
    fiveYearsAgo.toISOString().split('T')[0],
    now.toISOString().split('T')[0],
    6.0,
    EXTENDED_BOUNDS
  );
  
  console.log('[1.3] Fetching M5+ earthquakes (1 year - for pattern analysis)...');
  const oneYearM5 = await fetchUSGSEarthquakes(
    oneYearAgo.toISOString().split('T')[0],
    now.toISOString().split('T')[0],
    5.0,
    PH_BOUNDS
  );
  
  console.log('[1.4] Fetching M4+ earthquakes (30 days - for current activity)...');
  const recentM4 = await fetchUSGSEarthquakes(
    thirtyDaysAgo.toISOString().split('T')[0],
    now.toISOString().split('T')[0],
    4.0,
    PH_BOUNDS
  );
  
  // Combine and deduplicate
  const allFeatures = new Map<string, USGSFeature>();
  [...historicalM7, ...fiveYearM6, ...oneYearM5, ...recentM4].forEach(f => {
    allFeatures.set(f.id, f);
  });
  
  const allEarthquakes = processEarthquakes(Array.from(allFeatures.values()));
  const recentEarthquakes = processEarthquakes(recentM4);
  
  console.log('');
  console.log(`Total unique earthquakes collected: ${allEarthquakes.length}`);
  console.log(`Recent (30d) earthquakes: ${recentEarthquakes.length}`);
  
  // Data summary
  const m7Count = allEarthquakes.filter(eq => eq.magnitude >= 7.0).length;
  const m6Count = allEarthquakes.filter(eq => eq.magnitude >= 6.0).length;
  const m5Count = allEarthquakes.filter(eq => eq.magnitude >= 5.0).length;
  
  console.log('');
  console.log('Data Summary:');
  console.log(`  M7.0+: ${m7Count} events`);
  console.log(`  M6.0+: ${m6Count} events`);
  console.log(`  M5.0+: ${m5Count} events`);
  console.log(`  Total: ${allEarthquakes.length} events`);
  
  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE 2: INDIVIDUAL VOLCANO ANALYSIS
  // ═══════════════════════════════════════════════════════════════════════════
  
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log('PHASE 2: VOLCANO-BY-VOLCANO FORWARD ANALYSIS');
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log('');
  
  const analyses: VolcanoAnalysis[] = [];
  
  for (const volcano of PHILIPPINE_VOLCANOES) {
    const analysis = analyzeVolcano(volcano, allEarthquakes, recentEarthquakes, analysisDate);
    analyses.push(analysis);
  }
  
  // Sort by combined probability (what the math says)
  analyses.sort((a, b) => b.combinedProbability - a.combinedProbability);
  
  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE 3: RESULTS - WHAT THE DATA SHOWS
  // ═══════════════════════════════════════════════════════════════════════════
  
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log('PHASE 3: FORWARD CALCULATION RESULTS');
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log('');
  console.log('Sorted by calculated probability (highest to lowest):');
  console.log('');
  
  // Top 10 detailed
  console.log('┌─────────────────────────────────────────────────────────────────────────────┐');
  console.log('│                          TOP 10 BY FORWARD CALCULATION                      │');
  console.log('└─────────────────────────────────────────────────────────────────────────────┘');
  console.log('');
  
  for (let i = 0; i < Math.min(10, analyses.length); i++) {
    const a = analyses[i];
    const probPct = (a.combinedProbability * 100).toFixed(1);
    
    console.log(`#${i + 1}: ${a.volcano.name.toUpperCase()}`);
    console.log(`    Location: ${a.volcano.province}, ${a.volcano.region}`);
    console.log(`    Status: ${a.volcano.status} | Type: ${a.volcano.type}`);
    console.log('');
    console.log('    CALCULATION BREAKDOWN:');
    console.log(`    ├─ Base probability (${a.volcano.status}): ${(a.baseProbability * 100).toFixed(1)}%`);
    console.log(`    ├─ Nishimura factor (M7.5+/200km triggers): ${a.nishimuraFactor.toFixed(3)}x`);
    console.log(`    │  └─ Qualifying events: ${a.nishimuraTriggers.length}`);
    if (a.nishimuraTriggers.length > 0) {
      for (const t of a.nishimuraTriggers.slice(0, 3)) {
        const dist = haversineDistance(a.volcano.latitude, a.volcano.longitude, t.lat, t.lon);
        console.log(`    │     • M${t.magnitude.toFixed(1)} @ ${dist.toFixed(0)}km (${t.time.toISOString().split('T')[0]})`);
      }
    }
    console.log(`    ├─ Jenkins factor (M7+/750km triggers): ${a.jenkinsFactor.toFixed(3)}x`);
    console.log(`    │  └─ Qualifying events: ${a.jenkinsTriggers.length}`);
    console.log(`    ├─ Bracketing factor: ${a.bracketingFactor.toFixed(1)}x`);
    if (a.clusters.length > 0) {
      console.log(`    │  └─ Active clusters: ${a.clusters.map(c => `${c.direction}(${c.count})`).join(', ')}`);
    }
    console.log(`    └─ COMBINED PROBABILITY: ${probPct}%`);
    console.log('');
    console.log('    SEISMIC CONTEXT:');
    console.log(`    ├─ Earthquakes within 50km: ${a.within50km.length}`);
    console.log(`    ├─ Earthquakes within 200km: ${a.within200km.length}`);
    console.log(`    ├─ Energy within 200km: ${a.equivalentMag200km.toFixed(1)} equivalent magnitude`);
    console.log(`    └─ Recent 30d (within 200km): M4+: ${a.recent30d.m4Plus}, M5+: ${a.recent30d.m5Plus}, M6+: ${a.recent30d.m6Plus}`);
    console.log('');
    console.log('─────────────────────────────────────────────────────────────────────────────');
    console.log('');
  }
  
  // Summary table
  console.log('');
  console.log('┌─────────────────────────────────────────────────────────────────────────────┐');
  console.log('│                         FULL RANKING (ALL VOLCANOES)                        │');
  console.log('└─────────────────────────────────────────────────────────────────────────────┘');
  console.log('');
  console.log('Rank │ Volcano               │ Prob%  │ Nishi │ Jenk  │ Brack │ EQ200 │ Status');
  console.log('─────┼───────────────────────┼────────┼───────┼───────┼───────┼───────┼─────────');
  
  for (let i = 0; i < analyses.length; i++) {
    const a = analyses[i];
    const name = a.volcano.name.padEnd(21).substring(0, 21);
    const prob = (a.combinedProbability * 100).toFixed(1).padStart(5);
    const nishi = a.nishimuraFactor.toFixed(2).padStart(5);
    const jenk = a.jenkinsFactor.toFixed(2).padStart(5);
    const brack = a.bracketingFactor.toFixed(1).padStart(5);
    const eq200 = a.within200km.length.toString().padStart(5);
    const status = a.volcano.status.substring(0, 8);
    
    console.log(`${(i + 1).toString().padStart(4)} │ ${name} │ ${prob}% │ ${nishi} │ ${jenk} │ ${brack} │ ${eq200} │ ${status}`);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE 4: KEY FINDINGS - WHAT THE MATH SAYS
  // ═══════════════════════════════════════════════════════════════════════════
  
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log('PHASE 4: KEY FINDINGS (DERIVED FROM FORWARD CALCULATIONS)');
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log('');
  
  // Highest probability
  const top3 = analyses.slice(0, 3);
  console.log('HIGHEST CALCULATED RISK (Top 3):');
  for (const a of top3) {
    console.log(`  • ${a.volcano.name}: ${(a.combinedProbability * 100).toFixed(1)}%`);
  }
  console.log('');
  
  // Recent M7+ triggers
  const m7Triggers = allEarthquakes.filter(eq => eq.magnitude >= 7.0);
  const recentM7 = m7Triggers.filter(eq => {
    const daysSince = (analysisDate.getTime() - eq.time.getTime()) / (1000 * 60 * 60 * 24);
    return daysSince <= 365; // Last year
  });
  
  console.log(`M7+ EVENTS IN LAST YEAR (potential triggers): ${recentM7.length}`);
  for (const eq of recentM7.slice(0, 5)) {
    console.log(`  • M${eq.magnitude.toFixed(1)} - ${eq.place} (${eq.time.toISOString().split('T')[0]})`);
  }
  console.log('');
  
  // Volcanoes with Nishimura triggers
  const withNishimura = analyses.filter(a => a.nishimuraTriggers.length > 0);
  console.log(`VOLCANOES WITH NISHIMURA TRIGGERS (M7.5+/200km): ${withNishimura.length}`);
  for (const a of withNishimura) {
    console.log(`  • ${a.volcano.name}: ${a.nishimuraTriggers.length} triggers, factor ${a.nishimuraFactor.toFixed(2)}x`);
  }
  console.log('');
  
  // Current hotspots (high recent activity)
  const hotspots = analyses
    .filter(a => a.recent30d.m5Plus >= 2)
    .sort((a, b) => b.recent30d.m5Plus - a.recent30d.m5Plus);
  
  console.log('CURRENT SEISMIC HOTSPOTS (2+ M5 events in 30d within 200km):');
  if (hotspots.length === 0) {
    console.log('  None currently');
  } else {
    for (const a of hotspots.slice(0, 5)) {
      console.log(`  • ${a.volcano.name}: ${a.recent30d.m5Plus} M5+ events`);
    }
  }
  console.log('');
  
  // Bracketing effects
  const bracketed = analyses.filter(a => a.bracketingFactor > 1);
  console.log(`VOLCANOES WITH BRACKETING SEISMICITY: ${bracketed.length}`);
  for (const a of bracketed) {
    const dirs = a.clusters.map(c => c.direction).join(', ');
    console.log(`  • ${a.volcano.name}: clusters at ${dirs}`);
  }
  console.log('');
  
  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE 5: CONCLUSIONS
  // ═══════════════════════════════════════════════════════════════════════════
  
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log('PHASE 5: CONCLUSIONS (FORWARD-DERIVED)');
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log('');
  console.log('Based SOLELY on the calculations above (not predetermined):');
  console.log('');
  
  const veryHigh = analyses.filter(a => a.combinedProbability >= 0.35);
  const high = analyses.filter(a => a.combinedProbability >= 0.20 && a.combinedProbability < 0.35);
  const elevated = analyses.filter(a => a.combinedProbability >= 0.10 && a.combinedProbability < 0.20);
  
  console.log(`VERY HIGH RISK (≥35%): ${veryHigh.length} volcanoes`);
  veryHigh.forEach(a => console.log(`  → ${a.volcano.name} (${(a.combinedProbability * 100).toFixed(1)}%)`));
  console.log('');
  
  console.log(`HIGH RISK (20-35%): ${high.length} volcanoes`);
  high.forEach(a => console.log(`  → ${a.volcano.name} (${(a.combinedProbability * 100).toFixed(1)}%)`));
  console.log('');
  
  console.log(`ELEVATED RISK (10-20%): ${elevated.length} volcanoes`);
  elevated.forEach(a => console.log(`  → ${a.volcano.name} (${(a.combinedProbability * 100).toFixed(1)}%)`));
  console.log('');
  
  console.log('INTERPRETATION:');
  console.log('These probabilities represent MULTI-YEAR windows based on seismic-volcanic');
  console.log('correlation models. They indicate statistical likelihood of increased activity,');
  console.log('NOT imminent eruption predictions. PHIVOLCS remains the official authority.');
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log('                           END OF FORWARD ANALYSIS');
  console.log('═══════════════════════════════════════════════════════════════════════════════');
}

main().catch(console.error);
