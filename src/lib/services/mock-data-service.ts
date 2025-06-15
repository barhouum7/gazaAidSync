import { ReliefLocation, ReliefLocationType, LocationStatus } from '@/types/map';

// Mock data that simulates real relief locations in Gaza
const mockLocations: ReliefLocation[] = [
    {
        id: '1',
        name: 'Al-Shifa Hospital',
        location: [31.5204, 34.4667],
        type: ReliefLocationType.MEDICAL,
        status: LocationStatus.NEEDS_SUPPORT,
        lastUpdated: new Date(),
        description: 'Major medical center in Gaza City. Currently operating at reduced capacity.',
        capacity: 700,
        needs: ['Medical Supplies', 'Generators', 'Fuel', 'Medicines'],
        contactInfo: '+972 123456789'
    },
    {
        id: '2',
        name: 'Rafah Food Distribution Center',
        location: [31.3547, 34.2377],
        type: ReliefLocationType.FOOD,
        status: LocationStatus.ACTIVE,
        lastUpdated: new Date(),
        description: 'Main food distribution point in Rafah. Providing daily meals to displaced families.',
        capacity: 1000,
        needs: ['Food Supplies', 'Water', 'Cooking Equipment'],
        contactInfo: '+972 987654321'
    },
    {
        id: '3',
        name: 'UNRWA Khan Younis Shelter',
        location: [31.3452, 34.3037],
        type: ReliefLocationType.SHELTER,
        status: LocationStatus.ACTIVE,
        lastUpdated: new Date(),
        description: 'Emergency shelter for displaced families in Khan Younis.',
        capacity: 500,
        needs: ['Blankets', 'Clothing', 'Hygiene Kits'],
        contactInfo: '+972 1122334455'
    },
    {
        id: '4',
        name: 'Water Distribution Center - Gaza City',
        location: [31.5200, 34.4670],
        type: ReliefLocationType.WATER,
        status: LocationStatus.NEEDS_SUPPORT,
        lastUpdated: new Date(),
        description: 'Critical water supply point serving northern Gaza.',
        capacity: 300,
        needs: ['Water Tanks', 'Purification Tablets', 'Fuel for Pumps'],
        contactInfo: '+972 5566778899'
    },
    {
        id: '5',
        name: 'Central Medical Supplies Depot',
        location: [31.5300, 34.4700],
        type: ReliefLocationType.SUPPLIES,
        status: LocationStatus.ACTIVE,
        lastUpdated: new Date(),
        description: 'Main distribution center for medical supplies and equipment.',
        capacity: 200,
        needs: ['Medical Equipment', 'First Aid Kits', 'Personal Protective Equipment'],
        contactInfo: '+972 6677889900'
    },
    {
        id: '6',
        name: 'Deir al-Balah Emergency Clinic',
        location: [31.4170, 34.3500],
        type: ReliefLocationType.MEDICAL,
        status: LocationStatus.ACTIVE,
        lastUpdated: new Date(),
        description: 'Emergency medical clinic serving central Gaza.',
        capacity: 150,
        needs: ['Medical Staff', 'Basic Medicines', 'Bandages'],
        contactInfo: '+972 7788990011'
    }
];

class MockDataService {
    private static instance: MockDataService;
    private locations: ReliefLocation[] = [...mockLocations];
    private lastUpdate: Date = new Date();

    private constructor() {}

    static getInstance(): MockDataService {
        if (!MockDataService.instance) {
            MockDataService.instance = new MockDataService();
        }
        return MockDataService.instance;
    }

    // Simulate network delay
    private async delay(ms: number = 500) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Simulate random data updates
    private simulateDataChanges() {
        this.locations = this.locations.map(location => {
            // 30% chance to update each location
            if (Math.random() < 0.3) {
                return {
                    ...location,
                    lastUpdated: new Date(),
                    status: this.getRandomStatus(),
                    needs: this.getRandomNeeds(location.type)
                };
            }
            return location;
        });
    }

    private getRandomStatus(): LocationStatus {
        const statuses = Object.values(LocationStatus);
        return statuses[Math.floor(Math.random() * statuses.length)];
    }

    private getRandomNeeds(type: ReliefLocationType): string[] {
        const needsByType: Record<ReliefLocationType, string[]> = {
            [ReliefLocationType.MEDICAL]: ['Medical Supplies', 'Medicines', 'Bandages', 'PPE', 'Staff'],
            [ReliefLocationType.FOOD]: ['Food Supplies', 'Water', 'Cooking Equipment', 'Storage Containers'],
            [ReliefLocationType.SHELTER]: ['Blankets', 'Clothing', 'Hygiene Kits', 'Tents'],
            [ReliefLocationType.WATER]: ['Water Tanks', 'Purification Tablets', 'Fuel for Pumps'],
            [ReliefLocationType.SUPPLIES]: ['Basic Supplies', 'Storage Space', 'Transport'],
            [ReliefLocationType.OTHER]: ['General Supplies', 'Support']
        };

        const needs = needsByType[type];
        const count = Math.floor(Math.random() * 3) + 1; // 1-3 needs
        const selectedNeeds: string[] = [];
        
        for (let i = 0; i < count; i++) {
            const need = needs[Math.floor(Math.random() * needs.length)];
            if (!selectedNeeds.includes(need)) {
                selectedNeeds.push(need);
            }
        }

        return selectedNeeds;
    }

    async getLocations(): Promise<ReliefLocation[]> {
        await this.delay();
        
        // Simulate data changes every 5 minutes
        const now = new Date();
        if (now.getTime() - this.lastUpdate.getTime() > 5 * 60 * 1000) {
            this.simulateDataChanges();
            this.lastUpdate = now;
        }

        return [...this.locations];
    }

    async addLocation(location: Omit<ReliefLocation, 'id'>): Promise<ReliefLocation> {
        await this.delay();
        const newLocation: ReliefLocation = {
            ...location,
            id: crypto.randomUUID(),
            lastUpdated: new Date()
        };
        this.locations.push(newLocation);
        return newLocation;
    }

    async updateLocation(id: string, updates: Partial<ReliefLocation>): Promise<ReliefLocation> {
        await this.delay();
        const index = this.locations.findIndex(loc => loc.id === id);
        if (index === -1) throw new Error('Location not found');
        
        this.locations[index] = {
            ...this.locations[index],
            ...updates,
            lastUpdated: new Date()
        };
        return this.locations[index];
    }

    async removeLocation(id: string): Promise<void> {
        await this.delay();
        this.locations = this.locations.filter(loc => loc.id !== id);
    }
}

export const mockDataService = MockDataService.getInstance();