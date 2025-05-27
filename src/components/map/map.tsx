'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, ZoomControl, 
    // AttributionControl 
} from 'react-leaflet';
import { 
    MapConfig, 
    // ReliefLocationType 
} from '@/types/map';
import 'leaflet/dist/leaflet.css';
import { useMapState } from '@/hooks/use-map-state';
// import { LocationMarker } from './location-marker';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import Link from 'next/link';
import { Button } from '../ui/button';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import AidStatistics from '../dashboard/aid-statistics';
// import EmergencyAlerts from '../alerts/emergency-alerts';
import LiveUpdatesFeed from '../updates/live-updates-feed';
import MapControls from './map-controls';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import TimelineControl from './timeline-control';
import AidLocationDetail from './aid-location-detail';
import ResizableSidebar from '../layout/resizable-sidebar';
// import CustomMarker from '@/app/custom-marker';

import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import ClusteredCustomMarkers from './clustered-markers';

// Default map configuration for Gaza
const defaultMapConfig: MapConfig = {
    center: [31.5017, 34.4668], // Gaza Strip coordinates
    zoom: 11,
    maxZoom: 18,
    minZoom: 8,
};

const Map = () => {
    const [mounted, setMounted] = useState(false);
    const [leafletLoaded, setLeafletLoaded] = useState(false);

    const {
        locations,
        selectedLocation,
        // loading,
        error,
        activeFilters,
        setSelectedLocation,
        setActiveFilters,
    } = useMapState();

    useEffect(() => {
        const initLeaflet = async () => {
          try {
            const L = await import('leaflet');
            await import('leaflet.markercluster');
            
            // Fix for Leaflet icons in Next.js
            // @ts-expect-error -- Leaflet's Icon.Default.prototype internals
            delete L.Icon.Default.prototype._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            });
    
            setLeafletLoaded(true);
          } catch (error) {
            console.error('Error loading Leaflet:', error);
          }
        };
    
        initLeaflet();
        setMounted(true);
    }, []);


    const handleDateChange = (date: Date) => {
        // Filter locations based on date
        console.log('Selected date:', date);
        // Implement date filtering logic here
    };

    const filteredLocations = locations.filter(
        location => activeFilters.includes(location.type)
    );


    // Show loading state if not mounted or Leaflet isn't loaded yet
    if (!mounted || !leafletLoaded) {
        return (
            <div className="w-full h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-100">
                <div className="flex items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>Loading map data...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-100">
                <Alert variant="destructive" className="max-w-md">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="flex w-full h-[calc(100vh-4rem)] relative">
            {/* Sidebar */}
            <ResizableSidebar>
                <Card className="w-auto h-full overflow-auto border-r">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 mb-4">
                            <h1 className="text-xl font-bold">Gaza Aid Sync</h1>
                            <span className="px-2 py-0.5 text-xs bg-red-100 text-red-800 rounded-full">Live</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="stats" className="space-y-4">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="overview">Overview</TabsTrigger>
                                <TabsTrigger value="stats">Statistics</TabsTrigger>
                                <TabsTrigger value="updates">Updates</TabsTrigger>
                            </TabsList>

                            <TabsContent value="overview">
                                <div className="space-y-4">
                                    {/* Crisis Overview */}
                                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                                        <h3 className="font-semibold text-red-700 mb-2">Crisis Overview</h3>
                                        <ul className="space-y-2 text-sm">
                                            <li>• 90% of population displaced</li>
                                            <li>• 52,000+ casualties reported</li>
                                            <li>• 470,000 at risk of starvation</li>
                                            <li>• 47% of hospitals non-functional</li>
                                        </ul>
                                    </div>

                                    {/* Selected Location Details */}
                                    {selectedLocation && (
                                        <div className="p-4 bg-white rounded-lg border">
                                            <h3 className="font-bold text-lg mb-2">{selectedLocation.name}</h3>
                                            <div className="space-y-2 text-sm">
                                                <p className="flex items-center">
                                                    <span className="font-semibold mr-2">Type:</span>
                                                    {selectedLocation.type}
                                                </p>
                                                <p className="flex items-center">
                                                    <span className="font-semibold mr-2">Status:</span>
                                                    <span className={`px-2 py-1 rounded ${
                                                        selectedLocation.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                                                        selectedLocation.status === 'NEEDS_SUPPORT' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-red-100 text-red-800'
                                                    }`}>
                                                        {selectedLocation.status}
                                                    </span>
                                                </p>
                                                {selectedLocation.description && (
                                                    <p className="mt-2">{selectedLocation.description}</p>
                                                )}
                                                {selectedLocation.contactInfo && (
                                                    <p className="mt-2">
                                                        <span className="font-semibold">Contact:</span> {selectedLocation.contactInfo}
                                                    </p>
                                                )}
                                                <p className="text-xs text-gray-500 mt-2">
                                                    Last updated: {new Date(selectedLocation.lastUpdated).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="space-y-2">
                                        <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700">
                                            <Link href="https://unrwa.org/donate" target="_blank">
                                                Donate to UNRWA
                                            </Link>
                                        </Button>
                                        <Button asChild variant="outline" className="w-full">
                                            <Link href="https://www.wfp.org/emergencies/palestine-emergency" target="_blank">
                                                Support WFP Gaza
                                            </Link>
                                        </Button>
                                        <Button asChild variant="outline" className="w-full">
                                            <Link href="/take-action" className="flex items-center gap-2">
                                                <span>Take Action</span>
                                                <ArrowRight className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </TabsContent>
                            
                            <TabsContent value="stats">
                                <AidStatistics />
                            </TabsContent>

                            <TabsContent value="updates">
                                <LiveUpdatesFeed />
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </ResizableSidebar>
            
            {/* Map Container */}
            <div className="flex-1 relative">
                <MapContainer
                    center={defaultMapConfig.center}
                    zoom={defaultMapConfig.zoom}
                    maxZoom={defaultMapConfig.maxZoom}
                    minZoom={defaultMapConfig.minZoom}
                    className="flex-1 h-full"
                    zoomControl={false}
                    attributionControl={false}
                >
                    {/* Modern dark theme map tiles */}
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    />
                    
                    {/* {filteredLocations.map((location) => (
                        <CustomMarker
                            key={location.id}
                            location={location}
                            onSelect={setSelectedLocation}
                        />
                    ))} */}

                    <ClusteredCustomMarkers
                        locations={filteredLocations}
                        onMarkerClick={setSelectedLocation}
                    />

                    {selectedLocation && (
                        <AidLocationDetail
                            location={selectedLocation}
                            onClose={() => setSelectedLocation(null)}
                        />
                    )}

                    <ZoomControl position="bottomright" />
                    {/* <AttributionControl position="bottomleft" /> */}
                </MapContainer>

                {/* Map Controls */}
                <MapControls
                    activeFilters={activeFilters}
                    onFilterChange={setActiveFilters}
                />

                {/* Timeline Control */}
                <TimelineControl onDateChange={handleDateChange} />
            </div>
        </div>
    );
};

export default Map;