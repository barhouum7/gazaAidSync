'use client';

import React, { useState } from 'react'
import { Button } from '../ui/button';
import { Menu } from 'lucide-react';
import { MainNav } from '../main-nav';
import { CommandMenu } from '../command-menu';
import { UserNav } from '../user-nav';
import { MobileNav } from '../mobile-nav';

const HeaderContainer = () => {
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    return (
        <>
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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