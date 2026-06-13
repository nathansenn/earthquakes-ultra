"use client";

import { useState } from "react";
import { ProcessedEarthquake } from "@/lib/usgs-api";
import { EarthquakeCard, EarthquakeCardCompact } from "./EarthquakeCard";

interface EarthquakeListProps {
  earthquakes: ProcessedEarthquake[];
  compact?: boolean;
  showDistance?: boolean;
  userLocation?: { latitude: number; longitude: number };
  emptyMessage?: string;
  /** When set, render only this many rows initially behind a "Show all" toggle. */
  initialCount?: number;
}

// Calculate distance between two points
function getDistanceFromLatLonInKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
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

export function EarthquakeList({
  earthquakes,
  compact = false,
  showDistance = false,
  userLocation,
  emptyMessage = "No earthquakes found.",
  initialCount,
}: EarthquakeListProps) {
  const [expanded, setExpanded] = useState(false);

  // De-duplicate by id — multi-source feeds (USGS/EMSC/JMA) can surface the same
  // event twice, which renders a duplicate row and a React "same key" warning.
  const seen = new Set<string>();
  const items = earthquakes.filter((eq) => {
    if (seen.has(eq.id)) return false;
    seen.add(eq.id);
    return true;
  });

  // Cap the initial render so high-volume pages (e.g. a country with thousands
  // of events) don't produce an absurdly tall page.
  const isCapped = initialCount != null && !expanded && items.length > initialCount;
  const visible = isCapped ? items.slice(0, initialCount) : items;

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="mt-4 text-gray-500 dark:text-gray-400">{emptyMessage}</p>
      </div>
    );
  }

  const showAllButton = isCapped ? (
    <button
      onClick={() => setExpanded(true)}
      className="mt-4 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:border-blue-300 dark:hover:border-blue-600 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
    >
      Show all {items.length.toLocaleString()} earthquakes
    </button>
  ) : null;

  if (compact) {
    return (
      <>
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {visible.map((eq) => (
            <EarthquakeCardCompact key={eq.id} earthquake={eq} />
          ))}
        </div>
        {showAllButton}
      </>
    );
  }

  return (
    <div className="space-y-4">
      {visible.map((eq) => {
        const distanceKm =
          showDistance && userLocation
            ? getDistanceFromLatLonInKm(
                userLocation.latitude,
                userLocation.longitude,
                eq.latitude,
                eq.longitude
              )
            : undefined;

        return (
          <EarthquakeCard
            key={eq.id}
            earthquake={eq}
            showDistance={showDistance}
            distanceKm={distanceKm}
          />
        );
      })}
      {showAllButton}
    </div>
  );
}
