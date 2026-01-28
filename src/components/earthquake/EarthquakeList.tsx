import { ProcessedEarthquake } from "@/lib/usgs-api";
import { EarthquakeCard, EarthquakeCardCompact } from "./EarthquakeCard";

interface EarthquakeListProps {
  earthquakes: ProcessedEarthquake[];
  compact?: boolean;
  showDistance?: boolean;
  userLocation?: { latitude: number; longitude: number };
  emptyMessage?: string;
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
}: EarthquakeListProps) {
  if (earthquakes.length === 0) {
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

  if (compact) {
    return (
      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {earthquakes.map((eq) => (
          <EarthquakeCardCompact key={eq.id} earthquake={eq} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {earthquakes.map((eq) => {
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
    </div>
  );
}
