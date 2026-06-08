import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | QuakeGlobe",
  description: "QuakeGlobe terms of service — informational use only, no warranty.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <section className="bg-gradient-to-br from-gray-700 to-gray-900 text-white py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Terms of Service</h1>
          <p className="text-gray-300 text-sm">Last updated: {new Date().getFullYear()}</p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6 text-gray-600 dark:text-gray-300 leading-relaxed">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Informational use only</h2>
          <p>
            QuakeGlobe provides earthquake and volcano information for general awareness and education. It is
            not an official alerting service and must not be relied upon for emergency, evacuation, or any
            other life-safety decisions. Always defer to your national geological survey, civil-defense
            authority, and local officials.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No warranty</h2>
          <p>
            Data is aggregated from third-party public sources and may be delayed, incomplete, revised, or
            inaccurate. Eruption probabilities and risk levels are statistical model estimates, not
            predictions. The service is provided &ldquo;as is,&rdquo; without warranties of any kind, and we
            are not liable for any loss or damage arising from its use.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Attribution</h2>
          <p>
            Seismic and volcanic data is courtesy of the USGS, EMSC, JMA, GeoNet, PHIVOLCS, and the
            Smithsonian Global Volcanism Program. Please respect those organizations&apos; own terms when
            relying on their data.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Acceptable use</h2>
          <p>
            Don&apos;t use the service in any way that disrupts it or others&apos; use of it. Automated bulk
            scraping that degrades the service for others is not permitted.
          </p>
        </div>
      </div>
    </div>
  );
}
