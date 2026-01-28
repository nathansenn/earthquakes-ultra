'use client';

import { ProcessedEarthquake } from '@/lib/usgs-api';

interface EarthquakeTickerProps {
  earthquakes: ProcessedEarthquake[];
}

export default function EarthquakeTicker({ earthquakes }: EarthquakeTickerProps) {
  return (
    <div className="bg-gray-900 border-t border-gray-800 py-3 overflow-hidden">
      <div className="flex animate-marquee gap-8 whitespace-nowrap hover:[animation-play-state:paused]">
        {earthquakes.map((eq, i) => (
          <div key={eq.id} className="flex items-center gap-2 text-sm">
            <span 
              className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold"
              style={{ 
                backgroundColor: getMagnitudeColor(eq.magnitude), 
                color: eq.magnitude >= 5 ? 'white' : 'black' 
              }}
            >
              {eq.magnitude.toFixed(1)}
            </span>
            <span className="text-gray-300">{eq.place}</span>
            <span className="text-gray-500">•</span>
            <span className="text-gray-500">{eq.timeAgo}</span>
            {i < earthquakes.length - 1 && <span className="text-gray-700 mx-4">|</span>}
          </div>
        ))}
        {/* Duplicate for seamless loop */}
        {earthquakes.map((eq, i) => (
          <div key={`${eq.id}-dup`} className="flex items-center gap-2 text-sm">
            <span 
              className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold"
              style={{ 
                backgroundColor: getMagnitudeColor(eq.magnitude), 
                color: eq.magnitude >= 5 ? 'white' : 'black' 
              }}
            >
              {eq.magnitude.toFixed(1)}
            </span>
            <span className="text-gray-300">{eq.place}</span>
            <span className="text-gray-500">•</span>
            <span className="text-gray-500">{eq.timeAgo}</span>
            {i < earthquakes.length - 1 && <span className="text-gray-700 mx-4">|</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

function getMagnitudeColor(magnitude: number): string {
  if (magnitude >= 7) return '#b91c1c';
  if (magnitude >= 6) return '#ef4444';
  if (magnitude >= 5) return '#f97316';
  if (magnitude >= 4) return '#facc15';
  return '#4ade80';
}
