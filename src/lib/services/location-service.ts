import { ReliefLocation, ReliefLocationType, LocationStatus } from '@/types/map';
// import { dataSourceService } from './data-sources';
import { newsService } from './news-service';
// import { mockDataService } from './mock-data-service';
import { LatLngTuple } from 'leaflet';
import { addDays, endOfDay, format, startOfDay } from 'date-fns';
import { createNewAidPointAction, deleteLocationByIdAction, getAllAidPoints, getLocationByIdAction, getLocationsByDateAction, getTotalLocationsAction, updateLocationByIdAction } from '../actions/location-service-actions';
import { AidPoint } from '@prisma/client';

// Sample initial data - In a real app, this would come from an API
// const initialLocations: ReliefLocation[] = [
//     {
//         id: '1',
//         name: 'Al-Shifa Hospital',
//         location: [31.5204, 34.4667],
//         type: ReliefLocationType.MEDICAL,
//         status: LocationStatus.NEEDS_SUPPORT,
//         lastUpdated: new Date(),
//         description: 'Major medical center in Gaza City',
//         capacity: 700,
//         needs: ['Medical Supplies', 'Generators', 'Fuel'],
//         contactInfo: '+972 123456789'
//     },
//     {
//         id: '2',
//         name: 'Rafah Food Distribution',
//         location: [31.3547, 34.2377],
//         type: ReliefLocationType.FOOD,
//         status: LocationStatus.ACTIVE,
//         lastUpdated: new Date(),
//         description: 'Main food distribution point in Rafah',
//         capacity: 1000,
//         needs: ['Food Supplies', 'Water'],
//         contactInfo: '+972 987654321'
//     },
//     {
//         id: '3',
//         name: 'UNRWA Shelter',
//         location: [31.5010, 34.4660],
//         type: ReliefLocationType.SHELTER,
//         status: LocationStatus.ACTIVE,
//         lastUpdated: new Date(),
//         description: 'Temporary shelter for displaced families',
//         capacity: 500,
//         needs: ['Blankets', 'Clothing'],
//         contactInfo: '+972 1122334455'
//     },
//     {
//         id: '4',
//         name: 'Water Distribution Center',
//         location: [31.5200, 34.4670],
//         type: ReliefLocationType.WATER,
//         status: LocationStatus.NEEDS_SUPPORT,
//         lastUpdated: new Date(),
//         description: 'Critical water supply point',
//         capacity: 300,
//         needs: ['Water Tanks', 'Purification Tablets'],
//         contactInfo: '+972 5566778899'
//     },
//     {
//         id: '5',
//         name: 'Supplies Depot',
//         location: [31.5300, 34.4700],
//         type: ReliefLocationType.SUPPLIES,
//         status: LocationStatus.TEMPORARILY_CLOSED,
//         lastUpdated: new Date(),
//         description: 'Depot for various relief supplies',
//         capacity: 200,
//         needs: [],
//     }
// ];

export class LocationService {
    private static instance: LocationService;
    private locations: Map<string, ReliefLocation> = new Map();
    private lastUpdate: Date | null = null;
    private lastLocations: ReliefLocation[] = [];

    private constructor() {}

    static getInstance(): LocationService {
        if (!LocationService.instance) {
            LocationService.instance = new LocationService();
        }
        return LocationService.instance;
    }

    private getLocationKey(location: LatLngTuple, placeName?: string): string {
        return placeName ? `${placeName.trim()}|${location[0]},${location[1]}` : `${location[0]},${location[1]}`;
    }

    private ensureLatLngTuple(location: ReliefLocation['location']): LatLngTuple {
        if (Array.isArray(location)) {
            return location as LatLngTuple;
        }
        // If it's a LatLng object, convert to tuple
        return [location.lat, location.lng];
    }


