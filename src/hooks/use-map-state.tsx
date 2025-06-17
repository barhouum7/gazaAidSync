"use client";

import { useState, useCallback, useEffect, useMemo } from 'react';
import { ReliefLocation, ReliefLocationType } from '@/types/map';
import { locationService } from '@/lib/services/location-service';

export const useMapState = () => {
    const [locations, setLocations] = useState<ReliefLocation[]>([]);
    const [selectedLocation, setSelectedLocation] = useState<ReliefLocation | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeFilters, setActiveFilters] = useState<ReliefLocationType[]>(Object.values(ReliefLocationType));

    // Load initial data
    useEffect(() => {
        const loadLocations = async () => {
            try {
                setLoading(true);
                const data = await locationService.getLocations();
                setLocations(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load locations');
            } finally {
                setLoading(false);
            }
        };

        loadLocations();
    }, []);


    const fetchLocations = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const fetchedLocations = await locationService.getLocations(); // Now fetches from DB
            setLocations(fetchedLocations);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch locations');
            console.error('Error fetching locations:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLocations();
    }, [fetchLocations]);

    const addLocation = useCallback(async (location: Omit<ReliefLocation, 'id'>) => {
        const tempId = crypto.randomUUID();
        setLocations(prev => [...prev, { ...location, id: tempId }]);
        try {
            const newLocation = await locationService.addLocation(location);
            setLocations(prev => prev.map(loc => 
                loc.id === tempId ? newLocation : loc
            ));
            return newLocation;
        } catch (err) {
            setLocations(prev => prev.filter(loc => loc.id !== tempId));
            throw err;
        }
    }, []);

    const updateLocation = useCallback(async (id: string, updates: Partial<ReliefLocation>) => {
        try {
            const updatedLocation = await locationService.updateLocation(id, updates);
            setLocations(prev =>
                prev.map(loc => (loc.id === id ? updatedLocation : loc))
            );
            if (selectedLocation?.id === id) {
                setSelectedLocation(updatedLocation);
            }
            return updatedLocation;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update location');
            throw err;
        }
    }, [selectedLocation]);

    const removeLocation = useCallback(async (id: string) => {
        try {
            await locationService.removeLocation(id);
            setLocations(prev => prev.filter(loc => loc.id !== id));
            if (selectedLocation?.id === id) {
                setSelectedLocation(null);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to remove location');
            throw err;
        }
    }, [selectedLocation]);

    const retryOperation = useCallback(async (
        operation: () => Promise<any>,
        maxRetries = 3
    ) => {
        let lastError;
        for (let i = 0; i < maxRetries; i++) {
            try {
                return await operation();
            } catch (err) {
                lastError = err;
                await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
            }
        }
        throw lastError;
    }, []);

    // Filtered locations will be handled in the Map component based on selectedDate
    const filteredLocations = useMemo(() => {
        // This memoization might be redundant if the Map component also filters
        // but it's good to keep if useMapState also needs its own filtered list.
        return locations.filter(location => activeFilters.includes(location.type));
    }, [locations, activeFilters]);


    return {
        locations, // Now directly from the DB via locationService
        selectedLocation,
        loading,
        setLoading,
        setError,
        error,
        activeFilters,
        setSelectedLocation,
        setActiveFilters,
        updateLocation,
        removeLocation,
        retryOperation,
        // Expose fetchLocations so Map component can refresh
        fetchLocations,
    };
};