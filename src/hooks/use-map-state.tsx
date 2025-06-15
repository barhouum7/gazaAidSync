"use client";

import { useState, useCallback, useEffect, useMemo } from 'react';
import { ReliefLocation, ReliefLocationType } from '@/types/map';
import { locationService } from '@/lib/services/location-service';

export const useMapState = () => {
    const [locations, setLocations] = useState<ReliefLocation[]>([]);
    const [selectedLocation, setSelectedLocation] = useState<ReliefLocation | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeFilters, setActiveFilters] = useState<ReliefLocationType[]>(
        Object.values(ReliefLocationType)
    );

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

    const filteredLocations = useMemo(() => {
        const filtered = locations.filter(location => activeFilters.includes(location.type));
        // console.log('[FROM useMapState: ] Filtered locations:', filtered);
        return filtered;
    }, [locations, activeFilters]);

    return {
        locations: filteredLocations,
        selectedLocation,
        loading,
        error,
        activeFilters,
        setSelectedLocation,
        setActiveFilters,
        addLocation,
        updateLocation,
        removeLocation,
        retryOperation
    };
};