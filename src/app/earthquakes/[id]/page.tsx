import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getEarthquakeById,
  getNearbyEarthquakes,
  getSignificantEarthquakeIds,
} from "@/lib/db-queries";
import { fetchUSGSEventById, getMagnitudeIntensity } from "@/lib/usgs-api";
import { haversineKm, bearing, energyTNTLabel } from "@/lib/geo";
import { calculateSeismicRisk } from "@/data/fault-lines";
import { PHILIPPINE_VOLCANOES, volcanoNameToSlug } from "@/data/philippine-volcanoes";
import { philippineCities } from "@/data/philippine-cities";

export const revalidate = 3600;
export const dynamicParams = true;

interface PageProps {
  params: Promise<{ id: string }>;
}

interface EventData {
  id: string;
  magnitude: number;
  magnitudeType: string;
  place: string;
  time: Date;
  latitude: number;
  longitude: number;
  depth: number;
  url: string | null;
  felt: number | null;
  tsunami: boolean;
  source: string;
  region: string | null;
}

async function resolveEvent(id: string): Promise<EventData | null> {
  const db = getEarthquakeById(id);
  if (db) {
    return {
      id: db.id, magnitude: db.magnitude, magnitudeType: db.magnitudeType, place: db.place,
      time: db.time, latitude: db.latitude, longitude: db.longitude, depth: db.depth,
      url: db.url, felt: db.felt, tsunami: db.tsunami, source: db.source, region: db.region,
    };
  }
  // Fallback: resolve USGS-sourced ids that aren't in the local snapshot.
  const live = await fetchUSGSEventById(id);
  if (live) {
    return {
      id, magnitude: live.magnitude, magnitudeType: live.magnitudeType, place: live.place,
      time: live.time, latitude: live.latitude, longitude: live.longitude, depth: live.depth,
      url: live.url, felt: live.felt, tsunami: live.tsunami, source: 'usgs', region: null,
    };
  }
  return null;
}

