"use client";

import React, { useEffect, useMemo, useState } from 'react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { useMediaQuery } from '@/hooks/use-media-query';
import MapSidebar from './map/map-sidebar';
import { useSidebar } from '@/providers/sidebar-provider';
import { cn } from '@/lib/utils';

const SidebarWrapper = () => {
    const { setIsSideBarOpen } = useSidebar();
    const [isOpen, setIsOpen] = useState(false);
    const isSmallScreen = useMediaQuery("(max-width: 640px)");

    // Set initial state based on screen size
    useEffect(() => {
        setIsOpen(!isSmallScreen);
        setIsSideBarOpen(!isSmallScreen);
    }, [isSmallScreen, setIsSideBarOpen]);

    // Update isSideBarOpen when isOpen changes
    useEffect(() => {
        setIsSideBarOpen(isOpen);
    }, [isOpen, setIsSideBarOpen]);

    // Memoize the open state to avoid unnecessary re-renders
    // This is useful for performance optimization
    // and to ensure the Sheet component receives the correct props
    // If not isSmallScreen, we want to keep the sidebar open
    // if isSmallScreen, we want to toggle it based on isOpen
    // This allows us to control the sidebar's open state based on screen size
    const openState = useMemo(
        () => ((!isSmallScreen && isOpen) ? { open: true } : {
            open: isOpen,
            onOpenChange: setIsOpen,
        }), [isSmallScreen, isOpen]
    );


    
    // Toggle button component
    const ToggleButton = () => (
        <div className={cn(
            "fixed top-1/2 z-[9999] transition-all duration-300 ease-in-out group cursor-pointer",
            {
                "left-[315px]": isOpen,
                "left-1": !isOpen,
                "translate-y-[-50%]": true, // Center vertically
            }
        )}
        >
            <Tooltip>
                <TooltipTrigger
                    asChild
                    onClick={() => setIsOpen(!isOpen)}
                    className={cn(
                        "transform transition-all duration-300"
                        , {
                            "group-hover:-translate-x-1": isOpen,
                            "group-hover:translate-x-1": !isOpen,
                        }
                    )}
                >
                    <div className="flex h-[100px] w-8 items-center justify-center" style={{opacity: '1'}}>
                        <div className={cn(
                            "flex h-6 w-6 flex-col items-center"
                            , !isOpen && "animate-bounce-right group-hover:animate-none"
                        )}>
                            {isOpen ? (
                                <>
                                    <div 
                                    // style={{transform: 'translateY(0.15rem) rotate(0deg) translateZ(0px)'}}
                                    className="h-3 w-1 rounded-full
                                        bg-gray-400 
                                        dark:bg-gray-400
                                        group-hover:bg-gray-600
                                        dark:group-hover:bg-gray-300
                                        transition-all
                                        duration-300
                                        ease-in-out

                                        transform
                                        translate-y-[0.15rem]
                                        rotate-0
                                        translate-z-0
                                        group-hover:translate-y-[0.15rem]
                                        group-hover:rotate-12
                                        group-hover:translate-z-0
                                    " 
                                    ></div>
                                    <div 
                                    // style={{transform: 'translateY(-0.15rem) rotate(-0deg) translateZ(0px)'}}
                                    className="h-3 w-1 rounded-full
                                        bg-gray-400 
                                        dark:bg-gray-400
                                        group-hover:bg-gray-600
                                        dark:group-hover:bg-gray-300
                                        transition-all
                                        duration-300
                                        ease-in-out

                                        transform
                                        -translate-y-[0.15rem]
                                        rotate-0
                                        translate-z-0
                                        group-hover:-translate-y-[0.15rem]
                                        group-hover:-rotate-12
                                        group-hover:translate-z-0
                                    "
                                    ></div>
                                </>
                            ): (
                                <>
                                    <div 
                                    style={{transform: 'translateY(0.15rem) rotate(-15deg) translateZ(0px)'}}
                                    className="h-3 w-1 rounded-full
                                        bg-gray-400 
                                        dark:bg-gray-400
                                        group-hover:bg-gray-600
                                        dark:group-hover:bg-gray-300
                                        transition-all
                                        duration-300
                                        ease-in-out
                                    " 
                                    ></div>
                                    <div 
                                    style={{transform: 'translateY(-0.15rem) rotate(15deg) translateZ(0px)'}}
                                    className="h-3 w-1 rounded-full
                                        bg-gray-400 
                                        dark:bg-gray-400
                                        group-hover:bg-gray-600
                                        dark:group-hover:bg-gray-300
                                        transition-all
                                        duration-300
                                        ease-in-out
                                    "
                                    ></div>
                                </>
                            )}
                        </div>
                    </div>
                </TooltipTrigger>
                <TooltipContent side={isSmallScreen ? "right" : "left"}>
                    <span>
                        {isOpen ? 'Hide sidebar' : 'Show sidebar'}
                    </span>
                </TooltipContent>
            </Tooltip>
        </div>
    );

    return (
        <>
            <Sheet modal={isSmallScreen && isOpen} {...openState}>
                <SheetTrigger asChild><ToggleButton /></SheetTrigger>
                <SheetContent 
                    side="left" 
                    className={`
                        w-[20rem]
                        min-h-full backdrop-blur-xl fixed top-0 border-r-[1px]
                        bg-secondary/10 dark:bg-secondary/10
                        transition-all duration-300 ease-in-out
                        flex flex-col items-center text-xs
                    `}
                >
                    <SheetHeader>
                        <SheetTitle className="sr-only">Sidebar</SheetTitle>
                    </SheetHeader>
                    <MapSidebar />
                </SheetContent>
            </Sheet>
        </>
    );
};

export default SidebarWrapper;