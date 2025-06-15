"use client";

import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { addDays, format } from 'date-fns';
import { Calendar, Clock, Play, Pause } from 'lucide-react';
import { Button } from '../ui/button';
import { Slider } from '../ui/slider';

interface TimelineControlProps {
    onDateChange: (date: Date) => void;
}

const TimelineControl = ({ onDateChange }: TimelineControlProps) => {
    const [value, setValue] = useState(7);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const today = new Date();
    
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isPlaying) {
            interval = setInterval(() => {
                setValue((prev) => {
                    const newValue = prev - 1;
                    if (newValue < 0) {
                        setIsPlaying(false);
                        return 7;
                    }
                    return newValue;
                });
            }, 1000 / playbackSpeed);
        }
        return () => clearInterval(interval);
    }, [isPlaying, playbackSpeed]);

    const handleChange = (newValue: number) => {
        setValue(newValue);
        const selectedDate = addDays(today, -newValue);
        onDateChange(selectedDate);
    };

    return (
        <Card className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-sm p-4 rounded-lg shadow-lg w-3/4 max-w-3xl">
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">Timeline Control</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsPlaying(!isPlaying)}
                        >
                            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                        <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <select
                                value={playbackSpeed}
                                onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                                className="text-sm bg-transparent border-none"
                            >
                                <option value={0.5}>0.5x</option>
                                <option value={1}>1x</option>
                                <option value={2}>2x</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div className="space-y-2">
                    <Slider
                        value={[value]}
                        min={0}
                        max={7}
                        step={1}
                        onValueChange={([newValue]) => handleChange(newValue)}
                        className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>{format(addDays(today, -7), 'MMM d, yyyy')}</span>
                        <span className="font-medium">{format(addDays(today, -value), 'MMM d, yyyy')}</span>
                        <span>{format(today, 'MMM d, yyyy')}</span>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default TimelineControl;