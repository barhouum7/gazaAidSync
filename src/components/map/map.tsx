'use client';

import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, ZoomControl, 
    // AttributionControl 
} from 'react-leaflet';
import { 
    MapConfig,
    ReliefLocationType,
} from '@/types/map';
import 'leaflet/dist/leaflet.css';
import { useMapState } from '@/hooks/use-map-state';
// import { LocationMarker } from './location-marker';

import { Button } from '../ui/button';
import { Clock, Loader2, RefreshCcw } from 'lucide-react';
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
import TimelineStats from './timeline-stats';

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
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [showTimeline, setShowTimeline] = useState(false);

    const {
        locations, // All locations (fetched by useMapState)
        selectedLocation,
        loading,
        setLoading,
        setError,
        error,
        activeFilters,
        setSelectedLocation,
        setActiveFilters,
        retryOperation,
        fetchLocations: fetchAllLocations, // Renamed for clarity
    } = useMapState();

    // State for locations filtered by date AND active filters
    const [locationsForMap, setLocationsForMap] = useState(locations);
    const [totalLocationsCount, setTotalLocationsCount] = useState(0); // To get total count across all dates

    // Fetch locations for the map based on selectedDate and activeFilters
    useEffect(() => {
        const fetchAndFilterLocations = async () => {
            setLoading(true); // Indicate loading while fetching/filtering
            try {
                // Fetch ALL locations first to get the total count
                const allFetched = await locationService.getLocations();
                setTotalLocationsCount(allFetched.length);

                // Then filter by date and active filters
                const locationsFilteredByDate = await locationService.getLocationsByDate(selectedDate);
                const finalFilteredLocations = locationsFilteredByDate.filter(location =>
                    activeFilters.includes(location.type)
                );
                setLocationsForMap(finalFilteredLocations);
            } catch (err) {
                console.error('Error fetching/filtering locations for map:', err);
                setError(err instanceof Error ? err.message : 'Failed to load map data.');
            } finally {
                setLoading(false);
            }
        };

        if (mounted && leafletLoaded) {
            fetchAndFilterLocations();
        }
    }, [selectedDate, activeFilters, mounted, leafletLoaded, setError, setLoading]); // Re-run when date or filters change

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
            await fetchAllLocations(); // Refresh all locations
            // Re-trigger the filtering useEffect by updating selectedDate or activeFilters
            setSelectedDate(new Date()); // Reset to today to force re-filter
            setActiveFilters(Object.values(ReliefLocationType)); // Reset filters too if desired
        } catch (err) {
            console.error('Error refreshing data:', err);
        } finally {
            // Reset isRefreshing state after operation
            setTimeout(() => {
                setIsRefreshing(false);
            }, 1000); // Delay to show loading state briefly
        }
    };

    const handleDateChange = (date: Date) => {
        // Filter locations based on date
        setSelectedDate(date);
        // console.log('Selected date:', date);
    };

    // Filter locations based on selected date and active filters
    const filteredLocations = useMemo(() => {
        return locations.filter(location => {
            // First apply type filters
            if (!activeFilters.includes(location.type)) {
                return false;
            }

            // Then apply date filter
            const locationDate = new Date(location.lastUpdated);
            const selectedDateStart = new Date(selectedDate);
            selectedDateStart.setHours(0, 0, 0, 0);
            
            const selectedDateEnd = new Date(selectedDate);
            selectedDateEnd.setHours(23, 59, 59, 999);

            return locationDate >= selectedDateStart && locationDate <= selectedDateEnd;
        });
    }, [locations, activeFilters, selectedDate]);


    // Show loading state if not mounted or Leaflet isn't loaded yet
    if (!mounted || !leafletLoaded || loading) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="text-lg font-medium">Initializing map and fetching data...</span>
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
                    // locations={locations}
                    locations={locationsForMap} // Use the date-filtered locations
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

            {/* Timeline Toggle Button */}
            <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTimeline(!showTimeline)}
                className="absolute bottom-3 right-16 z-30 bg-white/95 backdrop-blur-sm hover:bg-white/90"
                title={showTimeline ? "Hide Timeline" : "Show Timeline"}
            >
                <Clock className="h-4 w-4 mr-2" />
                {showTimeline ? "Hide" : "Timeline"}
            </Button>

            {/* Timeline Statistics - Only show when timeline is visible */}
            {showTimeline && (
                <TimelineStats
                    selectedDate={selectedDate}
                    // totalLocations={locations.length}
                    // filteredLocations={filteredLocations.length}
                    totalLocations={totalLocationsCount} // Pass total count from DB
                    filteredLocations={locationsForMap.length} // Pass filtered count
                />
            )}

            {/* Enhanced Timeline Control - Only show when timeline is visible */}
            {showTimeline && (
                <TimelineControl 
                    onDateChange={handleDateChange}
                    selectedDate={selectedDate}
                    // totalLocations={locations.length}
                    // filteredLocations={filteredLocations.length}
                    totalLocations={totalLocationsCount} // Pass total count from DB
                    filteredLocations={locationsForMap.length} // Pass filtered count
                />
            )}
        </div>
    );
};

export default Map;