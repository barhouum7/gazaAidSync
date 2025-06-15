'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet';
import { 
    Map,
    BarChart3,
    Bell,
    AlertTriangle,
    Heart,
    HelpCircle,
    Settings,
    X
} from 'lucide-react';

interface MobileNavProps {
    open: boolean;
    onClose: () => void;
}

const mobileNavItems = [
    {
        title: 'Map',
        href: '/',
        icon: Map,
        description: 'Interactive map of aid locations and delivery routes'
    },
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: BarChart3,
        description: 'Aid statistics and critical needs overview'
    },
    {
        title: 'Updates',
        href: '/updates',
        icon: Bell,
        description: 'Live updates on aid delivery and situations'
    },
    {
        title: 'Alerts',
        href: '/alerts',
        icon: AlertTriangle,
        description: 'Emergency alerts and critical notifications'
    },
    {
        title: 'Take Action',
        href: '/take-action',
        icon: Heart,
        description: 'Ways to help and support humanitarian efforts'
    },
    {
        title: 'Help',
        href: '/help',
        icon: HelpCircle,
        description: 'Guide and frequently asked questions'
    },
    {
        title: 'Settings',
        href: '/settings',
        icon: Settings,
        description: 'App preferences and notifications'
    }
];

export function MobileNav({ open, onClose }: MobileNavProps) {
    const pathname = usePathname();

    return (
        <Sheet open={open} onOpenChange={onClose}>
            <SheetContent side="left" className="w-full max-w-[300px] p-0">
                <SheetHeader className="p-4 border-b">
                    <SheetTitle className="flex items-center justify-between">
                        <span>Gaza Aid Sync</span>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="shrink-0"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </SheetTitle>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-4rem)]">
                    <div className="space-y-2 p-4">
                        {mobileNavItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={onClose}
                                className={cn(
                                    'flex items-start gap-4 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent',
                                    pathname === item.href
                                        ? 'bg-accent'
                                        : 'transparent'
                                )}
                            >
                                <item.icon className="h-5 w-5 shrink-0" />
                                <div className="space-y-1">
                                    <div className="font-medium leading-none">
                                        {item.title}
                                    </div>
                                    <p className="text-xs text-muted-foreground line-clamp-2">
                                        {item.description}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
}
