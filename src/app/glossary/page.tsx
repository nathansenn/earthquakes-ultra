import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Earthquake & Volcano Glossary",
  description:
    "Plain-language definitions of earthquake and volcano terms — moment magnitude, intensity, hypocenter, aftershocks, Ring of Fire, b-value, VEI and more.",
  alternates: { canonical: "/glossary" },
  openGraph: {
    title: "Earthquake & Volcano Glossary | QuakeGlobe",
    description:
      "Plain-language definitions of the seismic and volcanic terms used across QuakeGlobe.",
  },
};

type Term = { term: string; slug: string; def: string };
type Group = { heading: string; terms: Term[] };

const GROUPS: Group[] = [
  {
    heading: "Measuring an earthquake",
    terms: [
      {
        term: "Moment magnitude (Mw)",
        slug: "moment-magnitude",
        def: "The modern measure of an earthquake's size, based on the area of the fault that slipped and how far it moved. It replaced the original Richter scale for medium and large events because Richter saturates (stops increasing) for the biggest quakes. The scale is logarithmic: each whole number is about 10× more shaking amplitude and ~31× more energy.",
      },
      {
        term: "Richter scale (ML)",
        slug: "richter-scale",
        def: "The original 1935 local-magnitude scale. Still widely cited in the media, but agencies now report moment magnitude for most events because it stays accurate for large earthquakes.",
      },
      {
        term: "Intensity (MMI)",
        slug: "intensity",
        def: "How strongly shaking is felt at a given place, on the Modified Mercalli Intensity scale (I–XII). Unlike magnitude — one number per earthquake — intensity varies with distance, depth, and local soil. A single quake produces many intensity values.",
      },
      {
        term: "Peak ground acceleration (PGA)",
        slug: "pga",
        def: "The strongest ground acceleration recorded at a site during shaking, often given as a fraction of gravity (g). Engineers use PGA, not magnitude, to design buildings for seismic loads.",
      },
    ],
  },
  {
    heading: "Where it happens",
    terms: [
      {
        term: "Hypocenter (focus)",
        slug: "hypocenter",
        def: "The point underground where the fault rupture begins. Its depth strongly affects shaking: shallow quakes concentrate energy near the surface and are more damaging than deep ones of the same magnitude.",
      },
      {
        term: "Epicenter",
        slug: "epicenter",
        def: "The point on the Earth's surface directly above the hypocenter — the location quoted in most reports.",
      },
      {
        term: "Depth",
        slug: "depth",
        def: "How far below the surface the rupture started. Shallow is usually defined as 0–70 km, intermediate 70–300 km, and deep 300–700 km. Most damaging quakes are shallow.",
      },
      {
        term: "Fault",
        slug: "fault",
        def: "A fracture in the crust where two blocks of rock move past each other. Stress builds along locked faults and releases suddenly as an earthquake.",
      },
    ],
  },
  {
    heading: "Sequences & patterns",
    terms: [
      {
        term: "Foreshock",
        slug: "foreshock",
        def: "A smaller quake that precedes a larger one on the same fault. Foreshocks can only be identified with certainty after the mainshock, so they aren't a reliable warning on their own.",
      },
      {
        term: "Mainshock",
        slug: "mainshock",
        def: "The largest earthquake in a sequence. If a later event is bigger, the labels are reassigned and the earlier mainshock becomes a foreshock.",
      },
      {
        term: "Aftershock",
        slug: "aftershock",
        def: "Smaller quakes following a mainshock as the crust readjusts. They are most frequent in the first hours and days and taper off over weeks to years, following Omori's law.",
      },
      {
        term: "Swarm",
        slug: "swarm",
        def: "A cluster of earthquakes in one area over a short period with no single dominant mainshock. Swarms are common near volcanoes as magma moves underground.",
      },
      {
        term: "b-value",
        slug: "b-value",
        def: "A statistic describing the ratio of small to large earthquakes in a region. A drop in b-value can indicate rising stress, which is one of the precursors QuakeGlobe's volcano model watches.",
      },
    ],
  },
  {
    heading: "Volcanoes",
    terms: [
      {
        term: "Volcanic Explosivity Index (VEI)",
        slug: "vei",
        def: "A 0–8 logarithmic scale of eruption size based on erupted volume and plume height. VEI 0 is gentle effusion (lava flows); VEI 5+ are major explosive eruptions like Pinatubo (VEI 6, 1991).",
      },
      {
        term: "Alert level",
        slug: "alert-level",
        def: "The official status an agency assigns to a volcano (for example PHIVOLCS Alert Levels 0–5). It reflects current unrest and the likelihood of eruption, and is the strongest input to QuakeGlobe's probability estimates.",
      },
      {
        term: "Volcanic tremor",
        slug: "volcanic-tremor",
        def: "Continuous ground vibration caused by moving magma or gas, as opposed to the discrete jolts of tectonic earthquakes. Sustained tremor often precedes eruptions.",
      },
      {
        term: "Caldera",
        slug: "caldera",
        def: "A large basin formed when a volcano's summit collapses into the emptied magma chamber after a big eruption. Taal and Yellowstone sit in calderas.",
      },
    ],
  },
  {
    heading: "Hazards & geography",
    terms: [
      {
        term: "Tsunami",
        slug: "tsunami",
        def: "A series of ocean waves generated when an undersea earthquake, landslide, or eruption displaces a large volume of water. Strong shaking near the coast is itself a natural warning to move to high ground.",
      },
      {
        term: "Liquefaction",
        slug: "liquefaction",
        def: "When shaking turns water-saturated, loose soil into a fluid-like state, causing buildings to sink or tilt. It is a major hazard in coastal and reclaimed areas.",
      },
      {
        term: "Pacific Ring of Fire",
        slug: "ring-of-fire",
        def: "The horseshoe-shaped belt around the Pacific Ocean where most of the world's earthquakes and volcanoes occur, driven by subducting tectonic plates. The Philippines, Japan, Indonesia, and Chile all sit on it.",
      },
      {
        term: "Subduction zone",
        slug: "subduction-zone",
        def: "A boundary where one tectonic plate dives beneath another. These zones produce the planet's largest earthquakes and most explosive volcanoes.",
      },
    ],
  },
];

