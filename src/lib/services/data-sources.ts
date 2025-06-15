import { ReliefLocation, ReliefLocationType, LocationStatus } from '@/types/map';

interface DataSourceConfig {
    baseUrl: string;
    apiKey?: string;
    updateInterval: number; // in milliseconds
}

class DataSourceService {
    private static instance: DataSourceService;
    private configs: Map<string, DataSourceConfig> = new Map();

    private constructor() {
        // Initialize data source configurations
        this.configs.set('ocha', {
            baseUrl: process.env.NEXT_PUBLIC_OCHA_API_URL || 'https://api.humanitarianresponse.info/v1',
            apiKey: process.env.OCHA_API_KEY,
            updateInterval: 3600000 // 1 hour
        });

        this.configs.set('unrwa', {
            baseUrl: process.env.NEXT_PUBLIC_UNRWA_API_URL || 'https://api.unrwa.org/v1',
            apiKey: process.env.UNRWA_API_KEY,
            updateInterval: 3600000 // 1 hour
        });

        this.configs.set('hdx', {
            baseUrl: process.env.NEXT_PUBLIC_HDX_API_URL || 'https://data.humdata.org/api/3',
            updateInterval: 86400000 // 24 hours
        });
    }

    static getInstance(): DataSourceService {
        if (!DataSourceService.instance) {
            DataSourceService.instance = new DataSourceService();
        }
        return DataSourceService.instance;
    }

