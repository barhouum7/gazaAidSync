/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useMemo } from 'react';
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
import { useLiveNewsData } from '@/hooks/use-live-news-data';

type AlertSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
type AlertStatus = 'ACTIVE' | 'RESOLVED' | 'MONITORING';

function getRelativeTime(date?: Date) {
    if (!date || isNaN(date.getTime())) return "Unknown time";
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return `${diff} seconds ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return date.toLocaleString();
}

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

function normalizeText(text: string) {
    return text.replace(/\s+/g, ' ').replace(/[.,،؛:!؟\-]/g, '').trim().toLowerCase();
}

function truncateAtWord(text: string, maxLength: number) {
    if (text.length <= maxLength) return text;
    const truncated = text.slice(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    return truncated.slice(0, lastSpace > 0 ? lastSpace : maxLength) + '...';
}

const EmergencyAlerts = () => {
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [selectedAlert, setSelectedAlert] = useState<EmergencyAlert | null>(null);

    // Live data
    const { data, loading, error, refetch } = useLiveNewsData(60000);
    
    function filterAndMapToAlerts(items: any[]): EmergencyAlert[] {
        // Expanded keyword lists for better mapping
        const criticalKeywords = ['عاجل', 'وفاة', 'مقتل', 'تحذير', 'خطر', 'انفجار', 'كارثة', 'إخلاء', 'حريق', 'هجوم', 'قصف', 'إطلاق نار', 'إصابة خطيرة', 'كمين', 'اغتيال', 'تفجير', 'تهديد', 'حصار', 'مجزرة', 'عدوان'];
        const highKeywords = ['إصابة', 'جرحى', 'جريح', 'إسعاف', 'حالة طارئة', 'أزمة', 'إغلاق', 'اشتباك', 'تدمير', 'أضرار', 'مفقود', 'مفقودين', 'محتجز', 'محتجزين', 'إجلاء', 'نزوح'];
        const mediumKeywords = ['توزيع', 'مساعدات', 'إغاثة', 'إمداد', 'معونة', 'إيواء', 'لاجئ', 'نزوح', 'مأوى', 'خيمة', 'مخيم', 'طعام', 'غذاء', 'وجبة', 'ملابس', 'بطانية', 'سلة غذائية', 'سلة طعام'];
        const locationRegex = /(غزة|رفح|خان يونس|جباليا|دير البلح|بيت حانون|بيت لاهيا|النصيرات|البريج|المغازي|الزوايدة|الوسطى|الشمال|الجنوب|القدس|رام الله|الخليل|نابلس|طولكرم|قلقيلية|سلفيت|أريحا|جنين|طوباس)/i;
    
        const now = new Date();
        const maxAgeMinutes = 12 * 60;
    
        // A Set to filter out duplicate IDs/links
        const seen = new Set();
    
        return items
            .map((item: any) => {
                const content = item.content || item.title || item.postExcerpt || '';
                let severity: AlertSeverity = 'MEDIUM';
                let status: AlertStatus = 'MONITORING';

                if (criticalKeywords.some(k => content.includes(k))) {
                    severity = 'CRITICAL';
                    status = 'ACTIVE';
                } else if (highKeywords.some(k => content.includes(k))) {
                    severity = 'HIGH';
                    status = 'ACTIVE';
                } else if (mediumKeywords.some(k => content.includes(k))) {
                    severity = 'MEDIUM';
                    status = 'MONITORING';
                } else {
                    severity = 'LOW';
                    status = 'MONITORING';
                }
    
                // Try to extract location
                const locationMatch = content.match(locationRegex);
                const location = locationMatch ? locationMatch[0] : (item.source || '');
    
                // Parse time if available, fallback to now
                let timestamp: Date | null = null;
                if (item.time && item.parsedTime) {
                    timestamp = new Date(now.getTime() - item.parsedTime * 60 * 1000);
                } else if (item.timestamp) {
                    timestamp = new Date(item.timestamp);
                } else if (item.date) {
                    timestamp = new Date(item.date);
                } else {
                    timestamp = now;
                }

                // Only show recent alerts
                if (timestamp) {
                    const ageMinutes = (now.getTime() - timestamp.getTime()) / (60 * 1000);
                    if (ageMinutes > maxAgeMinutes) return null;
                }

                // Deduplicate by normalized content/title
                const norm = normalizeText(content);
                if (seen.has(norm)) return null;
                seen.add(norm);

                if (!content.trim()) return null;

                return {
                    id: item.id || item.link || btoa(unescape(encodeURIComponent(content))).slice(0, 16),
                    title: truncateAtWord(content, 80),
                    description: item.postExcerpt || content,
                    severity,
                    status,
                    location,
                    timestamp: timestamp ?? now,
                } as EmergencyAlert;
            })
            .filter(Boolean) as EmergencyAlert[];
    }
    
    // Aggregate all sources: blogs, news, trending
    const allLiveItems = useMemo(() => [
        ...(data?.blogs || []),
        ...(data?.news || []),
        ...(data?.trending || [])
    ], [data]);
    // Map all sources to EmergencyAlert
    const alerts: EmergencyAlert[] = useMemo(() =>
        allLiveItems.length > 0 ? filterAndMapToAlerts(allLiveItems) : [],
        [allLiveItems]
    );


    // Fallback to sample data if no live data
    const fallbackAlerts: EmergencyAlert[] = [
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
    
    // Only count truly active/critical alerts for the badge
    const activeCriticalCount = alerts.filter(a => a.severity === 'CRITICAL' && a.status === 'ACTIVE').length;
    const displayAlerts = alerts.length > 0 ? alerts : fallbackAlerts;

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
    if (error) {
        return (
            <Alert variant="destructive">
                <AlertTitle>Error loading alerts</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
                <Button onClick={refetch} className="mt-2">Retry</Button>
            </Alert>
        );
    }

    return (
        <div className="space-y-4" 
        // dir="rtl"
        >
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
                    variant={activeCriticalCount > 0 ? 'destructive' : 'default'}
                    className="gap-1"
                >
                    <BellRing className="h-3 w-3" />
                    <span>{activeCriticalCount} Active</span>
                </Badge>
            </div>

            {/* Alerts List */}
            <ScrollArea className="h-[calc(100vh-20rem)]">
                <div className="space-y-2">
                    {displayAlerts.map(alert => (
                        <Card
                            key={alert.id}
                            className={cn(
                            "p-4 transition-colors cursor-pointer hover:bg-muted/50 border-l-4",
                            selectedAlert?.id === alert.id && "border-primary ring-2 ring-primary/30",
                            alert.severity === 'CRITICAL' && "border-destructive",
                            alert.severity === 'HIGH' && "border-warning",
                            alert.severity === 'MEDIUM' && "border-primary"
                            )}
                            onClick={() => setSelectedAlert(alert)}
                            aria-label={`View details for ${alert.title}`}
                            
                            // dir="rtl"

                        >
                            <div className="space-y-2">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-center gap-2">
                                {getSeverityIcon(alert.severity)}
                                <span className="font-medium" 
                                // dir="rtl"
                                >{alert.title}</span>
                                {getRelativeTime(alert.timestamp) === "Unknown time" && (
                                    <Badge variant="default" className="text-[10px] px-1 py-0">NEW</Badge>
                                )}
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
                            <p className="text-sm text-muted-foreground" 
                            // dir="rtl"
                            >{alert.description}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                {alert.location && <><MapPin className="h-3 w-3" /><span>{alert.location}</span></>}
                                <span>•</span>
                                <span>{getRelativeTime(alert.timestamp)}</span>
                                {/* {alert.source && alert.link && (
                                <>
                                    <span>•</span>
                                    <a href={alert.link} target="_blank" rel="noopener noreferrer" className="underline text-primary">Source</a>
                                </>
                                )} */}
                                {
                                    alert.affectedPopulation && (
                                        <>
                                            <span>•</span>
                                            <span>Affected: {alert.affectedPopulation.toLocaleString()}</span>
                                        </>
                                    )
                                }
                                {
                                    alert.updateFrequency && (
                                        <>
                                            <span>•</span>
                                            <span>Updates: {alert.updateFrequency}</span>
                                        </>
                                    )
                                }
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
                )} 
                // dir="rtl"
                >
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