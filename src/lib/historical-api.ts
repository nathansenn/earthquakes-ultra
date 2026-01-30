// Historical Earthquake & Volcanic Data API
// Provides historical significant events with sources

export interface HistoricalEarthquake {
  id: string;
  date: string;
  year: number;
  magnitude: number;
  location: string;
  country: string;
  region?: string;
  city?: string;
  latitude: number;
  longitude: number;
  depth?: number;
  deaths?: number;
  injuries?: number;
  damage?: string;
  tsunami?: boolean;
  description: string;
  sources: Source[];
}

export interface HistoricalVolcanicEvent {
  id: string;
  date: string;
  year: number;
  volcano: string;
  country: string;
  region?: string;
  vei?: number; // Volcanic Explosivity Index
  latitude: number;
  longitude: number;
  deaths?: number;
  description: string;
  sources: Source[];
}

export interface Source {
  name: string;
  url: string;
  type: 'official' | 'academic' | 'news' | 'historical';
}

// Fetch historical earthquakes from USGS (M5+ since 1900)
export async function fetchUSGSHistorical(
  bounds: { minLat: number; maxLat: number; minLon: number; maxLon: number },
  minMag: number = 5.0,
  startYear: number = 1900
): Promise<HistoricalEarthquake[]> {
  const url = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&minmagnitude=${minMag}&minlatitude=${bounds.minLat}&maxlatitude=${bounds.maxLat}&minlongitude=${bounds.minLon}&maxlongitude=${bounds.maxLon}&starttime=${startYear}-01-01&orderby=magnitude&limit=500`;
  
  try {
    const response = await fetch(url, { next: { revalidate: 86400 } }); // Cache 24h
    if (!response.ok) return [];
    
    const data = await response.json();
    return data.features.map((f: any) => {
      const time = new Date(f.properties.time);
      return {
        id: `usgs_${f.id}`,
        date: time.toISOString().split('T')[0],
        year: time.getFullYear(),
        magnitude: f.properties.mag,
        location: f.properties.place || 'Unknown',
        country: extractCountry(f.properties.place),
        latitude: f.geometry.coordinates[1],
        longitude: f.geometry.coordinates[0],
        depth: f.geometry.coordinates[2],
        tsunami: f.properties.tsunami === 1,
        description: `M${f.properties.mag} earthquake at ${f.properties.place}`,
        sources: [{
          name: 'USGS Earthquake Hazards Program',
          url: f.properties.url || `https://earthquake.usgs.gov/earthquakes/eventpage/${f.id}`,
          type: 'official' as const
        }]
      };
    });
  } catch (error) {
    console.error('USGS historical fetch error:', error);
    return [];
  }
}

function extractCountry(place: string): string {
  if (!place) return 'Unknown';
  const parts = place.split(',');
  return parts[parts.length - 1]?.trim() || place;
}

