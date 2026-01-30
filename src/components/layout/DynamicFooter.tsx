import Link from "next/link";

interface DynamicFooterProps {
  region?: string;
  city?: string;
  country?: string;
  pageType?: 'home' | 'global' | 'philippines' | 'city' | 'region' | 'volcano' | 'country';
}

// Philippine regional emergency contacts
const REGIONAL_CONTACTS: Record<string, { office: string; phone: string }[]> = {
  'NCR': [
    { office: 'Metro Manila DRRMC', phone: '(02) 8426-0219' },
    { office: 'MMDA Rescue', phone: '136' },
  ],
  'CAR': [
    { office: 'Cordillera OCD', phone: '(074) 442-8990' },
  ],
  'I': [
    { office: 'Region 1 RDRRMC', phone: '(077) 600-4500' },
  ],
  'II': [
    { office: 'Region 2 RDRRMC', phone: '(078) 844-1630' },
  ],
  'III': [
    { office: 'Region 3 RDRRMC', phone: '(045) 455-1526' },
  ],
  'IV-A': [
    { office: 'CALABARZON RDRRMC', phone: '(049) 536-3566' },
  ],
  'IV-B': [
    { office: 'MIMAROPA RDRRMC', phone: '(043) 723-5289' },
  ],
  'V': [
    { office: 'Bicol RDRRMC', phone: '(052) 481-0527' },
  ],
  'VI': [
    { office: 'Western Visayas RDRRMC', phone: '(033) 337-0772' },
  ],
  'VII': [
    { office: 'Central Visayas RDRRMC', phone: '(032) 416-5025' },
  ],
  'VIII': [
    { office: 'Eastern Visayas RDRRMC', phone: '(053) 832-0553' },
  ],
  'IX': [
    { office: 'Zamboanga Peninsula RDRRMC', phone: '(062) 992-2869' },
  ],
  'X': [
    { office: 'Northern Mindanao RDRRMC', phone: '(088) 856-1749' },
  ],
  'XI': [
    { office: 'Davao Region RDRRMC', phone: '(082) 222-0325' },
  ],
  'XII': [
    { office: 'SOCCSKSARGEN RDRRMC', phone: '(083) 552-7803' },
  ],
  'XIII': [
    { office: 'Caraga RDRRMC', phone: '(085) 342-5641' },
  ],
  'BARMM': [
    { office: 'BARMM Humanitarian Affairs', phone: '(064) 421-5595' },
  ],
};

// City-specific contacts (expandable)
const CITY_CONTACTS: Record<string, { name: string; phone: string; type: string }[]> = {
  'manila': [
    { name: 'Manila DRRMO', phone: '(02) 8527-5698', type: 'emergency' },
    { name: 'Manila Fire District', phone: '(02) 8523-6040', type: 'fire' },
    { name: 'PGH Emergency', phone: '(02) 8554-8400', type: 'hospital' },
  ],
  'quezon-city': [
    { name: 'QC DRRMO', phone: '(02) 8988-2039', type: 'emergency' },
    { name: 'QC General Hospital', phone: '(02) 8426-0219', type: 'hospital' },
  ],
  'cebu-city': [
    { name: 'Cebu City DRRMO', phone: '(032) 256-1015', type: 'emergency' },
    { name: 'VSMMC Emergency', phone: '(032) 253-8871', type: 'hospital' },
  ],
  'davao-city': [
    { name: 'Davao CDRRMO', phone: '(082) 227-4373', type: 'emergency' },
    { name: 'SPMC Emergency', phone: '(082) 227-2731', type: 'hospital' },
  ],
};

