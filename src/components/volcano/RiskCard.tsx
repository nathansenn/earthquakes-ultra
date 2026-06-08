'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useInView, useCountUp } from './anim';

// ---------------------------------------------------------------------------
// Data shape (built on the server from a RiskAssessment — all serializable)
// ---------------------------------------------------------------------------

export interface FactorRow {
  key: string;
  label: string;
  value: number;   // multiplier applied to the rate
  detail: string;  // one-line evidence the model is reading
  kind: 'alert' | 'seismic' | 'static';
}

export interface TriggerEventRow {
  magnitude: number;
  distanceKm: number;
  model: string;
  decayRemaining: number; // 0..1 of the triggering window left
  daysAgo: number;
}

export interface ClusterRow {
  name: string;
  count: number;
  maxMagnitude: number;
  avgDepth: number;
  isSwarm: boolean;
  isMigrating: boolean;
  migrationDirection: string;
}

export interface RiskCardData {
  id: string;
  name: string;
  province: string;
  region: string;
  type: string;
  status: string;
  slug: string;
  alertLevel: number;
  monitoringStations: number;
  hasHazardMap: boolean;
  riskLevel: string;
  confidence: string;
  p1Year: number;       // percent
  p30Day: number;       // percent
  baseAnnualRate: number;
  effectiveAnnualRate: number;
  recurrenceYears: number;
  alertMultiplier: number;
  seismicMultiplier: number; // product of seismic precursor multipliers
  factors: FactorRow[];
  triggerEvents: TriggerEventRow[];
  bValue: {
    value: number; mc: number; anomaly: string; sampleSize: number;
    stdErr: number; interpretation: string;
  } | null;
  depthMigration: {
    detected: boolean; direction: string; rate: number;
    startDepth: number; currentDepth: number; interpretation: string;
  } | null;
  acceleration: {
    detected: boolean; type: string; rsquared: number; projectedPeak: string | null;
  } | null;
  clusters: ClusterRow[];
  stats: {
    earthquakesAnalyzed: number; m3PlusCount: number; m4PlusCount: number;
    m5PlusCount: number; shallowCount: number; nearFieldCount: number;
    eventRate30Day: number; energyRelease30Day: number;
  };
  scientificNotes: string[];
  guidanceAction: string;
}

// ---------------------------------------------------------------------------
// Visual helpers
// ---------------------------------------------------------------------------

const RISK_STYLE: Record<string, { ring: string; text: string; chip: string; glow: string }> = {
  CRITICAL:   { ring: '#dc2626', text: 'text-red-600 dark:text-red-400',     chip: 'bg-red-600 text-white',      glow: 'shadow-[0_0_0_1px_rgba(220,38,38,.4)]' },
  VERY_HIGH:  { ring: '#ea580c', text: 'text-orange-600 dark:text-orange-400', chip: 'bg-orange-600 text-white',  glow: 'shadow-[0_0_0_1px_rgba(234,88,12,.35)]' },
  HIGH:       { ring: '#f59e0b', text: 'text-amber-600 dark:text-amber-400',  chip: 'bg-amber-500 text-black',    glow: '' },
  ELEVATED:   { ring: '#eab308', text: 'text-yellow-600 dark:text-yellow-400', chip: 'bg-yellow-400 text-black',  glow: '' },
  MODERATE:   { ring: '#84cc16', text: 'text-lime-600 dark:text-lime-400',    chip: 'bg-lime-500 text-white',     glow: '' },
  LOW:        { ring: '#22c55e', text: 'text-green-600 dark:text-green-400',  chip: 'bg-green-500 text-white',    glow: '' },
  BACKGROUND: { ring: '#9ca3af', text: 'text-gray-500 dark:text-gray-400',    chip: 'bg-gray-400 text-white',     glow: '' },
};

const ALERT_DESC: Record<number, string> = {
  0: 'Normal — no significant unrest',
  1: 'Low-level unrest (abnormal)',
  2: 'Increasing / probable magmatic unrest',
  3: 'Magma near surface — hazardous eruption possible within days–weeks',
  4: 'Intense unrest — hazardous eruption imminent',
  5: 'Hazardous eruption in progress',
};

function factorColor(v: number): string {
  if (v >= 8) return 'bg-red-500';
  if (v >= 3) return 'bg-orange-500';
  if (v >= 1.5) return 'bg-amber-400';
  if (v > 1.02) return 'bg-emerald-400';
  return 'bg-gray-300 dark:bg-gray-600';
}

function anomalyChip(anomaly: string): string {
  if (anomaly === 'low') return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300';
  if (anomaly === 'high') return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300';
  return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300';
}

