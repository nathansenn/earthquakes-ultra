'use client';

import dynamic from 'next/dynamic';
import MapSkeleton from './MapSkeleton';
import type { LocationMapViewProps } from './LocationMapView';

// Leaflet needs the browser, so load the actual map only on the client.
const View = dynamic(() => import('./LocationMapView'), {
  ssr: false,
  loading: () => <MapSkeleton height="100%" />,
});

export default function LocationMap(props: LocationMapViewProps) {
  const { height = '420px' } = props;
  return (
    <div style={{ height }}>
      <View {...props} height="100%" />
    </div>
  );
}
