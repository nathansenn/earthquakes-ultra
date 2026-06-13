import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The page you're looking for doesn't exist. Browse earthquakes, volcanoes, and regions on QuakeGlobe.",
  robots: { index: false, follow: true },
};

const LINKS = [
  { href: "/earthquakes", icon: "📊", label: "All Earthquakes", desc: "Global M1+ live feed" },
  { href: "/volcanoes", icon: "🌋", label: "Volcanoes", desc: "Risk monitoring dashboard" },
  { href: "/map", icon: "🗺️", label: "Live Map", desc: "Recent events on a map" },
  { href: "/near-me", icon: "📍", label: "Near Me", desc: "Quakes around your location" },
  { href: "/countries", icon: "🌍", label: "By Country", desc: "Browse seismic regions" },
  { href: "/preparedness", icon: "🛡️", label: "Preparedness", desc: "Stay safe before & after" },
];

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl w-full text-center">
        <p className="text-7xl mb-4" aria-hidden>🌐</p>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Page not found</h1>
        <p className="mt-3 text-gray-600 dark:text-gray-400 max-w-md mx-auto">
          We couldn&apos;t find that page. It may have moved, or the link might be off. Here&apos;s where to go next:
        </p>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-left">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all"
            >
              <span className="text-2xl" aria-hidden>{l.icon}</span>
              <span>
                <span className="block font-semibold text-gray-900 dark:text-white">{l.label}</span>
                <span className="block text-xs text-gray-500 dark:text-gray-400">{l.desc}</span>
              </span>
            </Link>
          ))}
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
        >
          ← Back to home
        </Link>
      </div>
    </div>
  );
}
