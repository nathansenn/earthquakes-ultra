// Shared geospatial helpers (replaces ~8 copy-pasted haversine implementations).

const EARTH_RADIUS_KM = 6371;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Great-circle distance between two lat/lon points, in kilometres. */
export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Compass bearing (e.g. "NE", "SSW") from point 1 to point 2. */
export function bearing(lat1: number, lon1: number, lat2: number, lon2: number): string {
  const dLon = toRad(lon2 - lon1);
  const y = Math.sin(dLon) * Math.cos(toRad(lat2));
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon);
  const deg = (Math.atan2(y, x) * 180) / Math.PI;
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return dirs[Math.round(((deg % 360) + 360) % 360 / 22.5) % 16];
}

/**
 * Seismic energy released, from the Gutenberg–Richter relation
 * log10(E joules) = 1.5·M + 4.8, expressed in tonnes of TNT (1 t TNT = 4.184e9 J).
 */
export function energyTNTtons(magnitude: number): number {
  const joules = Math.pow(10, 1.5 * magnitude + 4.8);
  return joules / 4.184e9;
}

/** Human-readable TNT-equivalent yield (e.g. "55 kilotons of TNT"). */
export function energyTNTLabel(magnitude: number): string {
  const tons = energyTNTtons(magnitude);
  if (tons >= 1e6) return `${(tons / 1e6).toFixed(1)} megatons of TNT`;
  if (tons >= 1e3) return `${(tons / 1e3).toFixed(1)} kilotons of TNT`;
  if (tons >= 1) return `${tons.toFixed(0)} tons of TNT`;
  return `${(tons * 1000).toFixed(0)} kg of TNT`;
}
