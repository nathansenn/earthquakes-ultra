"use client";

import { useState, useEffect, useCallback } from "react";
import { ProcessedEarthquake, processEarthquake } from "@/lib/usgs-api";
import { EarthquakeCard } from "@/components/earthquake/EarthquakeCard";
import { getDistanceFromLatLonInKm } from "@/data/philippine-cities";

interface EarthquakeWithDistance extends ProcessedEarthquake {
  distanceKm: number;
}

export default function NearMePage() {
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [earthquakes, setEarthquakes] = useState<EarthquakeWithDistance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationStatus, setLocationStatus] = useState<
    "idle" | "requesting" | "granted" | "denied"
  >("idle");
  const [radiusKm, setRadiusKm] = useState(300);
  const [minMag, setMinMag] = useState(1.0);

  // Set page title
  useEffect(() => {
    document.title = "Earthquakes Near Me | Lindol.ph";
  }, []);

  const fetchNearbyEarthquakes = useCallback(
    async (lat: number, lng: number) => {
      setLoading(true);
      setError(null);

      try {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);

        const params = new URLSearchParams({
          format: "geojson",
          starttime: startDate.toISOString().split("T")[0],
          endtime: endDate.toISOString().split("T")[0],
          latitude: lat.toString(),
          longitude: lng.toString(),
          maxradiuskm: radiusKm.toString(),
          minmagnitude: minMag.toString(),
          orderby: "time",
          limit: "500",
        });

        const response = await fetch(
          `https://earthquake.usgs.gov/fdsnws/event/1/query?${params}`
        );
        const data = await response.json();

        const processedQuakes: EarthquakeWithDistance[] = data.features.map(
          (eq: Parameters<typeof processEarthquake>[0]) => {
            const processed = processEarthquake(eq);
            const distanceKm = getDistanceFromLatLonInKm(
              lat,
              lng,
              processed.latitude,
              processed.longitude
            );
            return { ...processed, distanceKm };
          }
        );

        // Sort by distance
        processedQuakes.sort((a, b) => a.distanceKm - b.distanceKm);
        setEarthquakes(processedQuakes);
      } catch (err) {
        setError("Failed to fetch earthquakes. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [radiusKm, minMag]
  );

  const requestLocation = () => {
    setLocationStatus("requesting");
    setError(null);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setLocationStatus("denied");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setLocationStatus("granted");
        fetchNearbyEarthquakes(latitude, longitude);
      },
      (geoErr) => {
        setLocationStatus("denied");
        switch (geoErr.code) {
          case geoErr.PERMISSION_DENIED:
            setError(
              "Location access denied. Please enable location in your browser settings."
            );
            break;
          case geoErr.POSITION_UNAVAILABLE:
            setError("Location information is unavailable.");
            break;
          case geoErr.TIMEOUT:
            setError("Location request timed out.");
            break;
          default:
            setError("An unknown error occurred.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  useEffect(() => {
    if (userLocation) {
      fetchNearbyEarthquakes(userLocation.lat, userLocation.lng);
    }
  }, [radiusKm, minMag, userLocation, fetchNearbyEarthquakes]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-600 to-green-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Earthquakes Near You
          </h1>
          <p className="text-lg text-green-100 mb-8">
            Find recent seismic activity in your area based on your current
            location
          </p>

          {locationStatus === "idle" && (
            <button
              onClick={requestLocation}
              className="px-8 py-4 bg-white text-green-700 rounded-xl font-semibold hover:bg-green-50 transition-colors flex items-center gap-3 mx-auto shadow-lg"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
              </svg>
              Enable Location Access
            </button>
          )}

          {locationStatus === "requesting" && (
            <div className="flex items-center justify-center gap-3 text-green-100">
              <svg
                className="w-5 h-5 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Requesting location access...
            </div>
          )}

          {userLocation && (
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-2 text-green-100">
                <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
                Location: {userLocation.lat.toFixed(4)},{" "}
                {userLocation.lng.toFixed(4)}
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-green-100">Radius:</label>
                  <select
                    value={radiusKm}
                    onChange={(e) => setRadiusKm(Number(e.target.value))}
                    className="bg-white/20 text-white border border-white/30 rounded-lg px-3 py-1 text-sm"
                  >
                    <option value={100} className="text-gray-900">100 km</option>
                    <option value={200} className="text-gray-900">200 km</option>
                    <option value={300} className="text-gray-900">300 km</option>
                    <option value={500} className="text-gray-900">500 km</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-green-100">Min Magnitude:</label>
                  <select
                    value={minMag}
                    onChange={(e) => setMinMag(Number(e.target.value))}
                    className="bg-white/20 text-white border border-white/30 rounded-lg px-3 py-1 text-sm"
                  >
                    <option value={1.0} className="text-gray-900">M1.0+</option>
                    <option value={2.0} className="text-gray-900">M2.0+</option>
                    <option value={3.0} className="text-gray-900">M3.0+</option>
                    <option value={4.0} className="text-gray-900">M4.0+</option>
                    <option value={5.0} className="text-gray-900">M5.0+</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Error Message */}
      {error && (
        <div className="max-w-4xl mx-auto px-4 mt-8">
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3">
            <svg
              className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <p className="text-red-800 dark:text-red-200 font-medium">
                {error}
              </p>
              {locationStatus === "denied" && (
                <button
                  onClick={requestLocation}
                  className="mt-2 text-sm text-red-600 dark:text-red-400 underline"
                >
                  Try again
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Results Section */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading && (
            <div className="flex flex-col items-center justify-center py-16">
              <svg
                className="w-12 h-12 text-green-600 animate-spin mb-4"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              <p className="text-gray-600 dark:text-gray-400">
                Searching for earthquakes near you...
              </p>
            </div>
          )}

          {!loading && userLocation && earthquakes.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No Recent Earthquakes
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Good news! No earthquakes detected within {radiusKm}km of your
                location in the past 30 days.
              </p>
            </div>
          )}

          {!loading && earthquakes.length > 0 && (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {earthquakes.length} Earthquakes Found
                </h2>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Within {radiusKm}km • Last 30 days
                </span>
              </div>

              <div className="space-y-4">
                {earthquakes.map((eq) => (
                  <EarthquakeCard
                    key={eq.id}
                    earthquake={eq}
                    showDistance
                    distanceKm={eq.distanceKm}
                  />
                ))}
              </div>
            </>
          )}

          {!userLocation && locationStatus !== "requesting" && (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Location Access Required
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Click the button above to enable location access and find
                earthquakes near you.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
