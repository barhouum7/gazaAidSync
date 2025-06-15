"use client";

import React, { useEffect, useState } from "react";
import ResizableSidebar from '@/components/layout/resizable-sidebar';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AidStatistics from "../dashboard/aid-statistics";
import { GripVertical } from "lucide-react";

interface MainGridProps {
    left?: React.ReactNode;
    center: React.ReactNode;
    right: React.ReactNode;
}

export default function MainGrid({ left, center, right }: MainGridProps) {
    const [mounted, setMounted] = useState(false);


    useEffect(() => {
        setMounted(true);
    }, []);
    
    if (!mounted) {
        return null;
    }

    return (
        <>
            <div
                className="flex flex-col md:flex-row gap-4 md:gap-8"
            >
                <div className="flex flex-col gap-4 md:gap-8 w-full md:w-1/3 flex-grow">
                    <div className="w-full flex flex-col md:flex-row gap-y-4 md:gap-x-4 items-start justify-between">
                        <div className="relative h-full w-full">
                            {center}
                        </div>
                    
                        <div className="sticky top-4 self-start h-full overflow-hidden
                            shadow-lg bg-card dark:bg-card/80 border border-input-200 dark:border-input-700 
                            text-gray-900 dark:text-gray-100 text-sm rounded-lg p-1 z-10
                            scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600
                            hover:shadow-xl transition-shadow duration-200"
                        >
                            <div className="overflow-y-auto h-full">
                                {right}
                                {/* Action Cards */}
                                <div className="space-y-6 my-4">
                                    <Card className="p-6 bg-primary/5 border-primary/20 shadow-md">
                                        <h3 className="text-lg font-semibold mb-2">Take Action</h3>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            Support humanitarian efforts in Gaza through verified organizations.
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            <Button>Donate</Button>
                                            <Button variant="outline">Learn More</Button>
                                        </div>
                                    </Card>
                                </div>
                            </div>


                        </div>
                    </div>

                    <div className="space-y-6 my-4">
                        <Card className="p-6 bg-muted/50 shadow-md">
                            <h3 className="text-lg font-semibold mb-2">Crisis Overview</h3>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Aid Delivered</p>
                                        <p className="text-2xl font-bold">1,234</p>
                                        <p className="text-xs text-muted-foreground">Trucks</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Critical Needs</p>
                                        <p className="text-2xl font-bold text-destructive">78%</p>
                                        <p className="text-xs text-muted-foreground">Unmet</p>
                                    </div>
                                </div>
                                <Button variant="outline" className="w-full">View Full Report</Button>
                            </div>
                        </Card>

                        {/* Statistics Dashboard */}
                        <Card className="p-6 shadow-lg border border-muted">
                            <AidStatistics />
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}