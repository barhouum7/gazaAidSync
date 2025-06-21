'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { 
    Map,
    BarChart3,
    Bell,
    AlertTriangle,
    Heart,
    HelpCircle,
    Settings
} from 'lucide-react';
import BlurImage from './ui/blur-image';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

const mainNavItems = [
    {
        title: 'Map',
        href: '/',
        icon: Map
    },
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: BarChart3
    },
    {
        title: 'Updates',
        href: '/updates',
        icon: Bell
    },
    {
        title: 'Alerts',
        href: '/alerts',
        icon: AlertTriangle
    },
    {
        title: 'Take Action',
        href: '/take-action',
        icon: Heart
    }
];

export function MainNav() {
    const pathname = usePathname();
    const { theme } = useTheme();

    return (
        <TooltipProvider>
            <nav className="flex items-center space-x-1">
                <Link
                    href="/"
                    className="flex items-center space-x-1"
                >
                    <div className="relative flex-none h-12 w-12 -ml-4 mt-2">
                        <BlurImage
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            style={{ objectFit: 'contain' }}
                            src={`${theme === 'dark' ? '/assets/images/gazaAidSync_Logo-icon-green.png' : '/assets/images/gazaAidSync_Logo-icon.png'}`}
                            alt="Gaza Aid Sync Logo"
                        />
                    </div>
                    <span className="sr-only">
                        Gaza AidSync
                    </span>
                </Link>

                <div className="flex items-center justify-between">
                    {mainNavItems.map((item) => (
                        <Button
                            key={item.href}
                            variant={pathname === item.href ? 'secondary' : 'ghost'}
                            asChild
                            className={cn(
                                'hidden md:flex items-center justify-center text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50',
                                'data-[state=open]:bg-accent data-[state=open]:text-accent-foreground',
                                'mx-1 rounded-md transition-colors hover:bg-accent',
                                pathname === item.href && 'bg-accent text-accent-foreground',
                            )}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Link href={item.href}
                            className="flex items-center justify-center space-x-0 px-2 py-2"
                            >
                                <item.icon className="h-4 w-4" />
                                <span className="inline-block">
                                    {item.title}
                                </span>
                            </Link>
                        </Button>
                    ))}
                </div>
            </nav>
        </TooltipProvider>
    );
}
