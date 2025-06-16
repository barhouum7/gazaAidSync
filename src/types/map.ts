import { LatLngExpression } from 'leaflet';

export interface MapConfig {
    center: LatLngExpression;
    zoom: number;
    maxZoom: number;
    minZoom: number;
}

export enum ReliefLocationType {
    MEDICAL = 'MEDICAL',
    FOOD = 'FOOD',
    SHELTER = 'SHELTER',
    WATER = 'WATER',
    SUPPLIES = 'SUPPLIES',
    OTHER = 'OTHER'
}

export enum LocationStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    NEEDS_SUPPORT = 'NEEDS_SUPPORT',
    TEMPORARILY_CLOSED = 'TEMPORARILY_CLOSED'
}

export interface ReliefLocation {
    id: string;
    name: string;
    location: LatLngExpression;
    type: ReliefLocationType;
    status: LocationStatus;
    lastUpdated: Date;
    description?: string;
    capacity?: number;
    needs?: string[];
    contactInfo?: string;
    newsUpdates?: Array<{ time: string; content: string; link?: string }>;
}

export interface MapControlsProps {
    activeFilters: ReliefLocationType[];
    onFilterChange: (filters: ReliefLocationType[]) => void;
}

export interface CustomMarkerProps {
    location: ReliefLocation;
    onSelect: (location: ReliefLocation) => void;
}