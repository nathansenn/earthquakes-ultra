// ============================================================================
// Philippine volcano eruption ground-truth (Smithsonian GVP + PHIVOLCS)
// ============================================================================
//
// Curated reference data used to compute *per-volcano* baseline eruption rates
// AND to give the risk model real historical + scientific context (eruption
// style, notable past eruptions, current multi-parameter unrest, references).
// Sources:
//   - Smithsonian Global Volcanism Program (volcano.si.edu) — GVP number,
//     confirmed-eruption counts, earliest/most-recent recorded eruption, VEI.
//   - PHIVOLCS bulletins (2024–2026) — alert level and current unrest signals
//     (SO2 flux, deformation, seismicity, thermal/hydrothermal).
//
// `historicalEruptions` / `recordStartYear` are only populated for volcanoes
// whose eruptive record is well documented (verified against GVP). For the
// remainder, the forecast falls back to a status + recency prior, so missing
// entries degrade gracefully rather than inventing precision we don't have.
// ============================================================================

export interface NotableEruption {
  year: number;
  vei?: number;        // Volcanic Explosivity Index
  note: string;        // impact / style (deaths, PDCs, base surges, etc.)
}

export type UnrestKind = 'so2' | 'deformation' | 'seismicity' | 'thermal' | 'hydrothermal' | 'lahar' | 'other';

export interface UnrestSignal {
  kind: UnrestKind;
  note: string;        // observed signal, e.g. "SO2 1,083–2,747 t/day (elevated)"
}

export interface ScienceRef {
  label: string;
  url: string;
}

export interface EruptionRecord {
  /** Smithsonian GVP volcano number (vn). Omitted when no GVP entry exists. */
  gvpNumber?: number;
  /** Count of confirmed eruptions over the documented record (GVP). */
  historicalEruptions?: number;
  /** First year of the documented eruptive record used for the rate. */
  recordStartYear?: number;
  /** Most recent confirmed eruption year (null = no dated eruption). */
  lastEruptionYear: number | null;

  // --- Historical / scientific context (populated for well-studied volcanoes) ---
  /** Eruption style summary, e.g. "Open-conduit stratovolcano (frequent VEI 1–3)". */
  eruptionStyle?: string;
  /** Most common VEI of historical eruptions. */
  dominantVEI?: number;
  /** Notable past eruptions (impact / style). */
  notableEruptions?: NotableEruption[];
  /** Current multi-parameter unrest signals (PHIVOLCS, as of 2026). */
  recentUnrest?: UnrestSignal[];
  /** Scientific / official references. */
  references?: ScienceRef[];
}

const GVP = (n: number): ScienceRef => ({ label: 'Smithsonian GVP', url: `https://volcano.si.edu/volcano.cfm?vn=${n}` });
const PHIVOLCS: ScienceRef = { label: 'PHIVOLCS bulletins', url: 'https://www.phivolcs.dost.gov.ph/' };