    // Helper to convert AidPoint from DB to ReliefLocation for frontend
    private mapAidPointToReliefLocation(aidPoint: any): ReliefLocation {
        return {
            id: aidPoint.id,
            name: aidPoint.name,
            location: [aidPoint.latitude, aidPoint.longitude] as LatLngTuple,
            type: aidPoint.category as ReliefLocationType, // Cast string to enum
            status: aidPoint.status as LocationStatus,     // Cast string to enum
            lastUpdated: aidPoint.lastUpdated,
            description: aidPoint.description,
            capacity: aidPoint.capacity,
            needs: aidPoint.needs ? JSON.parse(aidPoint.needs) : [], // Parse needs from JSON string
            contactInfo: aidPoint.contactInfo,
            ngoLink: aidPoint.ngoLink, // Ensure this property exists if you want to use it
        };
    }

    async getLocations(): Promise<ReliefLocation[]> {
        // Fetch all aid points from the database
        const aidPoints = await getAllAidPoints();
        if (!aidPoints || aidPoints.length === 0) {
            return [];
        }

        // Group by rounded coordinates (to 4 decimals ~10m) and name
        const grouped: Record<string, ReliefLocation> = {};
        const usedCoords = new Set<string>();

        for (const aidPoint of aidPoints) {
            // Round coordinates for grouping
            const lat = Number((aidPoint.latitude ?? 0).toFixed(4));
            const lng = Number((aidPoint.longitude ?? 0).toFixed(4));
            const name = aidPoint.name ?? '';
            const id = aidPoint.id ?? '';
            const ngoLink = aidPoint.ngoLink === null ? undefined : aidPoint.ngoLink;
            const key = `${lat},${lng}|${name}`;

            // Aggregate news updates (ensure types match ReliefLocation.newsUpdates)
            const newsUpdate = {
                time: aidPoint.lastUpdated instanceof Date ? aidPoint.lastUpdated.toISOString() : String(aidPoint.lastUpdated),
                content: aidPoint.description || '',
                link: ngoLink,
            };


            const description = aidPoint.description === null ? undefined : aidPoint.description;
            const capacity = aidPoint.capacity === null ? undefined : aidPoint.capacity;
            const contactInfo = aidPoint.contactInfo === null ? undefined : aidPoint.contactInfo;

            if (!grouped[key]) {
                grouped[key] = {
                    id,
                    name,
                    location: [lat, lng] as [number, number],
                    type: aidPoint.category as ReliefLocationType,
                    status: aidPoint.status as LocationStatus,
                    lastUpdated: aidPoint.lastUpdated,
                    description,
                    capacity,
                    needs: aidPoint.needs ? JSON.parse(aidPoint.needs) : [],
                    contactInfo,
                    ngoLink,
                    newsUpdates: [newsUpdate],
                };
            } else {
                // Merge needs and news updates
                grouped[key].needs = Array.from(new Set([...(grouped[key].needs || []), ...(aidPoint.needs ? JSON.parse(aidPoint.needs) : [])]));
                grouped[key].newsUpdates?.push(newsUpdate);
            }
        }

        // Apply jitter to overlapping points
        const coordsCount: Record<string, number> = {};
        Object.values(grouped).forEach(loc => {
            const coordKey = `${(loc.location as [number, number])[0]},${(loc.location as [number, number])[1]}`;
            coordsCount[coordKey] = (coordsCount[coordKey] || 0) + 1;
        });

        const jitterIndex: Record<string, number> = {};
        Object.values(grouped).forEach(loc => {
            const coordKey = `${(loc.location as [number, number])[0]},${(loc.location as [number, number])[1]}`;
            if (coordsCount[coordKey] > 1) {
                jitterIndex[coordKey] = (jitterIndex[coordKey] || 0) + 1;
                const angle = (2 * Math.PI * jitterIndex[coordKey]) / coordsCount[coordKey];
                const radius = 0.002 * jitterIndex[coordKey]; // ~200m per step
                loc.location = [
                    (loc.location as [number, number])[0] + Math.cos(angle) * radius,
                    (loc.location as [number, number])[1] + Math.sin(angle) * radius,
                ];
            }
        });

        return Object.values(grouped);
    }


