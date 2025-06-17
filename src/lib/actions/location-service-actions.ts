"use server";

import prismadb from '@/lib/prismadb';
import { AidPoint } from '@prisma/client';


// Fetch all aid points from the database
export const getAllAidPoints = async () => {
    try {
        return await prismadb.aidPoint.findMany({
            orderBy: {
                createdAt: 'desc',
            },
        });
    } catch (error) {
        console.error('Error fetching aid points:', error);
        throw new Error('Failed to fetch aid points');
    }
}


// Fetch locations from DB filtered by lastUpdated within the selected day
export const getLocationsByDateAction = async (
    startOfDay: Date,
    endOfDay: Date
) => {
    try {
        return await prismadb.aidPoint.findMany({
            where: {
                lastUpdated: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
            },
            orderBy: {
                lastUpdated: 'desc',
            },
        });
    } catch (error) {
        console.error('Error fetching locations by date:', error);
        throw new Error('Failed to fetch locations by date');
    }
}


// Get location by id
export const getLocationByIdAction = async (id: string) => {
    try {
        const location = await prismadb.aidPoint.findUnique({
            where: { id },
        });
        if (!location) throw new Error('Location not found');
        return location;
    } catch (error) {
        console.error(`Error fetching location with id ${id}:`, error);
        throw new Error('Failed to fetch location');
    }
}


// Get total locations in the DB
export const getTotalLocationsAction = async () => {
    try {
        const totalLocations = await prismadb.aidPoint.count();
        return totalLocations;
    } catch (error) {
        console.error('Error fetching total locations:', error);
        throw new Error('Failed to fetch total locations');
    }
}

// Create new AidPoint
export const createNewAidPointAction = async (data: Omit<AidPoint, 'id'>) => { // Omit<AidPoint, 'id'> means we are omitting the 'id' property from the 'data' object, so we only include the properties that we want to use to create the new location.
    try {
        const newLocation = await prismadb.aidPoint.create({
            data,
        });
        return newLocation;
    } catch (error) {
        console.error('Error creating new location:', error);
        throw new Error('Failed to create new location');
    }
}


// Find by primary key (id) and update
export const updateLocationByIdAction = async (id: string, data: Partial<AidPoint>) => {
    try {
        const updatedLocation = await prismadb.aidPoint.update({
            where: { id },
            data,
        });
        return updatedLocation;
    } catch (error) {
        console.error(`Error updating location with id ${id}:`, error);
        throw new Error('Failed to update location');
    }
}


// Delete location by primary key (id)
export const deleteLocationByIdAction = async (id: string) => {
    try {
        const deletedLocation = await prismadb.aidPoint.delete({
            where: { id },
        });
        return deletedLocation;
    } catch (error) {
        console.error(`Error deleting location with id ${id}:`, error);
        throw new Error('Failed to delete location');
    }
}
