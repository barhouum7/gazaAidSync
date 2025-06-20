"use client";

import React, { useEffect, useState } from "react";
import ResizableSidebar from '@/components/layout/resizable-sidebar';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AidStatistics from "../dashboard/aid-statistics";
import { GripVertical, PanelRightOpen, PanelRightClose, ChevronLeft, ChevronRight, RadioTower } from "lucide-react";
import { cn } from "@/lib/utils";

interface MainGridProps {
    left?: React.ReactNode;
    center: React.ReactNode;
    right: React.ReactNode;
}

export default function MainGrid({ left, center, right }: MainGridProps) {
    const [mounted, setMounted] = useState(false);
    const [showRightPanel, setShowRightPanel] = useState(false);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);
    
    if (!mounted) {
        return null;
    }

    // Clone the 'right' element to pass down the 'expanded' state
    const rightPanelContent = React.isValidElement(right) 
        ? React.cloneElement(right as React.ReactElement<any>, { expanded }) 
        : right;

    return (
        <>
            <div className="flex flex-col md:flex-row gap-4 md:gap-8 w-full">
                {/* Map (center) always visible, right panel is a drawer on mobile */}
                <div className="relative flex-1 min-w-0 min-h-[300px] sm:min-h-[400px]">
                    {center}
                </div>
                {/* Toggle right panel on mobile */}
                <Button
                    variant={"outline"}
                    className="md:hidden w-full px-8 mt-4 flex items-center justify-center gap-2"
                    size="icon"
                    onClick={() => setShowRightPanel(v => !v)}
                    aria-label={showRightPanel ? "Hide live updates panel" : "Show live updates panel"}
                    title={showRightPanel ? "Hide live updates panel" : "Show live updates panel"}
                >
                    {showRightPanel ? 
                        (
                            <>
                                <RadioTower className="h-4 w-4" />
                                <span>Hide live updates panel</span>
                            </>
                        )
                        : 
                        (
                            <>
                                <RadioTower className="h-4 w-4" />
                                <span>Show live updates panel</span>
                            </>
                        )
                    }
                </Button>
                {/* Right panel: sticky on desktop, drawer on mobile */}
                <div
                    className={cn(
                        "w-full", // Full width for mobile drawer
                        expanded
                        // ? "md:w-[700px] md:max-w-[98vw]" // Desktop expanded
                        ? "md:w-auto md:max-w-auto" // Desktop expanded
                        : "md:w-[450px] md:max-w-[95vw]" // Desktop collapsed
                        , "md:sticky md:top-4 md:self-start md:h-full md:overflow-visible " +
                        "shadow-lg bg-card dark:bg-card/80 border border-input-200 dark:border-input-700 " +
                        "text-gray-900 dark:text-gray-100 text-sm rounded-lg p-1 z-10 " +
                        "scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 " +
                        "hover:shadow-xl transition-shadow duration-200 " +
                        (showRightPanel ? "py-4 z-50 fixed inset-0 flex flex-col md:static md:flex-none bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" : "hidden md:block")
                    )}
                    style={{ minWidth: 0 }}
                >
                    {/* Expand/Collapse Button - hidden on mobile */}
                    <button
                        className="group cursor-pointer hidden md:block absolute -left-4 top-4 z-20 bg-muted border border-muted rounded-full p-1 shadow hover:bg-accent/50 focus:outline-none"
                        onClick={() => setExpanded(e => !e)}
                        title={expanded ? "Collapse panel" : "Expand panel"}
                        aria-label={expanded ? "Collapse panel" : "Expand panel"}
                    >
                        {expanded ? 
                            <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                            : <ChevronLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform duration-200" />
                        }
                    </button>

                    <div className={cn(
                        "overflow-y-auto h-auto max-h-screen md:max-h-[calc(100vh-2rem)]"
                    )}>
                        {/* Close button for drawer on mobile */}
                        <div className="md:hidden absolute top-12 right-2 z-20">
                            <Button size="icon" variant="ghost" onClick={() => setShowRightPanel(false)} aria-label="Close updates panel">
                                <PanelRightClose className="h-6 w-6" />
                            </Button>
                        </div>
                        {rightPanelContent}
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
            {/* Below main grid: dashboard cards (unchanged) */}
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
        </>
    );
}