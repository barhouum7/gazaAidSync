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
import { cn } from "@/lib/utils";
import { useLiveNewsData } from "@/hooks/use-live-news-data";
import BlurImage from "../ui/blur-image";
import { useTheme } from "next-themes";

export default function MapSidebar() {
    const { theme } = useTheme();

    // State to manage the visibility of the crisis overview
    const [showMore, setShowMore] = useState(false);
    // State to manage refreshing
    const [isRefreshing, setIsRefreshing] = useState(false);
    const { data, loading: newsLoading, error: newsError } = useLiveNewsData();

    const {
        locations,
        selectedLocation,
        loading,
        error,
        activeFilters,
        setSelectedLocation,
        setActiveFilters,
        fetchLocations: fetchAllLocations,
    } = useMapState();

    // const handleRefresh = async () => {
    //     setIsRefreshing(true);
    //     // Simulate data refresh
    //     await new Promise(resolve => setTimeout(resolve, 1000));
    //     setIsRefreshing(false);
    // };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await fetchAllLocations(); // Refresh all locations
        } catch (err) {
            console.error('Error refreshing data:', err);
        } finally {
            setTimeout(() => {
                setIsRefreshing(false);
            }, 1000); // Simulate a delay for the refresh animation
        }
    };


    const filteredLocations = locations.filter(
        location => activeFilters.includes(location.type)
    );

    return (
        <Card className="w-full h-full overflow-y-auto border-r rounded-none"
        style={{ backgroundImage: 'url("/assets/keffiyeh-bg.svg")', backgroundSize: 'cover' }}
        >
            <CardHeader className="space-y-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Link
                            href="/"
                            // className="flex items-center space-x-1"
                        >
                            {/* <div className="relative flex-none h-12 w-12 -ml-6">
                                <BlurImage
                                    fill
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    style={{ objectFit: 'contain' }}
                                    src={`${theme === 'dark' ? '/assets/images/gazaAidSync_Logo-icon-green.png' : '/assets/images/gazaAidSync_Logo-icon.png'}`}
                                    alt="Gaza Aid Sync Logo"
                                />
                            </div> */}
                            <h1 className="text-xl font-bold">Gaza Aid Sync</h1>
                        </Link>
                        <Badge variant="destructive" className="rounded-md uppercase">
                            {/* A Point as Live Indicator */}
                            <span className="relative inline-flex items-center mr-2">
                                <span className="absolute -top-1 -left-0.5 h-2 w-2 rounded-full bg-green-300 inline-block animate-ping" />
                                <span className="absolute -top-1 -left-0.5 h-2 w-2 rounded-full bg-green-400 inline-block" />
                                {/* <span className="h-2 w-2 rounded-full bg-red-300 inline-block mr-1 animate-ping" /> */}
                            </span>
                            Live
                        </Badge>
                    </CardTitle>
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="h-8 w-8"
                        title="Refresh data"
                    >
                        <RefreshCcw className={cn(
                            "h-4 w-4"
                            , isRefreshing ? 'animate-spin' : ''
                        )} />
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
                    <Alert variant="destructive" className="
                        bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800 
                        text-red-700 dark:text-red-300 p-4 rounded-lg shadow-sm
                    ">
                        <AlertTitle className="text-red-700 font-semibold">Crisis Overview</AlertTitle>
                        <AlertDescription>
                            {/* <ul className="space-y-2 text-sm mt-2 text-red-700">
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
                            </ul> */}

                            {newsLoading ? (
                                <Skeleton className="h-20 w-full bg-card" />
                            ) : newsError ? (
                                <span className="text-xs text-red-500">{newsError}</span>
                            ) : (
                                <ul className="space-y-2 text-sm mt-2 text-red-700">
                                    <li className="flex items-center gap-2">
                                        <span className="flex-none h-1.5 w-1.5 rounded-full bg-red-500" />
                                        <span>{data?.crisisOverview?.killed || "—"}</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="flex-none h-1.5 w-1.5 rounded-full bg-red-500" />
                                        <span>{data?.crisisOverview?.injured || "—"}</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="flex-none h-1.5 w-1.5 rounded-full bg-red-500" />
                                        <span>{data?.crisisOverview?.missing || "—"}</span>
                                    </li>
                                </ul>
                            )}
                        </AlertDescription>

                        <AlertTitle className="text-red-700 font-semibold mt-2">Israeli attacks have damaged:</AlertTitle>
                        <AlertDescription>
                            {newsLoading ? (
                                <Skeleton className="h-20 w-full bg-card" />
                            ) : newsError ? (
                                <span className="text-xs text-red-500">{newsError}</span>
                            ) : (
                                <ul className="space-y-2 text-sm mt-2 text-red-700">
                                    <li className="flex items-center gap-2">
                                        <span className="flex-none h-1.5 w-1.5 rounded-full bg-red-500" />
                                        <span>{data?.devastation?.homes || "—"}</span>
                                    </li>
                                    {/* Show and hide the reset based on the showMore state: */}
                                    { showMore && (
                                        <>
                                            <li className="flex items-center gap-2">
                                                <span className="flex-none h-1.5 w-1.5 rounded-full bg-red-500" />
                                                <span>{data?.devastation?.commercialFacilities || "—"}</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <span className="flex-none h-1.5 w-1.5 rounded-full bg-red-500" />
                                                <span>{data?.devastation?.schools || "—"}</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <span className="flex-none h-1.5 w-1.5 rounded-full bg-red-500" />
                                                <span>{data?.devastation?.hospitals || "—"}</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <span className="flex-none h-1.5 w-1.5 rounded-full bg-red-500" />
                                                <span>{data?.devastation?.roads || "—"}</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <span className="flex-none h-1.5 w-1.5 rounded-full bg-red-500" />
                                                <span>{data?.devastation?.cropland || "—"}</span>
                                            </li>
                                        </>
                                    )
                                    }
                                </ul>
                            )}
                        </AlertDescription>

                        {/* Show more - show less toggle */}
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-red-700 hover:underline mt-2 w-fit"
                            onClick={() => setShowMore(!showMore)}
                        >
                            {showMore ? "Show Less" : "Show More"}
                        </Button>
                    </Alert>

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