"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useMapState } from "@/hooks/use-map-state";

import { Skeleton } from '@/components/ui/skeleton';
import { Filter, RefreshCcw } from 'lucide-react';

export default function MapSidebar() {

    const [isRefreshing, setIsRefreshing] = useState(false);

    const {
        locations,
        selectedLocation,
        loading,
        error,
        activeFilters,
        setSelectedLocation,
        setActiveFilters,
        // refreshData,
    } = useMapState();

    const handleRefresh = async () => {
        setIsRefreshing(true);
        // Simulate data refresh
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsRefreshing(false);
    };


    const filteredLocations = locations.filter(
        location => activeFilters.includes(location.type)
    );

    return (
        <Card className="w-full h-full overflow-y-auto border-r rounded-none">
            <CardHeader className="space-y-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <h1 className="text-xl font-bold">Gaza Aid Sync</h1>
                        <Badge variant="destructive" className="rounded-md uppercase">Live</Badge>
                    </CardTitle>
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="h-8 w-8"
                        title="Refresh data"
                    >
                        <RefreshCcw className="h-4 w-4" />
                    </Button>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Filter className="h-4 w-4" />
                    <span>{filteredLocations.length} locations shown</span>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* Crisis Overview */}
                    <Alert variant="destructive" className="bg-red-50 border-red-200">
                        <AlertTitle className="text-red-700 font-semibold">Crisis Overview</AlertTitle>
                        <AlertDescription>
                            <ul className="space-y-2 text-sm mt-2 text-red-700">
                                <li className="flex items-center gap-2">
                                    <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                                    90% of population displaced
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                                    52,000+ casualties reported
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                                    470,000 at risk of starvation
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                                    47% of hospitals non-functional
                                </li>
                            </ul>
                        </AlertDescription>
                    </Alert>

                    {/* Selected Location Details */}
                    {loading ? (
                        <div className="space-y-4">
                            <Skeleton className="h-8 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                            <Skeleton className="h-20 w-full" />
                        </div>
                    ) : selectedLocation ? (
                        <div className="p-4 bg-white rounded-lg border">
                            <h3 className="font-bold text-lg mb-2">{selectedLocation.name}</h3>
                            <div className="space-y-2 text-sm">
                                <p className="flex items-center">
                                    <span className="font-semibold mr-2">Type:</span>
                                    <Badge variant="outline">{selectedLocation.type}</Badge>
                                </p>
                                <p className="flex items-center gap-2">
                                    <span className="font-semibold">Status:</span>
                                    <span className={`px-2 py-1 rounded ${
                                        selectedLocation.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                                        selectedLocation.status === 'NEEDS_SUPPORT' ? 'bg-amber-100 text-amber-800' :
                                        'bg-red-100 text-red-800'
                                    }`}>
                                        {selectedLocation.status}
                                    </span>
                                </p>
                                {selectedLocation.description && (
                                    <p className="mt-2">{selectedLocation.description}</p>
                                )}
                                {selectedLocation.contactInfo && (
                                    <p className="mt-2">
                                        <span className="font-semibold">Contact:</span> {selectedLocation.contactInfo}
                                    </p>
                                )}
                                <p className="text-xs text-muted-foreground mt-2">
                                    Last updated: {new Date(selectedLocation.lastUpdated).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <Alert>
                            <AlertTitle>No location selected</AlertTitle>
                            <AlertDescription>
                                Click on a marker on the map to view details about that location.
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Action Buttons */}
                    <div className="space-y-2">
                        <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700">
                            <Link href="https://unrwa.org/donate" target="_blank">
                                Donate to UNRWA
                            </Link>
                        </Button>
                        <Button asChild variant="outline" className="w-full">
                            <Link href="https://www.wfp.org/emergencies/palestine-emergency" target="_blank">
                                Support WFP Gaza
                            </Link>
                        </Button>
                        <Button asChild variant="outline" className="w-full">
                            <Link href="/take-action" className="flex items-center justify-center gap-2">
                                <span>Take Action</span>
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </Button>

                        <iframe width="100%" height="380" src="https://chuffed.org/iframe/131443/25aae1" allowFullScreen style={{maxWidth: '310px', border: '0px solid #fff', margin: '0 auto'}}></iframe>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}