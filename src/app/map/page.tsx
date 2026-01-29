"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ProcessedEarthquake, processEarthquake, getMagnitudeColor } from "@/lib/usgs-api";
import { PHILIPPINES_BOUNDS } from "@/lib/usgs-api";
import { EarthquakeMap } from "@/components/map";

export default function MapPage() {
  const [earthquakes, setEarthquakes] = useState<ProcessedEarthquake[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuake, setSelectedQuake] = useState<ProcessedEarthquake | null>(null);
  const [days, setDays] = useState(7);
  const [minMag, setMinMag] = useState(1.0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Set page title
  useEffect(() => {
    document.title = "Live Earthquake Map | Lindol.ph";
  }, []);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const params = new URLSearchParams({
          format: "geojson",
          starttime: startDate.toISOString().split("T")[0],
          endtime: endDate.toISOString().split("T")[0],
          minlatitude: PHILIPPINES_BOUNDS.minLatitude.toString(),
          maxlatitude: PHILIPPINES_BOUNDS.maxLatitude.toString(),
          minlongitude: PHILIPPINES_BOUNDS.minLongitude.toString(),
          maxlongitude: PHILIPPINES_BOUNDS.maxLongitude.toString(),
          minmagnitude: minMag.toString(),
          orderby: "time",
          limit: "500",
        });

        const response = await fetch(
          `https://earthquake.usgs.gov/fdsnws/event/1/query?${params}`
        );
        const data = await response.json();
        const processed = data.features.map(processEarthquake);
        setEarthquakes(processed);
      } catch (error) {
        console.error("Failed to fetch earthquakes:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [days, minMag]);

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Handle escape key to exit fullscreen
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isFullscreen]);

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900">
        {/* Fullscreen header */}
        <div className="absolute top-0 left-0 right-0 z-[1001] bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-gray-900 dark:text-white">
              🗺️ Live Earthquake Map
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {earthquakes.length} earthquakes
            </span>
          </div>
          <div className="flex items-center gap-4">
            {/* Filters */}
            <div className="flex items-center gap-2">
              <select
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 text-sm"
              >
                <option value={1}>24 hours</option>
                <option value={7}>7 days</option>
                <option value={30}>30 days</option>
              </select>
              <select
                value={minMag}
                onChange={(e) => setMinMag(Number(e.target.value))}
                className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 text-sm"
              >
                <option value={1.0}>M1.0+</option>
                <option value={2.0}>M2.0+</option>
                <option value={2.5}>M2.5+</option>
                <option value={4.0}>M4.0+</option>
                <option value={5.0}>M5.0+</option>
              </select>
            </div>
            <button
              onClick={toggleFullscreen}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Fullscreen map */}
        <div className="pt-14 h-full">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <svg className="w-12 h-12 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          ) : (
            <EarthquakeMap
              earthquakes={earthquakes}
              height="100%"
              selectedQuake={selectedQuake}
              onEarthquakeClick={setSelectedQuake}
            />
          )}
        </div>

        {/* Selected quake info (bottom panel) */}
        {selectedQuake && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1001] bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 max-w-md w-[calc(100%-2rem)]">
            <div className="flex items-start gap-3">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0"
                style={{ backgroundColor: getMagnitudeColor(selectedQuake.magnitude) }}
              >
                {selectedQuake.magnitude.toFixed(1)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                  {selectedQuake.place}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedQuake.timeAgo} • {selectedQuake.depth.toFixed(1)} km deep
                </p>
              </div>
              <button
                onClick={() => setSelectedQuake(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Live Earthquake Map</h1>
              <p className="text-blue-100">Real-time seismic activity across the Philippines</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mt-6">
            <div className="flex items-center gap-2">
              <label className="text-sm text-blue-100">Time range:</label>
              <select
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="bg-white/20 text-white border border-white/30 rounded-lg px-3 py-1.5 text-sm"
              >
                <option value={1} className="text-gray-900">24 hours</option>
                <option value={7} className="text-gray-900">7 days</option>
                <option value={30} className="text-gray-900">30 days</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-blue-100">Min magnitude:</label>
              <select
                value={minMag}
                onChange={(e) => setMinMag(Number(e.target.value))}
                className="bg-white/20 text-white border border-white/30 rounded-lg px-3 py-1.5 text-sm"
              >
                <option value={1.0} className="text-gray-900">1.0+</option>
                <option value={2.0} className="text-gray-900">2.0+</option>
                <option value={2.5} className="text-gray-900">2.5+</option>
                <option value={4.0} className="text-gray-900">4.0+</option>
                <option value={5.0} className="text-gray-900">5.0+</option>
              </select>
            </div>
            <button
              onClick={toggleFullscreen}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white border border-white/30 rounded-lg px-3 py-1.5 text-sm transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
              Fullscreen
            </button>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Map */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-lg">
                <div className="relative" style={{ height: "600px" }}>
                  {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                      <svg className="w-12 h-12 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    </div>
                  ) : (
                    <EarthquakeMap
                      earthquakes={earthquakes}
                      height="600px"
                      selectedQuake={selectedQuake}
                      onEarthquakeClick={setSelectedQuake}
                    />
                  )}
                </div>

                {/* Legend */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Magnitude Scale</p>
                  <div className="flex flex-wrap gap-3">
                    {[
                      { mag: "< 2.5", color: "#00ff00" },
                      { mag: "2.5-3.9", color: "#ffff00" },
                      { mag: "4.0-4.9", color: "#ffa500" },
                      { mag: "5.0-5.9", color: "#ff6600" },
                      { mag: "6.0-6.9", color: "#ff0000" },
                      { mag: "7.0+", color: "#990000" },
                    ].map((item) => (
                      <div key={item.mag} className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-xs text-gray-600 dark:text-gray-400">{item.mag}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  {earthquakes.length} Earthquakes
                </h2>

                {selectedQuake ? (
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div
                        className="w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-white"
                        style={{ backgroundColor: getMagnitudeColor(selectedQuake.magnitude) }}
                      >
                        {selectedQuake.magnitude.toFixed(1)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {selectedQuake.place}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {selectedQuake.timeAgo}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                        <p className="text-gray-500 dark:text-gray-400">Depth</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {selectedQuake.depth.toFixed(1)} km
                        </p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                        <p className="text-gray-500 dark:text-gray-400">Intensity</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {selectedQuake.intensity}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      <p>Coordinates: {selectedQuake.latitude.toFixed(4)}°N, {selectedQuake.longitude.toFixed(4)}°E</p>
                      <p>Time: {selectedQuake.time.toLocaleString()}</p>
                    </div>
                    <a
                      href={selectedQuake.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full px-4 py-2 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      View on USGS
                    </a>
                    <button
                      onClick={() => setSelectedQuake(null)}
                      className="w-full px-4 py-2 text-gray-600 dark:text-gray-400 text-center hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                      Clear Selection
                    </button>
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Click on an earthquake marker to see details
                  </p>
                )}
              </div>

              {/* Recent list */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Recent Activity</h3>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {earthquakes.slice(0, 10).map((eq) => (
                    <button
                      key={eq.id}
                      onClick={() => setSelectedQuake(eq)}
                      className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors ${
                        selectedQuake?.id === eq.id
                          ? "bg-blue-50 dark:bg-blue-900/30"
                          : "hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                    >
                      <div
                        className="w-8 h-8 rounded flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                        style={{ backgroundColor: getMagnitudeColor(eq.magnitude) }}
                      >
                        {eq.magnitude.toFixed(1)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {eq.place}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{eq.timeAgo}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <Link
                href="/earthquakes"
                className="block w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-center rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
              >
                View Full List →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
