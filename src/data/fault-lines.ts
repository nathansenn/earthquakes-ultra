// Philippine Major Fault Lines
// Data based on PHIVOLCS fault line maps

export interface FaultLine {
  name: string;
  type: 'active' | 'potentially-active' | 'inactive';
  description: string;
  length: number; // km
  coordinates: [number, number][]; // [lng, lat] pairs for the line
  affectedProvinces: string[];
  lastMajorEvent?: string;
  maxHistoricalMagnitude?: number;
}

export const philippineFaultLines: FaultLine[] = [
  {
    name: "Philippine Fault Zone",
    type: "active",
    description: "The Philippine Fault Zone (PFZ) is a major left-lateral strike-slip fault that extends for 1,200 km from Luzon to Mindanao. It is one of the most seismically active fault systems in the world.",
    length: 1200,
    coordinates: [
      [122.5, 16.5], // Northern Luzon
      [122.3, 15.8],
      [122.1, 15.0],
      [121.8, 14.5],
      [121.5, 14.0],
      [121.8, 13.5],
      [122.5, 12.5],
      [123.5, 11.5],
      [124.0, 10.5],
      [124.5, 9.5],
      [125.0, 8.5],
      [125.5, 7.5], // Southern Mindanao
    ],
    affectedProvinces: [
      "Cagayan", "Isabela", "Nueva Vizcaya", "Nueva Ecija", "Bulacan",
      "Rizal", "Laguna", "Quezon", "Camarines Sur", "Masbate",
      "Leyte", "Southern Leyte", "Surigao del Sur", "Davao Oriental"
    ],
    lastMajorEvent: "1990 Luzon Earthquake (M7.8)",
    maxHistoricalMagnitude: 7.8,
  },
  {
    name: "Marikina Valley Fault System",
    type: "active",
    description: "The Marikina Valley Fault System (also known as the Valley Fault System) passes through Metro Manila and nearby provinces. It poses significant risk to the National Capital Region.",
    length: 146,
    coordinates: [
      [121.08, 14.85], // North
      [121.07, 14.75],
      [121.06, 14.65],
      [121.05, 14.55],
      [121.04, 14.45],
      [121.03, 14.35], // South
    ],
    affectedProvinces: [
      "Bulacan", "Rizal", "Metro Manila", "Cavite", "Laguna"
    ],
    lastMajorEvent: "1658 Manila Earthquake",
    maxHistoricalMagnitude: 7.5,
  },
  {
    name: "West Valley Fault",
    type: "active",
    description: "Part of the Marikina Valley Fault System, running along the western edge of the Marikina Valley. It passes through densely populated areas of Metro Manila.",
    length: 100,
    coordinates: [
      [121.05, 14.78],
      [121.04, 14.68],
      [121.03, 14.58],
      [121.02, 14.48],
      [121.01, 14.38],
    ],
    affectedProvinces: ["Metro Manila", "Rizal"],
    maxHistoricalMagnitude: 7.2,
  },
  {
    name: "East Valley Fault",
    type: "active",
    description: "Part of the Marikina Valley Fault System, running along the eastern edge of the Marikina Valley through Rodriguez, San Mateo, and Antipolo.",
    length: 80,
    coordinates: [
      [121.15, 14.78],
      [121.14, 14.68],
      [121.13, 14.58],
      [121.12, 14.48],
    ],
    affectedProvinces: ["Rizal"],
    maxHistoricalMagnitude: 7.0,
  },
  {
    name: "Manila Trench",
    type: "active",
    description: "An oceanic trench west of the Philippines, capable of producing large megathrust earthquakes. It extends from Taiwan to Mindoro and poses tsunami risk to western Luzon.",
    length: 600,
    coordinates: [
      [119.0, 22.0],
      [118.5, 20.0],
      [118.0, 18.0],
      [118.5, 16.0],
      [119.0, 14.0],
      [119.5, 12.0],
    ],
    affectedProvinces: [
      "Ilocos Norte", "Ilocos Sur", "La Union", "Pangasinan",
      "Zambales", "Bataan", "Cavite", "Batangas", "Mindoro"
    ],
    lastMajorEvent: "1934 Manila Trench Earthquake",
    maxHistoricalMagnitude: 7.6,
  },
  {
    name: "Philippine Trench",
    type: "active",
    description: "The Philippine Trench is a submarine trench east of the Philippines, reaching depths of 10,540 meters. It is the third deepest trench in the world.",
    length: 1320,
    coordinates: [
      [127.0, 12.0],
      [126.5, 10.0],
      [126.0, 8.0],
      [127.0, 6.0],
      [127.5, 5.0],
    ],
    affectedProvinces: [
      "Eastern Samar", "Leyte", "Southern Leyte", "Surigao del Sur",
      "Davao Oriental", "Davao del Sur"
    ],
    lastMajorEvent: "2012 Samar Earthquake (M7.6)",
    maxHistoricalMagnitude: 8.0,
  },
  {
    name: "Cotabato Trench",
    type: "active",
    description: "A submarine trench located in the Celebes Sea, south of Mindanao. It is a subduction zone where the Celebes Sea Plate subducts under the Sunda Plate.",
    length: 500,
    coordinates: [
      [125.0, 5.5],
      [124.0, 5.0],
      [123.0, 5.5],
      [122.0, 6.0],
    ],
    affectedProvinces: [
      "South Cotabato", "Sultan Kudarat", "Maguindanao", "Davao del Sur"
    ],
    maxHistoricalMagnitude: 7.8,
  },
  {
    name: "Central Philippine Fault",
    type: "active",
    description: "A major fault cutting through the central Philippines, associated with significant seismic activity in the Visayas region.",
    length: 400,
    coordinates: [
      [123.0, 12.0],
      [123.5, 11.0],
      [124.0, 10.0],
      [124.5, 9.0],
    ],
    affectedProvinces: [
      "Masbate", "Cebu", "Bohol", "Negros Oriental", "Negros Occidental"
    ],
    lastMajorEvent: "2013 Bohol Earthquake (M7.2)",
    maxHistoricalMagnitude: 7.2,
  },
  {
    name: "Negros Oriental Fault",
    type: "active",
    description: "A fault system in Negros Island responsible for significant seismic activity in the Central Visayas.",
    length: 120,
    coordinates: [
      [123.3, 10.2],
      [123.2, 9.8],
      [123.1, 9.4],
      [123.0, 9.0],
    ],
    affectedProvinces: ["Negros Oriental"],
    lastMajorEvent: "2012 Negros Earthquake (M6.7)",
    maxHistoricalMagnitude: 6.9,
  },
  {
    name: "Lubang Fault",
    type: "active",
    description: "A fault near Lubang Island in Occidental Mindoro, capable of generating earthquakes felt in Metro Manila.",
    length: 80,
    coordinates: [
      [120.1, 14.0],
      [120.0, 13.8],
      [119.9, 13.6],
    ],
    affectedProvinces: ["Occidental Mindoro", "Batangas"],
    maxHistoricalMagnitude: 7.0,
  },
  {
    name: "Casiguran Fault",
    type: "active",
    description: "Located in Aurora province, this fault has been responsible for damaging earthquakes in eastern Luzon.",
    length: 90,
    coordinates: [
      [122.0, 16.5],
      [122.2, 16.0],
      [122.3, 15.5],
    ],
    affectedProvinces: ["Aurora", "Quezon"],
    lastMajorEvent: "1968 Casiguran Earthquake (M7.3)",
    maxHistoricalMagnitude: 7.3,
  },
  {
    name: "Digdig Fault",
    type: "active",
    description: "Part of the Philippine Fault Zone in Central Luzon, responsible for the devastating 1990 Luzon earthquake.",
    length: 200,
    coordinates: [
      [121.2, 15.8],
      [121.0, 15.5],
      [120.8, 15.2],
      [120.6, 15.0],
    ],
    affectedProvinces: ["Nueva Ecija", "Nueva Vizcaya", "Pangasinan"],
    lastMajorEvent: "1990 Luzon Earthquake (M7.8)",
    maxHistoricalMagnitude: 7.8,
  },
];