const ALL_TERMS = GROUPS.flatMap((g) => g.terms);

export default function GlossaryPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "DefinedTermSet",
            name: "QuakeGlobe Earthquake & Volcano Glossary",
            hasDefinedTerm: ALL_TERMS.map((t) => ({
              "@type": "DefinedTerm",
              name: t.term,
              description: t.def,
            })),
          }),
        }}
      />

      <section className="bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Glossary</h1>
          <p className="text-indigo-100">
            Plain-language definitions of the earthquake and volcano terms used across QuakeGlobe.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Quick jump */}
        <nav aria-label="Glossary sections" className="flex flex-wrap gap-2">
          {GROUPS.map((g) => (
            <a
              key={g.heading}
              href={`#${g.heading.toLowerCase().replace(/[^a-z]+/g, "-")}`}
              className="text-sm px-3 py-1.5 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
            >
              {g.heading}
            </a>
          ))}
        </nav>

        {GROUPS.map((g) => (
          <section key={g.heading} id={g.heading.toLowerCase().replace(/[^a-z]+/g, "-")} className="scroll-mt-24">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{g.heading}</h2>
            <dl className="space-y-4">
              {g.terms.map((t) => (
                <div
                  key={t.slug}
                  id={t.slug}
                  className="scroll-mt-24 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5"
                >
                  <dt className="font-semibold text-gray-900 dark:text-white">{t.term}</dt>
                  <dd className="mt-1.5 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{t.def}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}

        <div className="flex flex-wrap gap-3 pt-2">
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