    async getLocationsByDate(date: Date): Promise<ReliefLocation[]> {
        const targetDate = new Date(date);
        const startOfThisDay = startOfDay(targetDate);
        const endOfThisDay = endOfDay(targetDate);
    
        // Fetch locations from DB filtered by lastUpdated within the selected day
        const aidPoints = await getLocationsByDateAction(startOfThisDay, endOfThisDay);
        if (!aidPoints || aidPoints.length === 0) {
            return [];
        }
    
        // Group by rounded coordinates (to 4 decimals ~10m) and name
        const grouped: Record<string, ReliefLocation> = {};
    
        for (const aidPoint of aidPoints) {
            const lat = Number((aidPoint.latitude ?? 0).toFixed(4));
            const lng = Number((aidPoint.longitude ?? 0).toFixed(4));
            const name = aidPoint.name ?? '';
            const id = aidPoint.id ?? '';
            const ngoLink = aidPoint.ngoLink === null ? undefined : aidPoint.ngoLink;
            const key = `${lat},${lng}|${name}`;
    
            const newsUpdate = {
                time: aidPoint.lastUpdated instanceof Date ? aidPoint.lastUpdated.toISOString() : String(aidPoint.lastUpdated),
                content: aidPoint.description || '',
                link: ngoLink,
            };
    
            const description = aidPoint.description === null ? undefined : aidPoint.description;
            const capacity = aidPoint.capacity === null ? undefined : aidPoint.capacity;
            const contactInfo = aidPoint.contactInfo === null ? undefined : aidPoint.contactInfo;
    
            if (!grouped[key]) {
                grouped[key] = {
                    id,
                    name,
                    location: [lat, lng] as [number, number],
                    type: aidPoint.category as ReliefLocationType,
                    status: aidPoint.status as LocationStatus,
                    lastUpdated: aidPoint.lastUpdated,
                    description,
                    capacity,
                    needs: aidPoint.needs ? JSON.parse(aidPoint.needs) : [],
                    contactInfo,
                    ngoLink,
                    newsUpdates: [newsUpdate],
                };
            } else {
                grouped[key].needs = Array.from(new Set([...(grouped[key].needs || []), ...(aidPoint.needs ? JSON.parse(aidPoint.needs) : [])]));
                grouped[key].newsUpdates?.push(newsUpdate);
            }
        }
    
        // Apply jitter to overlapping points
        const coordsCount: Record<string, number> = {};
        Object.values(grouped).forEach(loc => {
            const coordKey = `${(loc.location as [number, number])[0]},${(loc.location as [number, number])[1]}`;
            coordsCount[coordKey] = (coordsCount[coordKey] || 0) + 1;
        });
    
        const jitterIndex: Record<string, number> = {};
        Object.values(grouped).forEach(loc => {
            const coordKey = `${(loc.location as [number, number])[0]},${(loc.location as [number, number])[1]}`;
            if (coordsCount[coordKey] > 1) {
                jitterIndex[coordKey] = (jitterIndex[coordKey] || 0) + 1;
                const angle = (2 * Math.PI * jitterIndex[coordKey]) / coordsCount[coordKey];
                const radius = 0.002 * jitterIndex[coordKey];
                loc.location = [
                    (loc.location as [number, number])[0] + Math.cos(angle) * radius,
                    (loc.location as [number, number])[1] + Math.sin(angle) * radius,
                ];
            }
        });
    
        return Object.values(grouped);
    }

    async getLocationHistory(id: string, days: number = 30): Promise<{
        date: Date;
        status: LocationStatus;
        needs: string[];
        capacity?: number;
    }[]> {
        // This method will still simulate for now, as historical status changes are not
        // directly stored in your current AidPoint model.
        // To implement this fully, you would need a separate 'AidPointHistory' model
        // or more complex event sourcing in your database.
        const location = await getLocationByIdAction(id);
        if (!location) return [];

        const history = [] as {
            date: Date;
            status: LocationStatus;
            needs: string[];
            capacity?: number;
        }[];
        const today = new Date();
        
        for (let i = days; i >= 0; i--) {
            const date = addDays(today, -i);
            // Simulate status changes over time (as real history isn't stored yet)
            history.push({
                date,
                status: location.status as LocationStatus,
                needs: location.needs ? JSON.parse(location.needs) : [],
                capacity: location.capacity || 0,
            });
        }
        return history;
    }

