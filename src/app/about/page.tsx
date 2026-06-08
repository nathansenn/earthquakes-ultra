import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About | QuakeGlobe",
  description:
    "About QuakeGlobe — a real-time global earthquake and volcano monitoring dashboard aggregating data from USGS, EMSC, JMA, GeoNet and PHIVOLCS.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <section className="bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">About QuakeGlobe</h1>
          <p className="text-indigo-100">Every tremor. Everywhere.</p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">What this is</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            QuakeGlobe is a real-time earthquake and volcano monitoring dashboard. It aggregates public
            seismic catalogues and volcano bulletins into one place so you can see what&apos;s happening
            around the planet — and around you — at a glance. It also includes an experimental volcanic
            eruption-probability model for Philippine and global volcanoes, plus preparedness guidance.
          </p>
        </section>

        <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Data sources</h2>
          <ul className="space-y-2 text-gray-600 dark:text-gray-300">
            <li>• <strong>USGS</strong> — United States Geological Survey earthquake catalogue</li>
            <li>• <strong>EMSC</strong> — European-Mediterranean Seismological Centre</li>
            <li>• <strong>JMA</strong> — Japan Meteorological Agency</li>
            <li>• <strong>GeoNet</strong> — New Zealand</li>
            <li>• <strong>PHIVOLCS</strong> — Philippine Institute of Volcanology and Seismology</li>
            <li>• <strong>Smithsonian GVP</strong> — Global Volcanism Program (volcano histories)</li>
          </ul>
        </section>

        <section className="bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-6">
          <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-3">⚠️ Important</h2>
          <p className="text-blue-800 dark:text-blue-200 leading-relaxed">
            QuakeGlobe is an informational and educational project. It is <strong>not</strong> an official
            warning system and must not be used for emergency or life-safety decisions. Always follow your
            national geological survey, civil-defense authority, and local officials. Probabilities and risk
            assessments shown here are statistical estimates, not deterministic predictions.
          </p>
        </section>

        <div className="flex flex-wrap gap-3">
          <Link href="/preparedness" className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">
            Safety &amp; Preparedness
          </Link>
          <Link href="/earthquakes" className="px-5 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            Browse Earthquakes
          </Link>
        </div>
      </div>
    </div>
  );
}