// ---------------------------------------------------------------------------
// Animated probability gauge (SVG ring)
// ---------------------------------------------------------------------------

function Gauge({ pct, p30, inView, color, level }: {
  pct: number; p30: number; inView: boolean; color: string; level: string;
}) {
  const r = 46;
  const C = 2 * Math.PI * r;
  const shown = useCountUp(pct, inView, { duration: 1200, decimals: 1 });
  const offset = inView ? C * (1 - pct / 100) : C;

  return (
    <div className="relative w-32 h-32 shrink-0">
      <svg viewBox="0 0 110 110" className="w-full h-full -rotate-90">
        <circle cx="55" cy="55" r={r} fill="none" strokeWidth="9"
          className="stroke-gray-200 dark:stroke-gray-700" />
        <circle cx="55" cy="55" r={r} fill="none" strokeWidth="9" strokeLinecap="round"
          stroke={color} strokeDasharray={C} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.3s cubic-bezier(.22,1,.36,1)' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-gray-900 dark:text-white tabular-nums">
          {shown.toFixed(1)}%
        </span>
        <span className="text-[10px] uppercase tracking-wide text-gray-400">1-yr</span>
        <span className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
          30-day {p30.toFixed(1)}%
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Factor chain: baseline → ×alert → ×seismic → λ → Poisson → P
// ---------------------------------------------------------------------------

function Chip({ inView, delay, children, tone = 'default' }: {
  inView: boolean; delay: number; children: React.ReactNode;
  tone?: 'default' | 'alert' | 'seismic' | 'result' | 'base';
}) {
  const tones: Record<string, string> = {
    base: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200',
    alert: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300',
    seismic: 'bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300',
    result: 'bg-indigo-600 text-white',
    default: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200',
  };
  return (
    <span
      className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap ${tones[tone]}`}
      style={{
        transition: 'opacity .5s ease, transform .5s ease',
        transitionDelay: `${delay}ms`,
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateX(0)' : 'translateX(-8px)',
      }}
    >
      {children}
    </span>
  );
}

function Arrow({ inView, delay, label }: { inView: boolean; delay: number; label?: string }) {
  return (
    <span className="flex flex-col items-center text-gray-300 dark:text-gray-600"
      style={{ transition: 'opacity .4s', transitionDelay: `${delay}ms`, opacity: inView ? 1 : 0 }}>
      <span className="text-sm leading-none">→</span>
      {label && <span className="text-[9px] text-gray-400 -mt-0.5">{label}</span>}
    </span>
  );
}

function FactorChain({ d, inView }: { d: RiskCardData; inView: boolean }) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap text-xs">
      <Chip inView={inView} delay={0} tone="base">
        Baseline {d.baseAnnualRate.toFixed(3)}/yr
        <span className="opacity-60"> · ~{d.recurrenceYears}y</span>
      </Chip>
      <Arrow inView={inView} delay={120} />
      <Chip inView={inView} delay={180} tone="alert">
        PHIVOLCS AL{d.alertLevel} ×{d.alertMultiplier}
      </Chip>
      <Arrow inView={inView} delay={300} />
      <Chip inView={inView} delay={360} tone="seismic">
        Seismic ×{d.seismicMultiplier}
      </Chip>
      <Arrow inView={inView} delay={480} label="λ" />
      <Chip inView={inView} delay={540} tone="base">
        {d.effectiveAnnualRate.toFixed(2)}/yr
      </Chip>
      <Arrow inView={inView} delay={660} label="Poisson" />
      <Chip inView={inView} delay={720} tone="result">
        P = {d.p1Year}% / yr
      </Chip>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Contribution meters — which inputs move the number, ranked
// ---------------------------------------------------------------------------

function FactorMeters({ factors, inView }: { factors: FactorRow[]; inView: boolean }) {
  const active = factors.filter(f => f.value > 1.02).sort((a, b) => b.value - a.value);
  if (active.length === 0) {
    return (
      <p className="text-xs text-gray-500 dark:text-gray-400">
        No active precursors — probability reflects the long-run baseline rate only.
      </p>
    );
  }
  const maxV = Math.max(...active.map(f => f.value));
  const pct = (v: number) => 10 + (Math.log(v) / Math.log(maxV || Math.E)) * 90;

  return (
    <div className="space-y-2">
      {active.map((f, i) => (
        <div key={f.key}>
          <div className="flex items-baseline justify-between text-xs mb-0.5">
            <span className="font-medium text-gray-700 dark:text-gray-200">
              {f.kind === 'alert' ? '🚨 ' : f.kind === 'static' ? '♨️ ' : '📡 '}{f.label}
            </span>
            <span className="font-mono text-gray-500 dark:text-gray-400">×{f.value}</span>
          </div>
          <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
            <div className={`h-full rounded-full ${factorColor(f.value)}`}
              style={{
                width: inView ? `${pct(f.value)}%` : '0%',
                transition: 'width 1s cubic-bezier(.22,1,.36,1)',
                transitionDelay: `${i * 90}ms`,
              }} />
          </div>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{f.detail}</p>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Evidence sub-panels
// ---------------------------------------------------------------------------

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="text-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800/60">
      <p className="text-base font-bold text-gray-900 dark:text-white tabular-nums">{value}</p>
      <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight">{label}</p>
    </div>
  );
}

function Evidence({ d }: { d: RiskCardData }) {
  return (
    <div className="space-y-5 pt-4">
      {/* PHIVOLCS alert */}
      <div>
        <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1.5">
          🚨 PHIVOLCS Alert Level
        </h4>
        <div className="flex items-center gap-2">
          {[0, 1, 2, 3, 4, 5].map(l => (
            <div key={l}
              className={`flex-1 h-1.5 rounded-full ${l <= d.alertLevel
                ? (d.alertLevel >= 3 ? 'bg-red-500' : d.alertLevel === 2 ? 'bg-orange-400' : 'bg-yellow-400')
                : 'bg-gray-200 dark:bg-gray-700'}`} />
          ))}
          <span className="text-xs font-bold text-gray-700 dark:text-gray-200 ml-1">AL{d.alertLevel}</span>
        </div>
        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">{ALERT_DESC[d.alertLevel]}</p>
      </div>

      {/* Triggering earthquakes */}
      {d.triggerEvents.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1.5">
            ⚡ Triggering earthquakes (Nishimura 2017 / Jenkins 2024)
          </h4>
          <div className="space-y-1.5">
            {d.triggerEvents.map((t, i) => (
              <div key={i} className="flex items-center gap-2 text-[11px]">
                <span className="px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 font-bold">
                  M{t.magnitude.toFixed(1)}
                </span>
                <span className="text-gray-600 dark:text-gray-300">{t.distanceKm.toFixed(0)} km</span>
                <span className="text-gray-400">·</span>
                <span className="text-gray-500 dark:text-gray-400">{t.model}</span>
                <span className="text-gray-400">·</span>
                <span className="text-gray-500 dark:text-gray-400">{t.daysAgo}d ago</span>
                <span className="ml-auto flex items-center gap-1">
                  <span className="w-12 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                    <span className="block h-full bg-orange-400" style={{ width: `${Math.round(t.decayRemaining * 100)}%` }} />
                  </span>
                  <span className="text-gray-400">{Math.round(t.decayRemaining * 100)}% window left</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        {/* b-value */}
        {d.bValue && (
          <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/60">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-200">📉 b-value (Gutenberg–Richter)</h4>
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${anomalyChip(d.bValue.anomaly)}`}>{d.bValue.anomaly}</span>
            </div>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {d.bValue.value.toFixed(2)} <span className="text-xs font-normal text-gray-400">± {d.bValue.stdErr.toFixed(2)}</span>
            </p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              Mc {d.bValue.mc.toFixed(1)} · n={d.bValue.sampleSize}
            </p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">{d.bValue.interpretation}</p>
          </div>
        )}

        {/* depth migration */}
        {d.depthMigration && (
          <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/60">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1">
              {d.depthMigration.direction === 'shallowing' ? '⬆️' : d.depthMigration.direction === 'deepening' ? '⬇️' : '↔️'} Depth migration
            </h4>
            {d.depthMigration.detected ? (
              <>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {Math.abs(d.depthMigration.rate).toFixed(2)} <span className="text-xs font-normal text-gray-400">km/day {d.depthMigration.direction}</span>
                </p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  {d.depthMigration.startDepth.toFixed(1)} → {d.depthMigration.currentDepth.toFixed(1)} km
                </p>
              </>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">No coherent migration detected</p>
            )}
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">{d.depthMigration.interpretation}</p>
          </div>
        )}

        {/* acceleration */}
        {d.acceleration && (
          <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/60">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1">📈 Accelerating seismicity (Kilburn)</h4>
            {d.acceleration.detected ? (
              <>
                <p className="text-sm font-bold text-gray-900 dark:text-white capitalize">{d.acceleration.type.replace('_', ' ')}</p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">R² = {d.acceleration.rsquared.toFixed(2)}</p>
                {d.acceleration.projectedPeak && (
                  <p className="text-[11px] text-orange-600 dark:text-orange-400 mt-0.5">Inverse-rate projection: {d.acceleration.projectedPeak}</p>
                )}
              </>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">No acceleration detected</p>
            )}
          </div>
        )}

        {/* clusters */}
        {d.clusters.length > 0 && (
          <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/60">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1.5">🌐 Seismic clusters</h4>
            <div className="space-y-1">
              {d.clusters.slice(0, 3).map((c, i) => (
                <div key={i} className="text-[11px] text-gray-600 dark:text-gray-300 flex items-center gap-1.5 flex-wrap">
                  <span className="font-medium">{c.name}</span>
                  <span className="text-gray-400">{c.count} events · M{c.maxMagnitude.toFixed(1)} · {c.avgDepth.toFixed(0)}km</span>
                  {c.isSwarm && <span className="px-1 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">swarm</span>}
                  {c.isMigrating && <span className="px-1 rounded bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300">{c.migrationDirection}</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* catalog stats */}
      <div>
        <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1.5">
          📊 Seismic catalogue (30-day window the model read)
        </h4>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
          <Stat label="analyzed" value={d.stats.earthquakesAnalyzed} />
          <Stat label="M3+" value={d.stats.m3PlusCount} />
          <Stat label="M4+" value={d.stats.m4PlusCount} />
          <Stat label="M5+" value={d.stats.m5PlusCount} />
          <Stat label="<5km deep" value={d.stats.shallowCount} />
          <Stat label="<15km away" value={d.stats.nearFieldCount} />
          <Stat label="ev/day" value={d.stats.eventRate30Day.toFixed(1)} />
        </div>
      </div>

      {/* scientific notes */}
      {d.scientificNotes.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1">🔬 Model notes</h4>
          <ul className="text-[11px] text-gray-500 dark:text-gray-400 space-y-0.5 list-disc list-inside">
            {d.scientificNotes.map((n, i) => <li key={i}>{n}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main card
// ---------------------------------------------------------------------------

export function RiskCard({ data, index = 0 }: { data: RiskCardData; index?: number }) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const high = data.riskLevel === 'CRITICAL' || data.riskLevel === 'VERY_HIGH';
  const [open, setOpen] = useState(false);
  const style = RISK_STYLE[data.riskLevel] ?? RISK_STYLE.BACKGROUND;

  return (
    <div
      ref={ref}
      className={`rounded-2xl border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 overflow-hidden ${style.glow}`}
      style={{
        transition: 'opacity .6s ease, transform .6s ease',
        transitionDelay: `${index * 80}ms`,
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(16px)',
      }}
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start gap-4">
          <Gauge pct={data.p1Year} p30={data.p30Day} inView={inView} color={style.ring} level={data.riskLevel} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">🌋 {data.name}</h3>
              <span className={`relative inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${style.chip}`}>
                {high && (
                  <span className="absolute inset-0 rounded-full animate-ping opacity-60" style={{ background: style.ring }} />
                )}
                <span className="relative">{data.riskLevel.replace('_', ' ')}</span>
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {data.province}{data.province && data.region ? ', ' : ''}{data.region} · {data.type}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              Confidence: <span className="capitalize">{data.confidence.toLowerCase().replace('_', ' ')}</span>
              {' · '}{data.monitoringStations} stations
              {' · '}{data.hasHazardMap ? 'hazard map ✓' : 'no hazard map'}
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-200 mt-2">📋 {data.guidanceAction}</p>
          </div>
        </div>

        {/* Factor chain — exactly how the number is built */}
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700/60">
          <p className="text-[11px] uppercase tracking-wide text-gray-400 mb-2">How this number is built</p>
          <FactorChain d={data} inView={inView} />
        </div>

        {/* Contribution meters */}
        <div className="mt-4">
          <p className="text-[11px] uppercase tracking-wide text-gray-400 mb-2">What&apos;s driving it</p>
          <FactorMeters factors={data.factors} inView={inView} />
        </div>

        {/* Expand / collapse evidence */}
        <button
          onClick={() => setOpen(o => !o)}
          className="mt-4 w-full flex items-center justify-center gap-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 py-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
          aria-expanded={open}
        >
          {open ? 'Hide evidence' : 'Show the evidence the model is reading'}
          <span className={`transition-transform duration-300 ${open ? 'rotate-180' : ''}`}>▾</span>
        </button>
      </div>

      {/* Animated expand region */}
      <div className="grid transition-[grid-template-rows] duration-500 ease-out px-5"
        style={{ gridTemplateRows: open ? '1fr' : '0fr' }}>
        <div className="overflow-hidden">
          <Evidence d={data} />
          <div className="flex justify-end py-4">
            <Link href={`/volcanoes/${data.slug}`}
              className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
              Full volcano profile →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
