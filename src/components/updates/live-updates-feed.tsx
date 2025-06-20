'use client';

import React from "react";
import { useState, useMemo } from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Skeleton } from '../ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Button } from '../ui/button';
import { Filter, AlertCircle, Bell, BellRing, Loader2, Radio, RadioTower, Globe, Newspaper, TrendingUp, Search, ChevronLeft, ChevronRight, RefreshCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLiveNewsData } from '@/hooks/use-live-news-data';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogClose,
} from '../ui/dialog';

type UpdateType = 'ALERT' | 'INFO' | 'SUCCESS';
type UpdateCategory = 'AID' | 'MEDICAL' | 'SECURITY' | 'INFRASTRUCTURE';

interface Update {
    id: string;
    type: UpdateType;
    category: UpdateCategory;
    title: string;
    description: string;
    location?: string;
    timestamp: Date;
    isNew?: boolean;
    link?: string;
    expanded?: boolean; // For expanded view
}

interface LiveUpdatesFeedProps {
    expanded?: boolean;
}

const DEMO_UPDATES: Update[] = [
    {
        id: '1',
        type: 'ALERT',
        category: 'SECURITY',
        title: 'Urgent: Road Closure',
        description: 'Main supply route to Rafah temporarily closed due to security concerns.',
        location: 'Rafah Border Crossing',
        timestamp: new Date('2024-05-31T04:30:00'),
        isNew: true
    },
    {
        id: '2',
        type: 'SUCCESS',
        category: 'AID',
        title: 'Aid Delivery Complete',
        description: '35 trucks of humanitarian aid successfully delivered to Gaza City.',
        location: 'Gaza City',
        timestamp: new Date('2024-05-31T04:15:00'),
        isNew: true
    },
    {
        id: '3',
        type: 'INFO',
        category: 'MEDICAL',
        title: 'Medical Supplies Update',
        description: 'Emergency medical supplies requested for Al-Shifa Hospital.',
        location: 'Al-Shifa Hospital',
        timestamp: new Date('2024-05-31T04:00:00')
    },
    {
        id: '4',
        type: 'ALERT',
        category: 'INFRASTRUCTURE',
        title: 'Power Outage',
        description: 'Northern Gaza experiencing widespread power outages.',
        location: 'North Gaza',
        timestamp: new Date('2024-05-31T03:45:00')
    }
];

const OFF_TOPIC_KEYWORDS = [
    'رياضة', 'كرة', 'دوري', 'مباراة', 'لاعب', 'فنان', 'فن', 'مسلسل', 'فيلم', 'ترفيه', 'نجوم', 'موسيقى', 'غناء', 'سباق', 'بطولة', 'كأس', 'جائزة', 'موضة'
];

function isRelevant(content: string) {
    return !OFF_TOPIC_KEYWORDS.some(keyword => content.includes(keyword));
}

// Robust keyword-to-category mapping for classification
const CATEGORY_KEYWORDS: { [K in UpdateCategory]: string[] } = {
    AID: ['مساعدات', 'إغاثة', 'توزيع', 'شاحنة', 'إمداد', 'إيصال', 'معونة', 'إيواء', 'لاجئ', 'نزوح', 'مأوى', 'خيمة', 'مخيم', 'طعام', 'غذاء', 'وجبة', 'ملابس', 'بطانية', 'سلة غذائية', 'سلة طعام'],
    MEDICAL: ['مستشفى', 'طبي', 'عيادة', 'دواء', 'إصابة', 'جرحى', 'إسعاف', 'علاج', 'مريض', 'طبيب', 'ممرضة', 'ممرض', 'جراحة', 'عيادة', 'مستشفيات', 'مصاب', 'جرح', 'إسعافات أولية'],
    SECURITY: ['قصف', 'هجوم', 'إطلاق نار', 'انفجار', 'اشتباك', 'كمين', 'مقتل', 'وفاة', 'تحذير', 'خطر', 'إخلاء', 'أمني', 'أمنية', 'أمن', 'الجيش', 'عسكري', 'توغل', 'دبابة', 'صاروخ', 'مروحية', 'طائرة حربية', 'الاحتلال', 'الجيش الإسرائيلي', 'إسرائيلي', 'جنود', 'جندي', 'مستوطن', 'مستوطنين'],
    INFRASTRUCTURE: ['كهرباء', 'ماء', 'مياه', 'بنية تحتية', 'طريق', 'محطة', 'جسر', 'مطار', 'ميناء', 'شبكة', 'اتصالات', 'هاتف', 'انترنت', 'مبنى', 'مبانٍ', 'مدرسة', 'مدارس', 'مستودع', 'مخزن', 'مزرعة', 'زراعة', 'محاصيل', 'مستودعات', 'مخازن', 'مزارع', 'طرق', 'جسور', 'موانئ', 'مطارات', 'مياه الشرب', 'صرف صحي']
};

