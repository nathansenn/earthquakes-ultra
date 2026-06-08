// ============================================================================
// Eruption forecasting primitives (shared by the Philippine seismic model and
// the global baseline model)
// ============================================================================
//
// Replaces the previous ad-hoc "base rate x multiplier, capped at 65%" scheme
// with a Poisson event model and per-volcano baseline rates.
//
// References:
//   - Poisson / renewal eruption models: Bebbington & Lai (1996); Marzocchi &
//     Bebbington (2012); Poland (2020), JGR Solid Earth.
//   - Baseline rates: Smithsonian Global Volcanism Program (volcano.si.edu)
//     per-volcano confirmed-eruption frequencies.
//   - PHIVOLCS Volcano Alert Level System (alert level -> indicative
//     near-term eruption likelihood mapping).
//   - Magnitude of completeness (Mc): Wiemer & Wyss (2000) maximum-curvature.
// ============================================================================

import { Volcano } from '@/data/philippine-volcanoes';
import { GlobalVolcano } from '@/data/global-volcanoes';
import { PH_ERUPTION_HISTORY } from '@/data/eruption-history';

export const CURRENT_YEAR = 2026;

export type RiskLevel =
  | 'BACKGROUND' | 'LOW' | 'MODERATE' | 'ELEVATED' | 'HIGH' | 'VERY_HIGH' | 'CRITICAL';

// 1-year probability -> categorical risk level
export const RISK_THRESHOLDS: { level: RiskLevel; min: number }[] = [
  { level: 'CRITICAL', min: 0.50 },
  { level: 'VERY_HIGH', min: 0.35 },
  { level: 'HIGH', min: 0.20 },
  { level: 'ELEVATED', min: 0.10 },
  { level: 'MODERATE', min: 0.05 },
  { level: 'LOW', min: 0.02 },
  { level: 'BACKGROUND', min: 0 },
];

export function riskLevelFromProbability(p1Year: number): RiskLevel {
  for (const { level, min } of RISK_THRESHOLDS) {
    if (p1Year >= min) return level;
  }
  return 'BACKGROUND';
}

// ----------------------------------------------------------------------------
// Poisson event model
// ----------------------------------------------------------------------------

/**
 * Probability of at least one eruption within `years`, given an annual rate λ,
 * under a homogeneous Poisson process: P = 1 - exp(-λ·t).
 * Capped at 0.98 — a statistical model should never claim certainty.
 */
export function poissonProbability(annualRate: number, years: number): number {
  if (annualRate <= 0 || years <= 0) return 0;
  return Math.min(1 - Math.exp(-annualRate * years), 0.98);
}

// ----------------------------------------------------------------------------
// Year parsing (handles "2024", "1991", "1450 BCE", "Holocene", "Unknown")
// ----------------------------------------------------------------------------

export function parseEruptionYear(value: string | null | undefined): number | null {
  if (!value) return null;
  const v = value.trim();
  const m = v.match(/(-?\d{1,5})/);
  if (!m) return null; // "Holocene", "Unknown", etc.
  let year = parseInt(m[1], 10);
  // Negative value or an explicit BCE/BC marker → before the common era.
  if (year < 0 || /bce|bc\b/i.test(v)) year = -Math.abs(year);
  return year;
}

// ----------------------------------------------------------------------------
// PHIVOLCS Volcano Alert Level -> eruption likelihood
// ----------------------------------------------------------------------------
//
// The alert level is the authoritative observed-unrest signal and is the
// strongest near-term predictor available. We map it to (a) a multiplier on the
// long-run baseline rate and (b) probability floors reflecting PHIVOLCS's
// expert near-term assessment (e.g. AL3 = "hazardous eruption possible within
// days to weeks"). The final probability is max(model, floor).

// Modest multipliers (deliberately smaller than the old scheme) so that a
// frequently-erupting volcano at a *low* alert level isn't pushed to CRITICAL by
// the alert factor alone — the floors below carry the alert-implied minimum.
export function alertLevelRateFactor(level: number): number {
  switch (level) {
    case 5: return 150;  // hazardous eruption in progress
    case 4: return 40;   // imminent (days)
    case 3: return 12;   // possible within weeks
    case 2: return 4;    // increasing / probable magmatic unrest
    case 1: return 1.5;  // low-level unrest
    default: return 1;   // AL0 — normal
  }
}

/** Indicative probability floors [30-day, 1-year] by alert level. */
export function alertLevelFloors(level: number): { p30: number; p1y: number } {
  switch (level) {
    case 5: return { p30: 0.95, p1y: 0.99 };
    case 4: return { p30: 0.60, p1y: 0.92 };
    case 3: return { p30: 0.35, p1y: 0.70 };
    case 2: return { p30: 0.08, p1y: 0.30 };
    case 1: return { p30: 0.02, p1y: 0.08 };
    default: return { p30: 0, p1y: 0 };
  }
}

