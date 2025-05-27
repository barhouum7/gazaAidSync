"use client";

import { useMemo } from 'react';
import { Marker, Popup } from 'react-leaflet';
// import { Icon } from 'leaflet';
import L from 'leaflet';
import { ReliefLocation, ReliefLocationType } from '@/types/map';

// Custom markers for different location types
const getMarkerIcon = (type: ReliefLocationType) => {
    const color = {
        [ReliefLocationType.MEDICAL]: 'red',
        [ReliefLocationType.FOOD]: 'orange',
        [ReliefLocationType.SHELTER]: 'blue',
        [ReliefLocationType.WATER]: 'cyan',
        [ReliefLocationType.SUPPLIES]: 'green',
        [ReliefLocationType.OTHER]: 'gray',
    }[type];

    return L.icon({
        iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });
};


interface LocationMarkerProps {
    location: ReliefLocation;
    onSelect: (location: ReliefLocation) => void;
}

export const LocationMarker = ({ location, onSelect }: LocationMarkerProps) => {
    const icon = useMemo(() => getMarkerIcon(location.type), [location.type]);

    return (
        <Marker
            position={location.location}
            icon={icon}
            eventHandlers={{
                click: () => onSelect(location),
            }}
        >
        <Popup>
            <div className="p-2">
                <h3 className="font-bold text-lg">{location.name}</h3>
                <p className="text-sm text-gray-600">{location.type}</p>
                <p className="text-sm">{location.description}</p>
                {location.contactInfo && (
                    <p className="text-sm mt-2">
                    <strong>Contact:</strong> {location.contactInfo}
                    </p>
                )}
                <p className="text-xs text-gray-500 mt-2">
                    Last updated: {new Date(location.lastUpdated).toLocaleDateString()}
                </p>
            </div>
        </Popup>
        </Marker>
    );
};