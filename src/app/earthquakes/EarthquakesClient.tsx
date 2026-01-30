"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
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

// Region options
const REGION_OPTIONS = [
  { value: '', label: 'All Regions' },
  { value: 'philippines', label: '🇵🇭 Philippines' },
  { value: 'japan', label: '🇯🇵 Japan' },
  { value: 'indonesia', label: '🇮🇩 Indonesia' },
  { value: 'newzealand', label: '🇳🇿 New Zealand' },
  { value: 'usa', label: '🇺🇸 United States' },
  { value: 'europe', label: '🇪🇺 Europe' },
  { value: 'chile', label: '🇨🇱 Chile' },
  { value: 'mexico', label: '🇲🇽 Mexico' },
];

// Source options
const SOURCE_OPTIONS = [
  { value: '', label: 'All Sources' },
  { value: 'usgs', label: 'USGS' },
  { value: 'emsc', label: 'EMSC' },
  { value: 'jma', label: 'JMA (Japan)' },
  { value: 'geonet', label: 'GeoNet (NZ)' },
  { value: 'phivolcs', label: 'PHIVOLCS' },
];

// Depth filter options (km)
const DEPTH_OPTIONS = [
  { value: '', label: 'All Depths' },
  { value: 'shallow', label: 'Shallow (<70km)' },
  { value: 'intermediate', label: 'Intermediate (70-300km)' },
  { value: 'deep', label: 'Deep (>300km)' },
];

