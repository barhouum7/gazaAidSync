/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const Map = dynamic(
  async () => {
    const { default: L } = await import('leaflet');
    await import('leaflet.markercluster');
    const { default: MapComponent } = await import('./map');
    return MapComponent;
  },
  {
    loading: () => (
      <div className="w-full h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-100">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading map...</span>
        </div>
      </div>
    ),
    ssr: false
  }
);

export default Map;