import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { REGIONS, getRegionInfo } from '@/lib/regional-api';
import { 
  fetchUSGSHistorical, 
  getHistoricalEarthquakesForCountry, 
  getHistoricalVolcanicEventsForCountry,
  SIGNIFICANT_EARTHQUAKES,
  SIGNIFICANT_VOLCANIC_EVENTS,
  HistoricalEarthquake,
  HistoricalVolcanicEvent
} from '@/lib/historical-api';

interface Props {
  params: { country: string };
  searchParams: { 
    minMag?: string;
    minYear?: string;
    maxYear?: string;
    type?: string;
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const region = getRegionInfo(params.country);
  const name = region?.name || params.country.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  
  return {
    title: `Historical Earthquakes & Volcanoes in ${name} | QuakeGlobe`,
    description: `Explore the seismic history of ${name}. Major earthquakes, volcanic eruptions, and geological events with sources and detailed information.`,
  };
}

export const revalidate = 86400; // Cache for 24 hours

export default async function HistoryPage({ params, searchParams }: Props) {
  const region = getRegionInfo(params.country);
  
  if (!region) {
    notFound();
  }
  
  // Parse filters
  const minMag = parseFloat(searchParams.minMag || '5');
  const minYear = parseInt(searchParams.minYear || '1900');
  const maxYear = parseInt(searchParams.maxYear || new Date().getFullYear().toString());
  const eventType = searchParams.type || 'all';
  
  // Fetch historical data
  const [usgsHistorical] = await Promise.all([
    fetchUSGSHistorical(region.bounds, minMag, minYear)
  ]);
  
  // Get curated significant events
  const significantEarthquakes = getHistoricalEarthquakesForCountry(region.name);
  const volcanicEvents = getHistoricalVolcanicEventsForCountry(region.name);
  
  // Filter by year range
  const filteredUSGS = usgsHistorical.filter(eq => eq.year >= minYear && eq.year <= maxYear);
  const filteredSignificant = significantEarthquakes.filter(eq => eq.year >= minYear && eq.year <= maxYear);
  const filteredVolcanic = volcanicEvents.filter(ev => ev.year >= minYear && ev.year <= maxYear);
  
  // Combine and sort earthquakes by magnitude (most significant first)
  const allEarthquakes = [...filteredSignificant];
  
  // Add USGS earthquakes that aren't already in significant list
  for (const eq of filteredUSGS) {
    const isDuplicate = allEarthquakes.some(existing => 
      Math.abs(existing.year - eq.year) < 1 &&
      Math.abs(existing.magnitude - eq.magnitude) < 0.3
    );
    if (!isDuplicate) {
      allEarthquakes.push(eq);
    }
  }
  
  allEarthquakes.sort((a, b) => b.magnitude - a.magnitude);
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 to-orange-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <nav className="text-sm mb-4">
            <Link href="/" className="hover:underline">Home</Link>
            <span className="mx-2">›</span>
            <Link href={`/country/${params.country}`} className="hover:underline">{region.name}</Link>
            <span className="mx-2">›</span>
            <span>Historical Data</span>
          </nav>
          
          <h1 className="text-4xl font-bold mb-2">
            📜 Historical Earthquakes & Volcanoes
          </h1>
          <p className="text-xl text-amber-100">
            {region.name} • {minYear} - {maxYear}
          </p>
        </div>
      </div>
      
      {/* Filters */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <form className="flex flex-wrap gap-4 items-center">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Min Magnitude</label>
              <select 
                name="minMag" 
                defaultValue={minMag}
                className="border rounded px-3 py-2"
              >
                <option value="5">M5.0+</option>
                <option value="6">M6.0+</option>
                <option value="7">M7.0+</option>
                <option value="8">M8.0+</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs text-gray-500 mb-1">From Year</label>
              <select 
                name="minYear" 
                defaultValue={minYear}
                className="border rounded px-3 py-2"
              >
                <option value="1900">1900</option>
                <option value="1950">1950</option>
                <option value="1980">1980</option>
                <option value="2000">2000</option>
                <option value="2010">2010</option>
                <option value="2020">2020</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs text-gray-500 mb-1">To Year</label>
              <select 
                name="maxYear" 
                defaultValue={maxYear}
                className="border rounded px-3 py-2"
              >
                <option value="2026">2026</option>
                <option value="2020">2020</option>
                <option value="2010">2010</option>
                <option value="2000">2000</option>
                <option value="1990">1990</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs text-gray-500 mb-1">Event Type</label>
              <select 
                name="type" 
                defaultValue={eventType}
                className="border rounded px-3 py-2"
              >
                <option value="all">All Events</option>
                <option value="earthquake">Earthquakes Only</option>
                <option value="volcanic">Volcanic Only</option>
                <option value="tsunami">With Tsunami</option>
              </select>
            </div>
            
            <button 
              type="submit"
              className="bg-amber-600 text-white px-6 py-2 rounded hover:bg-amber-700 mt-5"
            >
              Apply Filters
            </button>
          </form>
        </div>
      </div>
      
      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="text-3xl font-bold text-amber-600">{allEarthquakes.length}</div>
            <div className="text-sm text-gray-500">Total Earthquakes</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="text-3xl font-bold text-red-600">
              {allEarthquakes.filter(eq => eq.magnitude >= 7).length}
            </div>
            <div className="text-sm text-gray-500">M7+ Events</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="text-3xl font-bold text-orange-600">{filteredVolcanic.length}</div>
            <div className="text-sm text-gray-500">Volcanic Events</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="text-3xl font-bold text-blue-600">
              {allEarthquakes.filter(eq => eq.tsunami).length}
            </div>
            <div className="text-sm text-gray-500">Tsunami Events</div>
          </div>
        </div>
        
        {/* Significant Earthquakes Section */}
        {(eventType === 'all' || eventType === 'earthquake') && filteredSignificant.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              ⚡ Notable Historical Earthquakes
              <span className="text-sm font-normal text-gray-500">
                (Curated with detailed information)
              </span>
            </h2>
            
            <div className="space-y-4">
              {filteredSignificant.map(eq => (
                <SignificantEarthquakeCard key={eq.id} earthquake={eq} />
              ))}
            </div>
          </section>
        )}
        
        {/* Volcanic Events Section */}
        {(eventType === 'all' || eventType === 'volcanic') && filteredVolcanic.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              🌋 Historical Volcanic Events
            </h2>
            
            <div className="space-y-4">
              {filteredVolcanic.map(ev => (
                <VolcanicEventCard key={ev.id} event={ev} />
              ))}
            </div>
          </section>
        )}
        
