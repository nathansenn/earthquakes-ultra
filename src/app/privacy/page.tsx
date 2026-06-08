import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | QuakeGlobe",
  description: "QuakeGlobe privacy policy — what data we do and don't collect.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <section className="bg-gradient-to-br from-gray-700 to-gray-900 text-white py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-gray-300 text-sm">Last updated: {new Date().getFullYear()}</p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6 text-gray-600 dark:text-gray-300 leading-relaxed">
        <p>
          QuakeGlobe is an informational project that aims to collect as little data as possible. This page
          explains, in plain language, what that means.
        </p>

        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No accounts, no tracking profiles</h2>
          <p>
            You don&apos;t need an account to use QuakeGlobe. We don&apos;t ask for your name, email, or any
            personal details, and we don&apos;t sell or share personal information — because we don&apos;t
            collect it.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Location (&ldquo;Near Me&rdquo;)</h2>
          <p>
            The &ldquo;Near Me&rdquo; feature asks your browser for your location only when you choose to use
            it. Your coordinates are used in your browser to find nearby earthquakes and are not stored on our
            servers or shared with third parties. You can decline the permission at any time.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Preferences</h2>
          <p>
            Your theme choice (light/dark) is saved locally in your browser so the site remembers it. This
            never leaves your device.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Server logs &amp; third parties</h2>
          <p>
            Like most websites, our hosting provider may keep standard technical logs (such as IP address and
            user agent) for security and reliability. Seismic and volcano data is fetched from public sources
            (USGS, EMSC, JMA, GeoNet, PHIVOLCS, Smithsonian GVP); their use of any request is governed by
            their own policies.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Changes</h2>
          <p>
            If this policy changes, we&apos;ll update the date above. Questions? See the{" "}
            <a href="/about" className="text-blue-600 dark:text-blue-400 hover:underline">About</a> page.
          </p>
        </div>
      </div>
    </div>
  );
}
