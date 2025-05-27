"use client";

import dynamic from 'next/dynamic';
// import MapErrorBoundary from './map-error-boundary';

// Dynamically import the Map component with no SSR
const MapComponent = dynamic(() => import('./map'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-100">
            <div className="animate-pulse">Loading map...</div>
        </div>
    ),
});

const MapWithErrorBoundary = () => {
    return (
        <MapComponent />
        // <MapErrorBoundary>
        // </MapErrorBoundary>
    );
};

export default MapWithErrorBoundary;