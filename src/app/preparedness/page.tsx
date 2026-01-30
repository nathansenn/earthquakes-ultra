import { Metadata } from "next";
import Link from "next/link";
import {
  NATIONAL_EMERGENCY_CONTACTS,
  EARTHQUAKE_SCIENCE,
  EMERGENCY_KIT,
  EARTHQUAKE_RESPONSE,
  BUILDING_SAFETY,
  HISTORICAL_EARTHQUAKES,
  AFTERSHOCK_INFO,
  TSUNAMI_INFO,
  LIQUEFACTION_INFO,
} from "@/data/educational-content";

export const metadata: Metadata = {
  title: "Complete Earthquake Preparedness Guide | Safety Tips, Emergency Kit & What to Do",
  description:
    "The most comprehensive earthquake preparedness guide for the Philippines. Learn DROP-COVER-HOLD, complete emergency kit checklist, what to do before/during/after earthquakes, building safety, tsunami awareness, and aftershock preparation.",
  openGraph: {
    title: "Complete Earthquake Preparedness Guide | QuakeGlobe",
    description:
      "Essential earthquake safety guide for Filipinos. Emergency contacts, kit checklist, and life-saving tips.",
  },
  keywords: [
    "earthquake preparedness Philippines",
    "lindol safety",
    "earthquake emergency kit",
    "drop cover hold on",
    "PHIVOLCS earthquake",
    "earthquake safety tips",
    "what to do during earthquake",
    "tsunami evacuation",
    "aftershock safety",
  ],
};

