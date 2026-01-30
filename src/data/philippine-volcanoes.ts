// Philippine Volcanoes Database
// Source: PHIVOLCS, Global Volcanism Program (Smithsonian)
// 24 Active Volcanoes + Key Potentially Active

export interface Volcano {
  id: string;           // GVP Volcano Number
  name: string;
  latitude: number;
  longitude: number;
  elevation_m: number;
  type: string;         // stratovolcano, shield, caldera, etc.
  status: 'active' | 'potentially_active' | 'dormant';
  region: string;
  province: string;
  lastEruption: string | null;  // Year or "Holocene" or null
  hydrothermalActivity: 0 | 1 | 2 | 3;  // 0=none, 1=minor, 2=moderate, 3=vigorous
  monitoringStations: number;
  hasHazardMap: boolean;
  nearbyPopulation: number;     // Within 30km radius
  alertLevel: number;           // PHIVOLCS 0-5 scale
  riskFactors: string[];
  description: string;
}

// Risk level descriptions for strategic planning (NOT fear-based)
export const RISK_LEVEL_DESCRIPTIONS = {
  'VERY_HIGH': {
    label: 'Very High',
    color: '#dc2626',
    action: 'Heightened Awareness - Review and update emergency plans immediately',
    context: 'Statistical models indicate significantly elevated probability over baseline',
  },
  'HIGH': {
    label: 'High', 
    color: '#ea580c',
    action: 'Review Emergency Plans - Ensure evacuation routes are known',
    context: 'Multiple risk factors present - preparedness steps recommended',
  },
  'ELEVATED': {
    label: 'Elevated',
    color: '#ca8a04',
    action: 'Stay Informed - Monitor official PHIVOLCS bulletins',
    context: 'Above-normal activity detected - maintain awareness',
  },
  'MODERATE': {
    label: 'Moderate',
    color: '#65a30d',
    action: 'Standard Preparedness - Keep emergency kit ready',
    context: 'Normal monitoring conditions - standard preparedness applies',
  },
  'LOW': {
    label: 'Low',
    color: '#16a34a',
    action: 'Background Level - Maintain general awareness',
    context: 'No significant indicators - continue standard monitoring',
  },
};

// ============================================================================
// ACTIVE PHILIPPINE VOLCANOES (24 total per PHIVOLCS)
// ============================================================================

