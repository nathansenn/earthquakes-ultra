'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';

interface Earthquake {
  id: string;
  latitude: number;
  longitude: number;
  magnitude: number;
  place: string;
  time: Date;
  depth: number;
}

interface EarthquakeGlobeProps {
  earthquakes: Earthquake[];
  autoRotate?: boolean;
  showLabels?: boolean;
}

// Globe.gl doesn't work well with SSR, so we need dynamic import
const GlobeComponent = dynamic(() => import('./GlobeRenderer'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-gray-900 rounded-2xl">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-400">Loading 3D Globe...</p>
      </div>
    </div>
  ),
});

export default function EarthquakeGlobe({ 
  earthquakes, 
  autoRotate = true,
  showLabels = true 
}: EarthquakeGlobeProps) {
  return (
    <GlobeComponent 
      earthquakes={earthquakes} 
      autoRotate={autoRotate}
      showLabels={showLabels}
    />
  );
}
