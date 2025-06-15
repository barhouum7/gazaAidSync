/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState } from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { 
    AlertTriangle, 
    AlertOctagon, 
    AlertCircle,
    Bell,
    BellRing,
    Volume2,
    Volume1,
    VolumeX,
    MapPin
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Switch } from '../ui/switch';
import { Skeleton } from '../ui/skeleton';
import { toast } from 'sonner';

type AlertSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
type AlertStatus = 'ACTIVE' | 'RESOLVED' | 'MONITORING';

interface EmergencyAlert {
    id: string;
    title: string;
    description: string;
    severity: AlertSeverity;
    status: AlertStatus;
    location: string;
    timestamp: Date;
    affectedPopulation?: number;
    updateFrequency?: string;
    lastUpdate?: Date;
    nextUpdate?: Date;
}

const EmergencyAlerts = () => {
    const [loading, setLoading] = useState(false);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [selectedAlert, setSelectedAlert] = useState<EmergencyAlert | null>(null);

    // Sample data - In a real app, this would come from an API
    const alerts: EmergencyAlert[] = [
        {
            id: '1',
            title: 'Critical Medical Emergency',
            description: 'Severe shortage of essential medical supplies at multiple hospitals. Immediate assistance required.',
            severity: 'CRITICAL',
            status: 'ACTIVE',
            location: 'Gaza City',
            timestamp: new Date('2024-05-31T04:30:00'),
            affectedPopulation: 250000,
            updateFrequency: '30 minutes',
            lastUpdate: new Date('2024-05-31T04:30:00'),
            nextUpdate: new Date('2024-05-31T05:00:00')
        },
        {
            id: '2',
            title: 'Infrastructure Damage',
            description: 'Major water supply infrastructure damaged. Limited access to clean water in affected areas.',
            severity: 'HIGH',
            status: 'ACTIVE',
            location: 'North Gaza',
            timestamp: new Date('2024-05-31T04:15:00'),
            affectedPopulation: 150000,
            updateFrequency: '1 hour'
        },
        {
            id: '3',
            title: 'Supply Route Disruption',
            description: 'Alternative supply routes being established due to main route closure.',
            severity: 'MEDIUM',
            status: 'MONITORING',
            location: 'Rafah',
            timestamp: new Date('2024-05-31T04:00:00')
        }
    ];

    const getSeverityIcon = (severity: AlertSeverity) => {
        switch (severity) {
            case 'CRITICAL':
                return <AlertOctagon className="h-4 w-4 text-destructive" />;
            case 'HIGH':
                return <AlertTriangle className="h-4 w-4 text-destructive" />;
            case 'MEDIUM':
                return <AlertCircle className="h-4 w-4 text-warning" />;
            case 'LOW':
                return <Bell className="h-4 w-4 text-primary" />;
        }
    };

    const handleNotificationToggle = (enabled: boolean) => {
        setNotificationsEnabled(enabled);
        toast(`${enabled ? 'Notifications enabled' : 'Notifications disabled'}`,{
            description: enabled 
                ? 'You will receive alerts for new emergencies'
                : 'You will not receive alerts for new emergencies',
            duration: 3000
        });
    };

    if (loading) {
        return (
            <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i} className="p-4 space-y-2">
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-4 w-4 rounded-full" />
                            <Skeleton className="h-4 w-1/3" />
                            <Skeleton className="h-4 w-16 ml-auto" />
                        </div>
                        <Skeleton className="h-4 w-full" />
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-3 w-24" />
                            <Skeleton className="h-3 w-32" />
                        </div>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Controls */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Switch
                            checked={notificationsEnabled}
                            onCheckedChange={handleNotificationToggle}
                        />
                        <span className="text-sm">Notifications</span>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSoundEnabled(!soundEnabled)}
                        title={soundEnabled ? 'Mute alert sounds' : 'Enable alert sounds'}
                    >
                        {soundEnabled ? (
                            <Volume2 className="h-4 w-4" />
                        ) : (
                            <VolumeX className="h-4 w-4" />
                        )}
                    </Button>
                </div>
                <Badge 
                    variant={alerts.some(a => a.severity === 'CRITICAL') ? 'destructive' : 'default'}
                    className="gap-1"
                >
                    <BellRing className="h-3 w-3" />
                    <span>{alerts.length} Active</span>
                </Badge>
            </div>

            {/* Alerts List */}
            <ScrollArea className="h-[calc(100vh-20rem)]">
                <div className="space-y-2">
                    {alerts.map(alert => (
                        <Card
                            key={alert.id}
                            className={cn(
                                "p-4 transition-colors cursor-pointer hover:bg-muted/50",
                                selectedAlert?.id === alert.id && "border-primary",
                                alert.severity === 'CRITICAL' && "animate-pulse-subtle"
                            )}
                            onClick={() => setSelectedAlert(alert)}
                        >
                            <div className="space-y-2">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-center gap-2">
                                        {getSeverityIcon(alert.severity)}
                                        <span className="font-medium">{alert.title}</span>
                                    </div>
                                    <Badge
                                        variant={
                                            alert.status === 'ACTIVE' ? 'destructive' :
                                            alert.status === 'MONITORING' ? 'secondary' :
                                            'outline'
                                        }
                                    >
                                        {alert.status}
                                    </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{alert.description}</p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <MapPin className="h-3 w-3" />
                                    <span>{alert.location}</span>
                                    <span>•</span>
                                    <time>{alert.timestamp.toLocaleTimeString()}</time>
                                    {alert.affectedPopulation && (
                                        <>
                                            <span>•</span>
                                            <span>{alert.affectedPopulation.toLocaleString()} affected</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </ScrollArea>

            {/* Selected Alert Details */}
            {selectedAlert && (
                <Alert className={cn(
                    "border",
                    selectedAlert.severity === 'CRITICAL' ? 'border-destructive' :
                    selectedAlert.severity === 'HIGH' ? 'border-destructive' :
                    selectedAlert.severity === 'MEDIUM' ? 'border-warning' :
                    'border-primary'
                )}>
                    <AlertTitle className="flex items-center gap-2">
                        {getSeverityIcon(selectedAlert.severity)}
                        {selectedAlert.title}
                    </AlertTitle>
                    <AlertDescription className="mt-2 space-y-2">
                        <p>{selectedAlert.description}</p>
                        <div className="grid gap-2 text-sm">
                            <div className="flex items-center gap-2">
                                <span className="font-medium">Location:</span>
                                <span>{selectedAlert.location}</span>
                            </div>
                            {selectedAlert.affectedPopulation && (
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">Affected Population:</span>
                                    <span>{selectedAlert.affectedPopulation.toLocaleString()}</span>
                                </div>
                            )}
                            {selectedAlert.updateFrequency && (
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">Update Frequency:</span>
                                    <span>Every {selectedAlert.updateFrequency}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <span className="font-medium">Status:</span>
                                <Badge
                                    variant={
                                        selectedAlert.status === 'ACTIVE' ? 'destructive' :
                                        selectedAlert.status === 'MONITORING' ? 'outline' :
                                        'default'
                                    }
                                >
                                    {selectedAlert.status}
                                </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-medium">Last Update:</span>
                                <time>{selectedAlert.lastUpdate?.toLocaleString()}</time>
                            </div>
                            {selectedAlert.nextUpdate && (
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">Next Update:</span>
                                    <time>{selectedAlert.nextUpdate.toLocaleString()}</time>
                                </div>
                            )}
                        </div>
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
};

export default EmergencyAlerts;