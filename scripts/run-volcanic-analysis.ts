#!/usr/bin/env npx tsx
/**
 * Run volcanic risk analysis using the v2 prediction system
 * 
 * This script:
 * 1. Fetches recent earthquake data from multiple sources
 * 2. Runs the v2 volcanic prediction algorithms
 * 3. Outputs detailed risk assessments for all Philippine volcanoes
 */

import { PHILIPPINE_VOLCANOES } from '../src/data/philippine-volcanoes';
import {
  assessAllVolcanoes,
  Earthquake,
  haversineDistance,
} from '../src/lib/volcanic-prediction-v2';

// Fetch from USGS
async function fetchUSGS(days: number, minMag: number): Promise<Earthquake[]> {
  const startTime = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  // Philippines bounds
  const url = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=${startTime}&minmagnitude=${minMag}&minlatitude=4&maxlatitude=22&minlongitude=115&maxlongitude=130&limit=5000&orderby=time`;
  
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`USGS: ${res.status}`);
    const data = await res.json();
    
    return data.features.map((f: any) => ({
      id: `usgs_${f.id}`,
      magnitude: f.properties.mag,
      depth_km: f.geometry.coordinates[2] || 10,
      latitude: f.geometry.coordinates[1],
      longitude: f.geometry.coordinates[0],
      timestamp: new Date(f.properties.time),
      location: f.properties.place || 'Unknown',
    }));
  } catch (e) {
    console.error('USGS fetch failed:', e);
    return [];
  }
}

// Fetch from EMSC
async function fetchEMSC(days: number, minMag: number): Promise<Earthquake[]> {
  const startTime = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  
  const url = `https://www.seismicportal.eu/fdsnws/event/1/query?format=json&starttime=${startTime}&minmagnitude=${minMag}&minlatitude=4&maxlatitude=22&minlongitude=115&maxlongitude=130&limit=5000&orderby=time`;
  
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`EMSC: ${res.status}`);
    const data = await res.json();
    
    return (data.features || []).map((f: any) => ({
      id: `emsc_${f.properties.source_id || f.id}`,
      magnitude: f.properties.mag,
      depth_km: f.geometry.coordinates[2] || 10,
      latitude: f.geometry.coordinates[1],
      longitude: f.geometry.coordinates[0],
      timestamp: new Date(f.properties.time),
      location: f.properties.flynn_region || 'Unknown',
    }));
  } catch (e) {
    console.error('EMSC fetch failed:', e);
    return [];
  }
}

// Deduplicate earthquakes
function deduplicateEarthquakes(earthquakes: Earthquake[]): Earthquake[] {
  const sorted = [...earthquakes].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  const unique: Earthquake[] = [];
  
  for (const eq of sorted) {
    const isDuplicate = unique.some(existing => {
      const timeDiff = Math.abs(existing.timestamp.getTime() - eq.timestamp.getTime());
      const magDiff = Math.abs(existing.magnitude - eq.magnitude);
      const distance = haversineDistance(
        existing.latitude, existing.longitude,
        eq.latitude, eq.longitude
      );
      return timeDiff < 120000 && distance < 50 && magDiff < 0.3;
    });
    
    if (!isDuplicate) unique.push(eq);
  }
  
  return unique;
}

// Format for display
function formatRiskLevel(level: string): string {
  const colors: Record<string, string> = {
    CRITICAL: '\x1b[41m\x1b[37m',    // Red background
    VERY_HIGH: '\x1b[31m',           // Red
    HIGH: '\x1b[33m',                // Yellow
    ELEVATED: '\x1b[93m',            // Bright yellow
    MODERATE: '\x1b[32m',            // Green
    LOW: '\x1b[90m',                 // Gray
    BACKGROUND: '\x1b[90m',          // Gray
  };
  const reset = '\x1b[0m';
  return `${colors[level] || ''}${level.padEnd(10)}${reset}`;
}