    private async fetchFromOCHA(): Promise<ReliefLocation[]> {
        const config = this.configs.get('ocha');
        if (!config) throw new Error('OCHA configuration not found');

        const response = await fetch(`${config.baseUrl}/locations`, {
            headers: {
                'Authorization': `Bearer ${config.apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch from OCHA');
        }

        const data = await response.json();
        return this.transformOCHAData(data);
    }

    private async fetchFromUNRWA(): Promise<ReliefLocation[]> {
        const config = this.configs.get('unrwa');
        if (!config) throw new Error('UNRWA configuration not found');

        const response = await fetch(`${config.baseUrl}/facilities`, {
            headers: {
                'Authorization': `Bearer ${config.apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch from UNRWA');
        }

        const data = await response.json();
        return this.transformUNRWAData(data);
    }

    private async fetchFromHDX(): Promise<ReliefLocation[]> {
        const config = this.configs.get('hdx');
        if (!config) throw new Error('HDX configuration not found');

        const response = await fetch(`${config.baseUrl}/datasets/gaza-relief-locations`);
        if (!response.ok) {
            throw new Error('Failed to fetch from HDX');
        }

        const data = await response.json();
        return this.transformHDXData(data);
    }

    private transformOCHAData(data: any): ReliefLocation[] {
        // Transform OCHA API response to our ReliefLocation format
        return data.map((item: any) => ({
            id: item.id,
            name: item.name,
            location: [item.latitude, item.longitude],
            type: this.mapOCHATypeToReliefType(item.type),
            status: this.mapOCHAStatusToLocationStatus(item.status),
            lastUpdated: new Date(item.last_updated),
            description: item.description,
            capacity: item.capacity,
            needs: item.needs || [],
            contactInfo: item.contact_info
        }));
    }

    private transformUNRWAData(data: any): ReliefLocation[] {
        // Transform UNRWA API response to our ReliefLocation format
        return data.map((item: any) => ({
            id: `unrwa-${item.id}`,
            name: item.name,
            location: [item.lat, item.lng],
            type: this.mapUNRWATypeToReliefType(item.facility_type),
            status: this.mapUNRWAStatusToLocationStatus(item.status),
            lastUpdated: new Date(item.last_updated),
            description: item.description,
            capacity: item.capacity,
            needs: item.needs || [],
            contactInfo: item.contact_info
        }));
    }

    private transformHDXData(data: any): ReliefLocation[] {
        // Transform HDX API response to our ReliefLocation format
        return data.resources.map((item: any) => ({
            id: `hdx-${item.id}`,
            name: item.name,
            location: [item.latitude, item.longitude],
            type: this.mapHDXTypeToReliefType(item.type),
            status: this.mapHDXStatusToLocationStatus(item.status),
            lastUpdated: new Date(item.last_updated),
            description: item.description,
            capacity: item.capacity,
            needs: item.needs || [],
            contactInfo: item.contact_info
        }));
    }

    private mapOCHATypeToReliefType(ochaType: string): ReliefLocationType {
        // Map OCHA facility types to our ReliefLocationType enum
        const typeMap: Record<string, ReliefLocationType> = {
            'hospital': ReliefLocationType.MEDICAL,
            'clinic': ReliefLocationType.MEDICAL,
            'food_distribution': ReliefLocationType.FOOD,
            'shelter': ReliefLocationType.SHELTER,
            'water_point': ReliefLocationType.WATER,
            'supply_center': ReliefLocationType.SUPPLIES,
            // Add more mappings as needed
        };
        return typeMap[ochaType] || ReliefLocationType.OTHER;
    }

    private mapOCHAStatusToLocationStatus(ochaStatus: string): LocationStatus {
        // Map OCHA status to our LocationStatus enum
        const statusMap: Record<string, LocationStatus> = {
            'active': LocationStatus.ACTIVE,
            'inactive': LocationStatus.INACTIVE,
            'needs_support': LocationStatus.NEEDS_SUPPORT,
            'temporarily_closed': LocationStatus.TEMPORARILY_CLOSED,
        };
        return statusMap[ochaStatus] || LocationStatus.INACTIVE;
    }

    // Similar mapping functions for UNRWA and HDX...
    private mapUNRWATypeToReliefType(unrwaType: string): ReliefLocationType {
        const typeMap: Record<string, ReliefLocationType> = {
            'medical': ReliefLocationType.MEDICAL,
            'food': ReliefLocationType.FOOD,
            'shelter': ReliefLocationType.SHELTER,
            'water': ReliefLocationType.WATER,
            'supplies': ReliefLocationType.SUPPLIES,
        };
        return typeMap[unrwaType] || ReliefLocationType.OTHER;
    }

    private mapUNRWAStatusToLocationStatus(unrwaStatus: string): LocationStatus {
        const statusMap: Record<string, LocationStatus> = {
            'active': LocationStatus.ACTIVE,
            'inactive': LocationStatus.INACTIVE,
            'needs_support': LocationStatus.NEEDS_SUPPORT,
            'temporarily_closed': LocationStatus.TEMPORARILY_CLOSED,
        };
        return statusMap[unrwaStatus] || LocationStatus.INACTIVE;
    }

    private mapHDXTypeToReliefType(hdxType: string): ReliefLocationType {
        const typeMap: Record<string, ReliefLocationType> = {
            'food': ReliefLocationType.FOOD,
            'water': ReliefLocationType.WATER,
            'shelter': ReliefLocationType.SHELTER,
            'medical': ReliefLocationType.MEDICAL,
            'supplies': ReliefLocationType.SUPPLIES,
        };
        return typeMap[hdxType] || ReliefLocationType.OTHER;
    }

    private mapHDXStatusToLocationStatus(hdxStatus: string): LocationStatus {
        const statusMap: Record<string, LocationStatus> = {
            'active': LocationStatus.ACTIVE,
            'inactive': LocationStatus.INACTIVE,
            'needs_support': LocationStatus.NEEDS_SUPPORT,
            'temporarily_closed': LocationStatus.TEMPORARILY_CLOSED,
        };
        return statusMap[hdxStatus] || LocationStatus.INACTIVE;
    }

    async getAllLocations(): Promise<ReliefLocation[]> {
        try {
            const [ochaData, unrwaData, hdxData] = await Promise.all([
                this.fetchFromOCHA(),
                this.fetchFromUNRWA(),
                this.fetchFromHDX()
            ]);

            // Merge and deduplicate locations
            const allLocations = [...ochaData, ...unrwaData, ...hdxData];
            return this.deduplicateLocations(allLocations);
        } catch (error) {
            console.error('Error fetching locations:', error);
            throw error;
        }
    }

    private deduplicateLocations(locations: ReliefLocation[]): ReliefLocation[] {
        const uniqueLocations = new Map<string, ReliefLocation>();
        
        locations.forEach(location => {
            const key = `${location.name}-${location.type}-${location.id}`; // Use ID as the unique key for deduplication

            if (!uniqueLocations.has(key) || 
                new Date(location.lastUpdated) > new Date(uniqueLocations.get(key)!.lastUpdated)) {
                uniqueLocations.set(key, location);
            }
        });

        return Array.from(uniqueLocations.values());
    }
}

export const dataSourceService = DataSourceService.getInstance();