"use client";

// import { Card } from '../ui/card';
// import { Button } from '../ui/button';
import { ReliefLocationType } from '@/types/map';
import { 
    // LayersIcon, 
    Filter 
} from 'lucide-react';
import { motion } from 'framer-motion';

interface MapControlsProps {
    activeFilters: ReliefLocationType[];
    onFilterChange: (filters: ReliefLocationType[]) => void;
}

const MapControls = ({ activeFilters, onFilterChange }: MapControlsProps) => {
    const filterOptions = [
        { type: ReliefLocationType.MEDICAL, label: 'Hospitals', color: '#FF4444', icon: '🏥' },
        { type: ReliefLocationType.FOOD, label: 'Food Distribution', color: '#FF8C00', icon: '🍽️' },
        { type: ReliefLocationType.SHELTER, label: 'Shelters', color: '#4169E1', icon: '🏠' },
        { type: ReliefLocationType.WATER, label: 'Water Points', color: '#00CED1', icon: '💧' },
        { type: ReliefLocationType.SUPPLIES, label: 'Supply Centers', color: '#32CD32', icon: '📦' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-4 z-[1000] w-64"
        >
            <div className="space-y-3">
                <div className="flex items-center gap-2 mb-3">
                    <Filter className="h-4 w-4" />
                    <span className="font-medium">Filter Locations</span>
                </div>
                <div className="space-y-2">
                    {filterOptions.map((option) => (
                    <motion.button
                        key={option.type}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                        const newFilters = activeFilters.includes(option.type)
                            ? activeFilters.filter(f => f !== option.type)
                            : [...activeFilters, option.type];
                        onFilterChange(newFilters);
                        }}
                        className={`cursor-pointer w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                            activeFilters.includes(option.type)
                            ? 'bg-gray-900 hover:bg-gray-800 text-white'
                            : 'bg-gray-50 text-gray-900 hover:bg-gray-100'
                        }`}
                    >
                        <span className="text-lg">{option.icon}</span>
                        <span className="text-sm">{option.label}</span>
                    </motion.button>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default MapControls;