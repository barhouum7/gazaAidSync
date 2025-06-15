"use client";

import { useEffect, useState } from 'react';
import { ReliefLocationType } from '@/types/map';
import { Filter, Search, Sliders } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";

interface MapFiltersProps {
    activeFilters: ReliefLocationType[];
    onFilterChange: (filters: ReliefLocationType[]) => void;
}

const MapFilters = ({ activeFilters, onFilterChange }: MapFiltersProps) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');


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
            // className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-4 z-[1000] w-72"
        >
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-gray-500" />
                    <Input
                        type="text"
                        placeholder="Search locations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-8"
                    />
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        <span className="font-medium">Filters</span>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAdvanced(!showAdvanced)}
                    >
                        <Sliders className="h-4 w-4" />
                    </Button>
                </div>

                <AnimatePresence>
                    {showAdvanced && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="space-y-2"
                        >
                            <Select
                                value={statusFilter}
                                onValueChange={setStatusFilter}
                            >
                                <SelectTrigger className="w-full h-8">
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="needs_support">Needs Support</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </motion.div>
                    )}
                </AnimatePresence>

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
                                // console.log('[FROM MapFilters: ] New filters:', newFilters);
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

export default MapFilters;