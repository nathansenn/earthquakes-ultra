// ============================================================================
// Philippine volcano eruption ground-truth (Smithsonian GVP + PHIVOLCS)
// ============================================================================
//
// Curated reference data used to compute *per-volcano* baseline eruption rates
// instead of crude status buckets. Sources:
//   - Smithsonian Global Volcanism Program (volcano.si.edu) — GVP volcano number,
//     confirmed-eruption counts, and earliest/most-recent recorded eruption.
//   - PHIVOLCS bulletins — current alert level and recent activity.
//
// `historicalEruptions` / `recordStartYear` are only populated for volcanoes
// whose eruptive record is well documented (verified against GVP). For the
// remainder, the forecast falls back to a status + recency prior, so missing
// entries degrade gracefully rather than inventing precision we don't have.
//
// GVP numbers verified against the GVP Philippines country list (June 2026).
// The legacy ids in philippine-volcanoes.ts were largely placeholders; use
// `gvpNumber` here for any link to volcano.si.edu.
// ============================================================================

export interface EruptionRecord {
  /** Smithsonian GVP volcano number (vn). Omitted when no GVP entry exists. */
  gvpNumber?: number;
  /** Count of confirmed eruptions over the documented record (GVP). */
  historicalEruptions?: number;
  /** First year of the documented eruptive record used for the rate. */
  recordStartYear?: number;
  /** Most recent confirmed eruption year (null = no dated eruption). */
  lastEruptionYear: number | null;
}

// Keyed by the `name` field in PHILIPPINE_VOLCANOES.
export const PH_ERUPTION_HISTORY: Record<string, EruptionRecord> = {
  // --- Well-documented (rate computed from GVP eruption frequency) ---
  Mayon:    { gvpNumber: 273030, historicalEruptions: 66, recordStartYear: 1616, lastEruptionYear: 2026 },
  Taal:     { gvpNumber: 273070, historicalEruptions: 39, recordStartYear: 1572, lastEruptionYear: 2022 },
  Canlaon:  { gvpNumber: 272020, historicalEruptions: 31, recordStartYear: 1866, lastEruptionYear: 2026 },
  Bulusan:  { gvpNumber: 273010, historicalEruptions: 25, recordStartYear: 1852, lastEruptionYear: 2025 },
  Pinatubo: { gvpNumber: 273083, historicalEruptions: 6,  recordStartYear: 1500, lastEruptionYear: 2021 },

  // --- GVP number verified; rate from status + recency prior ---
  Iraya:                   { gvpNumber: 274060, lastEruptionYear: 1454 },
  'Babuyan Claro':         { gvpNumber: 274030, lastEruptionYear: 1924 },
  'Camiguin de Babuyanes': { gvpNumber: 274010, lastEruptionYear: 1857 },
  Didicas:                 { gvpNumber: 274020, lastEruptionYear: 1978 },
  Cagua:                   { gvpNumber: 273090, lastEruptionYear: 1907 },
  Biliran:                 { gvpNumber: 272080, lastEruptionYear: 1939 },
  Cabalian:                { gvpNumber: 272050, lastEruptionYear: null },
  'Mount Apo':             { gvpNumber: 271030, lastEruptionYear: null },
  'Hibok-Hibok':           { gvpNumber: 271080, lastEruptionYear: 1953 },
  Musuan:                  { gvpNumber: 271070, lastEruptionYear: 1887 },
  Matutum:                 { gvpNumber: 271020, lastEruptionYear: null },
  Parker:                  { gvpNumber: 271011, lastEruptionYear: 1641 },
  Ragang:                  { gvpNumber: 271060, lastEruptionYear: 1916 },
  Makaturing:              { gvpNumber: 271040, lastEruptionYear: 1882 },
  'Leonard Kniaseff':      { gvpNumber: 271031, lastEruptionYear: 1897 },

  // --- Not in the GVP Holocene list (no reliable GVP link) ---
  Smith:          { lastEruptionYear: 1924 },
  'Bud Dajo':     { lastEruptionYear: null },
  'Mount Talomo': { lastEruptionYear: null },
};

export function getEruptionRecord(name: string): EruptionRecord | undefined {
  return PH_ERUPTION_HISTORY[name];
}