async function main() {
  console.log('=' .repeat(80));
  console.log('SENN VOLCANIC PREDICTION SYSTEM v2.0');
  console.log('=' .repeat(80));
  console.log(`Analysis Date: ${new Date().toISOString()}`);
  console.log();
  
  // Fetch earthquake data
  console.log('Fetching earthquake data...');
  
  const [usgsData, emscData] = await Promise.all([
    fetchUSGS(90, 2.0),
    fetchEMSC(90, 2.0),
  ]);
  
  console.log(`  USGS: ${usgsData.length} events`);
  console.log(`  EMSC: ${emscData.length} events`);
  
  // Combine and deduplicate
  const allEarthquakes = deduplicateEarthquakes([...usgsData, ...emscData]);
  console.log(`  Combined (deduped): ${allEarthquakes.length} events`);
  console.log();
  
  // Run assessments
  console.log('Running volcanic risk assessments...');
  console.log();
  
  const assessments = assessAllVolcanoes(PHILIPPINE_VOLCANOES, allEarthquakes);
  
  // Display results
  console.log('=' .repeat(80));
  console.log('RISK ASSESSMENT RESULTS');
  console.log('=' .repeat(80));
  console.log();
  
  console.log('Volcano'.padEnd(25) + 'Risk Level'.padEnd(12) + 'P(1yr)'.padEnd(10) + 'P(30d)'.padEnd(10) + 'Multiplier'.padEnd(12) + 'Confidence');
  console.log('-'.repeat(80));
  
  for (const a of assessments) {
    const line = 
      a.volcano.name.padEnd(25) +
      formatRiskLevel(a.riskLevel) + '  ' +
      `${a.probability1Year}%`.padEnd(10) +
      `${a.probability30Day}%`.padEnd(10) +
      `${a.factors.combinedMultiplier}x`.padEnd(12) +
      a.confidence;
    
    console.log(line);
  }
  
  console.log();
  console.log('=' .repeat(80));
  console.log('DETAILED ANALYSIS (Elevated+ Risk)');
  console.log('=' .repeat(80));
  
  const elevated = assessments.filter(a => 
    ['CRITICAL', 'VERY_HIGH', 'HIGH', 'ELEVATED'].includes(a.riskLevel)
  );
  
  for (const a of elevated) {
    console.log();
    console.log(`🌋 ${a.volcano.name} (${a.volcano.province})`);
    console.log('-'.repeat(60));
    console.log(`  Risk Level: ${a.riskLevel}`);
    console.log(`  Probability (1-year): ${a.probability1Year}%`);
    console.log(`  Probability (30-day): ${a.probability30Day}%`);
    console.log(`  Confidence: ${a.confidence}`);
    console.log();
    
    console.log('  Factor Breakdown:');
    console.log(`    Baseline rate:        ${(a.factors.baseline * 100).toFixed(1)}%/year`);
    console.log(`    Triggering:           ${a.factors.triggeringMultiplier}x ${a.triggeringAnalysis.nishimuraTriggered ? '(Nishimura)' : ''}`);
    console.log(`    Depth migration:      ${a.factors.depthMigrationMultiplier}x ${a.depthMigration.detected ? `(${a.depthMigration.direction})` : ''}`);
    console.log(`    b-value:              ${a.factors.bValueMultiplier}x (b=${a.bValueAnalysis.bValue})`);
    console.log(`    Acceleration:         ${a.factors.accelerationMultiplier}x ${a.acceleration.detected ? `(${a.acceleration.type})` : ''}`);
    console.log(`    Cluster effects:      ${a.factors.clusterMultiplier}x`);
    console.log(`    Hydrothermal:         ${a.factors.hydrothermalMultiplier}x`);
    console.log(`    Recent activity:      ${a.factors.recentActivityMultiplier}x`);
    console.log(`    COMBINED:             ${a.factors.combinedMultiplier}x`);
    console.log();
    
    console.log('  Seismic Statistics:');
    console.log(`    Events analyzed:      ${a.stats.earthquakesAnalyzed}`);
    console.log(`    M3+ events:           ${a.stats.m3PlusCount}`);
    console.log(`    M5+ events:           ${a.stats.m5PlusCount}`);
    console.log(`    Near-field (<15km):   ${a.stats.nearFieldCount}`);
    console.log(`    Shallow (<5km):       ${a.stats.shallowCount}`);
    console.log(`    Event rate (7-day):   ${a.stats.eventRate7Day.toFixed(2)}/day`);
    console.log();
    
    if (a.scientificNotes.length > 0) {
      console.log('  Scientific Notes:');
      for (const note of a.scientificNotes) {
        console.log(`    • ${note}`);
      }
      console.log();
    }
    
    if (a.clusters.length > 0) {
      console.log('  Active Clusters:');
      for (const c of a.clusters.slice(0, 3)) {
        console.log(`    • ${c.name}: ${c.earthquakes.length} events, Mmax=${c.maxMagnitude.toFixed(1)}, ${c.isSwarm ? 'SWARM' : ''} ${c.isMigrating ? c.migrationDirection.toUpperCase() : ''}`);
      }
      console.log();
    }
    
    console.log(`  Guidance: ${a.strategicGuidance.action}`);
  }
  
  console.log();
  console.log('=' .repeat(80));
  console.log('SCIENTIFIC REFERENCES');
  console.log('=' .repeat(80));
  console.log();
  console.log('This analysis integrates the following peer-reviewed models:');
  console.log();
  console.log('1. Nishimura (2017) - Large earthquake triggering of volcanic eruptions');
  console.log('   Journal of Geophysical Research: Solid Earth, 122(3), 2195-2218');
  console.log();
  console.log('2. Jenkins et al. (2024) - Statistical analysis of earthquake-triggered');
  console.log('   volcanic unrest at regional scales');
  console.log();
  console.log('3. Manga & Brodsky (2006) - Seismic triggering of eruptions in the far');
  console.log('   field: Volcanoes and geysers. Annual Review of Earth and Planetary Sciences');
  console.log();
  console.log('4. Roman & Cashman (2006) - The origin of volcano-tectonic earthquake swarms');
  console.log('   Geology, 34(6), 457-460');
  console.log();
  console.log('5. Kilburn (2003) - Multiscale fracturing as a key to forecasting');
  console.log('   volcanic eruptions. Journal of Volcanology and Geothermal Research');
  console.log();
  console.log('6. Gutenberg & Richter (1944) - Frequency of earthquakes in California');
  console.log('   Bulletin of the Seismological Society of America');
  console.log();
  console.log('=' .repeat(80));
  console.log('DISCLAIMER');
  console.log('=' .repeat(80));
  console.log();
  console.log('This is a STATISTICAL model providing PROBABILITY ESTIMATES, not predictions.');
  console.log('Volcanic systems are complex and can erupt without warning or show precursors');
  console.log('without erupting. Always defer to official monitoring agencies (PHIVOLCS).');
  console.log();
}

main().catch(console.error);
