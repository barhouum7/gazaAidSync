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

import { Button } from '../ui/button';
import { Loader2, RefreshCcw } from 'lucide-react';
// import EmergencyAlerts from '../alerts/emergency-alerts';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import TimelineControl from './timeline-control';
import AidLocationDetail from './aid-location-detail';

import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import ClusteredCustomMarkers from './clustered-markers';
import MapControls from './map-controls';
import { cn } from '@/lib/utils';
import { locationService } from '@/lib/services/location-service';
import { useTheme } from 'next-themes';

// Default map configuration for Gaza
const defaultMapConfig: MapConfig = {
    center: [31.5017, 34.4668], // Gaza Strip coordinates
    zoom: 11,
    maxZoom: 18,
    minZoom: 8,
};

interface MapProps {
    isFullscreen: boolean;
    setIsFullscreen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Map: React.FC<MapProps> = ({ isFullscreen, setIsFullscreen }) => {
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [leafletLoaded, setLeafletLoaded] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const {
        locations,
        selectedLocation,
        loading,
        error,
        activeFilters,
        setSelectedLocation,
        setActiveFilters,
        retryOperation
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

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await retryOperation(locationService.getLocations, 3);
        } catch (err) {
            console.error('Error refreshing data:', err);
        }
        setIsRefreshing(false);
    };

    const handleDateChange = (date: Date) => {
        // Filter locations based on date
        console.log('Selected date:', date);
        // Implement date filtering logic here
    };

    // const filteredLocations = locations.filter(
    //     location => activeFilters.includes(location.type)
    // );


    // Show loading state if not mounted or Leaflet isn't loaded yet
    if (!mounted || !leafletLoaded) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="text-lg font-medium">Initializing map...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-background/95">
                <Alert variant="destructive" className="max-w-md">
                    <AlertTitle>Error Loading Map Data</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                    <Button 
                        variant="outline" 
                        className="mt-4 w-fit"
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                    >
                        {isRefreshing ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Retrying...
                            </>
                        ) : (
                            <>
                                <RefreshCcw className="mr-2 h-4 w-4" />
                                Retry
                            </>
                        )}
                    </Button>
                </Alert>
            </div>
        );
    }

    return (
        <div className={cn(
            // "absolute inset-0 flex w-full h-full"
            isFullscreen ? "fixed inset-0 z-50 w-full h-full bg-background" : "relative w-full h-full",
            "flex flex-col items-center justify-center bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
            // "z-0"
        )}>
            {/* Map Container */}
            <MapContainer
                center={defaultMapConfig.center}
                zoom={defaultMapConfig.zoom}
                maxZoom={defaultMapConfig.maxZoom}
                minZoom={defaultMapConfig.minZoom}
                className="w-full h-full z-0"
                zoomControl={false}
                attributionControl={false}
            >
                {/* Modern dark theme map tiles */}
                <TileLayer
                    // url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    url={ theme === 'dark'
                        ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    }
                    // url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />

                <ClusteredCustomMarkers
                    locations={locations}
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


            {/* Map Controls and Filters */}
            <MapControls
                activeFilters={activeFilters}
                onFilterChange={setActiveFilters}
                isRefreshing={isRefreshing}
                onRefresh={handleRefresh}
                isFullscreen={isFullscreen}
                setIsFullscreen={setIsFullscreen}
            />

            {/* Timeline Control */}
            <TimelineControl onDateChange={handleDateChange} />
        </div>
    );
};

export default Map;