// Pre-render the most significant recent events; the rest render on demand (ISR).
export async function generateStaticParams() {
  return getSignificantEarthquakeIds().map((id) => ({ id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const eq = await resolveEvent(decodeURIComponent(id));
  if (!eq) return { title: "Earthquake Not Found | QuakeGlobe" };
  const dateStr = eq.time.toLocaleDateString("en-PH", { timeZone: "Asia/Manila", year: "numeric", month: "short", day: "numeric" });
  return {
    title: `M${eq.magnitude.toFixed(1)} Earthquake — ${eq.place} (${dateStr})`,
    description: `Magnitude ${eq.magnitude.toFixed(1)} ${getMagnitudeIntensity(eq.magnitude).toLowerCase()} earthquake near ${eq.place} on ${dateStr}, ${eq.depth.toFixed(0)} km deep. Energy, intensity, nearby faults, volcanoes, cities and related earthquakes.`,
  };
}

const magColor = (m: number) =>
  m >= 7 ? "#b91c1c" : m >= 6 ? "#ef4444" : m >= 5 ? "#f97316" : m >= 4 ? "#facc15" : m >= 2.5 ? "#84cc16" : "#22c55e";

const INTENSITY_NOTE: Record<string, string> = {
  Minor: "Generally not felt, but recorded by seismographs.",
  Light: "Often felt, but rarely causes damage.",
  Moderate: "Felt widely; can cause minor damage to weak structures.",
  Strong: "Can cause damage to buildings and infrastructure near the epicentre.",
  Major: "Can cause serious damage over larger areas.",
  Great: "Can cause severe, widespread destruction and loss of life.",
  Extreme: "Among the largest earthquakes ever recorded.",
};

function Fact({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
      <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">{value}</p>
      {sub && <p className="text-xs text-gray-500 dark:text-gray-400">{sub}</p>}
    </div>
  );
}

export default async function EarthquakeDetailPage({ params }: PageProps) {
  const { id } = await params;
  const eq = await resolveEvent(decodeURIComponent(id));
  if (!eq) notFound();

  const intensity = getMagnitudeIntensity(eq.magnitude);
  const color = magColor(eq.magnitude);
  const depthClass = eq.depth < 70 ? "Shallow" : eq.depth < 300 ? "Intermediate" : "Deep";

  // Related, linkable data ---------------------------------------------------
  const risk = calculateSeismicRisk(eq.latitude, eq.longitude);
  const nearbyVolcanoes = PHILIPPINE_VOLCANOES
    .map((v) => ({ v, d: haversineKm(eq.latitude, eq.longitude, v.latitude, v.longitude) }))
    .filter((x) => x.d <= 200)
    .sort((a, b) => a.d - b.d)
    .slice(0, 5);
  const nearbyCities = philippineCities
    .map((c) => ({ c, d: haversineKm(eq.latitude, eq.longitude, c.latitude, c.longitude) }))
    .filter((x) => x.d <= 350)
    .sort((a, b) => a.d - b.d)
    .slice(0, 6);
  const related = getNearbyEarthquakes(eq.latitude, eq.longitude, { excludeId: eq.id, radiusKm: 200, days: 120, limit: 8 });

  const pht = eq.time.toLocaleString("en-PH", { timeZone: "Asia/Manila", dateStyle: "full", timeStyle: "short" });
  const utc = eq.time.toISOString().replace("T", " ").slice(0, 16) + " UTC";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero */}
      <section className="text-white" style={{ background: `linear-gradient(135deg, ${color}, #111827)` }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <nav className="flex items-center gap-2 text-sm text-white/70 mb-4 flex-wrap">
            <Link href="/" className="hover:text-white">Home</Link><span>/</span>
            <Link href="/earthquakes" className="hover:text-white">Earthquakes</Link><span>/</span>
            <span className="text-white">M{eq.magnitude.toFixed(1)}</span>
          </nav>
          <div className="flex items-start gap-5">
            <div className="shrink-0 w-24 h-24 rounded-2xl bg-white/15 backdrop-blur flex flex-col items-center justify-center">
              <span className="text-4xl font-bold tabular-nums">{eq.magnitude.toFixed(1)}</span>
              <span className="text-[11px] uppercase opacity-80">{eq.magnitudeType}</span>
            </div>
            <div className="min-w-0">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-semibold mb-2">
                {intensity} · {depthClass} ({eq.depth.toFixed(0)} km)
              </span>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{eq.place}</h1>
              <p className="mt-1 text-white/80 text-sm">{pht}</p>
              <p className="text-white/60 text-xs">{utc} · {eq.latitude.toFixed(3)}°, {eq.longitude.toFixed(3)}°</p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Key facts */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <Fact label="Magnitude" value={`${eq.magnitude.toFixed(1)} ${eq.magnitudeType}`} sub={intensity} />
          <Fact label="Depth" value={`${eq.depth.toFixed(1)} km`} sub={depthClass} />
          <Fact label="Energy" value={energyTNTLabel(eq.magnitude)} sub="Gutenberg–Richter" />
          <Fact label="Coordinates" value={`${eq.latitude.toFixed(3)}°, ${eq.longitude.toFixed(3)}°`} />
          <Fact label="Felt reports" value={eq.felt != null ? eq.felt.toLocaleString() : "—"} sub={eq.felt ? '“Did You Feel It?”' : undefined} />
          <Fact label="Tsunami" value={eq.tsunami ? "Flagged" : "No"} />
          <Fact label="Source" value={eq.source.toUpperCase()} />
          <Fact label="Region" value={eq.region ?? "—"} />
        </div>

        {/* What it means */}
        <section className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-2">What an M{eq.magnitude.toFixed(1)} ({intensity}) earthquake means</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">{INTENSITY_NOTE[intensity]}</p>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
            At {eq.depth.toFixed(0)} km this was a <strong>{depthClass.toLowerCase()}</strong> earthquake.
            {eq.depth < 70 ? " Shallow quakes concentrate shaking near the epicentre and tend to be the most damaging." :
              eq.depth < 300 ? " Intermediate-depth quakes spread shaking over a wider area but are usually less destructive at the surface." :
                " Deep quakes are felt over very large areas but rarely cause surface damage."}
          </p>
        </section>

        {/* Related data — all linked */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tectonic context */}
          <section className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-3">🗺️ Tectonic setting</h2>
            {risk.nearestFault && (
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Nearest mapped structure: <strong>{risk.nearestFault.name}</strong> (~{risk.nearestFaultDistance.toFixed(0)} km away).
                {risk.nearestFault.lastMajorEvent && ` Last major event: ${risk.nearestFault.lastMajorEvent}.`}
              </p>
            )}
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Area seismic-hazard score: <strong className="text-gray-700 dark:text-gray-200">{risk.score}/100</strong>{" "}
              (<span className="capitalize">{risk.level.replace("-", " ")}</span>).
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-sm">
              <a href={eq.url ?? `https://earthquake.usgs.gov/`} target="_blank" rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600">
                {eq.source.toUpperCase()} event page ↗
              </a>
              <Link href="/map" className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600">
                View on live map
              </Link>
            </div>
          </section>

          {/* Nearby volcanoes */}
          <section className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-3">🌋 Nearby volcanoes</h2>
            {nearbyVolcanoes.length > 0 ? (
              <ul className="space-y-2">
                {nearbyVolcanoes.map(({ v, d }) => (
                  <li key={v.id}>
                    <Link href={`/volcanoes/${volcanoNameToSlug(v.name)}`}
                      className="flex items-center justify-between gap-2 text-sm group">
                      <span className="text-gray-700 dark:text-gray-200 group-hover:text-red-600 dark:group-hover:text-red-400">{v.name}</span>
                      <span className="text-gray-400 shrink-0">{d.toFixed(0)} km {bearing(v.latitude, v.longitude, eq.latitude, eq.longitude)}{v.alertLevel > 0 ? ` · Alert ${v.alertLevel}` : ""}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : <p className="text-sm text-gray-500 dark:text-gray-400">No monitored volcanoes within 200 km.</p>}
          </section>

          {/* Nearby cities */}
          <section className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-3">🏙️ Nearby cities</h2>
            {nearbyCities.length > 0 ? (
              <ul className="grid grid-cols-2 gap-x-4 gap-y-2">
                {nearbyCities.map(({ c, d }) => (
                  <li key={c.slug}>
                    <Link href={`/philippines/${c.slug}`} className="flex items-center justify-between gap-2 text-sm group">
                      <span className="text-gray-700 dark:text-gray-200 group-hover:text-red-600 dark:group-hover:text-red-400 truncate">{c.name}</span>
                      <span className="text-gray-400 shrink-0">{d.toFixed(0)} km</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : <p className="text-sm text-gray-500 dark:text-gray-400">No major cities within 350 km.</p>}
          </section>

          {/* Related earthquakes */}
          <section className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-3">📈 Related earthquakes (within 200 km)</h2>
            {related.length > 0 ? (
              <ul className="space-y-1.5">
                {related.map((r) => (
                  <li key={r.id}>
                    <Link href={`/earthquakes/${encodeURIComponent(r.id)}`} className="flex items-center gap-3 text-sm group">
                      <span className="w-9 h-7 shrink-0 rounded grid place-items-center text-white text-xs font-bold" style={{ background: magColor(r.magnitude) }}>
                        {r.magnitude.toFixed(1)}
                      </span>
                      <span className="flex-1 min-w-0 truncate text-gray-700 dark:text-gray-200 group-hover:text-red-600 dark:group-hover:text-red-400">{r.place}</span>
                      <span className="text-gray-400 shrink-0 text-xs">{r.distanceKm.toFixed(0)} km</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : <p className="text-sm text-gray-500 dark:text-gray-400">No other recent earthquakes nearby.</p>}
            <Link href="/earthquakes" className="inline-block mt-3 text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
              Browse all earthquakes →
            </Link>
          </section>
        </div>

        <p className="text-xs text-gray-400 dark:text-gray-500">
          Data from {eq.source.toUpperCase()}. Magnitudes and locations are preliminary and may be revised.
          For official information consult{" "}
          <a href="https://www.phivolcs.dost.gov.ph/" target="_blank" rel="noopener noreferrer" className="hover:underline">PHIVOLCS</a>{" / "}
          <a href="https://earthquake.usgs.gov/" target="_blank" rel="noopener noreferrer" className="hover:underline">USGS</a>.
        </p>
      </div>
    </div>
  );
}