// ----------------------------------------------------------------------------
// Baseline annual eruption rate (per volcano)
// ----------------------------------------------------------------------------

const MIN_RATE = 0.0008; // ~1 per 1,250 yr floor
const MAX_RATE = 0.5;    // ~1 per 2 yr ceiling

function clampRate(r: number): number {
  return Math.max(MIN_RATE, Math.min(MAX_RATE, r));
}

/**
 * Philippine volcano baseline rate.
 * Prefers the GVP eruption frequency (count / record length); otherwise a
 * status + recency prior so under-documented volcanoes degrade gracefully.
 */
export function philippineBaseAnnualRate(volcano: Volcano): number {
  const rec = PH_ERUPTION_HISTORY[volcano.name];

  if (rec?.historicalEruptions && rec.recordStartYear) {
    const span = Math.max(CURRENT_YEAR - rec.recordStartYear, 30);
    return clampRate(rec.historicalEruptions / span);
  }

  const lastYear = rec?.lastEruptionYear ?? parseEruptionYear(volcano.lastEruption);
  const yearsSince = lastYear != null && lastYear <= CURRENT_YEAR ? CURRENT_YEAR - lastYear : Infinity;

  let rate =
    volcano.status === 'active' ? 0.01 :
    volcano.status === 'potentially_active' ? 0.0025 : 0.001;

  if (yearsSince <= 100) rate *= 2;       // erupted in the last century
  if (volcano.hydrothermalActivity >= 3) rate *= 1.3; // vigorous open system

  return clampRate(rate);
}

/**
 * Global volcano baseline rate from status, recency of last eruption and VEI.
 * Coarser than the Philippine model (no per-volcano eruption counts or live
 * seismicity), so its confidence is reported as lower.
 */
export function globalBaseAnnualRate(volcano: GlobalVolcano): number {
  const lastYear = parseEruptionYear(volcano.lastEruption);
  const yearsSince = lastYear != null && lastYear <= CURRENT_YEAR ? CURRENT_YEAR - lastYear : Infinity;

  let rate =
    volcano.status === 'active' ? 0.015 :
    volcano.status === 'potentially_active' ? 0.003 :
    volcano.status === 'historical' ? 0.005 : 0.0008; // 'holocene'

  // Recency of last eruption is the strongest available activity proxy.
  if (yearsSince <= 2) rate *= 12;
  else if (yearsSince <= 10) rate *= 5;
  else if (yearsSince <= 30) rate *= 2.5;
  else if (yearsSince <= 100) rate *= 1.3;
  else if (yearsSince > 1000) rate *= 0.6;

  // Larger eruptions recur less often.
  if ((volcano.vei ?? 0) >= 5) rate *= 0.7;

  return clampRate(rate);
}

// ----------------------------------------------------------------------------
// Global volcano assessment (baseline only — no live seismic feed)
// ----------------------------------------------------------------------------

export interface GlobalVolcanoAssessment {
  baseAnnualRate: number;
  recurrenceYears: number;
  probability30Day: number;   // percent
  probability1Year: number;   // percent
  riskLevel: RiskLevel;
  confidence: 'LOW' | 'MEDIUM';
}

export function assessGlobalVolcano(volcano: GlobalVolcano): GlobalVolcanoAssessment {
  const rate = globalBaseAnnualRate(volcano);
  const p1y = poissonProbability(rate, 1);
  const p30 = poissonProbability(rate, 30 / 365.25);
  const lastYear = parseEruptionYear(volcano.lastEruption);

  return {
    baseAnnualRate: rate,
    recurrenceYears: Math.round(1 / rate),
    probability30Day: Math.round(p30 * 1000) / 10,
    probability1Year: Math.round(p1y * 1000) / 10,
    riskLevel: riskLevelFromProbability(p1y),
    // More confident when we have a dated recent eruption to anchor recency.
    confidence: lastYear != null && CURRENT_YEAR - lastYear <= 100 ? 'MEDIUM' : 'LOW',
  };
}

// ----------------------------------------------------------------------------
// Magnitude of completeness (Wiemer & Wyss 2000, maximum curvature)
// ----------------------------------------------------------------------------

/**
 * Estimate Mc as the magnitude bin with the most events (mode of the
 * non-cumulative frequency-magnitude distribution) plus a +0.2 correction.
 * Returns a sensible default when the sample is too small.
 */
export function estimateMc(magnitudes: number[], binWidth = 0.1, fallback = 2.0): number {
  if (magnitudes.length < 20) return fallback;

  const bins = new Map<number, number>();
  for (const m of magnitudes) {
    const bin = Math.round(m / binWidth) * binWidth;
    bins.set(bin, (bins.get(bin) ?? 0) + 1);
  }

  let modeBin = fallback;
  let modeCount = -1;
  for (const [bin, count] of bins) {
    if (count > modeCount) {
      modeCount = count;
      modeBin = bin;
    }
  }

  return Math.round((modeBin + 0.2) * 10) / 10;
}
