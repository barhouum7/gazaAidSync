"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { ReliefLocationType } from '@/types/map';
import { locationService } from '@/lib/services/location-service';
import { addDays, format } from 'date-fns';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimelineStatsProps {
    selectedDate: Date;
    totalLocations: number;
    filteredLocations: number;
}

const TimelineStats = ({ selectedDate, totalLocations, filteredLocations }: TimelineStatsProps) => {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const timelineStats = await locationService.getTimelineStats(7);
                const todayStats = timelineStats.find(s => s.date === format(selectedDate, 'yyyy-MM-dd'));
                const yesterdayStats = timelineStats.find(s => s.date === format(addDays(selectedDate, -1), 'yyyy-MM-dd'));
                
                setStats({
                    today: todayStats,
                    yesterday: yesterdayStats,
                    change: todayStats && yesterdayStats 
                        ? todayStats.activeLocations - yesterdayStats.activeLocations 
                        : 0
                });
            } catch (error) {
                console.error('Error fetching timeline stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [selectedDate]);

    if (loading) {
        return (
            <Card className="absolute top-20 left-4 w-64 bg-white/95 backdrop-blur-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Loading stats...</CardTitle>
                </CardHeader>
            </Card>
        );
    }

    if (!stats) return null;

    const getChangeIcon = (change: number) => {
        if (change > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
        if (change < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
        return <Minus className="h-4 w-4 text-gray-600" />;
    };

    const getChangeColor = (change: number) => {
        if (change > 0) return 'text-green-600';
        if (change < 0) return 'text-red-600';
        return 'text-gray-600';
    };

    return (
        <Card className="absolute top-20 left-4 w-64 bg-white/95 backdrop-blur-sm border border-gray-200/50">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center justify-between">
                    Timeline Statistics
                    <Badge variant="secondary" className="text-xs">
                        {format(selectedDate, 'MMM d, yyyy')}
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Active Locations</span>
                    <div className="flex items-center gap-2">
                        <span className="font-medium">{filteredLocations}</span>
                        {stats.change !== 0 && (
                            <div className="flex items-center gap-1">
                                {getChangeIcon(stats.change)}
                                <span className={cn("text-xs", getChangeColor(stats.change))}>
                                    {Math.abs(stats.change)}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Locations</span>
                    <span className="font-medium">{totalLocations}</span>
                </div>

                {stats.today?.byType && (
                    <div className="space-y-2">
                        <span className="text-xs font-medium text-gray-600">By Type</span>
                        {Object.entries(stats.today.byType).map(([type, count]) => (
                            <div key={type} className="flex items-center justify-between text-xs">
                                <span className="text-gray-600">{type}</span>
                                <span className="font-medium">{count as number}</span>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default TimelineStats;