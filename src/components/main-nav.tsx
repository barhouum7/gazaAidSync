'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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

    return (
        <nav className="flex items-center space-x-4 lg:space-x-6">
            <Link
                href="/"
                className="hidden items-center space-x-2 md:flex"
            >
                <span className="hidden font-bold sm:inline-block">
                    Gaza Aid Sync
                </span>
            </Link>
            {mainNavItems.map((item) => (
                <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                        'hidden items-center space-x-2 text-sm font-medium transition-colors hover:text-primary md:flex',
                        pathname === item.href
                            ? 'text-foreground'
                            : 'text-muted-foreground'
                    )}
                >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                </Link>
            ))}
            <div className="flex items-center space-x-2">
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
            </div>
        </nav>
    );
}