    async getTimelineStats(days: number = 30): Promise<{
        date: string;
        activeLocations: number;
        totalLocations: number;
        byType: Record<string, number>;
    }[]> {
        const stats = [];
        const today = new Date();

        for (let i = days; i >= 0; i--) {
            const date = addDays(today, -i);
            const dateStr = format(date, 'yyyy-MM-dd');
            
            // Fetch real data for active locations on this specific date
            const locationsOnDate = await this.getLocationsByDate(date);
            const activeLocations = locationsOnDate.length;
            
            // Get total locations in the DB (can be optimized if needed)
            const totalLocations = await getTotalLocationsAction();

            const byType: Record<string, number> = {};
            // Count locations by type for the current date
            Object.values(ReliefLocationType).forEach(type => {
                byType[type] = locationsOnDate.filter(loc => loc.type === type).length;
            });

            stats.push({
                date: dateStr,
                activeLocations,
                totalLocations,
                byType
            });
        }
        return stats.reverse(); // Return in chronological order
    }

    // Keep add/update/removeLocation if you intend to use them for manual management
    // For now, the ingestion API handles creating/updating from news.
    // Ensure these map correctly to AidPoint model if used.
    async addLocation(location: Omit<ReliefLocation, 'id'>): Promise<ReliefLocation> {
        // Example: converting ReliefLocation to AidPoint for DB insertion

        // prismadb.aidPoint.create({
        //     data: {
        //         name: location.name,
        //         // latitude: location.location[0] as number,
        //         // longitude: location.location[1] as number,
        //         latitude: (location.location as LatLngTuple)[0] as number,
        //         longitude: (location.location as LatLngTuple)[1] as number,
        //         needs: JSON.stringify(location.needs || []),
        //         ngoLink: location.ngoLink || '',
        //         category: location.type,
        //         status: location.status,
        //         lastUpdated: location.lastUpdated,
        //         // createdAt will default to now()
        //     },
        // });
        const newAidPointData = {
            //     name: location.name,
            // // latitude: location.location[0] as number,
            // // longitude: location.location[1] as number,
            // latitude: (location.location as LatLngTuple)[0] as number,
            // longitude: (location.location as LatLngTuple)[1] as number,
            // needs: JSON.stringify(location.needs || []),
            name: location.name,
            latitude: location.location ? (location.location as LatLngTuple)[0] : undefined,
            longitude: location.location ? (location.location as LatLngTuple)[1] : undefined,
            needs: location.needs ? JSON.stringify(location.needs) : undefined,
            ngoLink: location.ngoLink || '',
            category: location.type,
            status: location.status,
            lastUpdated: location.lastUpdated,
            // createdAt: new Date(),
            // createdAt will default to now()
        } as Omit<AidPoint, 'id'>;

        const newAidPoint = await createNewAidPointAction(newAidPointData);
        return this.mapAidPointToReliefLocation(newAidPoint);
    }

    async updateLocation(id: string, updates: Partial<ReliefLocation>): Promise<ReliefLocation> {

        // prismadb.aidPoint.update({
        //     where: { id },
        //     data: {
        //         name: updates.name,
        //         latitude: updates.location ? (updates.location as LatLngTuple)[0] : undefined,
        //         longitude: updates.location ? (updates.location as LatLngTuple)[1] : undefined,
        //         needs: updates.needs ? JSON.stringify(updates.needs) : undefined,
        //         ngoLink: updates.ngoLink,
        //         category: updates.type,
        //         status: updates.status,
        //         lastUpdated: updates.lastUpdated || new Date(),
        //     },
        // });

        const dataToUpdate = {
            name: updates.name,
            latitude: updates.location ? (updates.location as LatLngTuple)[0] : undefined,
            longitude: updates.location ? (updates.location as LatLngTuple)[1] : undefined,
            needs: updates.needs ? JSON.stringify(updates.needs) : undefined,
            ngoLink: updates.ngoLink,
            category: updates.type,
            status: updates.status,
            lastUpdated: updates.lastUpdated || new Date(),
        } as Omit<AidPoint, 'id'>;

        // Find by primary key (id) and update
        const updatedAidPoint = await updateLocationByIdAction(id, dataToUpdate);
        return this.mapAidPointToReliefLocation(updatedAidPoint);
    }

