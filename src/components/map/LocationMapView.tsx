'use client';

import { MapContainer, TileLayer, CircleMarker, Marker, Popup, Tooltip, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getMagnitudeColor } from '@/lib/usgs-api';

/** Minimal earthquake shape so any of our feeds can be plotted. */
export interface MapQuake {
  id?: string;
  latitude: number;
  longitude: number;
  magnitude: number;
  place?: string;
  depth?: number;
  timeAgo?: string;
}

export interface LocationMapViewProps {
  center: [number, number];
  zoom?: number;
  height?: string;
  earthquakes?: MapQuake[];
  /** A primary point of interest (volcano, city, or epicenter). */
  focus?: { lat: number; lon: number; label: string; emoji?: string };
}

const radiusFor = (m: number) => Math.max(4, Math.min(18, m * 2.4));
const finite = (n: unknown): n is number => typeof n === 'number' && Number.isFinite(n);

export default function LocationMapView({
  center,
  zoom = 7,
  height = '420px',
  earthquakes = [],
  focus,
}: LocationMapViewProps) {
  const quakes = earthquakes.filter((q) => finite(q.latitude) && finite(q.longitude) && finite(q.magnitude));

  const focusIcon = focus
    ? L.divIcon({
        className: 'location-focus-pin',
        html: `<div style="font-size:28px;line-height:1;filter:drop-shadow(0 2px 3px rgba(0,0,0,.45))">${focus.emoji ?? '📍'}</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 30],
      })
    : null;

  return (
    <div
      style={{ height, width: '100%' }}
      className="relative z-0 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700"
    >
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <ZoomControl position="topright" />

        {quakes.map((eq, i) => (
          <CircleMarker
            key={`${eq.id ?? 'q'}-${i}`}
            center={[eq.latitude, eq.longitude]}
            radius={radiusFor(eq.magnitude)}
            pathOptions={{
              fillColor: getMagnitudeColor(eq.magnitude),
              fillOpacity: 0.6,
              color: getMagnitudeColor(eq.magnitude),
              weight: 1,
            }}
          >
            <Popup>
              <div className="text-xs leading-relaxed">
                <strong>M{eq.magnitude.toFixed(1)}</strong>
                {eq.place ? ` — ${eq.place}` : ''}
                {(eq.timeAgo || finite(eq.depth)) && (
                  <>
                    <br />
                    {eq.timeAgo ?? ''}
                    {finite(eq.depth) ? `${eq.timeAgo ? ' · ' : ''}${eq.depth.toFixed(0)} km deep` : ''}
                  </>
                )}
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {focus && focusIcon && (
          <Marker position={[focus.lat, focus.lon]} icon={focusIcon}>
            <Tooltip direction="top" offset={[0, -28]} opacity={1} permanent>
              {focus.label}
            </Tooltip>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
