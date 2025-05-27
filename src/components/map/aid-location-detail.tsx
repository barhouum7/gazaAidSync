import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { ReliefLocation, LocationStatus } from '@/types/map';
import { 
    Clock, 
    // Users, 
    Phone, AlertTriangle, CheckCircle, 
    // XCircle, 
    HelpCircle, X 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '../ui/button';

interface AidLocationDetailProps {
    location: ReliefLocation;
    onClose: () => void;
}

const AidLocationDetail = ({ location, onClose }: AidLocationDetailProps) => {
    const getStatusIcon = (status: LocationStatus) => {
        switch (status) {
            case 'ACTIVE':
                return {
                    color: 'bg-green-100 text-green-800',
                    icon: <CheckCircle className="h-4 w-4" />,
                };
            case 'NEEDS_SUPPORT':
                return {
                    color: 'bg-red-100 text-red-800',
                    icon: <AlertTriangle className="h-4 w-4" />,
                };
            default:
                return {
                    color: 'bg-yellow-100 text-yellow-800',
                    icon: <HelpCircle className="h-4 w-4" />,
                };
        }
    };

    const statusConfig = getStatusIcon(location.status);

    return (
        <Card className="absolute top-4 left-4 w-80 z-[1000] bg-white/95 backdrop-blur-sm">
            <div className="p-4">
                <div className="flex items-start justify-between">
                    <h3 className="text-lg font-bold">{location.name}</h3>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={onClose}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <div className="mt-4 space-y-4">
                    <Badge className={`flex items-center gap-1 ${statusConfig.color}`}>
                        {statusConfig.icon}
                        {location.status}
                    </Badge>

                    {location.description && (
                        <p className="text-sm text-gray-600">
                            {location.description}
                        </p>
                    )}

                    {location.needs && location.needs.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="text-sm font-medium">Current Needs:</h4>
                            <div className="flex flex-wrap gap-1">
                                {location.needs.map((need, index) => (
                                    <Badge
                                        key={index}
                                        variant="outline"
                                        className="text-xs"
                                    >
                                        {need}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {location.contactInfo && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="h-4 w-4" />
                            {location.contactInfo}
                        </div>
                    )}

                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        Updated {formatDistanceToNow(new Date(location.lastUpdated), { addSuffix: true })}
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default AidLocationDetail;