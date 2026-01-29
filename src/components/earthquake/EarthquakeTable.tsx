"use client";

import { useState, useMemo } from "react";
import { ProcessedEarthquake, getMagnitudeColor } from "@/lib/usgs-api";

type SortField = "magnitude" | "time" | "depth" | "place";
type SortOrder = "asc" | "desc";

interface EarthquakeTableProps {
  earthquakes: ProcessedEarthquake[];
  userLocation?: { latitude: number; longitude: number } | null;
  pageSize?: number;
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

function getMagnitudeClass(magnitude: number): string {
  if (magnitude < 2.0) return "bg-gray-400 text-white";
  if (magnitude < 3.0) return "bg-green-500 text-white";
  if (magnitude < 4.0) return "bg-yellow-500 text-gray-900";
  if (magnitude < 5.0) return "bg-orange-500 text-white";
  if (magnitude < 6.0) return "bg-orange-600 text-white";
  if (magnitude < 7.0) return "bg-red-600 text-white";
  return "bg-red-800 text-white";
}

export function EarthquakeTable({ 
  earthquakes, 
  userLocation,
  pageSize = 25 
}: EarthquakeTableProps) {
  const [sortField, setSortField] = useState<SortField>("time");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [currentPage, setCurrentPage] = useState(1);

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

  // Sort earthquakes
  const sortedEarthquakes = useMemo(() => {
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
  }, [earthquakesWithDistance, sortField, sortOrder]);

  // Paginate
  const totalPages = Math.ceil(sortedEarthquakes.length / pageSize);
  const paginatedEarthquakes = sortedEarthquakes.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
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
                    <span
                      className={`inline-flex items-center justify-center w-12 h-8 rounded-lg font-bold text-sm ${getMagnitudeClass(eq.magnitude)}`}
                    >
                      {eq.magnitude.toFixed(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="max-w-xs">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {eq.place || "Unknown location"}
                      </p>
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
                    <span className="text-sm text-gray-900 dark:text-white">
                      {eq.depth.toFixed(1)} km
                    </span>
                  </td>
                  {userLocation && (
                    <td className="px-4 py-3">
                      {eq.distance !== undefined && (
                        <span className="text-sm font-medium text-red-600 dark:text-red-400">
                          {eq.distance.toFixed(0)} km
                        </span>
                      )}
                    </td>
                  )}
                  <td className="px-4 py-3 text-right">
                    <a
                      href={eq.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                    >
                      USGS
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
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
