"use client";

import { useState } from 'react';
import { Card } from '../ui/card';
import { addDays, format } from 'date-fns';

interface TimelineControlProps {
    onDateChange: (date: Date) => void;
}

const TimelineControl = ({ onDateChange }: TimelineControlProps) => {
    const [value, setValue] = useState(7); // 7 days range
    const today = new Date();
    
    const handleChange = (newValue: number) => {
        setValue(newValue);
        const selectedDate = addDays(today, -newValue);
        onDateChange(selectedDate);
    };

    return (
        <Card className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg z-[1000] w-3/4">
            <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                    <span>{format(addDays(today, -7), 'MMM d')}</span>
                    <span>{format(today, 'MMM d')}</span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="7"
                    value={value}
                    className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    onChange={(e) => handleChange(Number(e.target.value))}
                />
            </div>
        </Card>
    );
};

export default TimelineControl;