export const PHILIPPINE_VOLCANOES: Volcano[] = [
  // --------------------------------------------------------------------------
  // LUZON VOLCANOES
  // --------------------------------------------------------------------------
  {
    id: '273030',
    name: 'Taal',
    latitude: 14.002,
    longitude: 120.993,
    elevation_m: 311,
    type: 'Caldera',
    status: 'active',
    region: 'CALABARZON',
    province: 'Batangas',
    lastEruption: '2022',
    hydrothermalActivity: 3,
    monitoringStations: 15,
    hasHazardMap: true,
    nearbyPopulation: 2100000,
    alertLevel: 1,
    riskFactors: ['caldera_system', 'lake_interaction', 'high_population_density', 'frequent_unrest'],
    description: 'Most monitored volcano in Philippines. Located in Taal Lake within a larger caldera. Multiple eruptions since 2020.'
  },
  {
    id: '273083',
    name: 'Mayon',
    latitude: 13.257,
    longitude: 123.685,
    elevation_m: 2462,
    type: 'Stratovolcano',
    status: 'active',
    region: 'Bicol',
    province: 'Albay',
    lastEruption: '2024',
    hydrothermalActivity: 2,
    monitoringStations: 12,
    hasHazardMap: true,
    nearbyPopulation: 1200000,
    alertLevel: 3,
    riskFactors: ['frequent_eruptions', 'pyroclastic_flows', 'lahars', 'population_exposure'],
    description: 'Most active volcano in Philippines. Perfect cone shape. Ongoing eruption since 2024 with lava flows, PDCs, and Strombolian activity.'
  },
  {
    id: '273054',
    name: 'Pinatubo',
    latitude: 15.130,
    longitude: 120.350,
    elevation_m: 1486,
    type: 'Stratovolcano',
    status: 'active',
    region: 'Central Luzon',
    province: 'Zambales',
    lastEruption: '1991',
    hydrothermalActivity: 2,
    monitoringStations: 8,
    hasHazardMap: true,
    nearbyPopulation: 850000,
    alertLevel: 0,
    riskFactors: ['vei6_capable', 'lahar_hazard', 'caldera_lake'],
    description: 'VEI 6 eruption in 1991 was second largest of 20th century. Triggered by M7.8 earthquake 8 months prior.'
  },
  {
    id: '273010',
    name: 'Bulusan',
    latitude: 12.770,
    longitude: 124.050,
    elevation_m: 1559,
    type: 'Stratovolcano',
    status: 'active',
    region: 'Bicol',
    province: 'Sorsogon',
    lastEruption: '2022',
    hydrothermalActivity: 2,
    monitoringStations: 6,
    hasHazardMap: true,
    nearbyPopulation: 180000,
    alertLevel: 1,
    riskFactors: ['phreatic_eruptions', 'frequent_unrest'],
    description: 'Frequent phreatic (steam-driven) eruptions. Phreatic eruption April 2025, ongoing elevated unrest.'
  },
  {
    id: '273020',
    name: 'Canlaon',
    latitude: 10.412,
    longitude: 123.132,
    elevation_m: 2435,
    type: 'Stratovolcano',
    status: 'active',
    region: 'Western Visayas',
    province: 'Negros Oriental',
    lastEruption: '2024',
    hydrothermalActivity: 2,
    monitoringStations: 7,
    hasHazardMap: true,
    nearbyPopulation: 350000,
    alertLevel: 2,
    riskFactors: ['recent_eruption', 'pyroclastic_density_currents', 'elevated_unrest'],
    description: 'Most active volcano in Visayas. Multiple eruptions in 2024 caused evacuations.'
  },
  {
    id: '270010',
    name: 'Iraya',
    latitude: 20.469,
    longitude: 122.010,
    elevation_m: 1009,
    type: 'Stratovolcano',
    status: 'active',
    region: 'Cagayan Valley',
    province: 'Batanes',
    lastEruption: '1454',
    hydrothermalActivity: 1,
    monitoringStations: 2,
    hasHazardMap: false,
    nearbyPopulation: 17000,
    alertLevel: 0,
    riskFactors: ['remote_monitoring', 'island_volcano'],
    description: 'Northernmost active volcano in Philippines. Last eruption in 1454 CE.'
  },
  {
    id: '270020',
    name: 'Babuyan Claro',
    latitude: 19.523,
    longitude: 121.940,
    elevation_m: 1080,
    type: 'Stratovolcano',
    status: 'active',
    region: 'Cagayan Valley',
    province: 'Cagayan',
    lastEruption: '1924',
    hydrothermalActivity: 2,
    monitoringStations: 1,
    hasHazardMap: false,
    nearbyPopulation: 5000,
    alertLevel: 0,
    riskFactors: ['remote_island', 'minimal_monitoring'],
    description: 'Remote island volcano. Last confirmed eruption in 1924.'
  },
  {
    id: '270030',
    name: 'Camiguin de Babuyanes',
    latitude: 18.831,
    longitude: 121.860,
    elevation_m: 712,
    type: 'Stratovolcano',
    status: 'active',
    region: 'Cagayan Valley',
    province: 'Cagayan',
    lastEruption: '1857',
    hydrothermalActivity: 2,
    monitoringStations: 1,
    hasHazardMap: false,
    nearbyPopulation: 3000,
    alertLevel: 0,
    riskFactors: ['remote_island', 'minimal_monitoring', 'historical_large_eruption'],
    description: 'Small volcanic island. 1857 eruption forced evacuation of entire island.'
  },
  {
    id: '270040',
    name: 'Didicas',
    latitude: 19.077,
    longitude: 122.202,
    elevation_m: 228,
    type: 'Compound volcano',
    status: 'active',
    region: 'Cagayan Valley',
    province: 'Cagayan',
    lastEruption: '1978',
    hydrothermalActivity: 2,
    monitoringStations: 0,
    hasHazardMap: false,
    nearbyPopulation: 0,
    alertLevel: 0,
    riskFactors: ['submarine_volcano', 'no_monitoring', 'recent_activity'],
    description: 'Submarine volcano that emerged above sea level in 1952. Last eruption 1978.'
  },
  {
    id: '270050',
    name: 'Cagua',
    latitude: 18.222,
    longitude: 122.123,
    elevation_m: 1133,
    type: 'Stratovolcano',
    status: 'active',
    region: 'Cagayan Valley',
    province: 'Cagayan',
    lastEruption: '1907',
    hydrothermalActivity: 2,
    monitoringStations: 2,
    hasHazardMap: false,
    nearbyPopulation: 45000,
    alertLevel: 0,
    riskFactors: ['limited_monitoring', 'steam_emissions'],
    description: 'Located in northeastern Luzon. Active fumaroles present.'
  },
  
  // --------------------------------------------------------------------------
  // VISAYAS VOLCANOES
  // --------------------------------------------------------------------------
  {
    id: '272020',
    name: 'Biliran',
    latitude: 11.523,
    longitude: 124.535,
    elevation_m: 1301,
    type: 'Stratovolcano',
    status: 'active',
    region: 'Eastern Visayas',
    province: 'Biliran',
    lastEruption: '1939',
    hydrothermalActivity: 2,
    monitoringStations: 2,
    hasHazardMap: false,
    nearbyPopulation: 65000,
    alertLevel: 0,
    riskFactors: ['limited_monitoring', 'geothermal_area'],
    description: 'Island volcano with active geothermal system.'
  },
  {
    id: '272040',
    name: 'Cabalian',
    latitude: 10.287,
    longitude: 125.220,
    elevation_m: 945,
    type: 'Stratovolcano',
    status: 'active',
    region: 'Eastern Visayas',
    province: 'Southern Leyte',
    lastEruption: 'Holocene',
    hydrothermalActivity: 2,
    monitoringStations: 1,
    hasHazardMap: false,
    nearbyPopulation: 25000,
    alertLevel: 0,
    riskFactors: ['limited_monitoring', 'uncertain_history'],
    description: 'Potentially active based on geothermal activity. Eruption history uncertain.'
  },

  // --------------------------------------------------------------------------
  // MINDANAO VOLCANOES
  // --------------------------------------------------------------------------
  {
    id: '271030',
    name: 'Mount Apo',
    latitude: 6.9875,
    longitude: 125.2711,
    elevation_m: 2954,
    type: 'Stratovolcano',
    status: 'potentially_active',
    region: 'Davao Region',
    province: 'Davao del Sur',
    lastEruption: null,  // No Holocene eruptions
    hydrothermalActivity: 3,  // 106MW geothermal plant!
    monitoringStations: 1,    // Single station since Sept 2024
    hasHazardMap: false,
    nearbyPopulation: 1800000, // Davao City metro
    alertLevel: 0,
    riskFactors: [
      'active_geothermal',
      'minimal_monitoring', 
      'no_hazard_map',
      'high_population_exposure',
      'dual_cluster_seismicity_2025'
    ],
    description: 'Highest peak in Philippines. No historical eruptions but active solfataras and major geothermal plant. Currently bracketed by two seismic clusters (Oct 2025-Jan 2026).'
  },
  {
    id: '271010',
    name: 'Hibok-Hibok',
    latitude: 9.203,
    longitude: 124.673,
    elevation_m: 1332,
    type: 'Stratovolcano',
    status: 'active',
    region: 'Northern Mindanao',
    province: 'Camiguin',
    lastEruption: '1953',
    hydrothermalActivity: 2,
    monitoringStations: 4,
    hasHazardMap: true,
    nearbyPopulation: 92000,
    alertLevel: 0,
    riskFactors: ['island_volcano', 'pyroclastic_flow_history', 'tourist_destination'],
    description: '1951 eruption killed 500+ people via pyroclastic flows. Island has no evacuation route.'
  },
  {
    id: '271020',
    name: 'Musuan',
    latitude: 7.877,
    longitude: 125.068,
    elevation_m: 646,
    type: 'Lava dome',
    status: 'active',
    region: 'Northern Mindanao',
    province: 'Bukidnon',
    lastEruption: 'Holocene',
    hydrothermalActivity: 1,
    monitoringStations: 1,
    hasHazardMap: false,
    nearbyPopulation: 120000,
    alertLevel: 0,
    riskFactors: ['limited_monitoring', 'lava_dome'],
    description: 'Small lava dome volcano. Part of Central Mindanao volcanic field.'
  },
  {
    id: '271040',
    name: 'Matutum',
    latitude: 6.360,
    longitude: 125.078,
    elevation_m: 2286,
    type: 'Stratovolcano',
    status: 'active',
    region: 'SOCCSKSARGEN',
    province: 'South Cotabato',
    lastEruption: 'Holocene',
    hydrothermalActivity: 2,
    monitoringStations: 2,
    hasHazardMap: false,
    nearbyPopulation: 450000,
    alertLevel: 0,
    riskFactors: ['limited_monitoring', 'near_apo_seismic_zone'],
    description: 'Located south of Lake Sebu. Active fumaroles. In proximity to current Mindanao seismic activity.'
  },
  {
    id: '271050',
    name: 'Parker',
    latitude: 6.113,
    longitude: 124.892,
    elevation_m: 1824,
    type: 'Stratovolcano',
    status: 'active',
    region: 'SOCCSKSARGEN',
    province: 'South Cotabato',
    lastEruption: '1641',
    hydrothermalActivity: 2,
    monitoringStations: 3,
    hasHazardMap: true,
    nearbyPopulation: 380000,
    alertLevel: 0,
    riskFactors: ['lake_in_crater', 'lahar_hazard', 'near_apo_seismic_zone'],
    description: '1641 eruption formed crater lake. Within range of current Mindanao seismic clusters.'
  },
  {
    id: '271060',
    name: 'Ragang',
    latitude: 7.677,
    longitude: 124.507,
    elevation_m: 2815,
    type: 'Stratovolcano',
    status: 'active',
    region: 'BARMM',
    province: 'Lanao del Sur',
    lastEruption: '1916',
    hydrothermalActivity: 2,
    monitoringStations: 2,
    hasHazardMap: false,
    nearbyPopulation: 180000,
    alertLevel: 0,
    riskFactors: ['limited_monitoring', 'conflict_zone_access'],
    description: 'Second highest volcano in Mindanao. Located in BARMM region.'
  },
  {
    id: '271070',
    name: 'Makaturing',
    latitude: 7.647,
    longitude: 124.320,
    elevation_m: 1940,
    type: 'Stratovolcano',
    status: 'active',
    region: 'BARMM',
    province: 'Lanao del Sur',
    lastEruption: '1858',
    hydrothermalActivity: 2,
    monitoringStations: 1,
    hasHazardMap: false,
    nearbyPopulation: 95000,
    alertLevel: 0,
    riskFactors: ['limited_monitoring', 'conflict_zone_access', 'solfataric_activity'],
    description: 'Active solfataras. Located in Lake Lanao region.'
  },
  {
    id: '271080',
    name: 'Leonard Kniaseff',
    latitude: 5.850,
    longitude: 126.042,
    elevation_m: -60,  // Submarine
    type: 'Submarine volcano',
    status: 'active',
    region: 'BARMM',
    province: 'Tawi-Tawi',
    lastEruption: '1897',
    hydrothermalActivity: 3,
    monitoringStations: 0,
    hasHazardMap: false,
    nearbyPopulation: 15000,
    alertLevel: 0,
    riskFactors: ['submarine', 'no_monitoring', 'tsunami_potential'],
    description: 'Submarine volcano in Celebes Sea. Could pose tsunami risk if eruption occurs.'
  },
  {
    id: '260020',
    name: 'Bud Dajo',
    latitude: 5.952,
    longitude: 121.072,
    elevation_m: 600,
    type: 'Stratovolcano',
    status: 'potentially_active',
    region: 'BARMM',
    province: 'Sulu',
    lastEruption: 'Holocene',
    hydrothermalActivity: 1,
    monitoringStations: 0,
    hasHazardMap: false,
    nearbyPopulation: 45000,
    alertLevel: 0,
    riskFactors: ['no_monitoring', 'conflict_zone', 'uncertain_status'],
    description: 'Historic site. Volcanic status debated but included in PHIVOLCS potentially active list.'
  },
  {
    id: '271090',
    name: 'Smith',
    latitude: 19.540,
    longitude: 121.915,
    elevation_m: 688,
    type: 'Stratovolcano',
    status: 'active',
    region: 'Cagayan Valley',
    province: 'Cagayan',
    lastEruption: '1924',
    hydrothermalActivity: 2,
    monitoringStations: 0,
    hasHazardMap: false,
    nearbyPopulation: 1000,
    alertLevel: 0,
    riskFactors: ['remote_island', 'no_monitoring'],
    description: 'Uninhabited volcanic island in Babuyan Channel.'
  },
  
  // Additional potentially active volcanoes near current seismic activity
  {
    id: '271100',
    name: 'Mount Talomo',
    latitude: 7.095,
    longitude: 125.455,
    elevation_m: 2674,
    type: 'Stratovolcano',
    status: 'potentially_active',
    region: 'Davao Region',
    province: 'Davao del Sur',
    lastEruption: null,
    hydrothermalActivity: 2,
    monitoringStations: 0,
    hasHazardMap: false,
    nearbyPopulation: 950000,
    alertLevel: 0,
    riskFactors: ['no_monitoring', 'near_apo', 'high_population'],
    description: 'Adjacent to Mount Apo. Part of same volcanic complex. Shares geothermal system.'
  }
];

