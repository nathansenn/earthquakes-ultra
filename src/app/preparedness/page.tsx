import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Earthquake Preparedness Guide | Safety Tips & Emergency Kit",
  description:
    "Learn how to prepare for earthquakes in the Philippines. Essential safety tips, emergency kit checklist, and what to do before, during, and after an earthquake.",
  openGraph: {
    title: "Earthquake Preparedness Guide | Lindol.ph",
    description:
      "Essential earthquake safety tips for the Philippines. Learn what to do before, during, and after an earthquake.",
  },
};

export default function PreparednessPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero */}
      <section className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Earthquake Preparedness Guide
          </h1>
          <p className="text-lg text-yellow-100 max-w-2xl mx-auto">
            Being prepared can save lives. Learn what to do before, during, and
            after an earthquake to keep yourself and your family safe.
          </p>
        </div>
      </section>

      {/* Quick Reference */}
      <section className="py-12 bg-red-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Remember: DROP, COVER, HOLD</h2>
            <p className="text-red-100">The most important actions during an earthquake</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/10 rounded-xl p-6 text-center">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-bold mb-2">DROP</h3>
              <p className="text-red-100">
                Get down on your hands and knees. This position protects you from
                being knocked down and allows you to crawl to shelter.
              </p>
            </div>
            <div className="bg-white/10 rounded-xl p-6 text-center">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-bold mb-2">COVER</h3>
              <p className="text-red-100">
                Cover your head and neck with your arms. Take shelter under a sturdy
                desk or table if possible.
              </p>
            </div>
            <div className="bg-white/10 rounded-xl p-6 text-center">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-bold mb-2">HOLD ON</h3>
              <p className="text-red-100">
                If under shelter, hold on to it with one hand. Be ready to move
                with your shelter if it shifts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Before */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Before an Earthquake</h2>
              <p className="text-gray-600 dark:text-gray-400">Preparation is key to survival</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">🏠 Secure Your Home</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  Secure heavy furniture to walls (cabinets, bookshelves)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  Install latches on cabinet doors
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  Hang heavy pictures away from beds and seating
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  Know how to shut off gas, water, and electricity
                </li>
              </ul>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">📋 Create a Plan</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  Identify safe spots in each room
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  Establish a family meeting point
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  Keep emergency contacts accessible
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  Practice earthquake drills regularly
                </li>
              </ul>
            </div>
          </div>

          {/* Emergency Kit */}
          <div className="mt-8 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-6 border border-yellow-200 dark:border-yellow-800">
            <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              Emergency Kit Checklist
            </h3>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm text-yellow-800 dark:text-yellow-200">
              <div>
                <p className="font-medium mb-2">💧 Water & Food</p>
                <ul className="space-y-1 text-yellow-700 dark:text-yellow-300">
                  <li>• 3-day water supply (1 gallon/person/day)</li>
                  <li>• Non-perishable food</li>
                  <li>• Manual can opener</li>
                </ul>
              </div>
              <div>
                <p className="font-medium mb-2">🏥 First Aid</p>
                <ul className="space-y-1 text-yellow-700 dark:text-yellow-300">
                  <li>• First aid kit</li>
                  <li>• Prescription medications</li>
                  <li>• Dust masks</li>
                </ul>
              </div>
              <div>
                <p className="font-medium mb-2">🔦 Tools & Supplies</p>
                <ul className="space-y-1 text-yellow-700 dark:text-yellow-300">
                  <li>• Flashlight & batteries</li>
                  <li>• Portable radio</li>
                  <li>• Multi-tool or wrench</li>
                </ul>
              </div>
              <div>
                <p className="font-medium mb-2">📱 Communication</p>
                <ul className="space-y-1 text-yellow-700 dark:text-yellow-300">
                  <li>• Phone charger/power bank</li>
                  <li>• Emergency contact list</li>
                  <li>• Whistle for signaling</li>
                </ul>
              </div>
              <div>
                <p className="font-medium mb-2">📄 Documents</p>
                <ul className="space-y-1 text-yellow-700 dark:text-yellow-300">
                  <li>• Copies of IDs</li>
                  <li>• Insurance documents</li>
                  <li>• Cash in small bills</li>
                </ul>
              </div>
              <div>
                <p className="font-medium mb-2">🧥 Personal Items</p>
                <ul className="space-y-1 text-yellow-700 dark:text-yellow-300">
                  <li>• Change of clothes</li>
                  <li>• Blankets</li>
                  <li>• Personal hygiene items</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* During */}
      <section className="py-12 bg-white dark:bg-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">During an Earthquake</h2>
              <p className="text-gray-600 dark:text-gray-400">Stay calm and protect yourself</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
              <h3 className="font-semibold text-green-800 dark:text-green-200 mb-4">✅ DO</h3>
              <ul className="space-y-3 text-green-700 dark:text-green-300">
                <li className="flex items-start gap-2">
                  <span>•</span>
                  DROP, COVER, and HOLD ON
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  Stay indoors until shaking stops
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  If in bed, stay there and cover your head with a pillow
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  If outdoors, move to an open area away from buildings
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  If driving, pull over safely and stay inside the car
                </li>
              </ul>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border border-red-200 dark:border-red-800">
              <h3 className="font-semibold text-red-800 dark:text-red-200 mb-4">❌ DON&apos;T</h3>
              <ul className="space-y-3 text-red-700 dark:text-red-300">
                <li className="flex items-start gap-2">
                  <span>•</span>
                  Run outside during shaking
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  Stand in doorways (this is a myth!)
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  Use elevators during or after the quake
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  Light matches or candles (gas leaks!)
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  Go near damaged structures
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* After */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">After an Earthquake</h2>
              <p className="text-gray-600 dark:text-gray-400">Stay safe and help others</p>
            </div>
          </div>

          <div className="space-y-4">
            {[
              {
                title: "Check for injuries",
                desc: "Check yourself and others for injuries. Provide first aid if needed. Don't move seriously injured people unless they're in immediate danger.",
              },
              {
                title: "Check your surroundings",
                desc: "Look for hazards like gas leaks, fires, or structural damage. If you smell gas, open windows and leave immediately.",
              },
              {
                title: "Expect aftershocks",
                desc: "Aftershocks can occur minutes, hours, or even days after the main quake. Be prepared to DROP, COVER, and HOLD ON again.",
              },
              {
                title: "Stay informed",
                desc: "Listen to local radio or TV for updates. Follow official instructions from authorities.",
              },
              {
                title: "Help others",
                desc: "Help trapped or injured people if it's safe to do so. Don't enter damaged buildings.",
              },
              {
                title: "Document damage",
                desc: "Take photos of any damage for insurance purposes. Contact your insurance company as soon as possible.",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="flex gap-4 bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700"
              >
                <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="font-semibold text-gray-700 dark:text-gray-300">{index + 1}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{item.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Emergency Numbers */}
      <section className="py-12 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold mb-8 text-center">Emergency Hotlines (Philippines)</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "National Emergency", number: "911" },
              { name: "Red Cross", number: "143" },
              { name: "NDRRMC", number: "(02) 8911-5061" },
              { name: "PHIVOLCS", number: "(02) 8426-1468" },
            ].map((item) => (
              <div
                key={item.name}
                className="bg-white/10 rounded-xl p-4 text-center"
              >
                <p className="text-sm text-gray-400">{item.name}</p>
                <p className="text-xl font-bold mt-1">{item.number}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-red-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Get Earthquake Alerts</h2>
          <p className="text-red-100 mb-6">
            Stay informed about seismic activity in your area with real-time alerts.
          </p>
          <Link
            href="/alerts"
            className="inline-block px-8 py-3 bg-white text-red-600 rounded-xl font-semibold hover:bg-red-50 transition-colors"
          >
            Set Up Alerts
          </Link>
        </div>
      </section>
    </div>
  );
}