// Keyed by the `name` field in PHILIPPINE_VOLCANOES.
export const PH_ERUPTION_HISTORY: Record<string, EruptionRecord> = {
  // --- Well-documented (rate computed from GVP eruption frequency) ---
  Mayon: {
    gvpNumber: 273030, historicalEruptions: 66, recordStartYear: 1616, lastEruptionYear: 2026,
    eruptionStyle: 'Open-conduit stratovolcano — frequent VEI 1–3 (lava effusion, PDCs (pyroclastic density currents — fast, hot ash-and-gas flows), Strombolian bursts)',
    dominantVEI: 2,
    notableEruptions: [
      { year: 1814, vei: 4, note: 'Cagsawa — ~1,200 deaths, town buried' },
      { year: 1897, vei: 4, note: '11-day eruption, ~400 deaths' },
      { year: 2018, vei: 2, note: 'Lava flows + PDCs, ~90,000 evacuated' },
      { year: 2023, vei: 2, note: 'Effusive eruption, months of PDCs/rockfalls' },
      { year: 2026, vei: 2, note: 'Ongoing — lava, PDCs, Alert Level 3' },
    ],
    recentUnrest: [
      { kind: 'so2', note: 'SO2 averaging 1,083–2,747 t/day (elevated)' },
      { kind: 'seismicity', note: '7–35 volcanic earthquakes/day; 223–364 rockfalls/day' },
      { kind: 'deformation', note: 'Edifice inflated; magma close to the crater' },
      { kind: 'thermal', note: 'Lava effusion + incandescent PDCs at the summit' },
    ],
    references: [GVP(273030), PHIVOLCS],
  },
  Taal: {
    gvpNumber: 273070, historicalEruptions: 39, recordStartYear: 1572, lastEruptionYear: 2022,
    eruptionStyle: 'Caldera/complex — phreatomagmatic (magma–water explosions), base surges (ground-hugging ash clouds); VEI 1–4',
    dominantVEI: 3,
    notableEruptions: [
      { year: 1754, vei: 4, note: '7-month eruption; towns destroyed' },
      { year: 1911, vei: 4, note: 'Base surges — ~1,335 deaths' },
      { year: 1965, vei: 4, note: 'Base surges — ~200 deaths; opened SW flank' },
      { year: 2020, vei: 4, note: 'Phreatomagmatic — ~376,000 evacuated' },
      { year: 2022, vei: 1, note: 'Phreatomagmatic bursts; Alert Level raised' },
    ],
    recentUnrest: [
      { kind: 'so2', note: 'Among the world’s highest volcanic SO2 degassing (often >5,000 t/day)' },
      { kind: 'hydrothermal', note: 'Main Crater Lake hyperacidic; recurrent upwelling/steaming' },
      { kind: 'seismicity', note: 'Periodic volcanic-tremor and low-frequency events' },
    ],
    references: [GVP(273070), PHIVOLCS],
  },
  Canlaon: {
    gvpNumber: 272020, historicalEruptions: 31, recordStartYear: 1866, lastEruptionYear: 2026,
    eruptionStyle: 'Stratovolcano — frequent phreatic (steam-driven), occasional magmatic; VEI 1–3',
    dominantVEI: 2,
    notableEruptions: [
      { year: 1996, vei: 1, note: 'Phreatic — 3 hikers killed near summit' },
      { year: 2016, vei: 1, note: 'Phreatic eruptions, ashfall' },
      { year: 2024, vei: 3, note: 'June & December explosive eruptions; evacuations' },
      { year: 2025, vei: 2, note: 'Repeated explosive eruptions, ashfall' },
      { year: 2026, vei: 2, note: 'Moderately explosive eruption (Feb); Alert Level 2' },
    ],
    recentUnrest: [
      { kind: 'so2', note: 'Elevated SO2 (thousands of t/day during the 2024–26 episode)' },
      { kind: 'deformation', note: 'Probable intrusion of magma at depth' },
      { kind: 'seismicity', note: 'Volcanic earthquakes and tremor; ash emission' },
    ],
    references: [GVP(272020), PHIVOLCS],
  },
  Bulusan: {
    gvpNumber: 273010, historicalEruptions: 25, recordStartYear: 1852, lastEruptionYear: 2025,
    eruptionStyle: 'Stratovolcano — predominantly phreatic (steam-driven); VEI 1–2',
    dominantVEI: 1,
    notableEruptions: [
      { year: 2006, vei: 1, note: 'Phreatic eruptions, ashfall over Sorsogon' },
      { year: 2016, vei: 1, note: 'Series of phreatic eruptions' },
      { year: 2022, vei: 1, note: 'Phreatic eruption; brief Alert Level 1' },
      { year: 2025, vei: 1, note: 'Phreatic eruption (April); ongoing low-level unrest' },
    ],
    recentUnrest: [
      { kind: 'hydrothermal', note: 'Shallow hydrothermal/magmatic/tectonic disturbance near Irosin Caldera' },
      { kind: 'seismicity', note: 'Episodic volcanic earthquakes; shallow source' },
      { kind: 'so2', note: 'Periodic SO2/steam plumes from summit vents' },
    ],
    references: [GVP(273010), PHIVOLCS],
  },
  Pinatubo: {
    gvpNumber: 273083, historicalEruptions: 6, recordStartYear: 1500, lastEruptionYear: 2021,
    eruptionStyle: 'Dacitic stratovolcano/caldera — infrequent but very large (up to VEI 6)',
    dominantVEI: 6,
    notableEruptions: [
      { year: 1500, vei: 5, note: 'Large pre-historic eruption (~500 yr repose before 1991)' },
      { year: 1991, vei: 6, note: '2nd-largest eruption of the 20th century; global cooling ~0.5°C' },
      { year: 2021, vei: 1, note: 'Minor phreatic explosion (Nov)' },
    ],
    recentUnrest: [
      { kind: 'hydrothermal', note: 'Crater lake (Lake Pinatubo) stable; occasional phreatic potential' },
      { kind: 'seismicity', note: 'Background levels; no significant volcanic seismicity' },
    ],
    references: [GVP(273083), PHIVOLCS],
  },
  'Hibok-Hibok': {
    gvpNumber: 271080, lastEruptionYear: 1953,
    eruptionStyle: 'Stratovolcano (lava domes) — VEI 1–3, deadly PDCs (pyroclastic density currents)',
    dominantVEI: 2,
    notableEruptions: [
      { year: 1871, note: 'Dome growth formed Mt. Vulcan' },
      { year: 1951, vei: 3, note: 'Pyroclastic density currents killed ~500–3,000' },
      { year: 1953, vei: 2, note: 'Final eruption of the 1948–53 sequence' },
    ],
    recentUnrest: [
      { kind: 'hydrothermal', note: 'Active solfataras and hot springs; no magmatic unrest' },
    ],
    references: [GVP(271080), PHIVOLCS],
  },

  // --- GVP number verified; rate from status + recency prior ---
  Iraya:                   { gvpNumber: 274060, lastEruptionYear: 1454 },
  'Babuyan Claro':         { gvpNumber: 274030, lastEruptionYear: 1924 },
  'Camiguin de Babuyanes': { gvpNumber: 274010, lastEruptionYear: 1857 },
  Didicas:                 { gvpNumber: 274020, lastEruptionYear: 1978 },
  Cagua:                   { gvpNumber: 273090, lastEruptionYear: 1907 },
  Biliran:                 { gvpNumber: 272080, lastEruptionYear: 1939 },
  Cabalian:                { gvpNumber: 272050, lastEruptionYear: null },
  'Mount Apo':             { gvpNumber: 271030, lastEruptionYear: null },
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