// Volcanoes sorted by current risk factors for monitoring priority
export function getVolcanoesByPriority(): Volcano[] {
  return [...PHILIPPINE_VOLCANOES].sort((a, b) => {
    // Priority factors:
    // 1. Current alert level
    // 2. Number of risk factors
    // 3. Population exposure
    // 4. Monitoring gaps
    
    const aScore = (a.alertLevel * 1000) + 
                   (a.riskFactors.length * 100) + 
                   (a.nearbyPopulation / 10000) +
                   (a.monitoringStations < 3 ? 50 : 0);
    const bScore = (b.alertLevel * 1000) + 
                   (b.riskFactors.length * 100) + 
                   (b.nearbyPopulation / 10000) +
                   (b.monitoringStations < 3 ? 50 : 0);
    
    return bScore - aScore;  // Higher score = higher priority
  });
}

// Get volcanoes within range of a seismic cluster
export function getVolcanoesNearLocation(
  latitude: number, 
  longitude: number, 
  radiusKm: number
): Volcano[] {
  return PHILIPPINE_VOLCANOES.filter(v => {
    const dist = haversineDistance(v.latitude, v.longitude, latitude, longitude);
    return dist <= radiusKm;
  });
}

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

// Export all volcanoes by slug for URL routing
export function getVolcanoBySlug(slug: string): Volcano | undefined {
  return PHILIPPINE_VOLCANOES.find(v => 
    v.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') === slug
  );
}

export function getAllVolcanoSlugs(): string[] {
  return PHILIPPINE_VOLCANOES.map(v => 
    v.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  );
}
