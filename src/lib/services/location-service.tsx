import { ReliefLocation, ReliefLocationType, LocationStatus } from '@/types/map';

// Sample initial data - In a real app, this would come from an API
const initialLocations: ReliefLocation[] = [
    {
        id: '1',
        name: 'Al-Shifa Hospital',
        location: [31.5204, 34.4667],
        type: ReliefLocationType.MEDICAL,
        status: LocationStatus.NEEDS_SUPPORT,
        lastUpdated: new Date(),
        description: 'Major medical center in Gaza City',
        capacity: 700,
        needs: ['Medical Supplies', 'Generators', 'Fuel'],
        contactInfo: '+972 123456789'
    },
    {
        id: '2',
        name: 'Rafah Food Distribution',
        location: [31.3547, 34.2377],
        type: ReliefLocationType.FOOD,
        status: LocationStatus.ACTIVE,
        lastUpdated: new Date(),
        description: 'Main food distribution point in Rafah',
        capacity: 1000,
        needs: ['Food Supplies', 'Water'],
        contactInfo: '+972 987654321'
    },
    {
        id: '3',
        name: 'UNRWA Shelter',
        location: [31.5010, 34.4660],
        type: ReliefLocationType.SHELTER,
        status: LocationStatus.ACTIVE,
        lastUpdated: new Date(),
        description: 'Temporary shelter for displaced families',
        capacity: 500,
        needs: ['Blankets', 'Clothing'],
        contactInfo: '+972 1122334455'
    },
    {
        id: '4',
        name: 'Water Distribution Center',
        location: [31.5200, 34.4670],
        type: ReliefLocationType.WATER,
        status: LocationStatus.NEEDS_SUPPORT,
        lastUpdated: new Date(),
        description: 'Critical water supply point',
        capacity: 300,
        needs: ['Water Tanks', 'Purification Tablets'],
        contactInfo: '+972 5566778899'
    },
    {
        id: '5',
        name: 'Supplies Depot',
        location: [31.5300, 34.4700],
        type: ReliefLocationType.SUPPLIES,
        status: LocationStatus.TEMPORARILY_CLOSED,
        lastUpdated: new Date(),
        description: 'Depot for various relief supplies',
        capacity: 200,
        needs: [],
    }
];

export class LocationService {
    private static instance: LocationService;
    private locations: ReliefLocation[] = initialLocations;

    private constructor() {}

    static getInstance(): LocationService {
        if (!LocationService.instance) {
            LocationService.instance = new LocationService();
        }
        return LocationService.instance;
    }

    async getLocations(): Promise<ReliefLocation[]> {
        // Simulate API call
        return new Promise((resolve) => {
            setTimeout(() => resolve(this.locations), 500);
        });
    }

    async addLocation(location: Omit<ReliefLocation, 'id'>): Promise<ReliefLocation> {
        const newLocation: ReliefLocation = {
            ...location,
            id: crypto.randomUUID(),
        };
        this.locations.push(newLocation);
        return newLocation;
    }

    async updateLocation(id: string, updates: Partial<ReliefLocation>): Promise<ReliefLocation> {
        const index = this.locations.findIndex(loc => loc.id === id);
        if (index === -1) throw new Error('Location not found');
        
        this.locations[index] = { ...this.locations[index], ...updates };
        return this.locations[index];
    }

    async removeLocation(id: string): Promise<void> {
        this.locations = this.locations.filter(loc => loc.id !== id);
    }
}

export const locationService = LocationService.getInstance();