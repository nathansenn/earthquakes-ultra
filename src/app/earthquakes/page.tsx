import { Metadata } from "next";
import { fetchGlobalEarthquakesMultiSource, convertToProcessed } from "@/lib/multi-source-api";
import { EarthquakesClient } from "./EarthquakesClient";

export const metadata: Metadata = {
  title: "All Earthquakes - Global M1+ Real-Time Data",
  description:
    "View all earthquakes worldwide including M1+ micro-earthquakes from 5 sources (USGS, EMSC, JMA, GeoNet, PHIVOLCS). Filter by magnitude, time range, and sort by various criteria.",
  openGraph: {
    title: "All Earthquakes - Global M1+ Data | QuakeGlobe",
    description: "Comprehensive global earthquake data from 5 sources with real-time updates and advanced filtering.",
  },
};

export const revalidate = 1800; // 30 minutes

export default async function EarthquakesPage() {
  // Fetch the last 7 days of M1+ earthquakes from all sources
  let earthquakes: ReturnType<typeof convertToProcessed>[] = [];
  let error: string | null = null;

  try {
    // Fetch multi-source global data - 7 days of M1+ earthquakes
    const rawEarthquakes = await fetchGlobalEarthquakesMultiSource(168, 1.0); // 168 hours = 7 days
    earthquakes = rawEarthquakes.map(convertToProcessed);
  } catch (err) {
    error = "Failed to fetch earthquake data. Please try again later.";
    console.error("Failed to fetch earthquakes:", err);
  }

  return <EarthquakesClient initialEarthquakes={earthquakes} error={error} />;
}
