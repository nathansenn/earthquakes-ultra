"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ProcessedEarthquake, processEarthquake, getMagnitudeColor } from "@/lib/usgs-api";
import { PHILIPPINES_BOUNDS } from "@/lib/usgs-api";

export default function MapPage() {
  const [earthquakes, setEarthquakes] = useState<ProcessedEarthquake[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuake, setSelectedQuake] = useState<ProcessedEarthquake | null>(null);
  const [days, setDays] = useState(7);
  const [minMag, setMinMag] = useState(2.5);

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

  // Convert lat/lng to SVG coordinates
  const latLngToSvg = (lat: number, lng: number) => {
    const minLat = 4;
    const maxLat = 22;
    const minLng = 115;
    const maxLng = 128;

    const x = ((lng - minLng) / (maxLng - minLng)) * 800;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 1000;
    return { x, y };
  };

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
                <option value={2.0} className="text-gray-900">2.0+</option>
                <option value={2.5} className="text-gray-900">2.5+</option>
                <option value={4.0} className="text-gray-900">4.0+</option>
                <option value={5.0} className="text-gray-900">5.0+</option>
              </select>
            </div>
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
                <div className="relative" style={{ paddingBottom: "125%" }}>
                  {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                      <svg className="w-12 h-12 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    </div>
                  ) : (
                    <svg
                      viewBox="0 0 800 1000"
                      className="absolute inset-0 w-full h-full"
                      style={{ background: "linear-gradient(180deg, #1e40af 0%, #3b82f6 100%)" }}
                    >
                      {/* Philippines outline (simplified) */}
                      <g fill="#22c55e" fillOpacity="0.3" stroke="#22c55e" strokeWidth="1">
                        {/* Luzon */}
                        <ellipse cx="320" cy="200" rx="120" ry="150" />
                        {/* Visayas */}
                        <ellipse cx="380" cy="500" rx="100" ry="80" />
                        {/* Mindanao */}
                        <ellipse cx="420" cy="700" rx="130" ry="120" />
                        {/* Palawan */}
                        <ellipse cx="180" cy="450" rx="30" ry="150" transform="rotate(-20 180 450)" />
                      </g>

                      {/* Grid lines */}
                      <g stroke="#ffffff" strokeWidth="0.5" strokeOpacity="0.2">
                        {[116, 118, 120, 122, 124, 126].map((lng) => {
                          const { x } = latLngToSvg(10, lng);
                          return <line key={lng} x1={x} y1="0" x2={x} y2="1000" />;
                        })}
                        {[6, 8, 10, 12, 14, 16, 18, 20].map((lat) => {
                          const { y } = latLngToSvg(lat, 120);
                          return <line key={lat} x1="0" y1={y} x2="800" y2={y} />;
                        })}
                      </g>

                      {/* Earthquake markers */}
                      {earthquakes.map((eq) => {
                        const { x, y } = latLngToSvg(eq.latitude, eq.longitude);
                        const radius = Math.max(4, eq.magnitude * 3);
                        const color = getMagnitudeColor(eq.magnitude);
                        const isSelected = selectedQuake?.id === eq.id;

                        return (
                          <g
                            key={eq.id}
                            onClick={() => setSelectedQuake(eq)}
                            style={{ cursor: "pointer" }}
                          >
                            {/* Pulse animation for selected */}
                            {isSelected && (
                              <circle
                                cx={x}
                                cy={y}
                                r={radius + 10}
                                fill="none"
                                stroke={color}
                                strokeWidth="2"
                                opacity="0.5"
                              >
                                <animate attributeName="r" from={radius} to={radius + 20} dur="1s" repeatCount="indefinite" />
                                <animate attributeName="opacity" from="0.5" to="0" dur="1s" repeatCount="indefinite" />
                              </circle>
                            )}
                            <circle
                              cx={x}
                              cy={y}
                              r={radius}
                              fill={color}
                              fillOpacity="0.8"
                              stroke="#fff"
                              strokeWidth={isSelected ? 3 : 1}
                            />
                          </g>
                        );
                      })}
                    </svg>
                  )}
                </div>

                {/* Legend */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Magnitude Scale</p>
                  <div className="flex flex-wrap gap-3">
                    {[
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