export function DynamicFooter({ region, city, country, pageType = 'home' }: DynamicFooterProps) {
  const currentYear = new Date().getFullYear();
  const citySlug = city?.toLowerCase().replace(/\s+/g, '-');
  const regionCode = region?.toUpperCase();

  // Get regional contacts if applicable
  const regionalContacts = regionCode ? REGIONAL_CONTACTS[regionCode] : [];
  const cityContacts = citySlug ? CITY_CONTACTS[citySlug] : [];

  return (
    <footer className="bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About QuakeGlobe */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-lg">🌍</span>
              </div>
              <span className="text-lg font-bold">
                Quake<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-600">Globe</span>
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Real-time global earthquake monitoring. 
              Every tremor. Everywhere. Stay informed, stay prepared, stay safe.
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-3">
              🌐 Monitoring the entire planet, 24/7
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/earthquakes"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  All Earthquakes (M1+)
                </Link>
              </li>
              <li>
                <Link
                  href="/countries"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  Browse by Country
                </Link>
              </li>
              <li>
                <Link
                  href="/map"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  Live Map
                </Link>
              </li>
              <li>
                <Link
                  href="/globe"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  3D Globe
                </Link>
              </li>
              <li>
                <Link
                  href="/volcanoes/global"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  Global Volcanoes
                </Link>
              </li>
              <li>
                <Link
                  href="/alerts"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  Set Up Alerts
                </Link>
              </li>
              <li>
                <Link
                  href="/preparedness"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  Safety Guide
                </Link>
              </li>
            </ul>
          </div>

          {/* Contextual Links - Changes based on page type */}
          <div>
            {(pageType === 'city' && cityContacts.length > 0) ? (
              <>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Local Emergency Contacts
                </h3>
                <ul className="space-y-2">
                  {cityContacts.map((contact, idx) => (
                    <li key={idx}>
                      <a
                        href={`tel:${contact.phone.replace(/[^0-9+]/g, '')}`}
                        className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        {contact.name}: <span className="font-medium">{contact.phone}</span>
                      </a>
                    </li>
                  ))}
                  <li>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      National Emergency: <span className="font-medium">911</span>
                    </span>
                  </li>
                </ul>
              </>
            ) : (pageType === 'region' && regionalContacts.length > 0) ? (
              <>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Regional Emergency
                </h3>
                <ul className="space-y-2">
                  {regionalContacts.map((contact, idx) => (
                    <li key={idx}>
                      <a
                        href={`tel:${contact.phone.replace(/[^0-9+]/g, '')}`}
                        className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        {contact.office}: <span className="font-medium">{contact.phone}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            ) : (pageType === 'philippines' || pageType === 'volcano') ? (
              <>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Philippine Emergency Hotlines
                </h3>
                <ul className="space-y-2">
                  <li>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      National Emergency: <span className="font-medium">911</span>
                    </span>
                  </li>
                  <li>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Red Cross: <span className="font-medium">143</span>
                    </span>
                  </li>
                  <li>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      NDRRMC: <span className="font-medium">(02) 8911-5061</span>
                    </span>
                  </li>
                  <li>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      PHIVOLCS: <span className="font-medium">(02) 8426-1468</span>
                    </span>
                  </li>
                </ul>
              </>
            ) : (
              <>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Top Seismic Regions
                </h3>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/philippines"
                      className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      🇵🇭 Philippines
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/country/japan"
                      className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      🇯🇵 Japan
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/country/indonesia"
                      className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      🇮🇩 Indonesia
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/country/chile"
                      className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      🇨🇱 Chile
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/country/united-states"
                      className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      🇺🇸 United States
                    </Link>
                  </li>
                </ul>
              </>
            )}
          </div>

          {/* Official Resources */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Official Resources
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://earthquake.usgs.gov/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1"
                >
                  USGS Earthquake Hazards
                  <ExternalLinkIcon />
                </a>
              </li>
              <li>
                <a
                  href="https://www.emsc-csem.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1"
                >
                  EMSC (Europe-Mediterranean)
                  <ExternalLinkIcon />
                </a>
              </li>
              <li>
                <a
                  href="https://www.phivolcs.dost.gov.ph/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1"
                >
                  PHIVOLCS (Philippines)
                  <ExternalLinkIcon />
                </a>
              </li>
              <li>
                <a
                  href="https://www.jma.go.jp/jma/en/Activities/earthquake.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1"
                >
                  JMA (Japan)
                  <ExternalLinkIcon />
                </a>
              </li>
              <li>
                <a
                  href="https://www.iris.edu/hq/inclass/earthquake_browser"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1"
                >
                  Global Seismographic Network
                  <ExternalLinkIcon />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                © {currentYear} QuakeGlobe — Real-Time Global Earthquake Monitoring
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Data provided by USGS. Not for official emergency use.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/privacy"
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
              >
                Terms of Service
              </Link>
              <Link
                href="/about"
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
              >
                About
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function ExternalLinkIcon() {
  return (
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
  );
}

// Export the old Footer as default for backwards compatibility
export function Footer() {
  return <DynamicFooter pageType="home" />;
}