export default function PreparednessPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero */}
      <section className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            Complete Earthquake Preparedness Guide
          </h1>
          <p className="text-lg md:text-xl text-yellow-100 max-w-3xl mx-auto">
            The Philippines experiences over 20 earthquakes daily. Being prepared isn&apos;t optional—it&apos;s essential. 
            This guide covers everything you need to know to protect yourself and your family.
          </p>
          
          {/* Quick Jump Links */}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href="#drop-cover-hold" className="px-4 py-2 bg-white/20 rounded-full text-sm hover:bg-white/30 transition">
              🛡️ Drop-Cover-Hold
            </a>
            <a href="#emergency-kit" className="px-4 py-2 bg-white/20 rounded-full text-sm hover:bg-white/30 transition">
              🎒 Emergency Kit
            </a>
            <a href="#during" className="px-4 py-2 bg-white/20 rounded-full text-sm hover:bg-white/30 transition">
              ⚠️ During Earthquake
            </a>
            <a href="#after" className="px-4 py-2 bg-white/20 rounded-full text-sm hover:bg-white/30 transition">
              ✅ After Earthquake
            </a>
            <a href="#tsunami" className="px-4 py-2 bg-white/20 rounded-full text-sm hover:bg-white/30 transition">
              🌊 Tsunami Safety
            </a>
          </div>
        </div>
      </section>

      {/* CRITICAL: Drop-Cover-Hold */}
      <section id="drop-cover-hold" className="py-12 bg-red-600 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">DROP • COVER • HOLD ON</h2>
            <p className="text-red-100 text-lg">The most important 3 actions during an earthquake. Practice these until they become automatic.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {EARTHQUAKE_RESPONSE.during.indoors.steps.map((step, index) => (
              <div key={step.action} className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center border-2 border-white/20">
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-5xl font-black">{index + 1}</span>
                </div>
                <h3 className="text-2xl font-bold mb-4">{step.action}</h3>
                <p className="text-red-100 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>

          {/* Visual Illustration Note */}
          <div className="mt-8 bg-white/10 rounded-xl p-6 text-center">
            <p className="text-lg font-medium">💡 Practice Tip</p>
            <p className="text-red-100 mt-2">
              Conduct family earthquake drills every 3 months. Time how quickly everyone can Drop, Cover, and Hold On. 
              Make it a game for children—the goal is to make this response automatic.
            </p>
          </div>
        </div>
      </section>

      {/* What NOT To Do */}
      <section className="py-12 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold mb-6 text-center">
            ❌ Common Myths & Dangerous Mistakes
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {EARTHQUAKE_RESPONSE.during.indoors.doNots.map((item, index) => (
              <div key={index} className="flex items-start gap-3 bg-red-900/30 rounded-xl p-4 border border-red-800/50">
                <span className="text-red-400 text-xl flex-shrink-0">✕</span>
                <p className="text-gray-200">{item}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center text-gray-400 text-sm">
            <p>The &quot;doorway myth&quot; comes from old adobe buildings where doorframes were stronger than walls. Modern buildings have equally strong walls—doorways offer no special protection.</p>
          </div>
        </div>
      </section>

      {/* Understanding Earthquakes - Science Section */}
      <section className="py-12 bg-white dark:bg-gray-950">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Understanding Earthquakes</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Knowledge is your first line of defense</p>
          </div>

          {/* Why Philippines Has Earthquakes */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 md:p-8 mb-8">
            <h3 className="text-xl font-bold text-blue-900 dark:text-blue-200 mb-4">
              {EARTHQUAKE_SCIENCE.philippineTectonics.title}
            </h3>
            <p className="text-blue-800 dark:text-blue-300 mb-6">{EARTHQUAKE_SCIENCE.philippineTectonics.content}</p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-3">Tectonic Plates</h4>
                <div className="space-y-2">
                  {EARTHQUAKE_SCIENCE.philippineTectonics.plates.map((plate) => (
                    <div key={plate.name} className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
                      <p className="font-medium text-gray-900 dark:text-white">{plate.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{plate.direction} • {plate.rate}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-3">Major Seismic Zones</h4>
                <ul className="space-y-2">
                  {EARTHQUAKE_SCIENCE.philippineTectonics.majorZones.map((zone, i) => (
                    <li key={i} className="flex items-start gap-2 text-blue-800 dark:text-blue-300">
                      <span className="text-blue-500">•</span>
                      <span>{zone}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Magnitude vs Intensity */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Magnitude */}
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-orange-900 dark:text-orange-200 mb-2">
                📊 Magnitude (Energy Released)
              </h3>
              <p className="text-sm text-orange-800 dark:text-orange-300 mb-4">{EARTHQUAKE_SCIENCE.magnitudeVsIntensity.magnitude.definition}</p>
              <div className="space-y-2">
                {EARTHQUAKE_SCIENCE.magnitudeVsIntensity.magnitude.examples.slice(0, 5).map((ex) => (
                  <div key={ex.mag} className="flex justify-between items-center bg-white/50 dark:bg-gray-800/50 rounded p-2">
                    <span className="font-mono font-bold text-orange-900 dark:text-orange-200">M{ex.mag}</span>
                    <span className="text-xs text-gray-600 dark:text-gray-400">{ex.description}</span>
                    <span className="text-xs text-orange-700 dark:text-orange-400">{ex.tntEquivalent}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Intensity */}
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-purple-900 dark:text-purple-200 mb-2">
                📍 Intensity (Effects at Location)
              </h3>
              <p className="text-sm text-purple-800 dark:text-purple-300 mb-4">{EARTHQUAKE_SCIENCE.magnitudeVsIntensity.intensity.definition}</p>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {EARTHQUAKE_SCIENCE.magnitudeVsIntensity.intensity.levels.map((level) => (
                  <div key={level.level} className="flex items-center gap-2 bg-white/50 dark:bg-gray-800/50 rounded p-2">
                    <span className={`w-8 h-8 flex items-center justify-center rounded font-bold text-white ${
                      parseInt(level.level) <= 3 ? 'bg-green-500' :
                      parseInt(level.level) <= 5 ? 'bg-yellow-500' :
                      parseInt(level.level) <= 7 ? 'bg-orange-500' : 'bg-red-600'
                    }`}>
                      {level.level}
                    </span>
                    <div>
                      <p className="font-medium text-sm text-gray-900 dark:text-white">{level.name}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{level.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Depth Explanation */}
          <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-green-900 dark:text-green-200 mb-4">
              {EARTHQUAKE_SCIENCE.depthMatters.title}
            </h3>
            <p className="text-green-800 dark:text-green-300 mb-4">{EARTHQUAKE_SCIENCE.depthMatters.content}</p>
            <div className="grid md:grid-cols-3 gap-4">
              {EARTHQUAKE_SCIENCE.depthMatters.categories.map((cat) => (
                <div key={cat.name} className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      cat.name === 'Shallow' ? 'bg-red-200 text-red-800' :
                      cat.name === 'Intermediate' ? 'bg-yellow-200 text-yellow-800' :
                      'bg-green-200 text-green-800'
                    }`}>
                      {cat.depth}
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">{cat.name}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{cat.effects}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Before Earthquake - Preparation */}
      <section className="py-12 bg-gray-100 dark:bg-gray-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Before an Earthquake</h2>
              <p className="text-gray-600 dark:text-gray-400">Preparation done today saves lives tomorrow</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Home Safety */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                🏠 Secure Your Home
              </h3>
              <ul className="space-y-3">
                {BUILDING_SAFETY.retrofitting.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                    <span className="text-green-500 mt-1 flex-shrink-0">✓</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Safe Spots */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                🛡️ Identify Safe Spots
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-green-700 dark:text-green-400 mb-2">✅ Safe Spots</p>
                  <ul className="space-y-1">
                    {BUILDING_SAFETY.safeSpots.good.map((spot, i) => (
                      <li key={i} className="text-sm text-gray-600 dark:text-gray-400">• {spot}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-sm font-medium text-red-700 dark:text-red-400 mb-2">❌ Avoid These Areas</p>
                  <ul className="space-y-1">
                    {BUILDING_SAFETY.safeSpots.avoid.slice(0, 4).map((spot, i) => (
                      <li key={i} className="text-sm text-gray-600 dark:text-gray-400">• {spot}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Building Type Risk */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{BUILDING_SAFETY.buildingTypes.title}</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {BUILDING_SAFETY.buildingTypes.types.map((type) => (
                <div key={type.type} className={`rounded-lg p-4 ${
                  type.risk === 'LOW' ? 'bg-green-50 dark:bg-green-900/20' :
                  type.risk === 'LOW-MODERATE' ? 'bg-lime-50 dark:bg-lime-900/20' :
                  type.risk === 'MODERATE' ? 'bg-yellow-50 dark:bg-yellow-900/20' :
                  type.risk === 'HIGH' ? 'bg-orange-50 dark:bg-orange-900/20' :
                  'bg-red-50 dark:bg-red-900/20'
                }`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-gray-900 dark:text-white text-sm">{type.type}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      type.risk === 'LOW' ? 'bg-green-200 text-green-800' :
                      type.risk === 'LOW-MODERATE' ? 'bg-lime-200 text-lime-800' :
                      type.risk === 'MODERATE' ? 'bg-yellow-200 text-yellow-800' :
                      type.risk === 'HIGH' ? 'bg-orange-200 text-orange-800' :
                      'bg-red-200 text-red-800'
                    }`}>
                      {type.risk}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{type.notes}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Family Plan */}
          <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-6 border border-indigo-200 dark:border-indigo-800">
            <h3 className="font-semibold text-indigo-900 dark:text-indigo-200 mb-4 flex items-center gap-2">
              👨‍👩‍👧‍👦 Family Earthquake Plan Template
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-indigo-800 dark:text-indigo-300 mb-2">Meeting Points</h4>
                <ul className="space-y-2 text-sm text-indigo-700 dark:text-indigo-300">
                  <li>📍 <strong>Primary:</strong> [e.g., Front of house/building]</li>
                  <li>📍 <strong>Secondary:</strong> [e.g., Nearby park or open area]</li>
                  <li>📍 <strong>Out-of-area:</strong> [e.g., Relative&apos;s house in different city]</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-indigo-800 dark:text-indigo-300 mb-2">Emergency Contacts</h4>
                <ul className="space-y-2 text-sm text-indigo-700 dark:text-indigo-300">
                  <li>👤 <strong>Out-of-area contact:</strong> [Name & number - someone outside the disaster zone]</li>
                  <li>🏥 <strong>Nearest hospital:</strong> [Name & address]</li>
                  <li>🏢 <strong>School contact:</strong> [If applicable]</li>
                </ul>
              </div>
            </div>
            <div className="mt-4 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
              <p className="text-sm text-indigo-800 dark:text-indigo-300">
                💡 <strong>Pro Tip:</strong> Print this plan and put copies in each family member&apos;s bag, wallet, and emergency kit. 
                Also save it as a photo on everyone&apos;s phone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Kit - Comprehensive */}
      <section id="emergency-kit" className="py-12 bg-yellow-50 dark:bg-yellow-900/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center justify-center gap-3">
              🎒 {EMERGENCY_KIT.title}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">{EMERGENCY_KIT.description}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {EMERGENCY_KIT.categories.map((category) => (
              <div key={category.name} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="bg-gradient-to-r from-yellow-400 to-orange-400 px-4 py-3">
                  <h3 className="font-bold text-white flex items-center gap-2">
                    <span className="text-xl">{category.icon}</span>
                    {category.name}
                  </h3>
                </div>
                <div className="p-4">
                  <ul className="space-y-2">
                    {category.items.map((item) => (
                      <li key={item.item} className="flex items-start gap-2">
                        <span className={`mt-1 ${item.essential ? 'text-red-500' : 'text-gray-400'}`}>
                          {item.essential ? '●' : '○'}
                        </span>
                        <div>
                          <span className="text-sm text-gray-900 dark:text-white">{item.item}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 block">{item.quantity}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-center gap-4 text-sm">
            <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
              <span className="text-red-500">●</span> Essential
            </span>
            <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
              <span className="text-gray-400">○</span> Recommended
            </span>
          </div>
        </div>
      </section>

      {/* During Earthquake - Location-Specific */}
      <section id="during" className="py-12 bg-white dark:bg-gray-950">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">During an Earthquake</h2>
              <p className="text-gray-600 dark:text-gray-400">Location-specific guidance</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Indoors */}
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
              <h3 className="font-bold text-green-900 dark:text-green-200 mb-4">{EARTHQUAKE_RESPONSE.during.indoors.title}</h3>
              <div className="space-y-3 mb-4">
                {EARTHQUAKE_RESPONSE.during.indoors.steps.map((step) => (
                  <div key={step.action} className="flex items-start gap-3">
                    <span className="text-2xl">{step.icon}</span>
                    <div>
                      <p className="font-medium text-green-800 dark:text-green-200">{step.action}</p>
                      <p className="text-sm text-green-700 dark:text-green-300">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-green-200 dark:border-green-700 pt-4">
                <p className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">Special Situations:</p>
                <div className="space-y-2">
                  {EARTHQUAKE_RESPONSE.during.indoors.locationSpecific.map((loc) => (
                    <div key={loc.location} className="text-sm">
                      <span className="font-medium text-green-700 dark:text-green-300">{loc.location}:</span>
                      <span className="text-green-600 dark:text-green-400 ml-1">{loc.action}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Outdoors */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
              <h3 className="font-bold text-blue-900 dark:text-blue-200 mb-4">{EARTHQUAKE_RESPONSE.during.outdoors.title}</h3>
              <div className="space-y-3 mb-4">
                {EARTHQUAKE_RESPONSE.during.outdoors.steps.map((step) => (
                  <div key={step.action} className="flex items-start gap-3">
                    <span className="text-2xl">{step.icon}</span>
                    <div>
                      <p className="font-medium text-blue-800 dark:text-blue-200">{step.action}</p>
                      <p className="text-sm text-blue-700 dark:text-blue-300">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-blue-200 dark:border-blue-700 pt-4">
                <p className="text-sm font-medium text-red-700 dark:text-red-400 mb-2">Never:</p>
                <ul className="space-y-1">
                  {EARTHQUAKE_RESPONSE.during.outdoors.doNots.map((item, i) => (
                    <li key={i} className="text-sm text-blue-700 dark:text-blue-300">• {item}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Driving */}
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-6 border border-amber-200 dark:border-amber-800">
              <h3 className="font-bold text-amber-900 dark:text-amber-200 mb-4">{EARTHQUAKE_RESPONSE.during.driving.title}</h3>
              <div className="space-y-3 mb-4">
                {EARTHQUAKE_RESPONSE.during.driving.steps.map((step) => (
                  <div key={step.action} className="flex items-start gap-3">
                    <span className="text-2xl">{step.icon}</span>
                    <div>
                      <p className="font-medium text-amber-800 dark:text-amber-200">{step.action}</p>
                      <p className="text-sm text-amber-700 dark:text-amber-300">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Near Coast */}
            <div className="bg-cyan-50 dark:bg-cyan-900/20 rounded-xl p-6 border border-cyan-200 dark:border-cyan-800">
              <h3 className="font-bold text-cyan-900 dark:text-cyan-200 mb-4">{EARTHQUAKE_RESPONSE.during.nearCoast.title}</h3>
              <div className="space-y-3 mb-4">
                {EARTHQUAKE_RESPONSE.during.nearCoast.steps.map((step) => (
                  <div key={step.action} className="flex items-start gap-3">
                    <span className="text-2xl">{step.icon}</span>
                    <div>
                      <p className="font-medium text-cyan-800 dark:text-cyan-200">{step.action}</p>
                      <p className="text-sm text-cyan-700 dark:text-cyan-300">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-red-100 dark:bg-red-900/30 rounded-lg p-3">
                <p className="text-sm font-bold text-red-800 dark:text-red-200">⚠️ CRITICAL</p>
                <p className="text-sm text-red-700 dark:text-red-300">{EARTHQUAKE_RESPONSE.during.nearCoast.tsunamiWarning}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* After Earthquake */}
      <section id="after" className="py-12 bg-gray-100 dark:bg-gray-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
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

          <div className="grid md:grid-cols-2 gap-8">
            {/* Immediate Actions */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{EARTHQUAKE_RESPONSE.after.immediate.title}</h3>
              <div className="space-y-3">
                {EARTHQUAKE_RESPONSE.after.immediate.steps.map((step) => (
                  <div key={step.priority} className="flex gap-3 bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="font-bold text-green-700 dark:text-green-300">{step.priority}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{step.action}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* First Hours */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{EARTHQUAKE_RESPONSE.after.firstHours.title}</h3>
              <div className="space-y-3">
                {EARTHQUAKE_RESPONSE.after.firstHours.steps.map((step) => (
                  <div key={step.priority} className="flex gap-3 bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="font-bold text-blue-700 dark:text-blue-300">{step.priority}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{step.action}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Returning Home Checks */}
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">{EARTHQUAKE_RESPONSE.after.returning.title}</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {EARTHQUAKE_RESPONSE.after.returning.checks.map((check) => (
                <div key={check.item} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="font-medium text-gray-900 dark:text-white">{check.item}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">⚠️ {check.signs}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
              <p className="text-red-800 dark:text-red-200 font-medium">{EARTHQUAKE_RESPONSE.after.returning.warning}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Aftershocks */}
      <section className="py-12 bg-white dark:bg-gray-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{AFTERSHOCK_INFO.title}</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">{AFTERSHOCK_INFO.definition}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6">
              <h3 className="font-bold text-purple-900 dark:text-purple-200 mb-3">{AFTERSHOCK_INFO.bathLaw.title}</h3>
              <p className="text-purple-800 dark:text-purple-300 text-sm mb-2">{AFTERSHOCK_INFO.bathLaw.description}</p>
              <p className="text-purple-700 dark:text-purple-400 text-sm italic">{AFTERSHOCK_INFO.bathLaw.example}</p>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-6">
              <h3 className="font-bold text-orange-900 dark:text-orange-200 mb-3">{AFTERSHOCK_INFO.omorisLaw.title}</h3>
              <p className="text-orange-800 dark:text-orange-300 text-sm">{AFTERSHOCK_INFO.omorisLaw.simplified}</p>
            </div>
          </div>

          <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6">
            <h3 className="font-bold text-gray-900 dark:text-white mb-3">Aftershock Safety Tips</h3>
            <ul className="space-y-2">
              {AFTERSHOCK_INFO.safety.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                  <span className="text-yellow-500">⚡</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Tsunami Safety */}
      <section id="tsunami" className="py-12 bg-cyan-600 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">🌊 {TSUNAMI_INFO.title}</h2>
            <p className="text-cyan-100 mt-2">{TSUNAMI_INFO.definition}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/10 rounded-xl p-6">
              <h3 className="font-bold mb-3">Natural Warning Signs</h3>
              <ul className="space-y-2">
                {TSUNAMI_INFO.naturalWarnings.map((warning, i) => (
                  <li key={i} className="flex items-start gap-2 text-cyan-100">
                    <span className="text-yellow-300">⚠️</span>
                    {warning}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white/10 rounded-xl p-6">
              <h3 className="font-bold mb-3">Immediate Actions</h3>
              <ul className="space-y-2">
                {TSUNAMI_INFO.immediateActions.map((action, i) => (
                  <li key={i} className="flex items-start gap-2 text-cyan-100">
                    <span className="text-green-300">→</span>
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-8 bg-red-500/30 rounded-xl p-6 border border-red-400/50">
            <h3 className="font-bold mb-3">Philippines High-Risk Areas</h3>
            <div className="flex flex-wrap gap-2">
              {TSUNAMI_INFO.philippineHighRiskAreas.map((area, i) => (
                <span key={i} className="px-3 py-1 bg-white/20 rounded-full text-sm">{area}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Liquefaction */}
      <section className="py-12 bg-yellow-50 dark:bg-yellow-900/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{LIQUEFACTION_INFO.title}</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">{LIQUEFACTION_INFO.definition}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="font-bold text-gray-900 dark:text-white mb-3">Risk Factors</h3>
              <ul className="space-y-2">
                {LIQUEFACTION_INFO.riskFactors.map((factor, i) => (
                  <li key={i} className="text-sm text-gray-700 dark:text-gray-300">• {factor}</li>
                ))}
              </ul>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border border-red-200 dark:border-red-800">
              <h3 className="font-bold text-red-900 dark:text-red-200 mb-3">High-Risk Areas in Philippines</h3>
              <ul className="space-y-2">
                {LIQUEFACTION_INFO.philippineHighRiskAreas.map((area, i) => (
                  <li key={i} className="text-sm text-red-800 dark:text-red-300">• {area}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Historical Earthquakes */}
      <section className="py-12 bg-gray-900 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold">Major Philippine Earthquakes: Lessons Learned</h2>
            <p className="text-gray-400 mt-2">History teaches us how to be better prepared</p>
          </div>

          <div className="space-y-4">
            {HISTORICAL_EARTHQUAKES.slice(0, 5).map((eq) => (
              <div key={eq.date} className="bg-white/5 rounded-xl p-5 border border-white/10">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-3 py-1 bg-red-500 rounded-lg font-bold">M{eq.magnitude}</span>
                      <span className="text-gray-300">{new Date(eq.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                    <h3 className="text-lg font-semibold">{eq.location}</h3>
                    <p className="text-sm text-gray-400 mt-1">{eq.damage}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-red-400 font-bold">{eq.casualties.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">casualties</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-white/10">
                  <p className="text-sm text-yellow-400">💡 Lesson: {eq.lessons}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Emergency Numbers */}
      <section className="py-12 bg-red-600 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold mb-8 text-center">🚨 Emergency Hotlines (Philippines)</h2>
          
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            {NATIONAL_EMERGENCY_CONTACTS.national.slice(0, 4).map((contact) => (
              <div key={contact.number} className="bg-white/10 rounded-xl p-4 text-center">
                <p className="text-sm text-red-100">{contact.name}</p>
                <p className="text-2xl font-bold mt-1">{contact.number}</p>
              </div>
            ))}
          </div>

          <div className="bg-white/10 rounded-xl p-6">
            <h3 className="font-semibold mb-4">More Emergency Contacts</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {NATIONAL_EMERGENCY_CONTACTS.national.slice(4).map((contact) => (
                <div key={contact.number} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{contact.name}</p>
                    <p className="text-xs text-red-200">{contact.description}</p>
                  </div>
                  <span className="font-mono text-red-200">{contact.number}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-white dark:bg-gray-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Stay Prepared, Stay Safe</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Knowledge is your best defense. Share this guide with your family and practice earthquake drills regularly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/alerts"
              className="px-8 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
            >
              Set Up Earthquake Alerts
            </Link>
            <Link
              href="/near-me"
              className="px-8 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Check Earthquakes Near You
            </Link>
          </div>
        </div>
      </section>

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "HowTo",
            name: "How to Prepare for an Earthquake in the Philippines",
            description: "Complete earthquake preparedness guide for the Philippines",
            step: [
              {
                "@type": "HowToStep",
                name: "Create an Emergency Plan",
                text: "Identify safe spots in each room, establish family meeting points, and keep emergency contacts accessible.",
              },
              {
                "@type": "HowToStep",
                name: "Prepare an Emergency Kit",
                text: "Stock 3 days of water, food, first aid supplies, flashlight, radio, and important documents.",
              },
              {
                "@type": "HowToStep",
                name: "Secure Your Home",
                text: "Anchor heavy furniture, install cabinet latches, and know how to shut off utilities.",
              },
              {
                "@type": "HowToStep",
                name: "Practice Drop, Cover, and Hold On",
                text: "Conduct regular earthquake drills with your family to make the response automatic.",
              },
            ],
          }),
        }}
      />
    </div>
  );
}