// Curated significant historical earthquakes (notable events with death tolls, etc.)
export const SIGNIFICANT_EARTHQUAKES: HistoricalEarthquake[] = [
  // Philippines
  {
    id: 'ph_1990_luzon',
    date: '1990-07-16',
    year: 1990,
    magnitude: 7.7,
    location: 'Luzon, Philippines',
    country: 'Philippines',
    region: 'Central Luzon',
    latitude: 15.68,
    longitude: 121.17,
    depth: 25,
    deaths: 1621,
    injuries: 3000,
    damage: '$369 million',
    description: 'The 1990 Luzon earthquake struck the island of Luzon, causing widespread destruction in Baguio City and nearby areas. Buildings collapsed, landslides blocked roads, and fires broke out in the aftermath.',
    sources: [
      { name: 'USGS', url: 'https://earthquake.usgs.gov/earthquakes/eventpage/usp0004bxs', type: 'official' },
      { name: 'PHIVOLCS', url: 'https://www.phivolcs.dost.gov.ph/', type: 'official' },
      { name: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/1990_Luzon_earthquake', type: 'historical' }
    ]
  },
  {
    id: 'ph_2013_bohol',
    date: '2013-10-15',
    year: 2013,
    magnitude: 7.2,
    location: 'Bohol, Philippines',
    country: 'Philippines',
    region: 'Central Visayas',
    latitude: 9.86,
    longitude: 124.07,
    depth: 12,
    deaths: 222,
    injuries: 976,
    damage: '$52.1 million',
    description: 'The Bohol earthquake caused significant damage to historic churches and infrastructure. The earthquake was felt across the Visayas and parts of Mindanao.',
    sources: [
      { name: 'USGS', url: 'https://earthquake.usgs.gov/earthquakes/eventpage/usb000kdb4', type: 'official' },
      { name: 'NDRRMC', url: 'https://ndrrmc.gov.ph/', type: 'official' },
      { name: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/2013_Bohol_earthquake', type: 'historical' }
    ]
  },
  {
    id: 'ph_1976_moro_gulf',
    date: '1976-08-16',
    year: 1976,
    magnitude: 8.0,
    location: 'Moro Gulf, Mindanao, Philippines',
    country: 'Philippines',
    region: 'Mindanao',
    latitude: 6.29,
    longitude: 124.09,
    depth: 33,
    deaths: 8000,
    tsunami: true,
    description: 'The deadliest earthquake in Philippine history. The earthquake generated a devastating tsunami that struck the coasts of the Moro Gulf, killing thousands.',
    sources: [
      { name: 'USGS', url: 'https://earthquake.usgs.gov/earthquakes/eventpage/usp0000fgk', type: 'official' },
      { name: 'NOAA NCEI', url: 'https://www.ngdc.noaa.gov/hazel/view/hazards/tsunami/event-more-info/5401', type: 'official' },
      { name: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/1976_Moro_Gulf_earthquake', type: 'historical' }
    ]
  },
  {
    id: 'ph_2019_mindanao',
    date: '2019-10-29',
    year: 2019,
    magnitude: 6.6,
    location: 'Cotabato, Mindanao, Philippines',
    country: 'Philippines',
    region: 'Mindanao',
    city: 'Kidapawan',
    latitude: 6.80,
    longitude: 124.99,
    depth: 14,
    deaths: 21,
    injuries: 432,
    description: 'Part of a series of strong earthquakes that struck Mindanao in October 2019, causing significant damage in Cotabato and Davao del Sur.',
    sources: [
      { name: 'USGS', url: 'https://earthquake.usgs.gov/earthquakes/eventpage/us70006d0m', type: 'official' },
      { name: 'PHIVOLCS', url: 'https://www.phivolcs.dost.gov.ph/', type: 'official' }
    ]
  },
  // Japan
  {
    id: 'jp_2011_tohoku',
    date: '2011-03-11',
    year: 2011,
    magnitude: 9.1,
    location: 'Tohoku, Japan',
    country: 'Japan',
    region: 'Tohoku',
    latitude: 38.30,
    longitude: 142.37,
    depth: 29,
    deaths: 19749,
    tsunami: true,
    damage: '$235 billion',
    description: 'The Great East Japan Earthquake, the most powerful earthquake ever recorded in Japan. Triggered a massive tsunami and the Fukushima nuclear disaster.',
    sources: [
      { name: 'USGS', url: 'https://earthquake.usgs.gov/earthquakes/eventpage/official20110311054624120_30', type: 'official' },
      { name: 'JMA', url: 'https://www.jma.go.jp/jma/en/2011_Earthquake.html', type: 'official' },
      { name: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/2011_T%C5%8Dhoku_earthquake_and_tsunami', type: 'historical' }
    ]
  },
  {
    id: 'jp_1995_kobe',
    date: '1995-01-17',
    year: 1995,
    magnitude: 6.9,
    location: 'Kobe, Japan',
    country: 'Japan',
    region: 'Kansai',
    city: 'Kobe',
    latitude: 34.59,
    longitude: 135.07,
    depth: 17,
    deaths: 6434,
    damage: '$100 billion',
    description: 'The Great Hanshin Earthquake devastated the city of Kobe and surrounding areas, exposing vulnerabilities in Japanese building codes.',
    sources: [
      { name: 'USGS', url: 'https://earthquake.usgs.gov/earthquakes/eventpage/usp0006re5', type: 'official' },
      { name: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Great_Hanshin_earthquake', type: 'historical' }
    ]
  },
  // Indonesia
  {
    id: 'id_2004_sumatra',
    date: '2004-12-26',
    year: 2004,
    magnitude: 9.1,
    location: 'Sumatra, Indonesia',
    country: 'Indonesia',
    region: 'Aceh',
    latitude: 3.32,
    longitude: 95.85,
    depth: 30,
    deaths: 227898,
    tsunami: true,
    damage: '$15 billion',
    description: 'The Boxing Day Earthquake triggered the deadliest tsunami in recorded history, affecting 14 countries around the Indian Ocean.',
    sources: [
      { name: 'USGS', url: 'https://earthquake.usgs.gov/earthquakes/eventpage/official20041226005853450_30', type: 'official' },
      { name: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/2004_Indian_Ocean_earthquake_and_tsunami', type: 'historical' }
    ]
  },
  {
    id: 'id_2018_sulawesi',
    date: '2018-09-28',
    year: 2018,
    magnitude: 7.5,
    location: 'Sulawesi, Indonesia',
    country: 'Indonesia',
    region: 'Central Sulawesi',
    city: 'Palu',
    latitude: -0.18,
    longitude: 119.84,
    depth: 20,
    deaths: 4340,
    tsunami: true,
    description: 'The Sulawesi earthquake triggered a tsunami and soil liquefaction that devastated Palu and surrounding areas.',
    sources: [
      { name: 'USGS', url: 'https://earthquake.usgs.gov/earthquakes/eventpage/us1000h3p4', type: 'official' },
      { name: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/2018_Sulawesi_earthquake_and_tsunami', type: 'historical' }
    ]
  },
  // Chile
  {
    id: 'cl_2010_maule',
    date: '2010-02-27',
    year: 2010,
    magnitude: 8.8,
    location: 'Maule, Chile',
    country: 'Chile',
    region: 'Maule',
    latitude: -35.85,
    longitude: -72.72,
    depth: 35,
    deaths: 525,
    tsunami: true,
    damage: '$30 billion',
    description: 'One of the most powerful earthquakes ever recorded. The earthquake and tsunami caused widespread damage along the Chilean coast.',
    sources: [
      { name: 'USGS', url: 'https://earthquake.usgs.gov/earthquakes/eventpage/official20100227063411530_30', type: 'official' },
      { name: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/2010_Chile_earthquake', type: 'historical' }
    ]
  },
  {
    id: 'cl_1960_valdivia',
    date: '1960-05-22',
    year: 1960,
    magnitude: 9.5,
    location: 'Valdivia, Chile',
    country: 'Chile',
    latitude: -38.14,
    longitude: -73.41,
    depth: 25,
    deaths: 5700,
    tsunami: true,
    description: 'The Great Chilean Earthquake, the most powerful earthquake ever recorded. Triggered tsunamis that caused deaths as far away as Hawaii, Japan, and the Philippines.',
    sources: [
      { name: 'USGS', url: 'https://earthquake.usgs.gov/earthquakes/eventpage/official19600522191120_30', type: 'official' },
      { name: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/1960_Valdivia_earthquake', type: 'historical' }
    ]
  },
  // Turkey
  {
    id: 'tr_2023_kahramanmaras',
    date: '2023-02-06',
    year: 2023,
    magnitude: 7.8,
    location: 'Kahramanmaraş, Turkey',
    country: 'Turkey',
    region: 'Southeast Anatolia',
    latitude: 37.17,
    longitude: 37.03,
    depth: 10,
    deaths: 59259,
    damage: '$104 billion',
    description: 'A devastating earthquake that struck southeastern Turkey and northern Syria, causing massive casualties and destruction. Followed by a M7.7 aftershock hours later.',
    sources: [
      { name: 'USGS', url: 'https://earthquake.usgs.gov/earthquakes/eventpage/us6000jllz', type: 'official' },
      { name: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/2023_Turkey%E2%80%93Syria_earthquake', type: 'historical' }
    ]
  },
  // USA
  {
    id: 'us_1906_sf',
    date: '1906-04-18',
    year: 1906,
    magnitude: 7.9,
    location: 'San Francisco, California, USA',
    country: 'United States',
    region: 'California',
    city: 'San Francisco',
    latitude: 37.75,
    longitude: -122.55,
    depth: 8,
    deaths: 3000,
    description: 'The Great San Francisco Earthquake and subsequent fires destroyed over 80% of the city and remains one of the most significant natural disasters in US history.',
    sources: [
      { name: 'USGS', url: 'https://earthquake.usgs.gov/earthquakes/eventpage/nc216859', type: 'official' },
      { name: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/1906_San_Francisco_earthquake', type: 'historical' }
    ]
  },
  {
    id: 'us_1964_alaska',
    date: '1964-03-28',
    year: 1964,
    magnitude: 9.2,
    location: 'Prince William Sound, Alaska, USA',
    country: 'United States',
    region: 'Alaska',
    latitude: 61.02,
    longitude: -147.65,
    depth: 25,
    deaths: 131,
    tsunami: true,
    description: 'The Great Alaska Earthquake, the second most powerful earthquake ever recorded. Triggered devastating tsunamis along the Alaskan coast.',
    sources: [
      { name: 'USGS', url: 'https://earthquake.usgs.gov/earthquakes/eventpage/official19640328033616_30', type: 'official' },
      { name: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/1964_Alaska_earthquake', type: 'historical' }
    ]
  },
  // New Zealand
  {
    id: 'nz_2011_christchurch',
    date: '2011-02-22',
    year: 2011,
    magnitude: 6.2,
    location: 'Christchurch, New Zealand',
    country: 'New Zealand',
    region: 'Canterbury',
    city: 'Christchurch',
    latitude: -43.58,
    longitude: 172.68,
    depth: 5,
    deaths: 185,
    damage: '$40 billion NZD',
    description: 'A shallow earthquake that struck Christchurch, causing significant casualties and widespread destruction to the city center and eastern suburbs.',
    sources: [
      { name: 'GeoNet', url: 'https://www.geonet.org.nz/earthquake/3468575', type: 'official' },
      { name: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/2011_Christchurch_earthquake', type: 'historical' }
    ]
  }
];

// Curated significant volcanic events
export const SIGNIFICANT_VOLCANIC_EVENTS: HistoricalVolcanicEvent[] = [
  // Philippines
  {
    id: 'ph_1991_pinatubo',
    date: '1991-06-15',
    year: 1991,
    volcano: 'Mount Pinatubo',
    country: 'Philippines',
    region: 'Central Luzon',
    vei: 6,
    latitude: 15.13,
    longitude: 120.35,
    deaths: 847,
    description: 'The second-largest volcanic eruption of the 20th century. Ejected 10 cubic kilometers of material and caused global cooling for several years.',
    sources: [
      { name: 'USGS', url: 'https://www.usgs.gov/volcanoes/pinatubo', type: 'official' },
      { name: 'PHIVOLCS', url: 'https://www.phivolcs.dost.gov.ph/', type: 'official' },
      { name: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/1991_eruption_of_Mount_Pinatubo', type: 'historical' }
    ]
  },
  {
    id: 'ph_1965_taal',
    date: '1965-09-28',
    year: 1965,
    volcano: 'Taal Volcano',
    country: 'Philippines',
    region: 'Calabarzon',
    vei: 4,
    latitude: 14.01,
    longitude: 120.99,
    deaths: 200,
    description: 'A violent eruption of Taal Volcano that killed around 200 people on Volcano Island.',
    sources: [
      { name: 'PHIVOLCS', url: 'https://www.phivolcs.dost.gov.ph/', type: 'official' },
      { name: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/1965_Taal_Volcano_eruption', type: 'historical' }
    ]
  },
  {
    id: 'ph_2020_taal',
    date: '2020-01-12',
    year: 2020,
    volcano: 'Taal Volcano',
    country: 'Philippines',
    region: 'Calabarzon',
    vei: 4,
    latitude: 14.01,
    longitude: 120.99,
    deaths: 0,
    description: 'A phreatomagmatic eruption that produced a 15km ash column and caused mass evacuations around Taal Lake.',
    sources: [
      { name: 'PHIVOLCS', url: 'https://www.phivolcs.dost.gov.ph/', type: 'official' },
      { name: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/2020_Taal_Volcano_eruption', type: 'historical' }
    ]
  },
  {
    id: 'ph_1814_mayon',
    date: '1814-02-01',
    year: 1814,
    volcano: 'Mayon Volcano',
    country: 'Philippines',
    region: 'Bicol',
    vei: 4,
    latitude: 13.26,
    longitude: 123.69,
    deaths: 1200,
    description: 'The most destructive eruption of Mayon Volcano, burying the town of Cagsawa under pyroclastic flows.',
    sources: [
      { name: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/1814_eruption_of_Mayon', type: 'historical' }
    ]
  },
  // Indonesia
  {
    id: 'id_1883_krakatoa',
    date: '1883-08-27',
    year: 1883,
    volcano: 'Krakatoa',
    country: 'Indonesia',
    vei: 6,
    latitude: -6.10,
    longitude: 105.42,
    deaths: 36000,
    description: 'One of the most violent volcanic events in recorded history. The explosion was heard 4,800 km away and caused tsunamis up to 30 meters high.',
    sources: [
      { name: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/1883_eruption_of_Krakatoa', type: 'historical' }
    ]
  },
  {
    id: 'id_1815_tambora',
    date: '1815-04-10',
    year: 1815,
    volcano: 'Mount Tambora',
    country: 'Indonesia',
    vei: 7,
    latitude: -8.25,
    longitude: 118.00,
    deaths: 92000,
    description: 'The largest volcanic eruption in recorded history. Caused the "Year Without a Summer" in 1816 due to global climate effects.',
    sources: [
      { name: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/1815_eruption_of_Mount_Tambora', type: 'historical' }
    ]
  },
  // Japan
  {
    id: 'jp_2014_ontake',
    date: '2014-09-27',
    year: 2014,
    volcano: 'Mount Ontake',
    country: 'Japan',
    vei: 3,
    latitude: 35.89,
    longitude: 137.48,
    deaths: 63,
    description: 'A sudden phreatic eruption that caught hikers by surprise, becoming the deadliest volcanic disaster in Japan since 1926.',
    sources: [
      { name: 'JMA', url: 'https://www.jma.go.jp/jma/en/Activities/earthquake.html', type: 'official' },
      { name: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/2014_Mount_Ontake_eruption', type: 'historical' }
    ]
  },
  // USA
  {
    id: 'us_1980_sthelens',
    date: '1980-05-18',
    year: 1980,
    volcano: 'Mount St. Helens',
    country: 'United States',
    region: 'Washington',
    vei: 5,
    latitude: 46.20,
    longitude: -122.18,
    deaths: 57,
    description: 'A catastrophic lateral eruption that removed the entire north face of the mountain, causing the largest debris avalanche in recorded history.',
    sources: [
      { name: 'USGS', url: 'https://www.usgs.gov/volcanoes/mount-st-helens', type: 'official' },
      { name: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/1980_eruption_of_Mount_St._Helens', type: 'historical' }
    ]
  }
];

// Get historical earthquakes for a country
export function getHistoricalEarthquakesForCountry(country: string): HistoricalEarthquake[] {
  const normalized = country.toLowerCase();
  return SIGNIFICANT_EARTHQUAKES.filter(eq => 
    eq.country.toLowerCase().includes(normalized) ||
    normalized.includes(eq.country.toLowerCase())
  );
}

// Get historical volcanic events for a country
export function getHistoricalVolcanicEventsForCountry(country: string): HistoricalVolcanicEvent[] {
  const normalized = country.toLowerCase();
  return SIGNIFICANT_VOLCANIC_EVENTS.filter(ev => 
    ev.country.toLowerCase().includes(normalized) ||
    normalized.includes(ev.country.toLowerCase())
  );
}

// Get all historical data for a country
export async function getCountryHistoricalData(
  country: string,
  bounds: { minLat: number; maxLat: number; minLon: number; maxLon: number }
): Promise<{
  significantEarthquakes: HistoricalEarthquake[];
  usgsHistorical: HistoricalEarthquake[];
  volcanicEvents: HistoricalVolcanicEvent[];
}> {
  const [usgsHistorical] = await Promise.all([
    fetchUSGSHistorical(bounds, 6.0, 1900)
  ]);
  
  return {
    significantEarthquakes: getHistoricalEarthquakesForCountry(country),
    usgsHistorical,
    volcanicEvents: getHistoricalVolcanicEventsForCountry(country)
  };
}

// Filter historical data by criteria
export interface HistoricalFilter {
  minYear?: number;
  maxYear?: number;
  minMagnitude?: number;
  maxMagnitude?: number;
  hasTsunami?: boolean;
  minDeaths?: number;
}

export function filterHistoricalEarthquakes(
  earthquakes: HistoricalEarthquake[],
  filter: HistoricalFilter
): HistoricalEarthquake[] {
  return earthquakes.filter(eq => {
    if (filter.minYear && eq.year < filter.minYear) return false;
    if (filter.maxYear && eq.year > filter.maxYear) return false;
    if (filter.minMagnitude && eq.magnitude < filter.minMagnitude) return false;
    if (filter.maxMagnitude && eq.magnitude > filter.maxMagnitude) return false;
    if (filter.hasTsunami !== undefined && eq.tsunami !== filter.hasTsunami) return false;
    if (filter.minDeaths && (!eq.deaths || eq.deaths < filter.minDeaths)) return false;
    return true;
  });
}

export function filterHistoricalVolcanic(
  events: HistoricalVolcanicEvent[],
  filter: { minYear?: number; maxYear?: number; minVEI?: number }
): HistoricalVolcanicEvent[] {
  return events.filter(ev => {
    if (filter.minYear && ev.year < filter.minYear) return false;
    if (filter.maxYear && ev.year > filter.maxYear) return false;
    if (filter.minVEI && (!ev.vei || ev.vei < filter.minVEI)) return false;
    return true;
  });
}