function classifyCategory(text: string): UpdateCategory {
    // Priority: SECURITY > MEDICAL > INFRASTRUCTURE > AID
    if (CATEGORY_KEYWORDS.SECURITY.some(k => text.includes(k))) return 'SECURITY';
    if (CATEGORY_KEYWORDS.MEDICAL.some(k => text.includes(k))) return 'MEDICAL';
    if (CATEGORY_KEYWORDS.INFRASTRUCTURE.some(k => text.includes(k))) return 'INFRASTRUCTURE';
    if (CATEGORY_KEYWORDS.AID.some(k => text.includes(k))) return 'AID';
    return 'AID'; // fallback
}

function mapNewsToUpdate(item: any, type: UpdateType = 'INFO', category: UpdateCategory = 'AID', expanded: boolean): Update {
    let t = type;
    const text = item.content || item.title || '';
    // Type logic (unchanged)
    if (/عاجل|إغلاق|تحذير|خطر|إخلاء|إصابة|وفاة|مقتل/.test(text)) {
        t = 'ALERT';
    } else if (/مساعدات|إغاثة|توزيع|شاحنة|إمداد|إيصال/.test(text)) {
        t = 'SUCCESS';
    } else if (/مستشفى|طبي|دواء|إصابة|عيادة/.test(text)) {
        t = 'INFO';
    } else if (/كهرباء|ماء|بنية تحتية|طريق|محطة/.test(text)) {
        t = 'ALERT';
    }
    // Improved category logic
    const c = classifyCategory(text);
    return {
        id: item.id || item.link || Math.random().toString(36).slice(2),
        type: t,
        category: c,
        title: (item.title || item.content || '').slice(0, 60) + ((item.title || item.content || '').length > 60 ? !expanded ? '...' : '' : ''),
        description: item.content || item.postExcerpt || item.title || '',
        location: item.source || undefined,
        timestamp: new Date(),
        isNew: t === 'ALERT',
        link: item.link || undefined
    };
}

const ALL_CATEGORIES: UpdateCategory[] = ['AID', 'MEDICAL', 'SECURITY', 'INFRASTRUCTURE'];
const ALL_SOURCES = ['blogs', 'news', 'trending'];
const ALL_TYPES: UpdateType[] = ['ALERT', 'INFO', 'SUCCESS'];
const SOURCE_ICONS: Record<string, React.ReactNode> = {
    blogs: <Globe className="h-4 w-4" />, news: <Newspaper className="h-4 w-4" />, trending: <TrendingUp className="h-4 w-4" />
};

