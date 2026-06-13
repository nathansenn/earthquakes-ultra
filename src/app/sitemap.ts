import type { MetadataRoute } from "next";
import { philippineCities, philippineRegions } from "@/data/philippine-cities";
import { seismicCountries } from "@/data/countries";
import { getAllCitySlugs } from "@/data/major-cities";
import { PHILIPPINE_VOLCANOES, volcanoNameToSlug } from "@/data/philippine-volcanoes";
import { GLOBAL_VOLCANOES, volcanoToSlug, getVolcanoCountries, countryToSlug } from "@/data/global-volcanoes";

const BASE = (process.env.NEXT_PUBLIC_BASE_URL || "https://quakeglobe.com").replace(/\/$/, "");

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const url = (path: string) => `${BASE}${path}`;

  // Static, high-value content routes.
  const staticEntries: MetadataRoute.Sitemap = [
    { path: "/", priority: 1.0, changeFrequency: "hourly" as const },
    { path: "/earthquakes", priority: 0.9, changeFrequency: "hourly" as const },
    { path: "/map", priority: 0.7, changeFrequency: "hourly" as const },
    { path: "/globe", priority: 0.6, changeFrequency: "daily" as const },
    { path: "/global", priority: 0.7, changeFrequency: "hourly" as const },
    { path: "/near-me", priority: 0.6, changeFrequency: "daily" as const },
    { path: "/volcanoes", priority: 0.8, changeFrequency: "daily" as const },
    { path: "/volcanoes/analysis", priority: 0.8, changeFrequency: "daily" as const },
    { path: "/volcanoes/global", priority: 0.7, changeFrequency: "weekly" as const },
    { path: "/cities", priority: 0.6, changeFrequency: "weekly" as const },
    { path: "/countries", priority: 0.6, changeFrequency: "weekly" as const },
    { path: "/philippines", priority: 0.7, changeFrequency: "daily" as const },
    { path: "/preparedness", priority: 0.6, changeFrequency: "monthly" as const },
    { path: "/alerts", priority: 0.4, changeFrequency: "monthly" as const },
    { path: "/about", priority: 0.3, changeFrequency: "monthly" as const },
    { path: "/privacy", priority: 0.2, changeFrequency: "yearly" as const },
    { path: "/terms", priority: 0.2, changeFrequency: "yearly" as const },
  ].map((e) => ({ url: url(e.path), lastModified: now, changeFrequency: e.changeFrequency, priority: e.priority }));

  // Dynamic content routes.
  const phCities: MetadataRoute.Sitemap = philippineCities.map((c) => ({
    url: url(`/philippines/${c.slug}`), lastModified: now, changeFrequency: "daily", priority: 0.6,
  }));
  const regions: MetadataRoute.Sitemap = philippineRegions.map((r) => ({
    url: url(`/region/${r.slug}`), lastModified: now, changeFrequency: "weekly", priority: 0.5,
  }));
  const countries: MetadataRoute.Sitemap = seismicCountries.flatMap((c) => [
    { url: url(`/country/${c.slug}`), lastModified: now, changeFrequency: "daily" as const, priority: 0.6 },
    { url: url(`/country/${c.slug}/history`), lastModified: now, changeFrequency: "weekly" as const, priority: 0.4 },
  ]);
  const majorCities: MetadataRoute.Sitemap = getAllCitySlugs().map((slug) => ({
    url: url(`/city/${slug}`), lastModified: now, changeFrequency: "daily", priority: 0.5,
  }));

  // Volcano detail pages — dedupe slugs across the PH and global datasets.
  const volcanoSlugs = new Set<string>();
  PHILIPPINE_VOLCANOES.forEach((v) => volcanoSlugs.add(volcanoNameToSlug(v.name)));
  GLOBAL_VOLCANOES.forEach((v) => volcanoSlugs.add(volcanoToSlug(v)));
  const volcanoes: MetadataRoute.Sitemap = [...volcanoSlugs].map((slug) => ({
    url: url(`/volcanoes/${slug}`), lastModified: now, changeFrequency: "weekly", priority: 0.5,
  }));
  const volcanoCountries: MetadataRoute.Sitemap = getVolcanoCountries().map((c) => ({
    url: url(`/volcanoes/country/${countryToSlug(c)}`), lastModified: now, changeFrequency: "weekly", priority: 0.4,
  }));

  return [
    ...staticEntries,
    ...phCities,
    ...regions,
    ...countries,
    ...majorCities,
    ...volcanoes,
    ...volcanoCountries,
  ];
}
