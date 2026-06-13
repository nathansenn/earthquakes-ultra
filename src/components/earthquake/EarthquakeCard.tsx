"use client";

import Link from "next/link";
import { useState } from "react";
import { ProcessedEarthquake } from "@/lib/usgs-api";
import { magnitudeTier } from "@/components/ui/kit";

interface EarthquakeCardProps {
  earthquake: ProcessedEarthquake;
  showDistance?: boolean;
  distanceKm?: number;
}

export function EarthquakeCard({
  earthquake,
  showDistance,
  distanceKm,
}: EarthquakeCardProps) {
  const tier = magnitudeTier(earthquake.magnitude);
  const [copied, setCopied] = useState(false);
  const detailHref = `/earthquakes/${encodeURIComponent(earthquake.id)}`;
  // Absolute time with timezone label, for the relative-time tooltip.
  // (dateStyle/timeStyle can't be combined with timeZoneName, so use components.)
  const absoluteTime = earthquake.time.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });

  return (
    <article className="relative bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-lg transition-all hover:border-red-300 dark:hover:border-red-700 group">
      {/* Stretched link: clicking anywhere on the card opens the detail page.
          Interactive controls below are raised above it with relative z-10. */}
      <Link
        href={detailHref}
        className="absolute inset-0 z-0"
        aria-label={`Details for M${earthquake.magnitude.toFixed(1)} earthquake near ${earthquake.place}`}
      />
      <div className="flex items-stretch">
        {/* Magnitude Badge */}
        <div
          className={`flex-shrink-0 w-20 flex flex-col items-center justify-center ${tier.badgeClass}`}
        >
          <span className="text-2xl font-bold tabular-nums">{earthquake.magnitude.toFixed(1)}</span>
          <span className="text-xs uppercase opacity-80">
            {earthquake.magnitudeType}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                {earthquake.place}
              </h3>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-gray-500 dark:text-gray-400">
                <time dateTime={earthquake.time.toISOString()} title={absoluteTime} className="flex items-center gap-1">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {earthquake.timeAgo}
                </time>
                <span className="flex items-center gap-1">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                  </svg>
                  <span className="tabular-nums">{earthquake.depth.toFixed(0)}</span> km deep
                </span>
                {showDistance && distanceKm !== undefined && (
                  <span className="flex items-center gap-1 text-red-600 dark:text-red-400 font-medium">
                    <svg
                      className="w-4 h-4"
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
                    {distanceKm.toFixed(0)} km away
                  </span>
                )}
              </div>
            </div>

            {/* Indicators */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {earthquake.tsunami && (
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full">
                  Tsunami
                </span>
              )}
              {earthquake.felt && earthquake.felt > 10 && (
                <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 text-xs font-medium rounded-full flex items-center gap-1">
                  <svg
                    className="w-3 h-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {earthquake.felt} felt it
                </span>
              )}
              {earthquake.alert && (
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${
                    earthquake.alert === "red"
                      ? "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
                      : earthquake.alert === "orange"
                      ? "bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300"
                      : earthquake.alert === "yellow"
                      ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300"
                      : "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                  }`}
                >
                  {earthquake.alert} alert
                </span>
              )}
            </div>
          </div>

          {/* Action row — raised above the stretched card link */}
          <div className="relative z-10 flex items-center gap-4 mt-3 w-fit">
            <Link
              href={detailHref}
              className="text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 flex items-center gap-1"
            >
              Details
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <a
              href={earthquake.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 flex items-center gap-1"
            >
              USGS
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
            <button
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 flex items-center gap-1"
              onClick={async () => {
                const shareData = {
                  title: `M${earthquake.magnitude.toFixed(1)} Earthquake - ${earthquake.place}`,
                  text: `A magnitude ${earthquake.magnitude.toFixed(1)} earthquake occurred ${earthquake.timeAgo} - ${earthquake.place}`,
                  url: earthquake.url,
                };
                if (navigator.share) {
                  try { await navigator.share(shareData); } catch { /* user dismissed */ }
                } else {
                  try {
                    await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  } catch { /* clipboard unavailable */ }
                }
              }}
            >
              {copied ? (
                <>
                  Copied!
                  <svg className="w-3 h-3 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </>
              ) : (
                <>
                  Share
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                    />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

// Compact version for lists
export function EarthquakeCardCompact({
  earthquake,
}: {
  earthquake: ProcessedEarthquake;
}) {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 -mx-2 px-2 rounded-lg transition-colors">
      <div
        className={`w-12 h-12 rounded-lg flex items-center justify-center ${magnitudeTier(earthquake.magnitude).badgeClass}`}
      >
        <span className="font-bold tabular-nums">{earthquake.magnitude.toFixed(1)}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 dark:text-white truncate text-sm">
          {earthquake.place}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {earthquake.timeAgo} • {earthquake.depth.toFixed(0)} km deep
        </p>
      </div>
      <Link
        href={`/earthquakes/${encodeURIComponent(earthquake.id)}`}
        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
        aria-label={`Details for M${earthquake.magnitude.toFixed(1)} earthquake near ${earthquake.place}`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </Link>
    </div>
  );
}
