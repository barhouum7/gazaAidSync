'use client';

import React, { useState } from 'react'
import Link from 'next/link';
import { Button } from '../ui/button';
import { Menu, HelpCircle, Settings } from 'lucide-react';
import { MainNav } from '../main-nav';
import { CommandMenu } from '../command-menu';
import { UserNav } from '../user-nav';
import { MobileNav } from '../mobile-nav';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

const HeaderContainer = () => {
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    // Fix hydration mismatch by ensuring the theme is set before rendering
    const [isMounted, setIsMounted] = React.useState(false);
    React.useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return null; // Prevents hydration mismatch
    };

    return (
        <>
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
            // Add a background pattern like Palestine flag or Palestine flag colors or Palestine keffiyeh pattern
            style={{ backgroundImage: 'url("/assets/keffiyeh-bg.svg")', backgroundSize: 'cover' }}
            >
                <div className="w-full justify-between px-6 flex h-14 items-center">
                    <div className="md:hidden">
                        <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setMobileNavOpen(true)}
                        >
                        <Menu className="h-5 w-5" />
                        </Button>
                    </div>
                    <div className="flex items-center space-x-4 md:space-x-6">
                        <MainNav />
                    </div>
                    <div className="flex flex-1 items-center justify-end space-x-4">
                        <TooltipProvider>
                            <div className="flex items-center space-x-2">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="hidden md:flex"
                                            asChild
                                        >
                                            <Link href="/help">
                                                <HelpCircle className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Help</p>
                                    </TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="hidden md:flex"
                                            asChild
                                        >
                                            <Link href="/settings">
                                                <Settings className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Settings</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        </TooltipProvider>
                        <CommandMenu />
                        <UserNav />
                    </div>
                </div>
            </header>

            {/* Mobile Navigation */}
            <MobileNav
                open={mobileNavOpen}
                onClose={() => setMobileNavOpen(false)}
            />
        </>
    )
}

export default HeaderContainer