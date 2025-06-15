"use client";

import { useEffect, useState } from 'react';
import { ReliefLocationType } from '@/types/map';
import { Button } from '../ui/button';
import { Filter, Maximize2, RefreshCw } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import MapFilters from './map-filters';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { cn } from '@/lib/utils';
import { useMapState } from '@/hooks/use-map-state';

interface MapControlsProps {
    activeFilters: ReliefLocationType[];
    onFilterChange: (filters: ReliefLocationType[]) => void;
    isRefreshing: boolean;
    onRefresh: () => void;
    isFullscreen: boolean;
    setIsFullscreen: React.Dispatch<React.SetStateAction<boolean>>; // For fullscreen toggle
}

const MapControls = ({ 
    activeFilters,
    onFilterChange,
    isRefreshing,
    onRefresh,
    isFullscreen,
    setIsFullscreen,
}: MapControlsProps) => {
    const [showFilter, setShowFilter] = useState(false);

    const handleRefresh = async () => {
        onRefresh();
    };

    return (
        <div className="absolute top-5 right-4 z-20 flex flex-row gap-3">
            <Button
                className='cursor-pointer'
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
            >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            {/* Filter Button and Popover */}
            <div className="relative">
                <Popover
                    open={showFilter}
                    onOpenChange={setShowFilter}
                >
                    <PopoverTrigger asChild>
                        <Button
                            className='cursor-pointer'
                            variant="outline"
                            size="sm"
                            onClick={() => setShowFilter(!showFilter)}
                        >
                            <Filter className="h-4 w-4" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className={cn(
                        'absolute top-5 w-72 p-4 bg-white shadow-lg rounded-lg z-50'
                        , isFullscreen ? '-right-28' : '-right-[28rem]'
                    )}>
                        {/* Map Filters */}
                        <MapFilters
                            activeFilters={activeFilters}
                            onFilterChange={onFilterChange}
                        />
                    </PopoverContent>
                </Popover>
            </div>
            <Button
                className='cursor-pointer'
                variant="outline"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
            >
                <Maximize2 className="h-4 w-4" />
            </Button>
        </div>
    );
};

export default MapControls;