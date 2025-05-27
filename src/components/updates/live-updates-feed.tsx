"use client";

import { Card } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';
import { Bell, AlertTriangle, Info, Truck, Hospital, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Update {
    id: string;
    type: 'emergency' | 'delivery' | 'medical' | 'info';
    title: string;
    description: string;
    source: string;
    timestamp: Date;
    location?: string;
}

const LiveUpdatesFeed = () => {
        // Sample data - In a real app, this would come from an API
        const updates: Update[] = [
            {
                id: '1',
                type: 'emergency',
                title: 'Critical Medical Supply Shortage',
                description: 'Al-Shifa Hospital reports severe shortage of surgical supplies and medication.',
                source: 'WHO',
                timestamp: new Date(Date.now() - 1000 * 60 * 30),
                location: 'Gaza City'
            },
            {
                id: '2',
                type: 'delivery',
                title: 'Aid Convoy Arrival',
                description: '20 trucks carrying food and water supplies have arrived at Rafah crossing.',
                source: 'UNRWA',
                timestamp: new Date(Date.now() - 1000 * 60 * 45),
                location: 'Rafah'
            },
            // Add more updates...
        ];

    const getUpdateIcon = (type: Update['type']) => {
        switch (type) {
            case 'emergency':
                return <AlertTriangle className="h-5 w-5 text-red-500" />;
            case 'delivery':
                return <Truck className="h-5 w-5 text-green-500" />;
            case 'medical':
                return <Hospital className="h-5 w-5 text-blue-500" />;
            case 'info':
                return <Info className="h-5 w-5 text-gray-500" />;
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    <h3 className="font-semibold">Live Updates</h3>
                </div>
                <Badge variant="outline" className="gap-1">
                    <Clock className="h-3 w-3" />
                    <span>Live</span>
                </Badge>
            </div>

            <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                    {updates.map((update) => (
                        <Card key={update.id} className="p-4">
                            <div className="flex gap-3">
                                {getUpdateIcon(update.type)}
                                <div className="space-y-1 flex-1">
                                    <div className="flex items-start justify-between gap-2">
                                        <h4 className="font-medium">{update.title}</h4>
                                        <Badge variant="outline" className="shrink-0">
                                            {update.source}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-gray-600">{update.description}</p>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <span>{formatDistanceToNow(update.timestamp, { addSuffix: true })}</span>
                                        {update.location && (
                                            <>
                                                <span>•</span>
                                                <span>{update.location}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
};

export default LiveUpdatesFeed;