// Get fault lines near a location
export function getFaultLinesNearLocation(
  latitude: number,
  longitude: number,
  radiusKm: number = 100
): FaultLine[] {
  return philippineFaultLines.filter(fault => {
    // Check if any point in the fault line is within radius
    return fault.coordinates.some(([lng, lat]) => {
      const distance = getDistanceFromLatLonInKm(latitude, longitude, lat, lng);
      return distance <= radiusKm;
    });
  });
}

// Get minimum distance to a fault line
export function getDistanceToFault(
  latitude: number,
  longitude: number,
  fault: FaultLine
): number {
  let minDistance = Infinity;
  
  for (let i = 0; i < fault.coordinates.length - 1; i++) {
    const [lng1, lat1] = fault.coordinates[i];
    const [lng2, lat2] = fault.coordinates[i + 1];
    
    // Calculate distance to line segment
    const distance = distanceToLineSegment(latitude, longitude, lat1, lng1, lat2, lng2);
    minDistance = Math.min(minDistance, distance);
  }
  
  return minDistance;
}

// Distance from point to line segment
function distanceToLineSegment(
  pLat: number, pLng: number,
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const dx = lng2 - lng1;
  const dy = lat2 - lat1;
  const t = Math.max(0, Math.min(1, ((pLng - lng1) * dx + (pLat - lat1) * dy) / (dx * dx + dy * dy)));
  const nearestLng = lng1 + t * dx;
  const nearestLat = lat1 + t * dy;
  return getDistanceFromLatLonInKm(pLat, pLng, nearestLat, nearestLng);
}

// Haversine formula
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

// Calculate seismic risk level for a location
export function calculateSeismicRisk(latitude: number, longitude: number): {
  level: 'very-high' | 'high' | 'moderate' | 'low';
  score: number;
  nearestFault: FaultLine | null;
  nearestFaultDistance: number;
} {
  let minDistance = Infinity;
  let nearestFault: FaultLine | null = null;
  let totalRiskScore = 0;
  
  for (const fault of philippineFaultLines) {
    const distance = getDistanceToFault(latitude, longitude, fault);
    
    if (distance < minDistance) {
      minDistance = distance;
      nearestFault = fault;
    }
    
    // Add risk score based on proximity to each active fault
    if (fault.type === 'active') {
      const proximityScore = Math.max(0, 100 - distance) / 100;
      const magnitudeWeight = (fault.maxHistoricalMagnitude || 6.0) / 8.0;
      totalRiskScore += proximityScore * magnitudeWeight * 20;
    }
  }
  
  // Add base risk for being in seismically active region
  totalRiskScore += 10;
  
  // Normalize score
  const score = Math.min(100, Math.round(totalRiskScore));
  
  // Determine risk level
  let level: 'very-high' | 'high' | 'moderate' | 'low';
  if (score >= 70) level = 'very-high';
  else if (score >= 50) level = 'high';
  else if (score >= 30) level = 'moderate';
  else level = 'low';
  
  return {
    level,
    score,
    nearestFault,
    nearestFaultDistance: minDistance,
  };
}
