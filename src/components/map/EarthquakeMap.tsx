'use client';

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap, LayersControl, ZoomControl } from 'react-leaflet';
import type { Map as LeafletMap } from 'leaflet';
import { ProcessedEarthquake, getMagnitudeColor } from '@/lib/usgs-api';
import 'leaflet/dist/leaflet.css';

// Philippines center and bounds
const PHILIPPINES_CENTER: [number, number] = [12.8797, 121.774];
const PHILIPPINES_BOUNDS: [[number, number], [number, number]] = [
  [4.5, 116.0],   // Southwest
  [21.5, 127.0],  // Northeast
];

export interface EarthquakeMapProps {
  earthquakes: ProcessedEarthquake[];
  center?: [number, number];
  zoom?: number;
  bounds?: [[number, number], [number, number]];
  height?: string;
  selectedQuake?: ProcessedEarthquake | null;
  onEarthquakeClick?: (eq: ProcessedEarthquake) => void;
  showControls?: boolean;
}

// Component to fit bounds when earthquakes change
function FitBounds({ 
  earthquakes, 
  bounds,
  selectedQuake 
}: { 
  earthquakes: ProcessedEarthquake[]; 
  bounds?: [[number, number], [number, number]];
  selectedQuake?: ProcessedEarthquake | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (selectedQuake) {
      map.setView([selectedQuake.latitude, selectedQuake.longitude], 10, { animate: true });
    } else if (bounds) {
      map.fitBounds(bounds, { padding: [20, 20] });
    } else if (earthquakes.length > 0) {
      // Fit to earthquake locations with some padding
      const lats = earthquakes.map(eq => eq.latitude);
      const lngs = earthquakes.map(eq => eq.longitude);
      const bounds: [[number, number], [number, number]] = [
        [Math.min(...lats), Math.min(...lngs)],
        [Math.max(...lats), Math.max(...lngs)],
      ];
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [earthquakes, bounds, selectedQuake, map]);

  return null;
}

// Control component for zooming to Philippines
function MapControls({ 
  earthquakes,
  onZoomToPhilippines,
  onZoomToAll,
}: {
  earthquakes: ProcessedEarthquake[];
  onZoomToPhilippines: () => void;
  onZoomToAll: () => void;
}) {
  const map = useMap();
  
  return (
    <div className="absolute bottom-4 left-4 z-[1000] flex flex-col gap-2">
      <button
        onClick={() => {
          map.fitBounds(PHILIPPINES_BOUNDS, { padding: [20, 20] });
          onZoomToPhilippines();
        }}
        className="bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-600"
        title="Zoom to Philippines"
      >
        🇵🇭 Philippines
      </button>
      {earthquakes.length > 0 && (
        <button
          onClick={() => {
            const lats = earthquakes.map(eq => eq.latitude);
            const lngs = earthquakes.map(eq => eq.longitude);
            const bounds: [[number, number], [number, number]] = [
              [Math.min(...lats), Math.min(...lngs)],
              [Math.max(...lats), Math.max(...lngs)],
            ];
            map.fitBounds(bounds, { padding: [50, 50] });
            onZoomToAll();
          }}
          className="bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-600"
          title="Zoom to all earthquakes"
        >
          📍 Show All
        </button>
      )}
    </div>
  );
}

export default function EarthquakeMap({
  earthquakes,
  center = PHILIPPINES_CENTER,
  zoom = 6,
  bounds,
  height = '100%',
  selectedQuake,
  onEarthquakeClick,
  showControls = true,
}: EarthquakeMapProps) {
  const mapRef = useRef<LeafletMap | null>(null);

  // Calculate marker radius based on magnitude
  const getRadius = (magnitude: number): number => {
    return Math.max(4, Math.min(20, magnitude * 2.5));
  };

  return (
    <div style={{ height, width: '100%' }} className="relative">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        ref={mapRef}
        className="rounded-lg"
      >
        {/* Layer Controls */}
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Street Map">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Light">
            <TileLayer
              attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Dark">
            <TileLayer
              attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Satellite">
            <TileLayer
              attribution='Tiles &copy; Esri'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Terrain">
            <TileLayer
              attribution='Map tiles by <a href="https://stamen.com">Stamen Design</a>'
              url="https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}{r}.png"
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        {/* Zoom control in a better position */}
        <ZoomControl position="topright" />

        {/* Fit bounds helper */}
        <FitBounds 
          earthquakes={earthquakes} 
          bounds={bounds}
          selectedQuake={selectedQuake}
        />

        {/* Custom controls */}
        {showControls && (
          <MapControls 
            earthquakes={earthquakes}
            onZoomToPhilippines={() => {}}
            onZoomToAll={() => {}}
          />
        )}

        {/* Earthquake markers */}
        {earthquakes.map((eq) => {
          const isSelected = selectedQuake?.id === eq.id;
          const color = getMagnitudeColor(eq.magnitude);
          const radius = getRadius(eq.magnitude);

          return (
            <CircleMarker
              key={eq.id}
              center={[eq.latitude, eq.longitude]}
              radius={isSelected ? radius * 1.3 : radius}
              pathOptions={{
                fillColor: color,
                fillOpacity: isSelected ? 1 : 0.7,
                color: isSelected ? '#fff' : color,
                weight: isSelected ? 3 : 1,
              }}
              eventHandlers={{
                click: () => onEarthquakeClick?.(eq),
              }}
            >
              <Popup>
                <div className="min-w-[200px]">
                  <div className="flex items-start gap-2 mb-2">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                      style={{ backgroundColor: color }}
                    >
                      {eq.magnitude.toFixed(1)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                        {eq.place}
                      </h3>
                      <p className="text-xs text-gray-500">{eq.timeAgo}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                    <div className="bg-gray-100 rounded p-1.5">
                      <span className="text-gray-500">Depth:</span>
                      <span className="font-medium ml-1">{eq.depth.toFixed(1)} km</span>
                    </div>
                    <div className="bg-gray-100 rounded p-1.5">
                      <span className="text-gray-500">Intensity:</span>
                      <span className="font-medium ml-1">{eq.intensity}</span>
                    </div>
                  </div>
                  <a
                    href={eq.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center text-xs bg-blue-600 text-white py-1.5 rounded hover:bg-blue-700 transition-colors"
                  >
                    View on USGS →
                  </a>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