export default function LiveUpdatesFeed({ expanded }: LiveUpdatesFeedProps) {
    const [mode, setMode] = useState<'live' | 'demo'>('live');
    const [activeFilters, setActiveFilters] = useState<UpdateCategory[]>(ALL_CATEGORIES);
    const [sourceFilters, setSourceFilters] = useState<string[]>(ALL_SOURCES);
    const [typeFilters, setTypeFilters] = useState<UpdateType[]>(ALL_TYPES);
    const [search, setSearch] = useState('');
    const [selectedUpdate, setSelectedUpdate] = useState<Update | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    // Live data with auto-refresh
    const { data, loading, error, refetch } = useLiveNewsData(60000);

    // Aggregate and filter
    const liveUpdates: Update[] = useMemo(() => {
        if (!data) return [];
        let allItems: any[] = [];
        if (sourceFilters.includes('blogs')) allItems = allItems.concat(data.blogs || []);
        if (sourceFilters.includes('news')) allItems = allItems.concat(data.news || []);
        if (sourceFilters.includes('trending')) allItems = allItems.concat(data.trending || []);
        return allItems
            .filter(item => isRelevant(item.content || item.title || ''))
            .map(item => mapNewsToUpdate(item, undefined, undefined, expanded || false))
            .filter(update =>
                typeFilters.includes(update.type) &&
                activeFilters.includes(update.category) &&
                (search === '' || update.title.includes(search) || update.description.includes(search))
            );
    }, [data, sourceFilters, typeFilters, activeFilters, search]);

    const updates = mode === 'live' ? liveUpdates : DEMO_UPDATES;
    const filteredUpdates = updates;

    const handleFilterToggle = (category: UpdateCategory) => {
        setActiveFilters(prev =>
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };
    const handleSourceToggle = (src: string) => {
        setSourceFilters(f =>
            f.includes(src) ? f.filter(s => s !== src) : [...f, src]
        );
    };
    const handleTypeToggle = (type: UpdateType) => {
        setTypeFilters(f =>
            f.includes(type) ? f.filter(t => t !== type) : [...f, type]
        );
    };
    const handleSelectAll = () => setActiveFilters([...ALL_CATEGORIES]);
    const handleClearFilters = () => setActiveFilters([]);
    const resetAllFilters = () => {
        setActiveFilters([...ALL_CATEGORIES]);
        setSourceFilters([...ALL_SOURCES]);
        setTypeFilters([...ALL_TYPES]);
        setSearch('');
    };
    // Open dialog when update is selected
    const handleUpdateClick = (update: Update) => {
        setSelectedUpdate(update);
        setDialogOpen(true);
    };
    // Dialog navigation
    const currentIdx = filteredUpdates.findIndex(u => u.id === selectedUpdate?.id);
    const handlePrev = () => {
        if (currentIdx > 0) {
            setSelectedUpdate(filteredUpdates[currentIdx - 1]);
        }
    };
    const handleNext = () => {
        if (currentIdx < filteredUpdates.length - 1) {
            setSelectedUpdate(filteredUpdates[currentIdx + 1]);
        }
    };
    // Keyboard navigation for dialog
    React.useEffect(() => {
        if (!dialogOpen) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') handlePrev();
            if (e.key === 'ArrowRight') handleNext();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [dialogOpen, currentIdx, filteredUpdates]);

    return (
        <div className={cn(
            "space-y-4 transition-all duration-300 relative",
        )}>
            {/* Mode Switch */}
            <div className="flex items-center gap-2 mb-2">
                <Button
                    size="sm"
                    variant={mode === 'live' ? 'default' : 'outline'}
                    onClick={() => setMode('live')}
                    className="flex items-center gap-1"
                >
                    <RadioTower className="h-4 w-4 animate-pulse" />
                    Live
                </Button>
                <Button
                    size="sm"
                    variant={mode === 'demo' ? 'default' : 'outline'}
                    onClick={() => setMode('demo')}
                    className="flex items-center gap-1"
                >
                    <Radio className="h-4 w-4" />
                    Demo
                </Button>
                <span className="ml-auto text-xs text-muted-foreground">
                    {mode === 'live' ? 'Showing real-time updates' : 'Showing demo data'}
                </span>
            </div>

            {/* Filters - sticky, grouped, icons, tooltips, search */}
            <div className="flex flex-wrap items-center gap-2 p-2 bg-muted rounded-lg sticky top-0 z-10 shadow-sm">
                <span className="font-medium text-sm">Filter by:</span>
                {ALL_CATEGORIES.map(category => (
                    <Button
                        key={category}
                        size="sm"
                        variant={activeFilters.includes(category) ? 'default' : 'outline'}
                        onClick={() => handleFilterToggle(category)}
                        className="h-7"
                        title={`Show only ${category.toLowerCase()} news`}
                    >
                        {category.toLowerCase()}
                    </Button>
                ))}
                <Button
                    size="sm"
                    variant="outline"
                    onClick={handleSelectAll}
                    className="h-7"
                    title="Select all categories"
                >
                    All
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={handleClearFilters}
                    className="h-7"
                    title="Clear all categories"
                >
                    Clear
                </Button>
                {/* Source filters */}
                <span className="ml-2 text-sm text-muted-foreground">Source:</span>
                {ALL_SOURCES.map(src => (
                    <Button
                        key={src}
                        size="sm"
                        variant={sourceFilters.includes(src) ? 'default' : 'outline'}
                        onClick={() => handleSourceToggle(src)}
                        className="h-7 flex items-center gap-1"
                        title={`Show only ${src}`}
                    >
                        {SOURCE_ICONS[src]} {src}
                    </Button>
                ))}
                {/* Type filters */}
                <span className="ml-2 text-sm text-muted-foreground">Type:</span>
                {ALL_TYPES.map(type => (
                    <Button
                        key={type}
                        size="sm"
                        variant={typeFilters.includes(type) ? 'default' : 'outline'}
                        onClick={() => handleTypeToggle(type)}
                        className="h-7"
                        title={`Show only ${type.toLowerCase()} news`}
                    >
                        {type}
                    </Button>
                ))}
                {/* Search box */}
                <div className="relative ml-2">
                    <Search className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search news..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="pl-8 pr-2 py-1 rounded border bg-background text-foreground border-muted focus:outline-none focus:ring-2 focus:ring-primary w-56"
                        style={{ minWidth: 120 }}
                        aria-label="Search news"
                    />
                </div>
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={resetAllFilters}
                    className="ml-2"
                    title="Reset all filters"
                >
                    <RefreshCcw className="h-4 w-4" /> Reset
                </Button>
                {mode === 'live' && (
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={refetch}
                        className="ml-auto"
                        title="Refresh live updates"
                    >
                        <Loader2 className={cn("h-4 w-4", loading && "animate-spin")}/>
                    </Button>
                )}
            </div>
            {/* News count */}
            <div className="text-xs text-muted-foreground mb-2">
                Showing {filteredUpdates.length} of {mode === 'live' ? (liveUpdates.length) : DEMO_UPDATES.length} news
            </div>
            {/* Updates Feed */}
            <ScrollArea className="h-[calc(100vh-20rem)]">
                <div className="space-y-3">
                    {loading && mode === 'live' ? (
                        Array.from({ length: 4 }).map((_, i) => (
                            <Card key={i} className="p-4 space-y-2">
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-4 w-4 rounded-full" />
                                    <Skeleton className="h-4 w-1/4" />
                                </div>
                                <Skeleton className="h-4 w-3/4" />
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-3 w-20" />
                                    <Skeleton className="h-3 w-24" />
                                </div>
                            </Card>
                        ))
                    ) : error && mode === 'live' ? (
                        <Alert variant="destructive">
                            <AlertTitle>Error loading live updates</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    ) : filteredUpdates.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                            <svg width="64" height="64" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.2"/><path d="M8 12h8M8 16h8M8 8h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5"/></svg>
                            <div className="mt-2">No news found for the selected filters.</div>
                        </div>
                    ) : (
                        filteredUpdates.map((update, idx) => (
                            <Card
                                key={update.id + '-' + idx} // Ensures uniqueness even if id/link is duplicated
                                className={cn(
                                    "p-4 transition-colors cursor-pointer hover:bg-accent/30 border border-muted rounded-lg shadow-sm",
                                    selectedUpdate?.id === update.id && "border-primary ring-2 ring-primary/30",
                                    update.isNew && "animate-highlight"
                                )}
                                onClick={() => handleUpdateClick(update)}
                                tabIndex={0}
                                aria-label={`View details for ${update.title}`}
                            >
                                <div className={cn(
                                    "flex items-start justify-between gap-4",
                                )}>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            {/* Type icon */}
                                            {update.type === 'ALERT' ? (
                                                <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                                            ) : update.type === 'SUCCESS' ? (
                                                <BellRing className="h-4 w-4 text-success flex-shrink-0" />
                                            ) : (
                                                <Bell className="h-4 w-4 text-primary flex-shrink-0" />
                                            )}
                                            <span className={cn("font-medium", !expanded && "max-w-[150px] truncate")} title={update.title}>{update.title}</span>
                                            {update.isNew && (
                                                <Badge variant="default" className="text-[10px] px-1 py-0">NEW</Badge>
                                            )}
                                        </div>
                                        <p className={cn("text-sm text-muted-foreground", !expanded && "max-w-[150px] truncate")} title={update.description}>{update.description}</p>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            {/* Source badge */}
                                            <Badge variant="secondary" className="px-1 py-0.5 whitespace-nowrap">{update.location || "Source"}</Badge>
                                            <span className="whitespace-nowrap">
                                                {update.timestamp instanceof Date
                                                    ? update.timestamp.toLocaleTimeString()
                                                    : new Date(update.timestamp).toLocaleTimeString()}
                                            </span>
                                        </div>
                                    </div>
                                    <Badge
                                        variant={
                                            update.type === 'ALERT' ? 'destructive' :
                                            update.type === 'SUCCESS' ? 'default' :
                                            'secondary'
                                        }
                                        className="flex-shrink-0"
                                    >
                                        {update.category}
                                    </Badge>
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            </ScrollArea>
            {/* Selected Update Details in Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    {selectedUpdate && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    {selectedUpdate.type === 'ALERT' ? (
                                        <AlertCircle className="h-4 w-4 text-destructive" />
                                    ) : selectedUpdate.type === 'SUCCESS' ? (
                                        <BellRing className="h-4 w-4 text-success" />
                                    ) : (
                                        <Bell className="h-4 w-4 text-primary" />
                                    )}
                                    {selectedUpdate.title}
                                </DialogTitle>
                                <DialogDescription asChild>
                                    <div className="mt-2 space-y-2">
                                        <div className="flex flex-wrap gap-2 items-center text-xs mb-2">
                                            <Badge variant="secondary">{selectedUpdate.category}</Badge>
                                            <Badge variant="outline">{selectedUpdate.type}</Badge>
                                            {selectedUpdate.location && <Badge variant="secondary">{selectedUpdate.location}</Badge>}
                                            <span className="text-muted-foreground">{selectedUpdate.timestamp instanceof Date ? selectedUpdate.timestamp.toLocaleString() : new Date(selectedUpdate.timestamp).toLocaleString()}</span>
                                            {selectedUpdate.link && (
                                                <a href={selectedUpdate.link} target="_blank" rel="noopener noreferrer" className="underline text-primary">View Source</a>
                                            )}
                                        </div>
                                        <p className="text-base leading-relaxed whitespace-pre-line break-words">{selectedUpdate.description}</p>
                                        <div className="flex justify-between mt-4">
                                            <Button size="icon" variant="ghost" onClick={handlePrev} disabled={currentIdx <= 0} title="Previous (←)"><ChevronLeft /></Button>
                                            <Button size="icon" variant="ghost" onClick={handleNext} disabled={currentIdx >= filteredUpdates.length - 1} title="Next (→)"><ChevronRight /></Button>
                                        </div>
                                    </div>
                                </DialogDescription>
                            </DialogHeader>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}