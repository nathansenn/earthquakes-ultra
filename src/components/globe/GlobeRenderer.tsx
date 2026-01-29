'use client';

import { useEffect, useRef, useState } from 'react';
import Globe, { GlobeInstance } from 'globe.gl';

interface Earthquake {
  id: string;
  latitude: number;
  longitude: number;
  magnitude: number;
  place: string;
  time: Date;
  depth: number;
}

interface GlobeRendererProps {
  earthquakes: Earthquake[];
  autoRotate?: boolean;
  showLabels?: boolean;
}

export default function GlobeRenderer({ 
  earthquakes, 
  autoRotate = true,
  showLabels = true 
}: GlobeRendererProps) {
  const globeRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const globeInstance = useRef<GlobeInstance | null>(null);
  const [selectedQuake, setSelectedQuake] = useState<Earthquake | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!globeRef.current || globeInstance.current) return;

    // Create globe
    const globe = new Globe(globeRef.current)
      .globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
      .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
      .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
      .showAtmosphere(true)
      .atmosphereColor('#ff4444')
      .atmosphereAltitude(0.15)
      .width(globeRef.current.clientWidth)
      .height(globeRef.current.clientHeight);

    // Enable auto rotation
    if (autoRotate) {
      globe.controls().autoRotate = true;
      globe.controls().autoRotateSpeed = 0.5;
    }

    // Enable zoom
    globe.controls().enableZoom = true;
    globe.controls().minDistance = 150;
    globe.controls().maxDistance = 500;

    globeInstance.current = globe;
    setIsLoaded(true);

    // Handle resize
    const handleResize = () => {
      if (globeRef.current && globeInstance.current) {
        globeInstance.current
          .width(globeRef.current.clientWidth)
          .height(globeRef.current.clientHeight);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [autoRotate]);

  // Update earthquake points
  useEffect(() => {
    if (!globeInstance.current || !isLoaded) return;

    const pointsData = earthquakes.map(eq => ({
      lat: eq.latitude,
      lng: eq.longitude,
      size: Math.max(0.1, (eq.magnitude - 2) * 0.15),
      color: getMagnitudeColor(eq.magnitude),
      altitude: 0.01,
      earthquake: eq,
    }));

    globeInstance.current
      .pointsData(pointsData)
      .pointLat('lat')
      .pointLng('lng')
      .pointAltitude('altitude')
      .pointRadius('size')
      .pointColor('color')
      .pointsMerge(false)
      .onPointClick((point: unknown) => {
        const p = point as { earthquake: Earthquake };
        setSelectedQuake(p.earthquake);
      });

    // Add pulsing rings for recent earthquakes (last hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentQuakes = earthquakes.filter(eq => new Date(eq.time) > oneHourAgo);

    const ringsData = recentQuakes.map(eq => ({
      lat: eq.latitude,
      lng: eq.longitude,
      maxR: Math.max(2, eq.magnitude * 0.8),
      propagationSpeed: 2,
      repeatPeriod: 1500,
      color: () => getMagnitudeColor(eq.magnitude),
    }));

    globeInstance.current
      .ringsData(ringsData)
      .ringLat('lat')
      .ringLng('lng')
      .ringMaxRadius('maxR')
      .ringPropagationSpeed('propagationSpeed')
      .ringRepeatPeriod('repeatPeriod')
      .ringColor('color');

    // Add labels for significant earthquakes
    if (showLabels) {
      const labelsData = earthquakes
        .filter(eq => eq.magnitude >= 5.0)
        .map(eq => ({
          lat: eq.latitude,
          lng: eq.longitude,
          text: `M${eq.magnitude.toFixed(1)}`,
          color: 'white',
          size: 0.8,
          earthquake: eq,
        }));

      globeInstance.current
        .labelsData(labelsData)
        .labelLat('lat')
        .labelLng('lng')
        .labelText('text')
        .labelColor('color')
        .labelSize('size')
        .labelDotRadius(0.4)
        .labelAltitude(0.02);
    }
  }, [earthquakes, isLoaded, showLabels]);

  return (
    <div className="relative w-full h-full min-h-[500px]">
      <div ref={globeRef} className="w-full h-full rounded-2xl overflow-hidden" />
      
      {/* Legend */}
      <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm rounded-xl p-4 text-white">
        <h3 className="font-semibold mb-3 text-sm">Magnitude Scale</h3>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-400"></span>
            <span>2.5 - 3.9 (Minor)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
            <span>4.0 - 4.9 (Light)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-orange-500"></span>
            <span>5.0 - 5.9 (Moderate)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500"></span>
            <span>6.0 - 6.9 (Strong)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-700"></span>
            <span>7.0+ (Major)</span>
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-white/20">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full border-2 border-red-500 animate-ping"></div>
            <span className="text-xs">Pulsing = Last Hour</span>
          </div>
        </div>
      </div>

      {/* Selected earthquake info */}
      {selectedQuake && (
        <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-black/80 backdrop-blur-sm rounded-xl p-4 text-white">
          <button 
            onClick={() => setSelectedQuake(null)}
            className="absolute top-2 right-2 text-gray-400 hover:text-white"
          >
            ✕
          </button>
          <div className="flex items-start gap-3">
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg"
              style={{ backgroundColor: getMagnitudeColor(selectedQuake.magnitude) }}
            >
              {selectedQuake.magnitude.toFixed(1)}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-sm">{selectedQuake.place}</h4>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(selectedQuake.time).toLocaleString()}
              </p>
              <p className="text-xs text-gray-400">
                Depth: {selectedQuake.depth.toFixed(1)} km
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Controls hint */}
      <div className="absolute bottom-4 right-4 text-white/50 text-xs bg-black/50 px-3 py-2 rounded-lg">
        🖱️ Drag to rotate • Scroll to zoom • Click markers for details
      </div>
    </div>
  );
}

function getMagnitudeColor(magnitude: number): string {
  if (magnitude >= 7) return '#b91c1c'; // red-700
  if (magnitude >= 6) return '#ef4444'; // red-500
  if (magnitude >= 5) return '#f97316'; // orange-500
  if (magnitude >= 4) return '#facc15'; // yellow-400
  return '#4ade80'; // green-400
}
