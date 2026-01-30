import { Metadata } from "next";
import { fetchAllPhilippineEarthquakes, processEarthquake } from "@/lib/usgs-api";
import { EarthquakesClient } from "./EarthquakesClient";

export const metadata: Metadata = {
  title: "All Earthquakes in the Philippines - Complete Data",
  description:
    "View all earthquakes in the Philippines including M1+ micro-earthquakes. Filter by magnitude, time range, and sort by various criteria. Updated in real-time from USGS data.",
  openGraph: {
    title: "All Earthquakes in the Philippines | QuakeGlobe",
    description: "Comprehensive earthquake data for the Philippines including M1+ events with filtering and real-time updates.",
  },
};

export const revalidate = 1800; // 30 minutes

export default async function EarthquakesPage() {
  // Fetch the last 30 days of M1+ earthquakes (server-side)
  let earthquakes: ReturnType<typeof processEarthquake>[] = [];
  let error: string | null = null;

  try {
    // Fetch a comprehensive dataset - 30 days of M1+ earthquakes
    const rawEarthquakes = await fetchAllPhilippineEarthquakes(30, 1.0);
    earthquakes = rawEarthquakes.map(processEarthquake);
  } catch (err) {
    error = "Failed to fetch earthquake data. Please try again later.";
    console.error("Failed to fetch earthquakes:", err);
  }

  return <EarthquakesClient initialEarthquakes={earthquakes} error={error} />;
}
