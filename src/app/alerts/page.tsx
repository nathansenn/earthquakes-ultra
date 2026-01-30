"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { philippineCities } from "@/data/philippine-cities";

export default function AlertsPage() {
  // Set page title
  useEffect(() => {
    document.title = "Earthquake Alerts | QuakeGlobe";
  }, []);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [minMagnitude, setMinMagnitude] = useState("4.0");
  const [alertTypes, setAlertTypes] = useState({
    email: true,
    sms: false,
    push: false,
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setSubmitted(true);
    setLoading(false);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl p-8 text-center shadow-xl">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Alert Preferences Saved!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You&apos;ll receive notifications when earthquakes matching your criteria are detected.
          </p>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-6 text-left">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Your Settings:</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Location: {selectedCity || "All Philippines"}</li>
              <li>• Minimum magnitude: {minMagnitude}</li>
              <li>
                • Notifications:{" "}
                {[
                  alertTypes.email && "Email",
                  alertTypes.sms && "SMS",
                  alertTypes.push && "Push",
                ]
                  .filter(Boolean)
                  .join(", ")}
              </li>
            </ul>
          </div>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <section className="bg-gradient-to-br from-orange-500 to-orange-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Earthquake Alert Settings
          </h1>
          <p className="text-lg text-orange-100 max-w-xl mx-auto">
            Get notified when earthquakes occur in your area. Choose your
            preferred notification methods and customize alert thresholds.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Location Selection */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                Location
              </h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Monitor earthquakes near
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">All of Philippines</option>
                  {philippineCities
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((city) => (
                      <option key={city.slug} value={city.name}>
                        {city.name}, {city.province}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {/* Magnitude Threshold */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Alert Threshold
              </h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Minimum magnitude to trigger alert
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {["3.0", "4.0", "5.0", "6.0"].map((mag) => (
                    <button
                      key={mag}
                      type="button"
                      onClick={() => setMinMagnitude(mag)}
                      className={`py-3 rounded-xl font-medium transition-colors ${
                        minMagnitude === mag
                          ? "bg-orange-500 text-white"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                      }`}
                    >
                      M{mag}+
                    </button>
                  ))}
                </div>
                <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                  {minMagnitude === "3.0" && "Light earthquakes - Usually felt, rarely causes damage"}
                  {minMagnitude === "4.0" && "Moderate earthquakes - Noticeable shaking, minor damage possible"}
                  {minMagnitude === "5.0" && "Strong earthquakes - Can cause damage to weak buildings"}
                  {minMagnitude === "6.0" && "Major earthquakes - Destructive in populated areas"}
                </p>
              </div>
            </div>

            {/* Notification Methods */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Notification Methods
              </h2>

              <div className="space-y-4">
                {/* Email */}
                <div
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                    alertTypes.email
                      ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
                      : "border-gray-200 dark:border-gray-600"
                  }`}
                  onClick={() => setAlertTypes((prev) => ({ ...prev, email: !prev.email }))}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={alertTypes.email}
                      onChange={() => {}}
                      className="w-5 h-5 text-orange-500 rounded"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">Email Notifications</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Receive detailed earthquake reports via email
                      </p>
                    </div>
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  {alertTypes.email && (
                    <input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-3 w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                      required={alertTypes.email}
                    />
                  )}
                </div>

                {/* SMS */}
                <div
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                    alertTypes.sms
                      ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
                      : "border-gray-200 dark:border-gray-600"
                  }`}
                  onClick={() => setAlertTypes((prev) => ({ ...prev, sms: !prev.sms }))}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={alertTypes.sms}
                      onChange={() => {}}
                      className="w-5 h-5 text-orange-500 rounded"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">SMS Notifications</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Get instant text alerts to your phone
                      </p>
                    </div>
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  {alertTypes.sms && (
                    <input
                      type="tel"
                      placeholder="+63 9XX XXX XXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-3 w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                      required={alertTypes.sms}
                    />
                  )}
                </div>

                {/* Push */}
                <div
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                    alertTypes.push
                      ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
                      : "border-gray-200 dark:border-gray-600"
                  }`}
                  onClick={() => setAlertTypes((prev) => ({ ...prev, push: !prev.push }))}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={alertTypes.push}
                      onChange={() => {}}
                      className="w-5 h-5 text-orange-500 rounded"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">Push Notifications</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Browser notifications when you&apos;re online
                      </p>
                    </div>
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || (!alertTypes.email && !alertTypes.sms && !alertTypes.push)}
              className="w-full py-4 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save Alert Preferences
                </>
              )}
            </button>
          </form>

          {/* Info */}
          <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-xl">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>Note:</strong> This is a demo feature. In a production environment,
              alerts would be sent via the selected notification channels. Data is sourced
              from USGS in real-time.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
