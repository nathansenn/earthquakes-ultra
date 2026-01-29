"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { 
  ProcessedEarthquake, 
  calculateStats,
  TimeRange,
  MagnitudeFilter,
  TIME_RANGE_OPTIONS,
  MAGNITUDE_OPTIONS,
  getTimeRangeDays,
} from "@/lib/usgs-api";
import { EarthquakeTable } from "@/components/earthquake/EarthquakeTable";
import { EarthquakeList } from "@/components/earthquake/EarthquakeList";

interface EarthquakesClientProps {
  initialEarthquakes: ProcessedEarthquake[];
  error: string | null;
}

export function EarthquakesClient({ initialEarthquakes, error }: EarthquakesClientProps) {
  const [minMagnitude, setMinMagnitude] = useState<MagnitudeFilter>(1);
  const [timeRange, setTimeRange] = useState<TimeRange>("7d");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Filter earthquakes based on selected criteria
  const filteredEarthquakes = useMemo(() => {
    const now = Date.now();
    const timeRangeDays = getTimeRangeDays(timeRange);
    const cutoffTime = now - timeRangeDays * 24 * 60 * 60 * 1000;

    return initialEarthquakes.filter(eq => {
      const meetsMinMag = eq.magnitude >= minMagnitude;
      const meetsTimeRange = eq.time.getTime() >= cutoffTime;
      return meetsMinMag && meetsTimeRange;
    });
  }, [initialEarthquakes, minMagnitude, timeRange]);

  // Calculate stats for filtered earthquakes
  const stats = useMemo(() => calculateStats(filteredEarthquakes), [filteredEarthquakes]);

  // Get user location
  const getUserLocation = () => {
    if (!navigator.geolocation) return;
    setIsLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setIsLoadingLocation(false);
      },
      () => {
        setIsLoadingLocation(false);
      }
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <section className="bg-gradient-to-br from-red-600 to-red-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">All Earthquakes</h1>
              <p className="text-red-100">
                {TIME_RANGE_OPTIONS.find(t => t.value === timeRange)?.label} • M{minMagnitude}+ • Philippines
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-8">
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-3xl font-bold">{stats.total}</p>
              <p className="text-sm text-red-100">Total</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-3xl font-bold">{stats.last24h}</p>
              <p className="text-sm text-red-100">Last 24h</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-3xl font-bold">{stats.m4Plus}</p>
              <p className="text-sm text-red-100">M4+</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-3xl font-bold">{stats.m5Plus}</p>
              <p className="text-sm text-red-100">M5+</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-3xl font-bold">{stats.avgMagnitude.toFixed(1)}</p>
              <p className="text-sm text-red-100">Avg Mag</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-3xl font-bold">{stats.maxMagnitude.toFixed(1)}</p>
              <p className="text-sm text-red-100">Max Mag</p>
            </div>
          </div>
        </div>
      </section>

      {/* Filters Bar */}
      <section className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {/* Magnitude Filter */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Magnitude:</span>
              <div className="flex flex-wrap gap-1">
                {MAGNITUDE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setMinMagnitude(option.value)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                      minMagnitude === option.value
                        ? "bg-red-500 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-red-100 dark:hover:bg-red-900/30"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Range Filter */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Time:</span>
              <div className="flex flex-wrap gap-1">
                {TIME_RANGE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setTimeRange(option.value)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                      timeRange === option.value
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                    }`}
                  >
                    {option.label.replace("Last ", "")}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* View Mode Toggle & Location Button */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">View:</span>
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("table")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    viewMode === "table"
                      ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                >
                  Table
                </button>
                <button
                  onClick={() => setViewMode("cards")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    viewMode === "cards"
                      ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                >
                  Cards
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {!userLocation && (
                <button
                  onClick={getUserLocation}
                  disabled={isLoadingLocation}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isLoadingLocation ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Getting location...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Show Distance
                    </>
                  )}
                </button>
              )}
              {userLocation && (
                <span className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Location enabled
                </span>
              )}
              <Link
                href="/map"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                View Map
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Earthquake List/Table */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {error ? (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
              <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-800 dark:text-red-200">{error}</p>
            </div>
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-gray-600 dark:text-gray-400">
                  Showing {filteredEarthquakes.length} earthquakes
                </p>
              </div>

              {viewMode === "table" ? (
                <EarthquakeTable 
                  earthquakes={filteredEarthquakes} 
                  userLocation={userLocation}
                  pageSize={25}
                />
              ) : (
                <EarthquakeList 
                  earthquakes={filteredEarthquakes} 
                  showDistance={!!userLocation}
                  userLocation={userLocation || undefined}
                />
              )}
            </>
          )}
        </div>
      </section>

      {/* Magnitude Guide */}
      <section className="py-12 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Understanding Earthquake Magnitudes
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 text-center">
              <div className="w-10 h-10 bg-gray-400 rounded-lg flex items-center justify-center text-white font-bold mx-auto mb-2">1-2</div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Micro</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Not felt</p>
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 text-center">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold mx-auto mb-2">2-3</div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Minor</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Rarely felt</p>
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 text-center">
              <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center text-gray-900 font-bold mx-auto mb-2">3-4</div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Light</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Often felt</p>
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 text-center">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold mx-auto mb-2">4-5</div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Moderate</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Minor damage</p>
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 text-center">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold mx-auto mb-2">5-6</div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Strong</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Damaging</p>
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 text-center">
              <div className="w-10 h-10 bg-red-800 rounded-lg flex items-center justify-center text-white font-bold mx-auto mb-2">6+</div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Major</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Destructive</p>
            </div>
          </div>
          <div className="mt-6 text-center">
            <Link
              href="/preparedness"
              className="text-red-600 dark:text-red-400 hover:underline font-medium"
            >
              Learn how to prepare for earthquakes →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
