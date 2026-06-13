/** Magnitude → hex color for the globe/ticker visuals (shared palette). */
export function getMagnitudeColor(magnitude: number): string {
  if (magnitude >= 7) return "#b91c1c"; // major
  if (magnitude >= 6) return "#ef4444"; // strong
  if (magnitude >= 5) return "#f97316"; // moderate
  if (magnitude >= 4) return "#facc15"; // light
  return "#4ade80"; // minor
}