export function EarthquakesClient({ initialEarthquakes, error }: EarthquakesClientProps) {
  const [earthquakes, setEarthquakes] = useState(initialEarthquakes);
  const [minMagnitude, setMinMagnitude] = useState<MagnitudeFilter>(1);
  const [timeRange, setTimeRange] = useState<TimeRange>("7d");
  const [region, setRegion] = useState('');
  const [source, setSource] = useState('');
  const [depthFilter, setDepthFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [sortBy, setSortBy] = useState<'time' | 'magnitude' | 'depth'>('time');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Fetch data when time range changes to historical
  const fetchHistoricalData = useCallback(async () => {
    const days = getTimeRangeDays(timeRange);
    if (days <= 30) return; // Use initial data for short ranges
    
    setIsLoadingData(true);
    try {
      const params = new URLSearchParams({
        days: days.toString(),
        minmag: minMagnitude.toString(),
        limit: '10000',
      });
      if (region) params.set('region', region);
      if (source) params.set('source', source);
      
      const response = await fetch(`/api/earthquakes?${params}`);
      const data = await response.json();
      
      if (data.success && data.earthquakes) {
        const processed = data.earthquakes.map((eq: any) => ({
          id: eq.id,
          magnitude: eq.magnitude,
          magnitudeType: eq.magnitudeType,
          place: eq.place,
          time: new Date(eq.time),
          timeAgo: getTimeAgo(new Date(eq.time)),
          latitude: eq.latitude,
          longitude: eq.longitude,
          depth: eq.depth,
          url: eq.url,
          felt: eq.felt || null,
          tsunami: eq.tsunami || false,
          alert: null,
          intensity: getMagnitudeIntensity(eq.magnitude),
          significanceScore: Math.round(eq.magnitude * 100),
          source: eq.source,
        }));
        setEarthquakes(processed);
      }
    } catch (err) {
      console.error('Failed to fetch historical data:', err);
    } finally {
      setIsLoadingData(false);
    }
  }, [timeRange, minMagnitude, region, source]);

  // Load historical data when needed
  useEffect(() => {
    const days = getTimeRangeDays(timeRange);
    if (days > 30) {
      fetchHistoricalData();
    } else {
      setEarthquakes(initialEarthquakes);
    }
  }, [timeRange, fetchHistoricalData, initialEarthquakes]);

  // Region bounding boxes for filtering
  const regionBounds: Record<string, { minLat: number; maxLat: number; minLon: number; maxLon: number }> = {
    philippines: { minLat: 4.5, maxLat: 21.5, minLon: 116, maxLon: 127 },
    japan: { minLat: 24, maxLat: 46, minLon: 122, maxLon: 154 },
    indonesia: { minLat: -11, maxLat: 6, minLon: 95, maxLon: 141 },
    newzealand: { minLat: -48, maxLat: -34, minLon: 165, maxLon: 179 },
    usa: { minLat: 24, maxLat: 50, minLon: -125, maxLon: -66 },
    europe: { minLat: 35, maxLat: 72, minLon: -25, maxLon: 45 },
    chile: { minLat: -56, maxLat: -17, minLon: -76, maxLon: -66 },
    mexico: { minLat: 14, maxLat: 33, minLon: -118, maxLon: -86 },
  };

  // Filter earthquakes based on selected criteria
  const filteredEarthquakes = useMemo(() => {
    const now = Date.now();
    const timeRangeDays = getTimeRangeDays(timeRange);
    const cutoffTime = now - timeRangeDays * 24 * 60 * 60 * 1000;

    let filtered = earthquakes.filter(eq => {
      const meetsMinMag = eq.magnitude >= minMagnitude;
      const meetsTimeRange = eq.time.getTime() >= cutoffTime;
      const meetsSearch = !searchQuery || 
        eq.place.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Region filter
      let meetsRegion = true;
      if (region) {
        const bounds = regionBounds[region];
        if (bounds) {
          meetsRegion = eq.latitude >= bounds.minLat && 
                        eq.latitude <= bounds.maxLat && 
                        eq.longitude >= bounds.minLon && 
                        eq.longitude <= bounds.maxLon;
        }
      }
      
      // Source filter
      const meetsSource = !source || (eq as any).source === source.toLowerCase();
      
      // Depth filter
      let meetsDepth = true;
      if (depthFilter) {
        switch (depthFilter) {
          case 'shallow':
            meetsDepth = eq.depth < 70;
            break;
          case 'intermediate':
            meetsDepth = eq.depth >= 70 && eq.depth <= 300;
            break;
          case 'deep':
            meetsDepth = eq.depth > 300;
            break;
        }
      }
      
      return meetsMinMag && meetsTimeRange && meetsSearch && meetsRegion && meetsSource && meetsDepth;
    });

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'time':
          comparison = a.time.getTime() - b.time.getTime();
          break;
        case 'magnitude':
          comparison = a.magnitude - b.magnitude;
          break;
        case 'depth':
          comparison = a.depth - b.depth;
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [earthquakes, minMagnitude, timeRange, searchQuery, region, source, depthFilter, sortBy, sortOrder]);

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
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🌍</span>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Global Earthquake Database</h1>
              <p className="text-blue-100">
                {TIME_RANGE_OPTIONS.find(t => t.value === timeRange)?.label} • M{minMagnitude}+ • Multi-Source Data
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-8">
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-3xl font-bold">{stats.total.toLocaleString()}</p>
              <p className="text-sm text-blue-100">Total</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-3xl font-bold">{stats.last24h.toLocaleString()}</p>
              <p className="text-sm text-blue-100">Last 24h</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-3xl font-bold">{stats.m4Plus.toLocaleString()}</p>
              <p className="text-sm text-blue-100">M4+</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-3xl font-bold">{stats.m5Plus.toLocaleString()}</p>
              <p className="text-sm text-blue-100">M5+</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-3xl font-bold">{stats.avgMagnitude.toFixed(1)}</p>
              <p className="text-sm text-blue-100">Avg Mag</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-3xl font-bold">{stats.maxMagnitude.toFixed(1)}</p>
              <p className="text-sm text-blue-100">Max Mag</p>
            </div>
          </div>
        </div>
      </section>

      {/* Filters Bar */}
      <section className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by location (e.g., California, Tokyo, Manila)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
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
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900/30"
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
                        ? "bg-green-500 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-green-100 dark:hover:bg-green-900/30"
                    }`}
                  >
                    {option.label.replace("Last ", "")}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Second row: Region, Source, Sort */}
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap items-center gap-4">
              {/* Region Filter */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Region:</span>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  {REGION_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              {/* Source Filter */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Source:</span>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  {SOURCE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              {/* Depth Filter */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Depth:</span>
                <select
                  value={depthFilter}
                  onChange={(e) => setDepthFilter(e.target.value)}
                  className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  {DEPTH_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'time' | 'magnitude' | 'depth')}
                  className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  <option value="time">Time</option>
                  <option value="magnitude">Magnitude</option>
                  <option value="depth">Depth</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-2 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  {sortOrder === 'desc' ? '↓' : '↑'}
                </button>
              </div>
            </div>

            {/* View Mode & Actions */}
            <div className="flex items-center gap-3">
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("table")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    viewMode === "table"
                      ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                >
                  📋 Table
                </button>
                <button
                  onClick={() => setViewMode("cards")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    viewMode === "cards"
                      ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                >
                  📇 Cards
                </button>
              </div>

              {!userLocation ? (
                <button
                  onClick={getUserLocation}
                  disabled={isLoadingLocation}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors disabled:opacity-50"
                >
                  📍 {isLoadingLocation ? 'Getting...' : 'My Location'}
                </button>
              ) : (
                <span className="text-sm text-green-600 dark:text-green-400">📍 Location on</span>
              )}

              <Link
                href="/map"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                🗺️ Map
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
              <p className="text-red-800 dark:text-red-200">{error}</p>
            </div>
          ) : isLoadingData ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading historical data...</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">This may take a moment for large date ranges</p>
            </div>
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-gray-600 dark:text-gray-400">
                  Showing <strong>{filteredEarthquakes.length.toLocaleString()}</strong> earthquakes
                  {searchQuery && ` matching "${searchQuery}"`}
                </p>
                {getTimeRangeDays(timeRange) > 365 && (
                  <p className="text-sm text-amber-600 dark:text-amber-400">
                    ⚠️ Historical data: M{Math.max(minMagnitude, getTimeRangeDays(timeRange) > 1825 ? 4 : 2.5)}+ only
                  </p>
                )}
              </div>

              {viewMode === "table" ? (
                <EarthquakeTable 
                  earthquakes={filteredEarthquakes} 
                  userLocation={userLocation}
                  pageSize={50}
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

      {/* Data Sources Info */}
      <section className="py-8 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Data Sources</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p className="font-medium text-gray-900 dark:text-white">USGS</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Global M2.5+, US M1+</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p className="font-medium text-gray-900 dark:text-white">EMSC</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Europe, Asia M1.5+</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p className="font-medium text-gray-900 dark:text-white">JMA</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Japan M1+</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p className="font-medium text-gray-900 dark:text-white">GeoNet</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">New Zealand M1+</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p className="font-medium text-gray-900 dark:text-white">PHIVOLCS</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Philippines M1+</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Helper functions
function getTimeAgo(date: Date): string {
  const now = Date.now();
  const timeDiff = now - date.getTime();
  
  if (timeDiff < 60000) return 'Just now';
  if (timeDiff < 3600000) return `${Math.floor(timeDiff / 60000)}m ago`;
  if (timeDiff < 86400000) return `${Math.floor(timeDiff / 3600000)}h ago`;
  if (timeDiff < 604800000) return `${Math.floor(timeDiff / 86400000)}d ago`;
  if (timeDiff < 2592000000) return `${Math.floor(timeDiff / 604800000)}w ago`;
  if (timeDiff < 31536000000) return `${Math.floor(timeDiff / 2592000000)}mo ago`;
  return `${Math.floor(timeDiff / 31536000000)}y ago`;
}

function getMagnitudeIntensity(magnitude: number): string {
  if (magnitude >= 7) return 'extreme';
  if (magnitude >= 6) return 'severe';
  if (magnitude >= 5) return 'strong';
  if (magnitude >= 4) return 'moderate';
  if (magnitude >= 3) return 'light';
  if (magnitude >= 2) return 'minor';
  return 'micro';
}
