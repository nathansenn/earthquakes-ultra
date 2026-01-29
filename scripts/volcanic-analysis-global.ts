#!/usr/bin/env npx tsx
/**
 * SENN Volcanic Risk Forward Analysis — GLOBAL HISTORICAL
 * 
 * Collecting EVERY earthquake globally for maximum historical depth.
 * USGS catalog completeness:
 * - M8+: ~1900-present (complete)
 * - M7+: ~1900-present (mostly complete)
 * - M6+: ~1964-present (complete after WWSSN)
 * - M5+: ~1973-present (complete after digital era)
 * 
 * We fetch everything available and let the data determine conclusions.
 */

import { PHILIPPINE_VOLCANOES, Volcano } from '../src/data/philippine-volcanoes';

const USGS_BASE = 'https://earthquake.usgs.gov/fdsnws/event/1/query';

// ============================================================================
// DATA FETCHING — CHUNKED FOR LARGE DATASETS
// ============================================================================

interface USGSFeature {
  id: string;
  properties: {
    mag: number;
    place: string;
    time: number;
  };
  geometry: {
    coordinates: [number, number, number];
  };
}

interface USGSResponse {
  features: USGSFeature[];
  metadata: { count: number };
}

async function fetchUSGSChunk(
  startDate: string,
  endDate: string,
  minMagnitude: number,
  minLat?: number,
  maxLat?: number,
  minLon?: number,
  maxLon?: number
): Promise<USGSFeature[]> {
  const params = new URLSearchParams({
    format: 'geojson',
    starttime: startDate,
    endtime: endDate,
    minmagnitude: minMagnitude.toString(),
    orderby: 'time-asc',
    limit: '20000',
  });
  
  if (minLat !== undefined) params.append('minlatitude', minLat.toString());
  if (maxLat !== undefined) params.append('maxlatitude', maxLat.toString());
  if (minLon !== undefined) params.append('minlongitude', minLon.toString());
  if (maxLon !== undefined) params.append('maxlongitude', maxLon.toString());

  const url = `${USGS_BASE}?${params}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    console.error(`  ✗ API error: ${response.status} for ${startDate} to ${endDate}`);
    return [];
  }
  
  const data: USGSResponse = await response.json();
  return data.features;
}

async function fetchGlobalEarthquakes(
  startYear: number,
  endYear: number,
  minMagnitude: number,
  chunkYears: number = 10
): Promise<USGSFeature[]> {
  const allFeatures: USGSFeature[] = [];
  
  for (let year = startYear; year < endYear; year += chunkYears) {
    const chunkEnd = Math.min(year + chunkYears, endYear);
    const startDate = `${year}-01-01`;
    const endDate = `${chunkEnd}-01-01`;
    
    process.stdout.write(`  ${year}-${chunkEnd}: `);
    
    const features = await fetchUSGSChunk(startDate, endDate, minMagnitude);
    allFeatures.push(...features);
    
    console.log(`${features.length} events`);
    
    // Rate limiting
    await new Promise(r => setTimeout(r, 500));
  }
  
  return allFeatures;
}

// ============================================================================
// GEOMETRY & PHYSICS
// ============================================================================

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function seismicEnergy(mag: number): number {
  return Math.pow(10, 1.5 * mag + 4.8);
}

function equivalentMag(energy: number): number {
  return (Math.log10(energy) - 4.8) / 1.5;
}

// ============================================================================
// PROCESSED EARTHQUAKE TYPE
// ============================================================================

interface Earthquake {
  id: string;
  mag: number;
  lat: number;
  lon: number;
  depth: number;
  time: Date;
  place: string;
  energy: number;
}

function processFeatures(features: USGSFeature[]): Earthquake[] {
  return features
    .filter(f => f.properties.mag && f.geometry?.coordinates)
    .map(f => ({
      id: f.id,
      mag: f.properties.mag,
      lat: f.geometry.coordinates[1],
      lon: f.geometry.coordinates[0],
      depth: f.geometry.coordinates[2] || 0,
      time: new Date(f.properties.time),
      place: f.properties.place || 'Unknown',
      energy: seismicEnergy(f.properties.mag),
    }));
}

// ============================================================================
// VOLCANO ANALYSIS WITH FULL HISTORICAL DATA
// ============================================================================

interface TriggerEvent {
  eq: Earthquake;
  distance: number;
  yearsAgo: number;
  decayedContribution: number;
}

interface VolcanoFullAnalysis {
  volcano: Volcano;
  
  // All historical earthquakes by distance
  within50km: Earthquake[];
  within200km: Earthquake[];
  within500km: Earthquake[];
  within1000km: Earthquake[];
  
  // Triggering analysis
  nishimuraTriggers: TriggerEvent[];  // M7.5+ within 200km, last 100 years
  jenkinsTriggers: TriggerEvent[];    // M7.0+ within 750km, last 100 years
  m8Triggers: TriggerEvent[];         // M8.0+ within 1000km (megathrust effects)
  
  // Energy accumulation
  totalEnergy200km: number;
  totalEnergy500km: number;
  equivalentMag200km: number;
  equivalentMag500km: number;
  
  // Temporal patterns
  decadalActivity: { decade: string; count: number; maxMag: number }[];
  
  // Recent vs historical
  last5Years: { m5: number; m6: number; m7: number };
  last30Years: { m5: number; m6: number; m7: number };
  all100Years: { m5: number; m6: number; m7: number };
  
  // Model calculations
  baseProbability: number;
  nishimuraFactor: number;
  jenkinsFactor: number;
  megathrustFactor: number;
  historicalActivityFactor: number;
  combinedProbability: number;
}

function analyzeVolcanoFull(
  volcano: Volcano,
  allEarthquakes: Earthquake[],
  analysisDate: Date
): VolcanoFullAnalysis {
  
  // Calculate distance to this volcano for all earthquakes
  const withDistance = allEarthquakes.map(eq => ({
    eq,
    distance: haversineDistance(volcano.latitude, volcano.longitude, eq.lat, eq.lon),
    yearsAgo: (analysisDate.getTime() - eq.time.getTime()) / (1000 * 60 * 60 * 24 * 365.25),
  }));
  
  // Filter by distance
  const within50km = withDistance.filter(e => e.distance <= 50).map(e => e.eq);
  const within200km = withDistance.filter(e => e.distance <= 200).map(e => e.eq);
  const within500km = withDistance.filter(e => e.distance <= 500).map(e => e.eq);
  const within1000km = withDistance.filter(e => e.distance <= 1000).map(e => e.eq);
  
  // ═══════════════════════════════════════════════════════════════════════════
  // TRIGGERING EVENTS
  // ═══════════════════════════════════════════════════════════════════════════
  
  // Nishimura triggers: M7.5+ within 200km
  const nishimuraCandidates = withDistance.filter(
    e => e.distance <= 200 && e.eq.mag >= 7.5
  );
  const nishimuraTriggers: TriggerEvent[] = nishimuraCandidates.map(e => ({
    eq: e.eq,
    distance: e.distance,
    yearsAgo: e.yearsAgo,
    // Decay over 5 years per Nishimura model, but track all historical
    decayedContribution: e.yearsAgo <= 5 ? 0.50 * (1 - e.yearsAgo / 5) : 0,
  }));
  
  // Jenkins triggers: M7.0+ within 750km
  const jenkinsCandidates = withDistance.filter(
    e => e.distance <= 750 && e.eq.mag >= 7.0
  );
  const jenkinsTriggers: TriggerEvent[] = jenkinsCandidates.map(e => ({
    eq: e.eq,
    distance: e.distance,
    yearsAgo: e.yearsAgo,
    // Decay over 4 years per Jenkins model
    decayedContribution: e.yearsAgo <= 4 ? 0.25 * (1 - e.yearsAgo / 4) : 0,
  }));
  
  // Megathrust triggers: M8.0+ within 1000km (far-field static stress transfer)
  const m8Candidates = withDistance.filter(
    e => e.distance <= 1000 && e.eq.mag >= 8.0
  );
  const m8Triggers: TriggerEvent[] = m8Candidates.map(e => ({
    eq: e.eq,
    distance: e.distance,
    yearsAgo: e.yearsAgo,
    // Extended effect window for megathrust events (10 years)
    decayedContribution: e.yearsAgo <= 10 ? 0.30 * (1 - e.yearsAgo / 10) : 0,
  }));
  
  // ═══════════════════════════════════════════════════════════════════════════
  // ENERGY ACCUMULATION
  // ═══════════════════════════════════════════════════════════════════════════
  
  const totalEnergy200km = within200km.reduce((sum, eq) => sum + eq.energy, 0);
  const totalEnergy500km = within500km.reduce((sum, eq) => sum + eq.energy, 0);
  
  // ═══════════════════════════════════════════════════════════════════════════
  // TEMPORAL PATTERNS
  // ═══════════════════════════════════════════════════════════════════════════
  
  const decadeMap = new Map<string, { count: number; maxMag: number }>();
  for (const eq of within200km) {
    const decade = `${Math.floor(eq.time.getFullYear() / 10) * 10}s`;
    const current = decadeMap.get(decade) || { count: 0, maxMag: 0 };
    current.count++;
    current.maxMag = Math.max(current.maxMag, eq.mag);
    decadeMap.set(decade, current);
  }
  const decadalActivity = Array.from(decadeMap.entries())
    .map(([decade, data]) => ({ decade, ...data }))
    .sort((a, b) => a.decade.localeCompare(b.decade));
  
  // Recent vs historical (within 500km for better sampling)
  const last5Years = {
    m5: withDistance.filter(e => e.distance <= 500 && e.yearsAgo <= 5 && e.eq.mag >= 5).length,
    m6: withDistance.filter(e => e.distance <= 500 && e.yearsAgo <= 5 && e.eq.mag >= 6).length,
    m7: withDistance.filter(e => e.distance <= 500 && e.yearsAgo <= 5 && e.eq.mag >= 7).length,
  };
  const last30Years = {
    m5: withDistance.filter(e => e.distance <= 500 && e.yearsAgo <= 30 && e.eq.mag >= 5).length,
    m6: withDistance.filter(e => e.distance <= 500 && e.yearsAgo <= 30 && e.eq.mag >= 6).length,
    m7: withDistance.filter(e => e.distance <= 500 && e.yearsAgo <= 30 && e.eq.mag >= 7).length,
  };
  const all100Years = {
    m5: withDistance.filter(e => e.distance <= 500 && e.eq.mag >= 5).length,
    m6: withDistance.filter(e => e.distance <= 500 && e.eq.mag >= 6).length,
    m7: withDistance.filter(e => e.distance <= 500 && e.eq.mag >= 7).length,
  };
  
  // ═══════════════════════════════════════════════════════════════════════════
  // PROBABILITY CALCULATIONS
  // ═══════════════════════════════════════════════════════════════════════════
  
  // Base probability
  const baseProbabilities: Record<string, number> = {
    'active': 0.10,
    'potentially_active': 0.05,
    'dormant': 0.01,
  };
  const baseProbability = baseProbabilities[volcano.status] || 0.05;
  
  // Nishimura factor (summed decayed contributions)
  const nishimuraFactor = 1 + nishimuraTriggers.reduce((sum, t) => sum + t.decayedContribution, 0);
  
  // Jenkins factor (most recent qualifying event)
  const activeJenkins = jenkinsTriggers.filter(t => t.decayedContribution > 0);
  const jenkinsFactor = activeJenkins.length > 0 
    ? 1 + Math.max(...activeJenkins.map(t => t.decayedContribution))
    : 1.0;
  
  // Megathrust factor
  const activeM8 = m8Triggers.filter(t => t.decayedContribution > 0);
  const megathrustFactor = activeM8.length > 0
    ? 1 + Math.max(...activeM8.map(t => t.decayedContribution))
    : 1.0;
  
  // Historical activity factor (is this region more active than average?)
  // Compare to Philippine average
  const expectedM6Per30Years = 10; // Rough Philippine regional average
  const observedRatio = last30Years.m6 / expectedM6Per30Years;
  const historicalActivityFactor = 1 + Math.min((observedRatio - 1) * 0.2, 0.5); // Cap at 1.5x
  
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
  
  // Combined probability
  const combinedMultiplier = 
    Math.max(nishimuraFactor, jenkinsFactor, megathrustFactor) *
    historicalActivityFactor *
    hydroFactor *
    stateFactor;
  
  const combinedProbability = Math.min(baseProbability * combinedMultiplier, 0.65);
  
  return {
    volcano,
    within50km,
    within200km,
    within500km,
    within1000km,
    nishimuraTriggers,
    jenkinsTriggers,
    m8Triggers,
    totalEnergy200km,
    totalEnergy500km,
    equivalentMag200km: totalEnergy200km > 0 ? equivalentMag(totalEnergy200km) : 0,
    equivalentMag500km: totalEnergy500km > 0 ? equivalentMag(totalEnergy500km) : 0,
    decadalActivity,
    last5Years,
    last30Years,
    all100Years,
    baseProbability,
    nishimuraFactor,
    jenkinsFactor,
    megathrustFactor,
    historicalActivityFactor,
    combinedProbability,
  };
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  const analysisDate = new Date();
  const currentYear = analysisDate.getFullYear();
  
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║           SENN VOLCANIC RISK ANALYSIS — GLOBAL HISTORICAL DATA              ║');
  console.log('║                                                                              ║');
  console.log('║  Collecting 100+ years of global earthquake data.                           ║');
  console.log('║  Forward calculations only. Data determines conclusions.                    ║');
  console.log('╚══════════════════════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`Analysis Date: ${analysisDate.toISOString()}`);
  console.log(`Volcanoes to analyze: ${PHILIPPINE_VOLCANOES.length}`);
  console.log('');
  
  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE 1: GLOBAL DATA COLLECTION
  // ═══════════════════════════════════════════════════════════════════════════
  
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log('PHASE 1: GLOBAL HISTORICAL DATA COLLECTION');
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log('');
  
  // M8+ Global (1900-present) — Megathrust events
  console.log('[1.1] M8.0+ GLOBAL (1900-present) — Megathrust triggering events');
  const globalM8 = await fetchGlobalEarthquakes(1900, currentYear + 1, 8.0, 50);
  console.log(`  Total M8+: ${globalM8.length} events\n`);
  
  // M7+ Global (1900-present) — Major triggering events  
  console.log('[1.2] M7.0+ GLOBAL (1900-present) — Major triggering events');
  const globalM7 = await fetchGlobalEarthquakes(1900, currentYear + 1, 7.0, 20);
  console.log(`  Total M7+: ${globalM7.length} events\n`);
  
  // M6+ Philippine region (1964-present) — Regional stress
  console.log('[1.3] M6.0+ PHILIPPINE REGION (1964-present) — Regional stress patterns');
  const regionalM6: USGSFeature[] = [];
  for (let year = 1964; year < currentYear + 1; year += 10) {
    const endYear = Math.min(year + 10, currentYear + 1);
    process.stdout.write(`  ${year}-${endYear}: `);
    const chunk = await fetchUSGSChunk(
      `${year}-01-01`, `${endYear}-01-01`, 6.0,
      0, 30, 110, 140  // Expanded Philippine region
    );
    regionalM6.push(...chunk);
    console.log(`${chunk.length} events`);
    await new Promise(r => setTimeout(r, 300));
  }
  console.log(`  Total regional M6+: ${regionalM6.length} events\n`);
  
  // M5+ Philippine region (1973-present) — Detailed local patterns
  console.log('[1.4] M5.0+ PHILIPPINE REGION (1973-present) — Local patterns');
  const regionalM5: USGSFeature[] = [];
  for (let year = 1973; year < currentYear + 1; year += 5) {
    const endYear = Math.min(year + 5, currentYear + 1);
    process.stdout.write(`  ${year}-${endYear}: `);
    const chunk = await fetchUSGSChunk(
      `${year}-01-01`, `${endYear}-01-01`, 5.0,
      4, 22, 114, 130  // Philippine bounding box
    );
    regionalM5.push(...chunk);
    console.log(`${chunk.length} events`);
    await new Promise(r => setTimeout(r, 300));
  }
  console.log(`  Total regional M5+: ${regionalM5.length} events\n`);
  
  // M4+ Recent (last 30 days) — Current state
  console.log('[1.5] M4.0+ RECENT (last 30 days) — Current seismic state');
  const thirtyDaysAgo = new Date(analysisDate.getTime() - 30 * 24 * 60 * 60 * 1000);
  const recentM4 = await fetchUSGSChunk(
    thirtyDaysAgo.toISOString().split('T')[0],
    analysisDate.toISOString().split('T')[0],
    4.0, 4, 22, 114, 130
  );
  console.log(`  Total recent M4+: ${recentM4.length} events\n`);
  
  // ═══════════════════════════════════════════════════════════════════════════
  // DEDUPLICATE AND PROCESS
  // ═══════════════════════════════════════════════════════════════════════════
  
  console.log('Processing and deduplicating...');
  const allFeatures = new Map<string, USGSFeature>();
  [...globalM8, ...globalM7, ...regionalM6, ...regionalM5, ...recentM4].forEach(f => {
    if (f.id) allFeatures.set(f.id, f);
  });
  
  const allEarthquakes = processFeatures(Array.from(allFeatures.values()));
  allEarthquakes.sort((a, b) => a.time.getTime() - b.time.getTime());
  
  console.log('');
  console.log('┌─────────────────────────────────────────────────────────────────────────────┐');
  console.log('│                          DATA COLLECTION SUMMARY                            │');
  console.log('└─────────────────────────────────────────────────────────────────────────────┘');
  console.log('');
  console.log(`Total unique earthquakes: ${allEarthquakes.length}`);
  console.log(`Date range: ${allEarthquakes[0]?.time.toISOString().split('T')[0]} to ${allEarthquakes[allEarthquakes.length-1]?.time.toISOString().split('T')[0]}`);
  console.log('');
  
  const m8Count = allEarthquakes.filter(eq => eq.mag >= 8.0).length;
  const m7Count = allEarthquakes.filter(eq => eq.mag >= 7.0).length;
  const m6Count = allEarthquakes.filter(eq => eq.mag >= 6.0).length;
  const m5Count = allEarthquakes.filter(eq => eq.mag >= 5.0).length;
  
  console.log('By magnitude:');
  console.log(`  M8.0+: ${m8Count} events`);
  console.log(`  M7.0+: ${m7Count} events`);
  console.log(`  M6.0+: ${m6Count} events`);
  console.log(`  M5.0+: ${m5Count} events`);
  console.log('');
  
  // Show largest events
  const largest = [...allEarthquakes].sort((a, b) => b.mag - a.mag).slice(0, 10);
  console.log('Largest 10 earthquakes in dataset:');
  for (const eq of largest) {
    console.log(`  M${eq.mag.toFixed(1)} — ${eq.place} (${eq.time.toISOString().split('T')[0]})`);
  }
  console.log('');
  
  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE 2: VOLCANO ANALYSIS
  // ═══════════════════════════════════════════════════════════════════════════
  
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log('PHASE 2: VOLCANO-BY-VOLCANO FORWARD ANALYSIS');
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log('');
  
  const analyses: VolcanoFullAnalysis[] = [];
  
  for (const volcano of PHILIPPINE_VOLCANOES) {
    process.stdout.write(`Analyzing ${volcano.name}... `);
    const analysis = analyzeVolcanoFull(volcano, allEarthquakes, analysisDate);
    analyses.push(analysis);
    console.log(`done (${analysis.within500km.length} events within 500km)`);
  }
  
  // Sort by probability
  analyses.sort((a, b) => b.combinedProbability - a.combinedProbability);
  
  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE 3: DETAILED RESULTS
  // ═══════════════════════════════════════════════════════════════════════════
  
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log('PHASE 3: FORWARD CALCULATION RESULTS');
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log('');
  
  // Top 10 detailed
  console.log('┌─────────────────────────────────────────────────────────────────────────────┐');
  console.log('│                    TOP 10 BY FORWARD CALCULATION                            │');
  console.log('│                    (Based on 100+ years of data)                            │');
  console.log('└─────────────────────────────────────────────────────────────────────────────┘');
  console.log('');
  
  for (let i = 0; i < Math.min(10, analyses.length); i++) {
    const a = analyses[i];
    
    console.log(`#${i + 1}: ${a.volcano.name.toUpperCase()}`);
    console.log(`    ${a.volcano.province}, ${a.volcano.region}`);
    console.log(`    Status: ${a.volcano.status} | Type: ${a.volcano.type}`);
    console.log('');
    console.log('    HISTORICAL DATA (100+ years):');
    console.log(`    ├─ Earthquakes within 200km: ${a.within200km.length}`);
    console.log(`    ├─ Earthquakes within 500km: ${a.within500km.length}`);
    console.log(`    ├─ Earthquakes within 1000km: ${a.within1000km.length}`);
    console.log(`    └─ Cumulative energy (200km): M${a.equivalentMag200km.toFixed(1)} equivalent`);
    console.log('');
    console.log('    TRIGGERING EVENTS:');
    console.log(`    ├─ Nishimura triggers (M7.5+/200km): ${a.nishimuraTriggers.length} total, ${a.nishimuraTriggers.filter(t => t.decayedContribution > 0).length} active`);
    if (a.nishimuraTriggers.length > 0) {
      for (const t of a.nishimuraTriggers.slice(0, 3)) {
        const status = t.decayedContribution > 0 ? `ACTIVE (${(t.decayedContribution * 100).toFixed(0)}% contrib)` : 'decayed';
        console.log(`    │  • M${t.eq.mag.toFixed(1)} @ ${t.distance.toFixed(0)}km, ${t.yearsAgo.toFixed(1)}y ago — ${status}`);
      }
      if (a.nishimuraTriggers.length > 3) console.log(`    │  ... and ${a.nishimuraTriggers.length - 3} more`);
    }
    console.log(`    ├─ Jenkins triggers (M7+/750km): ${a.jenkinsTriggers.length} total, ${a.jenkinsTriggers.filter(t => t.decayedContribution > 0).length} active`);
    console.log(`    └─ Megathrust triggers (M8+/1000km): ${a.m8Triggers.length} total, ${a.m8Triggers.filter(t => t.decayedContribution > 0).length} active`);
    if (a.m8Triggers.length > 0) {
      for (const t of a.m8Triggers.slice(0, 3)) {
        const status = t.decayedContribution > 0 ? `ACTIVE` : 'decayed';
        console.log(`       • M${t.eq.mag.toFixed(1)} @ ${t.distance.toFixed(0)}km, ${t.yearsAgo.toFixed(1)}y ago — ${status}`);
      }
    }
    console.log('');
    console.log('    TEMPORAL COMPARISON:');
    console.log(`    ├─ Last 5 years (500km):  M5+: ${a.last5Years.m5}, M6+: ${a.last5Years.m6}, M7+: ${a.last5Years.m7}`);
    console.log(`    ├─ Last 30 years (500km): M5+: ${a.last30Years.m5}, M6+: ${a.last30Years.m6}, M7+: ${a.last30Years.m7}`);
    console.log(`    └─ All 100 years (500km): M5+: ${a.all100Years.m5}, M6+: ${a.all100Years.m6}, M7+: ${a.all100Years.m7}`);
    console.log('');
    console.log('    PROBABILITY CALCULATION:');
    console.log(`    ├─ Base probability: ${(a.baseProbability * 100).toFixed(1)}%`);
    console.log(`    ├─ Nishimura factor: ${a.nishimuraFactor.toFixed(3)}x`);
    console.log(`    ├─ Jenkins factor: ${a.jenkinsFactor.toFixed(3)}x`);
    console.log(`    ├─ Megathrust factor: ${a.megathrustFactor.toFixed(3)}x`);
    console.log(`    ├─ Historical activity factor: ${a.historicalActivityFactor.toFixed(3)}x`);
    console.log(`    └─ COMBINED PROBABILITY: ${(a.combinedProbability * 100).toFixed(1)}%`);
    console.log('');
    console.log('─────────────────────────────────────────────────────────────────────────────');
    console.log('');
  }
  
  // Full ranking table
  console.log('');
  console.log('┌─────────────────────────────────────────────────────────────────────────────┐');
  console.log('│                    FULL RANKING (ALL VOLCANOES)                             │');
  console.log('└─────────────────────────────────────────────────────────────────────────────┘');
  console.log('');
  console.log('Rank │ Volcano               │ Prob%  │ Nishi │ Jenk  │ M8    │ Hist  │ EQ500');
  console.log('─────┼───────────────────────┼────────┼───────┼───────┼───────┼───────┼───────');
  
  for (let i = 0; i < analyses.length; i++) {
    const a = analyses[i];
    const name = a.volcano.name.padEnd(21).substring(0, 21);
    const prob = (a.combinedProbability * 100).toFixed(1).padStart(5);
    const nishi = a.nishimuraFactor.toFixed(2).padStart(5);
    const jenk = a.jenkinsFactor.toFixed(2).padStart(5);
    const m8 = a.megathrustFactor.toFixed(2).padStart(5);
    const hist = a.historicalActivityFactor.toFixed(2).padStart(5);
    const eq500 = a.within500km.length.toString().padStart(5);
    
    console.log(`${(i + 1).toString().padStart(4)} │ ${name} │ ${prob}% │ ${nishi} │ ${jenk} │ ${m8} │ ${hist} │ ${eq500}`);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE 4: KEY FINDINGS
  // ═══════════════════════════════════════════════════════════════════════════
  
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log('PHASE 4: KEY FINDINGS FROM HISTORICAL DATA');
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log('');
  
  // Most seismically active regions
  const byRegion = new Map<string, { volcanoes: string[], avgProb: number, totalEQ: number }>();
  for (const a of analyses) {
    const region = a.volcano.region;
    if (!byRegion.has(region)) {
      byRegion.set(region, { volcanoes: [], avgProb: 0, totalEQ: 0 });
    }
    const r = byRegion.get(region)!;
    r.volcanoes.push(a.volcano.name);
    r.avgProb += a.combinedProbability;
    r.totalEQ += a.within500km.length;
  }
  
  console.log('REGIONAL SEISMIC LOADING (by 500km earthquake count):');
  const regionRanking = Array.from(byRegion.entries())
    .map(([region, data]) => ({
      region,
      ...data,
      avgProb: data.avgProb / data.volcanoes.length,
    }))
    .sort((a, b) => b.totalEQ - a.totalEQ);
  
  for (const r of regionRanking) {
    console.log(`  ${r.region}: ${r.totalEQ} EQ, avg prob ${(r.avgProb * 100).toFixed(1)}%`);
    console.log(`    Volcanoes: ${r.volcanoes.join(', ')}`);
  }
  console.log('');
  
  // All Nishimura triggers (historical)
  const allNishimura = analyses.flatMap(a => 
    a.nishimuraTriggers.map(t => ({ volcano: a.volcano.name, ...t }))
  );
  const uniqueNishimura = [...new Map(allNishimura.map(t => [t.eq.id, t])).values()]
    .sort((a, b) => b.eq.mag - a.eq.mag);
  
  console.log(`ALL NISHIMURA-CLASS TRIGGERS (M7.5+ within 200km of any volcano): ${uniqueNishimura.length}`);
  for (const t of uniqueNishimura.slice(0, 10)) {
    const affected = allNishimura.filter(n => n.eq.id === t.eq.id).map(n => n.volcano);
    console.log(`  M${t.eq.mag.toFixed(1)} — ${t.eq.place} (${t.eq.time.toISOString().split('T')[0]})`);
    console.log(`    Affected volcanoes: ${affected.join(', ')}`);
  }
  console.log('');
  
  // Active triggers right now
  const activeNow = analyses.filter(a => 
    a.nishimuraTriggers.some(t => t.decayedContribution > 0) ||
    a.jenkinsTriggers.some(t => t.decayedContribution > 0) ||
    a.m8Triggers.some(t => t.decayedContribution > 0)
  );
  
  console.log(`VOLCANOES WITH ACTIVE TRIGGERS (decay window not expired): ${activeNow.length}`);
  for (const a of activeNow) {
    const activeN = a.nishimuraTriggers.filter(t => t.decayedContribution > 0).length;
    const activeJ = a.jenkinsTriggers.filter(t => t.decayedContribution > 0).length;
    const activeM = a.m8Triggers.filter(t => t.decayedContribution > 0).length;
    console.log(`  ${a.volcano.name}: Nishi=${activeN}, Jenkins=${activeJ}, M8=${activeM}`);
  }
  console.log('');
  
  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE 5: CONCLUSIONS
  // ═══════════════════════════════════════════════════════════════════════════
  
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log('PHASE 5: FORWARD-DERIVED CONCLUSIONS');
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log('');
  
  const veryHigh = analyses.filter(a => a.combinedProbability >= 0.35);
  const high = analyses.filter(a => a.combinedProbability >= 0.20 && a.combinedProbability < 0.35);
  const elevated = analyses.filter(a => a.combinedProbability >= 0.10 && a.combinedProbability < 0.20);
  
  console.log(`VERY HIGH RISK (≥35%): ${veryHigh.length}`);
  veryHigh.forEach(a => console.log(`  → ${a.volcano.name}: ${(a.combinedProbability * 100).toFixed(1)}%`));
  console.log('');
  
  console.log(`HIGH RISK (20-35%): ${high.length}`);
  high.forEach(a => console.log(`  → ${a.volcano.name}: ${(a.combinedProbability * 100).toFixed(1)}%`));
  console.log('');
  
  console.log(`ELEVATED RISK (10-20%): ${elevated.length}`);
  elevated.forEach(a => console.log(`  → ${a.volcano.name}: ${(a.combinedProbability * 100).toFixed(1)}%`));
  console.log('');
  
  console.log('KEY INSIGHTS FROM 100+ YEARS OF DATA:');
  console.log('');
  
  // Calculate which volcano has had most historical triggering events
  const mostTriggered = [...analyses].sort((a, b) => 
    (b.nishimuraTriggers.length + b.m8Triggers.length) - 
    (a.nishimuraTriggers.length + a.m8Triggers.length)
  )[0];
  console.log(`1. MOST HISTORICALLY TRIGGERED: ${mostTriggered.volcano.name}`);
  console.log(`   ${mostTriggered.nishimuraTriggers.length} Nishimura events, ${mostTriggered.m8Triggers.length} megathrust events`);
  console.log('');
  
  // Most seismically loaded
  const mostLoaded = [...analyses].sort((a, b) => b.equivalentMag500km - a.equivalentMag500km)[0];
  console.log(`2. HIGHEST SEISMIC ENERGY LOADING: ${mostLoaded.volcano.name}`);
  console.log(`   M${mostLoaded.equivalentMag500km.toFixed(1)} equivalent within 500km over 100 years`);
  console.log('');
  
  // Accelerating activity
  const accelerating = analyses.filter(a => {
    const recentRate = a.last5Years.m5 / 5;
    const historicalRate = a.all100Years.m5 / 100;
    return recentRate > historicalRate * 2;
  });
  console.log(`3. ACCELERATING SEISMICITY (recent > 2x historical rate): ${accelerating.length} volcanoes`);
  for (const a of accelerating) {
    const recentRate = (a.last5Years.m5 / 5).toFixed(1);
    const histRate = (a.all100Years.m5 / 100).toFixed(1);
    console.log(`   ${a.volcano.name}: ${recentRate}/yr recent vs ${histRate}/yr historical`);
  }
  console.log('');
  
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log('                    END OF GLOBAL HISTORICAL ANALYSIS');
  console.log('═══════════════════════════════════════════════════════════════════════════════');
}

main().catch(console.error);
