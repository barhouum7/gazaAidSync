import L from 'leaflet';
import { Marker, Popup } from 'react-leaflet';
import { ReliefLocation, ReliefLocationType } from '@/types/map';
import { Badge } from '@/components/ui/badge';

interface CustomMarkerProps {
    location: ReliefLocation;
    onSelect: (location: ReliefLocation) => void;
}

const CustomMarker = ({ location, onSelect }: CustomMarkerProps) => {
    // Define marker colors and icons based on type
    const markerConfig: Record<ReliefLocationType, { color: string; icon: string }> = {
        [ReliefLocationType.MEDICAL]: {
            color: '#FF4444', // Red for hospitals
            icon: '🏥'
        },
        [ReliefLocationType.FOOD]: {
            color: '#FF8C00', // Orange for food
            icon: '🍽️'
        },
        [ReliefLocationType.SHELTER]: {
            color: '#4169E1', // Blue for shelters
            icon: '🏠'
        },
        [ReliefLocationType.WATER]: {
            color: '#00CED1', // Cyan for water
            icon: '💧'
        },
        [ReliefLocationType.SUPPLIES]: {
            color: '#32CD32', // Green for supplies
            icon: '📦'
        },
        [ReliefLocationType.OTHER]: {
            color: '#808080', // Gray for other types
            icon: 'ℹ️'
        }
    };

    const config = markerConfig[location.type];

    const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `
            <div class="relative">
                <div style="
                    background-color: ${config.color};
                    width: 30px;
                    height: 30px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 2px solid white;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                ">
                    <span style="font-size: 16px;">${config.icon}</span>
                </div>
                ${location.status === 'NEEDS_SUPPORT' ? 
                    '<span class="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>' 
                    : ''}
            </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
    });

    return (
        <Marker
            position={location.location}
            icon={customIcon}
            eventHandlers={{
                click: () => onSelect(location)
            }}
        >
            <Popup className="custom-popup">
                <div className="p-2 min-w-[200px]">
                    <h3 className="font-bold text-lg mb-2">{location.name}</h3>
                    <div className="space-y-2">
                        <Badge 
                            className={`${
                                location.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                                location.status === 'NEEDS_SUPPORT' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                            }`}
                        >
                            {location.status}
                        </Badge>
                        <p className="text-sm">{location.description}</p>
                    </div>
                </div>
            </Popup>
        </Marker>
    );
};

export default CustomMarker;