    async removeLocation(id: string): Promise<void> {
        await deleteLocationByIdAction(id);
    }


    // async getLocationsByDate(date: Date): Promise<ReliefLocation[]> {
    //     const allLocations = await this.getLocations();
    //     const targetDate = new Date(date);
    //     const startOf_Day = startOfDay(targetDate);
    //     const endOf_Day = endOfDay(targetDate);

    //     return allLocations.filter(location => {
    //         const locationDate = new Date(location.lastUpdated);
    //         return locationDate >= startOf_Day && locationDate <= endOf_Day;
    //         // return locationDate >= startOfDay(targetDate) && locationDate <= endOfDay(targetDate);
    //     });
    // }

    // async getLocationHistory(id: string, days: number = 30): Promise<{
    //     date: Date;
    //     status: LocationStatus;
    //     needs: string[];
    //     capacity?: number;
    // }[]> {
    //     // In a real implementation, this would fetch from a database
    //     // For now, we'll simulate historical data
    //     const location = this.locations.get(id);
    //     if (!location) return [];

    //     const history = [];
    //     const today = new Date();
        
    //     for (let i = days; i >= 0; i--) {
    //         const date = addDays(today, -i);
    //         const randomChange = Math.random() > 0.8; // 20% chance of status change
            
    //         if (randomChange && i > 0) {
    //             // Simulate status changes over time
    //             const statuses = Object.values(LocationStatus);
    //             const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
                
    //             history.push({
    //                 date,
    //                 status: randomStatus,
    //                 needs: location.needs || [],
    //                 capacity: location.capacity
    //             });
    //         } else {
    //             history.push({
    //                 date,
    //                 status: location.status,
    //                 needs: location.needs || [],
    //                 capacity: location.capacity
    //             });
    //         }
    //     }

    //     return history;
    // }

    // async getTimelineStats(days: number = 30): Promise<{
    //     date: string;
    //     activeLocations: number;
    //     totalLocations: number;
    //     byType: Record<string, number>;
    // }[]> {
    //     const allLocations = await this.getLocations();
    //     const stats = [];
    //     const today = new Date();

    //     for (let i = days; i >= 0; i--) {
    //         const date = addDays(today, -i);
    //         const dateStr = format(date, 'yyyy-MM-dd');
            
    //         // Simulate daily statistics
    //         const activeLocations = Math.floor(Math.random() * allLocations.length * 0.8) + 1;
    //         const totalLocations = allLocations.length;
            
    //         const byType: Record<string, number> = {};
    //         Object.values(ReliefLocationType).forEach(type => {
    //             byType[type] = Math.floor(Math.random() * 10) + 1;
    //         });

    //         stats.push({
    //             date: dateStr,
    //             activeLocations,
    //             totalLocations,
    //             byType
    //         });
    //     }

    //     return stats;
    // }

    // async getLocations(): Promise<ReliefLocation[]> {
    //     const now = new Date();
    //     if (!this.lastUpdate || now.getTime() - this.lastUpdate.getTime() > 5 * 60 * 1000) {
    //         const updates = await newsService.getLatestUpdates();
    //         const locations: ReliefLocation[] = [];
    //         const usedCoords = new Set<string>();
            
    //         for (const update of updates) {
    //             let { location } = newsService.extractLocationInfo(update.content);
    //             const { type, needs, status, placeName } = newsService.extractLocationInfo(update.content);
                
