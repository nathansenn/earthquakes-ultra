"use client";

import Link from "next/link";
import { useState, useMemo, useEffect } from "react";
import { ProcessedEarthquake } from "@/lib/usgs-api";
import { MagnitudeBadge } from "@/components/ui/kit";

type SortField = "magnitude" | "time" | "depth" | "place";
type SortOrder = "asc" | "desc";

interface EarthquakeTableProps {
  earthquakes: ProcessedEarthquake[];
  userLocation?: { latitude: number; longitude: number } | null;
  pageSize?: number;
  // When provided, the table is controlled: it renders the rows in the order the
  // parent already sorted them and reports header clicks back, so there is a
  // single source of truth for sort across the page.
  sortField?: SortField;
  sortOrder?: SortOrder;
  onSort?: (field: SortField) => void;
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

export function EarthquakeTable({
  earthquakes,
  userLocation,
  pageSize = 25,
  sortField: controlledField,
  sortOrder: controlledOrder,
  onSort,
}: EarthquakeTableProps) {
  const controlled = !!onSort;
  const [internalField, setInternalField] = useState<SortField>("time");
  const [internalOrder, setInternalOrder] = useState<SortOrder>("desc");
  const [currentPage, setCurrentPage] = useState(1);

  const sortField = controlled ? controlledField ?? "time" : internalField;
  const sortOrder = controlled ? controlledOrder ?? "desc" : internalOrder;

  // Calculate distances if user location available
  const earthquakesWithDistance = useMemo(() => {
    return earthquakes.map(eq => ({
      ...eq,
      distance: userLocation
        ? getDistanceFromLatLonInKm(
            userLocation.latitude,
            userLocation.longitude,
            eq.latitude,
            eq.longitude
          )
        : undefined,
    }));
  }, [earthquakes, userLocation]);

  // When controlled, the parent has already sorted; only sort here in the
  // uncontrolled fallback.
  const sortedEarthquakes = useMemo(() => {
    if (controlled) return earthquakesWithDistance;
    return [...earthquakesWithDistance].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "magnitude":
          comparison = a.magnitude - b.magnitude;
          break;
        case "time":
          comparison = a.time.getTime() - b.time.getTime();
          break;
        case "depth":
          comparison = a.depth - b.depth;
          break;
        case "place":
          comparison = (a.place || "").localeCompare(b.place || "");
          break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [controlled, earthquakesWithDistance, sortField, sortOrder]);

  // Reset to the first page whenever the order or dataset changes.
  useEffect(() => {
    setCurrentPage(1);
  }, [sortField, sortOrder, earthquakes]);

  // Paginate
  const totalPages = Math.ceil(sortedEarthquakes.length / pageSize);
  const paginatedEarthquakes = sortedEarthquakes.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleSort = (field: SortField) => {
    if (controlled) {
      onSort!(field);
      return;
    }
    if (internalField === field) {
      setInternalOrder(internalOrder === "asc" ? "desc" : "asc");
    } else {
      setInternalField(field);
      setInternalOrder("desc");
    }
    setCurrentPage(1);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    return sortOrder === "asc" ? (
      <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  if (earthquakes.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
        <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="mt-4 text-gray-500 dark:text-gray-400">No earthquakes found for the selected criteria.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Table Container */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort("magnitude")}
                    className="flex items-center gap-1 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider hover:text-red-600 dark:hover:text-red-400"
                  >
                    Mag
                    <SortIcon field="magnitude" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort("place")}
                    className="flex items-center gap-1 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider hover:text-red-600 dark:hover:text-red-400"
                  >
                    Location
                    <SortIcon field="place" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort("time")}
                    className="flex items-center gap-1 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider hover:text-red-600 dark:hover:text-red-400"
                  >
                    Time
                    <SortIcon field="time" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort("depth")}
                    className="flex items-center gap-1 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider hover:text-red-600 dark:hover:text-red-400"
                  >
                    Depth
                    <SortIcon field="depth" />
                  </button>
                </th>
                {userLocation && (
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Distance
                  </th>
                )}
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {paginatedEarthquakes.map((eq) => (
                <tr
                  key={eq.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <MagnitudeBadge magnitude={eq.magnitude} size="sm" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="max-w-xs">
                      <Link
                        href={`/earthquakes/${encodeURIComponent(eq.id)}`}
                        className="text-sm font-medium text-gray-900 dark:text-white truncate block hover:text-red-600 dark:hover:text-red-400 hover:underline"
                      >
                        {eq.place || "Unknown location"}
                      </Link>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {eq.latitude.toFixed(3)}°, {eq.longitude.toFixed(3)}°
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm text-gray-900 dark:text-white">{eq.timeAgo}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {eq.time.toLocaleString()}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-900 dark:text-white tabular-nums">
                      {eq.depth.toFixed(0)} km
                    </span>
                  </td>
                  {userLocation && (
                    <td className="px-4 py-3">
                      {eq.distance !== undefined && (
                        <span className="text-sm font-medium text-red-600 dark:text-red-400 tabular-nums">
                          {eq.distance.toFixed(0)} km
                        </span>
                      )}
                    </td>
                  )}
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/earthquakes/${encodeURIComponent(eq.id)}`}
                      className="inline-flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                    >
                      Details
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing {(currentPage - 1) * pageSize + 1} to{" "}
            {Math.min(currentPage * pageSize, sortedEarthquakes.length)} of{" "}
            {sortedEarthquakes.length} earthquakes
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              First
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Last
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
