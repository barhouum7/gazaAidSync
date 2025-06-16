'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from './ui/command';
import { 
    Search,
    Map,
    BarChart3,
    Bell,
    AlertTriangle,
    Heart,
    HelpCircle,
    Settings,
    Filter,
    RefreshCw,
    AlertOctagon,
    Truck,
    Hospital,
    Building2
} from 'lucide-react';

export function CommandMenu() {
    const router = useRouter();
    const [open, setOpen] = React.useState(false);

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };
        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    const runCommand = React.useCallback((command: () => void) => {
        setOpen(false);
        command();
    }, []);

    return (
        <>
            <Button
                variant="outline"
                className="relative h-9 w-9 p-0 lg:h-10 lg:w-60 lg:justify-start lg:px-3 lg:py-2"
                onClick={() => setOpen(true)}
            >
                <Search className="h-4 w-4 lg:mr-2" />
                <span className="hidden lg:inline-flex">Search...</span>
                <span className="sr-only">Search</span>
                <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 lg:flex">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </Button>
            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput placeholder="Type a command or search..." />
                <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup heading="Navigation">
                        <CommandItem
                            onSelect={() => runCommand(() => router.push('/'))}
                        >
                            <Map className="mr-2 h-4 w-4" />
                            <span>Go to Map</span>
                        </CommandItem>
                        <CommandItem
                            onSelect={() => runCommand(() => router.push('/dashboard'))}
                        >
                            <BarChart3 className="mr-2 h-4 w-4" />
                            <span>View Dashboard</span>
                        </CommandItem>
                        <CommandItem
                            onSelect={() => runCommand(() => router.push('/updates'))}
                        >
                            <Bell className="mr-2 h-4 w-4" />
                            <span>Check Updates</span>
                        </CommandItem>
                        <CommandItem
                            onSelect={() => runCommand(() => router.push('/alerts'))}
                        >
                            <AlertTriangle className="mr-2 h-4 w-4" />
                            <span>View Alerts</span>
                        </CommandItem>
                    </CommandGroup>
                    <CommandSeparator />
                    <CommandGroup heading="Quick Actions">
                        <CommandItem
                            onSelect={() => runCommand(() => console.log('Refresh data'))}
                        >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            <span>Refresh Data</span>
                        </CommandItem>
                        <CommandItem
                            onSelect={() => runCommand(() => console.log('Filter locations'))}
                        >
                            <Filter className="mr-2 h-4 w-4" />
                            <span>Filter Locations</span>
                        </CommandItem>
                    </CommandGroup>
                    <CommandSeparator />
                    <CommandGroup heading="Categories">
                        <CommandItem
                            onSelect={() => runCommand(() => console.log('Show emergencies'))}
                        >
                            <AlertOctagon className="mr-2 h-4 w-4" />
                            <span>Emergency Zones</span>
                        </CommandItem>
                        <CommandItem
                            onSelect={() => runCommand(() => console.log('Show aid routes'))}
                        >
                            <Truck className="mr-2 h-4 w-4" />
                            <span>Aid Routes</span>
                        </CommandItem>
                        <CommandItem
                            onSelect={() => runCommand(() => console.log('Show medical'))}
                        >
                            <Hospital className="mr-2 h-4 w-4" />
                            <span>Medical Facilities</span>
                        </CommandItem>
                        <CommandItem
                            onSelect={() => runCommand(() => console.log('Show infrastructure'))}
                        >
                            <Building2 className="mr-2 h-4 w-4" />
                            <span>Infrastructure</span>
                        </CommandItem>
                    </CommandGroup>
                    <CommandSeparator />
                    <CommandGroup heading="Support">
                        <CommandItem
                            onSelect={() => runCommand(() => router.push('/take-action'))}
                        >
                            <Heart className="mr-2 h-4 w-4" />
                            <span>Take Action</span>
                        </CommandItem>
                        <CommandItem
                            onSelect={() => runCommand(() => router.push('/help'))}
                        >
                            <HelpCircle className="mr-2 h-4 w-4" />
                            <span>Help & Support</span>
                        </CommandItem>
                        <CommandItem
                            onSelect={() => runCommand(() => router.push('/settings'))}
                        >
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Settings</span>
                        </CommandItem>
                    </CommandGroup>
                </CommandList>
            </CommandDialog>
        </>
    );
}
