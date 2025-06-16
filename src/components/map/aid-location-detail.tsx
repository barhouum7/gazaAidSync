import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { ReliefLocation, LocationStatus } from '@/types/map';
import { 
    Clock, 
    // Users, 
    Phone, AlertTriangle, CheckCircle, 
    // XCircle, 
    HelpCircle, X,
    Newspaper
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from "@/components/ui/dialog";
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';

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
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <span>{location.name}</span>
                        <DialogClose asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <span className="sr-only">Close</span>
                                <HelpCircle className="h-4 w-4" />
                            </Button>
                        </DialogClose>
                    </DialogTitle>
                </DialogHeader>

                <ScrollArea className="max-h-[60vh] pr-4">
                    <div className="space-y-4">
                        <Badge className={`flex items-center gap-1 ${statusConfig.color}`}>
                            {statusConfig.icon}
                            {location.status}
                        </Badge>

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

                        {location.newsUpdates && location.newsUpdates.length > 0 && (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm font-medium">
                                    <Newspaper className="h-4 w-4" />
                                    Latest Updates
                                </div>
                                <div className="space-y-3">
                                    {location.newsUpdates.map((update, index) => (
                                        <div 
                                            key={index}
                                            className="p-3 bg-gray-50 dark:bg-card
                                            rounded-lg space-y-2"
                                        >
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                {update.time}
                                            </div>
                                            <div className="text-sm">
                                                {update.content}
                                            </div>
                                            {update.link && (
                                                <a 
                                                    href={update.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-xs text-blue-600 hover:underline"
                                                >
                                                    Read more
                                                </a>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            Updated {formatDistanceToNow(new Date(location.lastUpdated), { addSuffix: true })}
                        </div>
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
};

export default AidLocationDetail;