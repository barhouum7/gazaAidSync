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
    totalLocations: number;
    filteredLocations: number;
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
    const currentValue = useMemo(() => {
        const diffTime = Math.abs(today.getTime() - selectedDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return Math.min(diffDays, maxValue);
    }, [selectedDate, today, maxValue]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isPlaying) {
            interval = setInterval(() => {
                const newValue = currentValue - 1;
                if (newValue < 0) {
                    setIsPlaying(false);
                    onDateChange(today);
                } else {
                    const newDate = addDays(today, -newValue);
                    onDateChange(newDate);
                }
            }, 1000 / playbackSpeed);
        }
        return () => clearInterval(interval);
    }, [isPlaying, playbackSpeed, currentValue, onDateChange, today]);

    const handleSliderChange = (newValue: number) => {
        const selectedDate = addDays(today, -newValue);
        onDateChange(selectedDate);
    };

    const handleSkipToStart = () => {
        onDateChange(addDays(today, -maxValue));
    };

    const handleSkipToEnd = () => {
        onDateChange(today);
    };

    const handleReset = () => {
        onDateChange(today);
        setIsPlaying(false);
    };

    const formatDateRange = (date: Date) => {
        if (timelineRange === '7d') {
            return format(date, 'MMM d');
        } else if (timelineRange === '30d') {
            return format(date, 'MMM d');
        } else {
            return format(date, 'MMM d, yyyy');
        }
    };

    const getDateLabel = (date: Date) => {
        if (isSameDay(date, today)) {
            return 'Today';
        } else if (isSameDay(date, addDays(today, -1))) {
            return 'Yesterday';
        }
        return formatDateRange(date);
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
                                            disabled={isPlaying}
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
                                            disabled={isPlaying}
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
                                onChange={(e) => setTimelineRange(e.target.value as '7d' | '30d' | '90d')}
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
                            onValueChange={([newValue]) => handleSliderChange(newValue)}
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
                            <span>{formatDateRange(today)}</span>
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