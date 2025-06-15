/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState } from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Skeleton } from '../ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Button } from '../ui/button';
import { Filter, AlertCircle, Bell, BellRing, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

type UpdateType = 'ALERT' | 'INFO' | 'SUCCESS';
type UpdateCategory = 'AID' | 'MEDICAL' | 'SECURITY' | 'INFRASTRUCTURE';

interface Update {
    id: string;
    type: UpdateType;
    category: UpdateCategory;
    title: string;
    description: string;
    location?: string;
    timestamp: Date;
    isNew?: boolean;
}

const LiveUpdatesFeed = () => {
    const [loading, setLoading] = useState(false);
    const [activeFilters, setActiveFilters] = useState<UpdateCategory[]>(['AID', 'MEDICAL', 'SECURITY', 'INFRASTRUCTURE']);
    const [selectedUpdate, setSelectedUpdate] = useState<Update | null>(null);

    // Sample data - In a real app, this would come from an API
    const updates: Update[] = [
        {
            id: '1',
            type: 'ALERT',
            category: 'SECURITY',
            title: 'Urgent: Road Closure',
            description: 'Main supply route to Rafah temporarily closed due to security concerns.',
            location: 'Rafah Border Crossing',
            timestamp: new Date('2024-05-31T04:30:00'),
            isNew: true
        },
        {
            id: '2',
            type: 'SUCCESS',
            category: 'AID',
            title: 'Aid Delivery Complete',
            description: '35 trucks of humanitarian aid successfully delivered to Gaza City.',
            location: 'Gaza City',
            timestamp: new Date('2024-05-31T04:15:00'),
            isNew: true
        },
        {
            id: '3',
            type: 'INFO',
            category: 'MEDICAL',
            title: 'Medical Supplies Update',
            description: 'Emergency medical supplies requested for Al-Shifa Hospital.',
            location: 'Al-Shifa Hospital',
            timestamp: new Date('2024-05-31T04:00:00')
        },
        {
            id: '4',
            type: 'ALERT',
            category: 'INFRASTRUCTURE',
            title: 'Power Outage',
            description: 'Northern Gaza experiencing widespread power outages.',
            location: 'North Gaza',
            timestamp: new Date('2024-05-31T03:45:00')
        }
    ];

    const filteredUpdates = updates.filter(update => activeFilters.includes(update.category));

    const handleFilterToggle = (category: UpdateCategory) => {
        setActiveFilters(prev => 
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };

    if (loading) {
        return (
            <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i} className="p-4 space-y-2">
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-4 w-4 rounded-full" />
                            <Skeleton className="h-4 w-1/4" />
                        </div>
                        <Skeleton className="h-4 w-3/4" />
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-3 w-20" />
                            <Skeleton className="h-3 w-24" />
                        </div>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex items-center gap-2 flex-wrap">
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Filter className="h-4 w-4" />
                    Filter by:
                </span>
                {(['AID', 'MEDICAL', 'SECURITY', 'INFRASTRUCTURE'] as UpdateCategory[]).map(category => (
                    <Button
                        key={category}
                        size="sm"
                        variant={activeFilters.includes(category) ? 'default' : 'outline'}
                        onClick={() => handleFilterToggle(category)}
                        className="h-7"
                    >
                        {category.toLowerCase()}
                    </Button>
                ))}
            </div>

            {/* Updates Feed */}
            <ScrollArea className="h-[calc(100vh-20rem)]">
                <div className="space-y-2">
                    {filteredUpdates.map(update => (
                        <Card
                            key={update.id}
                            className={cn(
                                "p-4 transition-colors cursor-pointer hover:bg-muted/50",
                                selectedUpdate?.id === update.id && "border-primary",
                                update.isNew && "animate-highlight"
                            )}
                            onClick={() => setSelectedUpdate(update)}
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        {update.type === 'ALERT' ? (
                                            <AlertCircle className="h-4 w-4 text-destructive" />
                                        ) : update.type === 'SUCCESS' ? (
                                            <BellRing className="h-4 w-4 text-success" />
                                        ) : (
                                            <Bell className="h-4 w-4 text-primary" />
                                        )}
                                        <span className="font-medium">{update.title}</span>
                                        {update.isNew && (
                                            <Badge variant="default" className="text-[10px] px-1 py-0">NEW</Badge>
                                        )}
                                    </div>
                                    <p className="text-sm text-muted-foreground">{update.description}</p>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        {update.location && (
                                            <>
                                                <span>{update.location}</span>
                                                <span>•</span>
                                            </>
                                        )}
                                        <time>{update.timestamp.toLocaleTimeString()}</time>
                                    </div>
                                </div>
                                <Badge
                                    variant={
                                        update.type === 'ALERT' ? 'destructive' :
                                        update.type === 'SUCCESS' ? 'default' :
                                        'secondary'
                                    }
                                >
                                    {update.category}
                                </Badge>
                            </div>
                        </Card>
                    ))}
                </div>
            </ScrollArea>

            {/* Selected Update Details */}
            {selectedUpdate && (
                <Alert className={cn(
                    selectedUpdate.type === 'ALERT' ? 'border-destructive' :
                    selectedUpdate.type === 'SUCCESS' ? 'border-success' :
                    'border-primary'
                )}>
                    <AlertTitle className="flex items-center gap-2">
                        {selectedUpdate.type === 'ALERT' ? (
                            <AlertCircle className="h-4 w-4 text-destructive" />
                        ) : selectedUpdate.type === 'SUCCESS' ? (
                            <BellRing className="h-4 w-4 text-success" />
                        ) : (
                            <Bell className="h-4 w-4 text-primary" />
                        )}
                        {selectedUpdate.title}
                    </AlertTitle>
                    <AlertDescription className="mt-2 space-y-2">
                        <p>{selectedUpdate.description}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            {selectedUpdate.location && (
                                <>
                                    <span className="font-medium">Location:</span>
                                    <span>{selectedUpdate.location}</span>
                                    <span>•</span>
                                </>
                            )}
                            <span className="font-medium">Time:</span>
                            <time>{selectedUpdate.timestamp.toLocaleString()}</time>
                        </div>
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
};

export default LiveUpdatesFeed;