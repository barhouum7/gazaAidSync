"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card } from '../ui/card';
import { addDays, format, isSameDay } from 'date-fns';
import { Calendar, Clock, Play, Pause, SkipBack, SkipForward, RotateCcw } from 'lucide-react';
import { Button } from '../ui/button';
import { Slider } from '../ui/slider';
import { Badge } from '../ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { cn } from '@/lib/utils';

interface TimelineControlProps {
    onDateChange: (date: Date) => void;
    selectedDate: Date;
    totalLocations: number; // Now reflects total in DB
    filteredLocations: number; // Now reflects locations on selected date
}

const TimelineControl = ({ 
    onDateChange, 
    selectedDate, 
    totalLocations, 
    filteredLocations 
}: TimelineControlProps) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [timelineRange, setTimelineRange] = useState<'7d' | '30d' | '90d'>('30d');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today to start of day for consistent comparison
    
    // Calculate timeline range based on selected range
    const timelineConfig = useMemo(() => {
        const ranges = {
            '7d': { days: 7, step: 1 },
            '30d': { days: 30, step: 1 },
            '90d': { days: 90, step: 3 }
        };
        return ranges[timelineRange];
    }, [timelineRange]);

    const maxValue = timelineConfig.days;

    // Calculate currentValue relative to today and the max range
    const currentValue = useMemo(() => {
        const selectedDateStart = new Date(selectedDate);
        selectedDateStart.setHours(0, 0, 0, 0); // Normalize selectedDate to start of day

        const diffTime = today.getTime() - selectedDateStart.getTime(); // Difference in milliseconds
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)); // Difference in full days
        
        return Math.min(Math.max(0, diffDays), maxValue); // Ensure value is within [0, maxValue]
    }, [selectedDate, today, maxValue]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isPlaying) {
            interval = setInterval(() => {
                const newDaysAgo = currentValue + 1; // Move forward in time (closer to today)
                if (newDaysAgo > maxValue) { // If we've reached the "oldest" date
                    setIsPlaying(false);
                    onDateChange(today); // Reset to today
                } else {
                    const newDate = addDays(today, -newDaysAgo);
                    onDateChange(newDate);
                }
            }, 1000 / playbackSpeed);
        }
        return () => clearInterval(interval);
    }, [isPlaying, playbackSpeed, currentValue, onDateChange, today, maxValue]); // Added maxValue to dependencies

    const handleSliderChange = (newDaysAgo: number) => {
        const selectedDate = addDays(today, -newDaysAgo);
        onDateChange(selectedDate);
    };

    const handleSkipToStart = () => {
        onDateChange(addDays(today, -maxValue)); // Go to the oldest date in current range
    };

    const handleSkipToEnd = () => {
        onDateChange(today); // Go to today
    };

    const handleReset = () => {
        onDateChange(today);
        setIsPlaying(false);
    };

    const formatDateRange = (date: Date) => {
        // Use the actual year for 90d range, otherwise just month/day
        return format(date, timelineRange === '90d' ? 'MMM d, yyyy' : 'MMM d');
    };

    const getDateLabel = (date: Date) => {
        const normalizedDate = new Date(date);
        normalizedDate.setHours(0, 0, 0, 0);

        const normalizedToday = new Date(today);
        normalizedToday.setHours(0, 0, 0, 0);

        const normalizedYesterday = addDays(new Date(today), -1);
        normalizedYesterday.setHours(0, 0, 0, 0);


        if (isSameDay(normalizedDate, normalizedToday)) {
            return 'Today';
        } else if (isSameDay(normalizedDate, normalizedYesterday)) {
            return 'Yesterday';
        }
        return formatDateRange(normalizedDate);
    };

    return (
        <TooltipProvider>
            <Card className="absolute bottom-16 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-sm p-4 rounded-lg shadow-lg w-[calc(100%-2rem)] max-w-4xl border border-gray-200/50">
                <div className="space-y-4">
                    {/* Header with controls and stats */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span className="text-sm font-medium">Timeline Control</span>
                            <Badge variant="secondary" className="text-xs">
                                {filteredLocations} of {totalLocations} locations
                            </Badge>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            {/* Playback Controls */}
                            <div className="flex items-center gap-1">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleSkipToStart}
                                            disabled={isPlaying || currentValue === maxValue}
                                        >
                                            <SkipBack className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Go to start</TooltipContent>
                                </Tooltip>

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsPlaying(!isPlaying)}
                                >
                                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                                </Button>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleSkipToEnd}
                                            disabled={isPlaying || currentValue === 0}
                                        >
                                            <SkipForward className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Go to end</TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleReset}
                                        >
                                            <RotateCcw className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Reset to today</TooltipContent>
                                </Tooltip>
                            </div>

                            {/* Speed Control */}
                            <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4 text-gray-500" />
                                <select
                                    value={playbackSpeed}
                                    onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                                    className="text-sm bg-transparent border-none focus:outline-none"
                                    disabled={isPlaying}
                                >
                                    <option value={0.5}>0.5x</option>
                                    <option value={1}>1x</option>
                                    <option value={2}>2x</option>
                                    <option value={5}>5x</option>
                                </select>
                            </div>

                            {/* Range Selector */}
                            <select
                                value={timelineRange}
                                onChange={(e) => {
                                    setTimelineRange(e.target.value as '7d' | '30d' | '90d');
                                    // When range changes, reset selected date to ensure it's within bounds
                                    onDateChange(today);
                                }}
                                className="text-sm bg-transparent border-none focus:outline-none"
                                disabled={isPlaying}
                            >
                                <option value="7d">7 days</option>
                                <option value="30d">30 days</option>
                                <option value="90d">90 days</option>
                            </select>
                        </div>
                    </div>

                    {/* Timeline Slider */}
                    <div className="space-y-3">
                        <Slider
                            value={[currentValue]}
                            min={0}
                            max={maxValue}
                            step={timelineConfig.step}
                            onValueChange={([newDaysAgo]) => handleSliderChange(newDaysAgo)}
                            className="w-full"
                        />
                        
                        {/* Date Labels */}
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>{formatDateRange(addDays(today, -maxValue))}</span>
                            <span className={cn(
                                "font-medium",
                                isSameDay(selectedDate, today) && "text-blue-600"
                            )}>
                                {getDateLabel(selectedDate)}
                            </span>
                            <span>{getDateLabel(today)}</span>
                        </div>
                    </div>

                    {/* Additional Info */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>
                            Showing locations updated on {format(selectedDate, 'MMMM d, yyyy')}
                        </span>
                        <span>
                            {isPlaying ? `Playing at ${playbackSpeed}x speed` : 'Timeline paused'}
                        </span>
                    </div>
                </div>
            </Card>
        </TooltipProvider>
    );
};

export default TimelineControl;