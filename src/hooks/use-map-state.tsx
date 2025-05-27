"use client";

import { useState, useCallback, useEffect } from 'react';
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
        try {
            const newLocation = await locationService.addLocation(location);
            setLocations(prev => [...prev, newLocation]);
            return newLocation;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add location');
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

    const filteredLocations = locations.filter(
        location => activeFilters.includes(location.type)
    );

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
    };
};