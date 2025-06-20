"use client";

import dynamic from 'next/dynamic';
import { Skeleton } from '../ui/skeleton';
import { Loader2 } from 'lucide-react';



// Dynamically import the Map component to avoid SSR issues with Leaflet
const MapContainerWrapContent = dynamic(
    async () => {
        const { default: L } = await import('leaflet');
        await import('leaflet.markercluster');
        const { default: MapComponent } = await import('@/components/map/map-container');
        return MapComponent;
    },
    {
        loading: () => (
            <div className="w-full h-[300px] sm:h-[400px] md:h-full
            flex items-center justify-center bg-muted/10">
                <Skeleton className="flex items-center justify-center gap-2 w-full h-[300px] sm:h-[400px] md:h-full">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>Loading map...</span>
                </Skeleton>
            </div>
        ),
        ssr: false
    }
);


export function MapContainerWrapper() {
    return <MapContainerWrapContent />;
}