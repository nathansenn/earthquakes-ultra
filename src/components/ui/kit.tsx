// Shared, presentational UI kit. Pure (no hooks, no "use client") so it can be
// rendered from both server and client components. Centralizes the magnitude
// color/tier logic that was previously duplicated across EarthquakeCard,
// EarthquakeTable, the home feed and several pages.
import Link from "next/link";
import type { ReactNode } from "react";

// ---------------------------------------------------------------------------
// Magnitude tiers — the single source of truth for how a magnitude maps to a
// label, a badge color and an inline hex (for canvas/map dots). Thresholds
// match getMagnitudeIntensity()/getMagnitudeColor() in lib/usgs-api.ts.
// ---------------------------------------------------------------------------
export interface MagnitudeTier {
  label: string;
  badgeClass: string; // tailwind background + text, readable in light & dark
  hex: string; // for inline styles where a class can't be used (globe/map)
}

export function magnitudeTier(magnitude: number): MagnitudeTier {
  if (magnitude < 2.5) return { label: "Minor", badgeClass: "bg-green-500 text-white", hex: "#22c55e" };
  if (magnitude < 4.0) return { label: "Light", badgeClass: "bg-yellow-500 text-gray-900", hex: "#eab308" };
  if (magnitude < 5.0) return { label: "Moderate", badgeClass: "bg-orange-500 text-white", hex: "#f97316" };
  if (magnitude < 6.0) return { label: "Strong", badgeClass: "bg-orange-600 text-white", hex: "#ea580c" };
  if (magnitude < 7.0) return { label: "Major", badgeClass: "bg-red-600 text-white", hex: "#dc2626" };
  if (magnitude < 8.0) return { label: "Great", badgeClass: "bg-red-800 text-white", hex: "#991b1b" };
  return { label: "Extreme", badgeClass: "bg-red-950 text-white", hex: "#450a0a" };
}

type BadgeSize = "sm" | "md" | "lg";

const BADGE_SIZES: Record<BadgeSize, { box: string; mag: string; type: string }> = {
  sm: { box: "w-12 h-8 rounded-lg", mag: "text-sm font-bold", type: "text-[9px]" },
  md: { box: "w-14 h-14 rounded-xl", mag: "text-xl font-bold", type: "text-[10px]" },
  lg: { box: "w-16 h-16 rounded-xl", mag: "text-2xl font-bold", type: "text-xs" },
};

/**
 * Magnitude badge — colored chip showing M value (and optionally the
 * magnitude type). Uses tabular-nums so columns of values stay aligned.
 */
export function MagnitudeBadge({
  magnitude,
  type,
  size = "md",
  className = "",
}: {
  magnitude: number;
  type?: string;
  size?: BadgeSize;
  className?: string;
}) {
  const tier = magnitudeTier(magnitude);
  const s = BADGE_SIZES[size];
  return (
    <span
      className={`inline-flex flex-col items-center justify-center ${s.box} ${tier.badgeClass} ${className}`}
      title={`Magnitude ${magnitude.toFixed(1)} — ${tier.label}`}
    >
      <span className={`${s.mag} tabular-nums leading-none`}>{magnitude.toFixed(1)}</span>
      {type && size !== "sm" && (
        <span className={`${s.type} uppercase opacity-80 leading-none mt-0.5`}>{type}</span>
      )}
    </span>
  );
}

type BadgeTone = "neutral" | "green" | "yellow" | "orange" | "red" | "blue";

const BADGE_TONES: Record<BadgeTone, string> = {
  neutral: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  green: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  yellow: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  orange: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  red: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  blue: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
};

/** Small pill label. */
export function Badge({
  tone = "neutral",
  children,
  className = "",
}: {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${BADGE_TONES[tone]} ${className}`}>
      {children}
    </span>
  );
}

/** Surface card with consistent border/background. */
export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 ${className}`}>
      {children}
    </div>
  );
}

/** Compact labelled statistic tile. */
export function StatTile({
  value,
  label,
  tone = "neutral",
  className = "",
}: {
  value: ReactNode;
  label: string;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <div className={`rounded-xl p-3 text-center ${BADGE_TONES[tone]} ${className}`}>
      <p className="text-xl md:text-2xl font-bold tabular-nums">{value}</p>
      <p className="text-xs font-medium">{label}</p>
    </div>
  );
}

type ButtonVariant = "primary" | "secondary" | "ghost";

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-blue-600 text-white hover:bg-blue-700",
  secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700",
  ghost: "text-blue-600 dark:text-blue-400 hover:underline",
};

/** Link styled as a button. Keeps CTA styling consistent across pages. */
export function ButtonLink({
  href,
  variant = "primary",
  children,
  className = "",
}: {
  href: string;
  variant?: ButtonVariant;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${BUTTON_VARIANTS[variant]} ${className}`}
    >
      {children}
    </Link>
  );
}
