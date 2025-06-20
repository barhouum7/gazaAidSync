'use client';

import dynamic from 'next/dynamic';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Filter, Loader2, Maximize2, RefreshCw } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import { useState } from 'react';
import { Button } from '../ui/button';
import MapFilters from './map-filters';
import { useMapState } from '@/hooks/use-map-state';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { cn } from '@/lib/utils';
import { useRouter, useSearchParams } from 'next/navigation';
import { ReliefLocationType } from '@/types/map';
import Map from './map';

export default function MapContainerWrapContent() {
    const router = useRouter();
    const params = useSearchParams();

    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showFilter, setShowFilter] = useState(false);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        // Simulate data refresh
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsRefreshing(false);
    };

    // const {
    //     locations,
    //     selectedLocation,
    //     loading,
    //     error,
    //     activeFilters,
    //     setSelectedLocation,
    //     setActiveFilters,
    //     // refreshData,
    // } = useMapState();


    return (
        <>
            {/* Map Section */}
            <Card 
            // className={`h-full p-0 relative shadow-lg border border-muted ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}
            className={`
                h-[300px] sm:h-[400px] md:h-full p-0 overflow-hidden
                ${isFullscreen ? 'fixed inset-0 z-50 w-full bg-transparent border-none shadow-none' : 'shadow-lg border border-muted'}
            `}
            >
                <div className={`${isFullscreen ? 'h-screen' : 'h-full'}`}>
                    <Map 
                        isFullscreen={isFullscreen}
                        setIsFullscreen={setIsFullscreen}
                    />
                </div>
            </Card>
        </>
    );
}