    //             if (location) {
    //                 // If these coordinates are already used, apply jitter
    //                 let coordKey = `${location[0]},${location[1]}`;
    //                 while (usedCoords.has(coordKey)) {
    //                     // Apply jitter of up to ~0.003 deg (~300m)
    //                     const jitter = () => (Math.random() - 0.5) * 0.006;
    //                     location = [location[0] + jitter(), location[1] + jitter()];
    //                     coordKey = `${location[0]},${location[1]}`;
    //                 }
    //                 usedCoords.add(coordKey);
    
    //                 locations.push({
    //                     id: crypto.randomUUID(),
    //                     name: this.generateLocationName(location as LatLngTuple, type || ReliefLocationType.OTHER),
    //                     location: location as LatLngTuple,
    //                     type: type || ReliefLocationType.OTHER,
    //                     status: status || LocationStatus.ACTIVE,
    //                     lastUpdated: new Date(),
    //                     newsUpdates: [{ time: update.time, content: update.content, link: update.link }],
    //                     needs: needs || [],
    //                 });
    //             }
    //         }
    //         // Remove locations that haven't been updated in the last 24 hours (not needed since each is new)
    //         this.lastUpdate = now;
    //         this.lastLocations = locations;
    //         return locations;
    //     }
    //     return this.lastLocations;
    // }

    private mergeNeeds(existingNeeds: string[], newNeeds: string[]): string[] {
        return Array.from(new Set([...existingNeeds, ...newNeeds]));
    }

    private generateLocationName(location: LatLngTuple, type: ReliefLocationType): string {
        const typeNames: Record<ReliefLocationType, string> = {
            [ReliefLocationType.MEDICAL]: 'Medical Point',
            [ReliefLocationType.FOOD]: 'Food Distribution',
            [ReliefLocationType.SHELTER]: 'Shelter',
            [ReliefLocationType.WATER]: 'Water Point',
            [ReliefLocationType.SUPPLIES]: 'Supply Center',
            [ReliefLocationType.OTHER]: 'Point'
        };
        return `${typeNames[type]} - ${location[0].toFixed(4)}, ${location[1].toFixed(4)}`;
    }

    private updateDescription(existingDesc: string | undefined, newContent: string): string {
        if (!existingDesc) return newContent;
        if (existingDesc.includes(newContent)) return existingDesc;
        return `${existingDesc}\n\n${newContent}`;
    }

    // async addLocation(location: Omit<ReliefLocation, 'id'>): Promise<ReliefLocation> {
    //     const locationTuple = this.ensureLatLngTuple(location.location);
    //     const locationKey = this.getLocationKey(locationTuple);
        
    //     const newLocation: ReliefLocation = {
    //         ...location,
    //         id: crypto.randomUUID(),
    //         location: locationTuple, // Ensure we store as tuple
    //         needs: location.needs || [], // Ensure needs is always an array
    //     };
        
    //     this.locations.set(locationKey, newLocation);
    //     return newLocation;
    // }

    // async updateLocation(id: string, updates: Partial<ReliefLocation>): Promise<ReliefLocation> {
    //     // Find the location by id
    //     let locationToUpdate: ReliefLocation | undefined;
    //     let locationKey: string | undefined;

    //     for (const [key, location] of this.locations.entries()) {
    //         if (location.id === id) {
    //             locationToUpdate = location;
    //             locationKey = key;
    //             break;
    //         }
    //     }

    //     if (!locationToUpdate || !locationKey) {
    //         throw new Error('Location not found');
    //     }

    //     const updatedLocation: ReliefLocation = {
    //         ...locationToUpdate,
    //         ...updates,
    //         lastUpdated: new Date(),
    //         needs: updates.needs || locationToUpdate.needs || [], // Ensure needs is always an array
    //         location: updates.location ? 
    //             this.ensureLatLngTuple(updates.location) : 
    //             locationToUpdate.location
    //     };

    //     this.locations.set(locationKey, updatedLocation);
    //     return updatedLocation;
    // }

    // async removeLocation(id: string): Promise<void> {
    //     // Find and remove the location by id
    //     for (const [key, location] of this.locations.entries()) {
    //         if (location.id === id) {
    //             this.locations.delete(key);
    //             break;
    //         }
    //     }
    // }
}

export const locationService = LocationService.getInstance();