        {/* All USGS Historical Data */}
        {(eventType === 'all' || eventType === 'earthquake') && (
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              📊 Complete Earthquake Record
              <span className="text-sm font-normal text-gray-500">
                (M{minMag}+ from USGS database)
              </span>
            </h2>
            
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Magnitude</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Location</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Depth</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Source</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {allEarthquakes.slice(0, 100).map((eq, i) => (
                    <tr key={eq.id || i} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">{eq.date}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center justify-center w-12 h-8 rounded text-white font-bold text-sm ${
                          eq.magnitude >= 8 ? 'bg-purple-600' :
                          eq.magnitude >= 7 ? 'bg-red-600' :
                          eq.magnitude >= 6 ? 'bg-orange-500' :
                          'bg-yellow-500'
                        }`}>
                          {eq.magnitude.toFixed(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {eq.location}
                        {eq.tsunami && <span className="ml-2 text-blue-500">🌊</span>}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {eq.depth ? `${eq.depth.toFixed(0)} km` : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {eq.sources[0] && (
                          <a 
                            href={eq.sources[0].url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {eq.sources[0].name}
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {allEarthquakes.length > 100 && (
                <div className="p-4 bg-gray-50 text-center text-sm text-gray-500">
                  Showing 100 of {allEarthquakes.length} earthquakes
                </div>
              )}
            </div>
          </section>
        )}
        
        {/* Data Sources */}
        <section className="mt-12 p-6 bg-blue-50 rounded-lg">
          <h3 className="font-bold text-lg mb-3">📚 Data Sources</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <strong>USGS Earthquake Hazards Program</strong> - 
              <a href="https://earthquake.usgs.gov/" className="text-blue-600 ml-1" target="_blank" rel="noopener noreferrer">
                earthquake.usgs.gov
              </a>
            </li>
            <li>
              <strong>EMSC (European-Mediterranean Seismological Centre)</strong> - 
              <a href="https://www.emsc-csem.org/" className="text-blue-600 ml-1" target="_blank" rel="noopener noreferrer">
                emsc-csem.org
              </a>
            </li>
            <li>
              <strong>NOAA National Centers for Environmental Information</strong> - 
              <a href="https://www.ngdc.noaa.gov/hazard/" className="text-blue-600 ml-1" target="_blank" rel="noopener noreferrer">
                ngdc.noaa.gov
              </a>
            </li>
            <li>
              <strong>Wikipedia Historical Records</strong> - Community-verified historical data
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}

// Significant Earthquake Card Component
function SignificantEarthquakeCard({ earthquake }: { earthquake: HistoricalEarthquake }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="flex">
        <div className={`w-24 flex items-center justify-center text-white font-bold text-2xl ${
          earthquake.magnitude >= 8 ? 'bg-purple-600' :
          earthquake.magnitude >= 7 ? 'bg-red-600' :
          earthquake.magnitude >= 6 ? 'bg-orange-500' :
          'bg-yellow-500'
        }`}>
          M{earthquake.magnitude.toFixed(1)}
        </div>
        
        <div className="flex-1 p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-lg">{earthquake.location}</h3>
              <p className="text-gray-500">{earthquake.date}</p>
            </div>
            <div className="flex gap-2">
              {earthquake.tsunami && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                  🌊 Tsunami
                </span>
              )}
              {earthquake.deaths && earthquake.deaths > 1000 && (
                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
                  💔 {earthquake.deaths.toLocaleString()} deaths
                </span>
              )}
            </div>
          </div>
          
          <p className="mt-2 text-gray-700">{earthquake.description}</p>
          
          <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-500">
            {earthquake.depth && <span>📍 Depth: {earthquake.depth} km</span>}
            {earthquake.deaths && <span>💔 Deaths: {earthquake.deaths.toLocaleString()}</span>}
            {earthquake.damage && <span>💰 Damage: {earthquake.damage}</span>}
          </div>
          
          <div className="mt-3 pt-3 border-t flex flex-wrap gap-2">
            <span className="text-xs text-gray-500">Sources:</span>
            {earthquake.sources.map((source, i) => (
              <a
                key={i}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline"
              >
                {source.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Volcanic Event Card Component
function VolcanicEventCard({ event }: { event: HistoricalVolcanicEvent }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="flex">
        <div className="w-24 flex flex-col items-center justify-center bg-orange-600 text-white p-2">
          <span className="text-2xl">🌋</span>
          {event.vei && (
            <span className="text-sm mt-1">VEI {event.vei}</span>
          )}
        </div>
        
        <div className="flex-1 p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-lg">{event.volcano}</h3>
              <p className="text-gray-500">{event.date}</p>
            </div>
            {event.deaths && event.deaths > 0 && (
              <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
                💔 {event.deaths.toLocaleString()} deaths
              </span>
            )}
          </div>
          
          <p className="mt-2 text-gray-700">{event.description}</p>
          
          <div className="mt-3 pt-3 border-t flex flex-wrap gap-2">
            <span className="text-xs text-gray-500">Sources:</span>
            {event.sources.map((source, i) => (
              <a
                key={i}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline"
              >
                {source.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
