'use client';

import { useEffect, useRef, useState } from 'react';
import Globe, { GlobeInstance } from 'globe.gl';
import { getMagnitudeColor } from './magnitudeColor';

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

// Magnitude → height of the 3D column (in globe-radius units)
function magAltitude(m: number): number {
  return Math.max(0.015, (m - 1) * 0.045);
}
// Magnitude → column thickness
function magRadius(m: number): number {
  return Math.max(0.16, (m - 2) * 0.055);
}

export default function GlobeRenderer({
  earthquakes,
  autoRotate = true,
  showLabels = true,
}: GlobeRendererProps) {
  const globeRef = useRef<HTMLDivElement>(null);
  const globeInstance = useRef<GlobeInstance | null>(null);
  const [selectedQuake, setSelectedQuake] = useState<Earthquake | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!globeRef.current || globeInstance.current) return;

    const globe = new Globe(globeRef.current)
      .globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
      .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
      .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
      .showAtmosphere(true)
      .atmosphereColor('#6aa6ff')      // realistic blue atmospheric glow
      .atmosphereAltitude(0.22)
      .width(globeRef.current.clientWidth)
      .height(globeRef.current.clientHeight);

    const controls = globe.controls();
    controls.enableZoom = true;
    controls.minDistance = 140;
    controls.maxDistance = 800;
    controls.zoomSpeed = 1.2;
    controls.rotateSpeed = 0.7;
    controls.enableDamping = true;
    controls.dampingFactor = 0.12;
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 0.45;

    // Pause auto-rotation while the user interacts; resume after a brief idle.
    let idleTimer: ReturnType<typeof setTimeout> | undefined;
    const onStart = () => {
      clearTimeout(idleTimer);
      controls.autoRotate = false;
    };
    const onEnd = () => {
      clearTimeout(idleTimer);
      if (autoRotate) idleTimer = setTimeout(() => { controls.autoRotate = true; }, 3500);
    };
    controls.addEventListener('start', onStart);
    controls.addEventListener('end', onEnd);

    // A gentle starting tilt so the globe doesn't read as a flat circle.
    globe.pointOfView({ lat: 18, lng: 120, altitude: 2.4 }, 0);

    globeInstance.current = globe;
    setIsLoaded(true);

    const handleResize = () => {
      if (globeRef.current && globeInstance.current) {
        globeInstance.current
          .width(globeRef.current.clientWidth)
          .height(globeRef.current.clientHeight);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(idleTimer);
      controls.removeEventListener('start', onStart);
      controls.removeEventListener('end', onEnd);
      window.removeEventListener('resize', handleResize);
    };
  }, [autoRotate]);

  // Update earthquake data
  useEffect(() => {
    if (!globeInstance.current || !isLoaded) return;

    // 3D columns: taller + thicker for larger magnitudes.
    const pointsData = earthquakes.map(eq => ({
      lat: eq.latitude,
      lng: eq.longitude,
      altitude: magAltitude(eq.magnitude),
      radius: magRadius(eq.magnitude),
      color: getMagnitudeColor(eq.magnitude),
      earthquake: eq,
    }));

    globeInstance.current
      .pointsData(pointsData)
      .pointLat('lat')
      .pointLng('lng')
      .pointAltitude('altitude')
      .pointRadius('radius')
      .pointColor('color')
      .pointResolution(6)
      .pointsMerge(false)
      .pointLabel((d: object) => {
        const p = d as { earthquake: Earthquake };
        const eq = p.earthquake;
        return `
          <div style="background:rgba(10,12,20,.9);border:1px solid rgba(255,255,255,.12);
            border-radius:10px;padding:8px 10px;color:#fff;font-family:system-ui;max-width:240px">
            <div style="font-weight:700">M${eq.magnitude.toFixed(1)} · ${eq.place}</div>
            <div style="opacity:.7;font-size:12px;margin-top:2px">${eq.depth.toFixed(0)} km deep</div>
          </div>`;
      })
      .onPointClick((point: object) => {
        const p = point as { earthquake: Earthquake };
        setSelectedQuake(p.earthquake);
      });

    // Pulsing rings for events in the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentQuakes = earthquakes.filter(eq => new Date(eq.time) > oneHourAgo);
    const ringsData = recentQuakes.map(eq => ({
      lat: eq.latitude,
      lng: eq.longitude,
      maxR: Math.max(2.5, eq.magnitude * 1.1),
      propagationSpeed: 1.6,
      repeatPeriod: 1400,
      color: getMagnitudeColor(eq.magnitude),
    }));

    globeInstance.current
      .ringsData(ringsData)
      .ringLat('lat')
      .ringLng('lng')
      .ringMaxRadius('maxR')
      .ringPropagationSpeed('propagationSpeed')
      .ringRepeatPeriod('repeatPeriod')
      .ringColor('color');

    // Labels only for the most significant events, to avoid clutter
    const labelsData = showLabels
      ? earthquakes
          .filter(eq => eq.magnitude >= 5.5)
          .map(eq => ({
            lat: eq.latitude,
            lng: eq.longitude,
            text: `M${eq.magnitude.toFixed(1)}`,
            color: 'rgba(255,255,255,0.9)',
            size: 0.7,
            earthquake: eq,
          }))
      : [];

    globeInstance.current
      .labelsData(labelsData)
      .labelLat('lat')
      .labelLng('lng')
      .labelText('text')
      .labelColor('color')
      .labelSize('size')
      .labelDotRadius(0.3)
      .labelAltitude((d: object) => magAltitude((d as { earthquake: Earthquake }).earthquake.magnitude) + 0.01);
  }, [earthquakes, isLoaded, showLabels]);

  return (
    <div className="relative w-full h-full min-h-[500px]">
      <div ref={globeRef} className="w-full h-full rounded-2xl overflow-hidden bg-[#05070f]" />

      {/* Legend */}
      <div className="absolute top-4 left-4 rounded-2xl border border-white/10 bg-black/55 backdrop-blur-md p-4 text-white shadow-xl">
        <h3 className="font-semibold mb-3 text-xs uppercase tracking-wider text-white/70">Magnitude</h3>
        <div className="space-y-1.5 text-xs">
          {[
            { c: '#4ade80', label: 'M1 – 3.9 · Minor' },
            { c: '#facc15', label: 'M4 – 4.9 · Light' },
            { c: '#f97316', label: 'M5 – 5.9 · Moderate' },
            { c: '#ef4444', label: 'M6 – 6.9 · Strong' },
            { c: '#b91c1c', label: 'M7+ · Major' },
          ].map(({ c, label }) => (
            <div key={label} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c, boxShadow: `0 0 6px ${c}` }} />
              <span className="text-white/85">{label}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-white/10 space-y-1.5 text-[11px] text-white/70">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full border-2 border-red-400 animate-ping" />
            <span>Pulsing = last hour</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-1 h-3 rounded-sm bg-white/50" />
            <span>Taller column = larger quake</span>
          </div>
        </div>
      </div>

      {/* Selected earthquake info */}
      {selectedQuake && (
        <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 rounded-2xl border border-white/10 bg-black/70 backdrop-blur-md p-4 text-white shadow-2xl">
          <button
            onClick={() => setSelectedQuake(null)}
            className="absolute top-2.5 right-2.5 w-7 h-7 grid place-items-center rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
          <div className="flex items-start gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg text-white shadow-lg"
              style={{ backgroundColor: getMagnitudeColor(selectedQuake.magnitude) }}
            >
              {selectedQuake.magnitude.toFixed(1)}
            </div>
            <div className="flex-1 min-w-0 pr-5">
              <h4 className="font-semibold text-sm leading-snug">{selectedQuake.place}</h4>
              <p className="text-xs text-white/60 mt-1">
                {new Date(selectedQuake.time).toLocaleString()}
              </p>
              <p className="text-xs text-white/60">Depth: {selectedQuake.depth.toFixed(1)} km</p>
            </div>
          </div>
        </div>
      )}

      {/* Controls hint */}
      <div className="absolute bottom-4 left-4 md:left-1/2 md:-translate-x-1/2 text-white/50 text-xs bg-black/50 backdrop-blur-md border border-white/10 px-3 py-2 rounded-full pointer-events-none">
        Drag to rotate · Scroll to zoom · Click a marker for details
      </div>
    </div>
  );
}
