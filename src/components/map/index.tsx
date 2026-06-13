'use client';

import dynamic from 'next/dynamic';
import MapSkeleton from './MapSkeleton';

// Dynamic import to avoid SSR issues with Leaflet
export const EarthquakeMap = dynamic(
  () => import('./EarthquakeMap'),
  { 
    ssr: false, 
    loading: () => <MapSkeleton /> 
  }
);

export { default as MapSkeleton } from './MapSkeleton';
export { default as LocationMap } from './LocationMap';
export type { EarthquakeMapProps } from './EarthquakeMap';
export type { LocationMapViewProps, MapQuake } from './LocationMapView';
