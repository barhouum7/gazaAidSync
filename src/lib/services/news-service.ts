import { LocationStatus, ReliefLocationType } from "@/types/map";

interface AlJazeeraUpdate {
    time: string;
    link: string;
    content: string;
    source?: string;
    type?: 'urgent' | 'update' | 'news' | 'trending';
    parsedTime?: number;
    hasVideo?: boolean;
}

interface AlJazeeraResponse {
    headline: {
        title: string;
        link: string;
    };
    blogs: AlJazeeraUpdate[];
    news: Array<{
        title: string;
        link: string;
        postExcerpt: string;
    }>;
    trending: Array<{
        title: string;
        link: string;
    }>;
}

class NewsService {
    private static instance: NewsService;
    // private readonly API_URL = 'https://aljazeera-articles.vercel.app/get-liveblog';
    private readonly baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL;
    private readonly API_URL = `${this.baseUrl}/api/get-liveblog-news`;
    private lastUpdate: Date | null = null;
    private cachedData: AlJazeeraResponse | null = null;

    // Exclude keywords for military/Israeli news
    private readonly excludeKeywords = [
        'إسرائيلي', 'جنود إسرائيليين', 'جندي إسرائيلي', 'الجيش الإسرائيلي',
        'قوات الاحتلال', 'كمين', 'اشتباك', 'هجوم', 'قصف',
        'مقتل جندي', 'مقتل جنود', 'إصابة جندي', 'إصابة جنود',
        'الجيش', 'إطلاق نار', 'عملية عسكرية', 'توغل', 'دبابة', 'صاروخ', 'مروحية', 'طائرة حربية',
        'مستوطنة', 'مستوطنين', 'مستوطن', 'إسرائيليون', 'إسرائيليين',
        'جنود الاحتلال', 'قوات إسرائيلية', 'قوات خاصة', 'قوات عسكرية', 'موقع عسكري', 'مواقع عسكرية',
        'مقتل ضابط', 'إصابة ضابط', 'ضابط إسرائيلي', 'ضباط إسرائيليين', 'ضباط إسرائيليين', 'قادة عسكريين', 'قادة إسرائيليين',
        'قادة جيش', 'قادة قوات', 'قادة الاحتلال', 'قادة عسكريين إسرائيليين', 'قادة جيش إسرائيلي', 'قادة قوات الاحتلال',
        'قادة جيش الاحتلال', 'قادة جيش إسرائيليين', 'قادة قوات الاحتلال الإسرائيلي', 'قادة قوات الاحتلال الإسرائيلية',
        'عسكري', 'قائد', 'جندي'
    ];

    // Civilian/humanitarian focus keywords
    private readonly civilianKeywords = [
        'مدني', 'مدنيين', 'مستشفى', 'مشفى', 'إغاثة', 'مساعدات', 'نزوح', 'لاجئ', 'عائلة', 'أطفال', 'نساء',
        'مأوى', 'مخيم', 'جرحى', 'مصاب', 'شهيد', 'مقتل مدني', 'توزيع مساعدات', 'مياه', 'طعام', 'دواء', 'عيادة', 'إسعاف',
        'منتظر', 'منتظري', 'معونة', 'إغاثة إنسانية', 'مساعدات إنسانية', 'مساعدات طبية', 'مساعدات غذائية',
        'توزيع', 'معونة', 'إيواء', 'إجلاء', 'نزوح', 'لاجئين', 'عائلات', 'أسر', 'أطفال', 'نساء', 'مدنيين',
        'منازل', 'منزل', 'سكن', 'سكني', 'سكنية', 'مأوى', 'مأوى مؤقت', 'مخيم', 'مخيمات', 'مخيمات لاجئين', 'مخيمات إيواء', 'مخيمات إغاثة', 'مخيمات إغاثية',
        'مخيمات إيواء مؤقتة', 'مخيمات إيواء طارئة', 'مخيمات إيواء عاجلة', 'مخيمات إيواء إنسانية', 'مخيمات إيواء مدنية',
    ];

    private shouldInclude(content: string): boolean {
        const isMilitary = this.excludeKeywords.some(keyword => content.includes(keyword));
        const isCivilian = this.civilianKeywords.some(keyword => content.includes(keyword));
        const hasLocation = Object.keys(this.locationMap).some(loc => content.includes(loc));
        const hasGazaContext = content.includes('غزة') || content.includes('قطاع غزة');
    
        // Allow if:
        // 1. It's civilian-focused AND mentions Gaza (or a mapped location)
        // 2. It mentions a specific location (even if military-focused)
        return (isCivilian && (hasGazaContext || hasLocation))
            || hasLocation;
    }

    // Updated location mapping for Gaza
    private readonly locationMap: Record<string, { 
        coordinates: [number, number];
        type: ReliefLocationType;
        defaultNeeds: string[];
    }> = {
        'غزة': { coordinates: [31.5128679, 34.4581358], type: ReliefLocationType.SUPPLIES, defaultNeeds: ['Food', 'Water', 'Medical Supplies', 'Shelter', 'Security'] },
        'قطاع غزة': { coordinates: [31.4432234, 34.360007], type: ReliefLocationType.MEDICAL, defaultNeeds: ['Medical Supplies', 'Food', 'Water', 'Shelter'] },
        'جنوب قطاع غزة': { coordinates: [31.2710, 34.2455], type: ReliefLocationType.MEDICAL, defaultNeeds: ['Medical Supplies', 'Food', 'Water'] },
        'بجنوب قطاع غزة': { coordinates: [31.2710, 34.2455], type: ReliefLocationType.MEDICAL, defaultNeeds: ['Medical Supplies', 'Food', 'Water'] },
        'شمال قطاع غزة': { coordinates: [31.5501268, 34.5033134], type: ReliefLocationType.SHELTER, defaultNeeds: ['Shelter', 'Food', 'Water', 'Blankets'] },
        'شمال غزة': { coordinates: [31.5501268, 34.5033134], type: ReliefLocationType.MEDICAL, defaultNeeds: ['Medical Supplies', 'Food', 'Water', 'Shelter'] },
        'وسط قطاع غزة': { coordinates: [31.5225078, 34.4482441], type: ReliefLocationType.MEDICAL, defaultNeeds: ['Medical Supplies', 'Food'] },
        'مدينة غزة': { coordinates: [31.5050311, 34.4641381], type: ReliefLocationType.MEDICAL, defaultNeeds: ['Medical Supplies', 'Food', 'Water', 'Shelter'] },
        'مدينة غزة القديمة': { coordinates: [31.5050311, 34.4641381], type: ReliefLocationType.MEDICAL, defaultNeeds: ['Medical Supplies', 'Food', 'Water', 'Shelter'] },
        'خان يونس': { coordinates: [31.3452, 34.3037], type: ReliefLocationType.MEDICAL, defaultNeeds: ['Medical Supplies', 'Food', 'Water'] },
        'خانيونس': { coordinates: [31.3452, 34.3037], type: ReliefLocationType.MEDICAL, defaultNeeds: ['Medical Supplies', 'Food', 'Water'] },
        'رفح': { coordinates: [31.2968, 34.2435], type: ReliefLocationType.SUPPLIES, defaultNeeds: ['Food', 'Water', 'Shelter'] },
        'بيت لاهيا': { coordinates: [31.5506, 34.5000], type: ReliefLocationType.SHELTER, defaultNeeds: ['Shelter', 'Food', 'Water'] },
        'جباليا': { coordinates: [31.5367, 34.4983], type: ReliefLocationType.SHELTER, defaultNeeds: ['Shelter', 'Food', 'Water', 'Blankets'] },
        'مخيم جباليا': { coordinates: [31.5367, 34.4983], type: ReliefLocationType.SHELTER, defaultNeeds: ['Shelter', 'Food', 'Water', 'Blankets'] },
        'بيت حانون': { coordinates: [31.5522, 34.5361], type: ReliefLocationType.SHELTER, defaultNeeds: ['Shelter', 'Food', 'Water'] },
        'دير البلح': { coordinates: [31.4183455,34.3502476], type: ReliefLocationType.MEDICAL, defaultNeeds: ['Medical Supplies', 'Food'] },
        'مخيم الشاطئ': { coordinates: [31.5010, 34.4660], type: ReliefLocationType.SHELTER, defaultNeeds: ['Shelter', 'Food', 'Water', 'Blankets'] },
        'مخيم المغازي': { coordinates: [31.4218351 ,34.3852095], type: ReliefLocationType.SHELTER, defaultNeeds: ['Shelter', 'Food', 'Water'] },
        'مخيم النصيرات': { coordinates: [31.444084, 34.3865377], type: ReliefLocationType.SHELTER, defaultNeeds: ['Shelter', 'Food', 'Water'] },
        'النصيرات': { coordinates: [31.444084, 34.3865377], type: ReliefLocationType.SHELTER, defaultNeeds: ['Shelter', 'Food', 'Water'] },
        'مخيم البريج': { coordinates: [31.4381976, 34.4035751], type: ReliefLocationType.SHELTER, defaultNeeds: ['Shelter', 'Food', 'Water'] },
        'مخيم الشابورة': { coordinates: [31.2968, 34.2435], type: ReliefLocationType.SHELTER, defaultNeeds: ['Shelter', 'Food', 'Water'] },
        'مخيم': { coordinates: [31.5010, 34.4660], type: ReliefLocationType.SHELTER, defaultNeeds: ['Shelter', 'Food', 'Water', 'Blankets'] },
        'مأوى': { coordinates: [31.5010, 34.4660], type: ReliefLocationType.SHELTER, defaultNeeds: ['Shelter', 'Food', 'Water'] },
        
        // Hospitals
        'مستشفى الشفاء': { coordinates: [31.5231, 34.4667], type: ReliefLocationType.MEDICAL, defaultNeeds: ['Medical Supplies', 'Staff', 'Equipment'] },
        'مستشفى الأوروبي': { coordinates: [31.3450, 34.3030], type: ReliefLocationType.MEDICAL, defaultNeeds: ['Medical Supplies', 'Staff', 'Equipment'] },
        'مستشفى ناصر': { coordinates: [31.3400, 34.3030], type: ReliefLocationType.MEDICAL, defaultNeeds: ['Medical Supplies', 'Staff', 'Equipment'] },

        // Borders
        'الحدود': { coordinates: [31.5010, 34.4660], type: ReliefLocationType.OTHER, defaultNeeds: ['Security', 'Emergency Response'] },
        'الحدود مع مصر': { coordinates: [31.2200, 34.2650], type: ReliefLocationType.OTHER, defaultNeeds: ['Security', 'Emergency Response'] },
        'الحدود مع إسرائيل': { coordinates: [31.5067, 34.5511], type: ReliefLocationType.OTHER, defaultNeeds: ['Security', 'Emergency Response'] },
        'الحدود مع البحر': { coordinates: [31.5170, 34.4200], type: ReliefLocationType.OTHER, defaultNeeds: ['Security', 'Emergency Response'] },
        'الحدود البحرية': { coordinates: [31.5170, 34.4200], type: ReliefLocationType.OTHER, defaultNeeds: ['Security', 'Emergency Response'] },
        'الحدود البرية': { coordinates: [31.5010, 34.4660], type: ReliefLocationType.OTHER, defaultNeeds: ['Security', 'Emergency Response'] },
        'الحدود البرية مع مصر': { coordinates: [31.2200, 34.2650], type: ReliefLocationType.OTHER, defaultNeeds: ['Security', 'Emergency Response'] },
        'الحدود البرية مع إسرائيل': { coordinates: [31.5067, 34.5511], type: ReliefLocationType.OTHER, defaultNeeds: ['Security', 'Emergency Response'] },
        'الحدود البرية مع البحر': { coordinates: [31.4890, 34.4500], type: ReliefLocationType.OTHER, defaultNeeds: ['Security', 'Emergency Response'] },

        // Humanitarian crossing
        'معبر كرم أبو سالم': { coordinates: [31.2241, 34.2658], type: ReliefLocationType.SUPPLIES, defaultNeeds: ['Medical Supplies', 'Food', 'Water'] },
    };


    // Enhanced keyword mapping for better context understanding
    private readonly contextKeywords = {
        medical: {
            keywords: ['إصابة', 'جرحى', 'مستشفى', 'طبي', 'صحي', 'علاج', 'جرح', 'دم', 'إسعاف', 'عيادة', 'طبيب', 'مريض', 'دواء', 'علاج', 'علاج طبي', 'شهيدا', 'إسعافات أولية'],
            needs: ['Medical Supplies', 'Staff', 'Equipment', 'Blood', 'Medicines']
        },
        military: {
            keywords: ['قصف', 'اشتباك', 'كمين', 'جندي', 'عسكري', 'هجوم', 'قصف'],
            needs: ['Security', 'Emergency Response', 'Evacuation Support']
        },
        humanitarian: {
            keywords: ['مساعدات', 'إغاثة', 'إجلاء', 'مأوى', 'مخيم', 'طعام', 'ماء', 'دواء', 'ملابس', 'إيواء', 'إغاثة إنسانية', 'مساعدات إنسانية', 'مساعدات طبية', 'مساعدات غذائية', 'المساعدات'],
            needs: ['Food', 'Water', 'Shelter', 'Medical Supplies', 'Clothing']
        },
        food: {
            keywords: ['طعام', 'غذاء', 'وجبة', 'توزيع', 'معونة'],
            needs: ['Food Supplies', 'Distribution Equipment', 'Storage']
        },
        water: {
            keywords: ['ماء', 'شرب', 'مياه', 'توزيع'],
            needs: ['Water', 'Water Tanks', 'Purification Tablets']
        }
    };

    private readonly severityKeywords = {
        high: {
            keywords: ['قتل', 'استشهاد', 'قصف', 'دمار', 'تدمير', 'انفجار', 'هجوم', 'غارة', 'قصف جوي', 'قصف مدفعي', 'قصف صاروخي'],
            status: LocationStatus.NEEDS_SUPPORT
        },
        medium: {
            keywords: ['إصابة', 'جرحى', 'تدمير', 'ضرر', 'أضرار'],
            status: LocationStatus.ACTIVE
        },
        low: {
            keywords: ['تقرير', 'تطور', 'وضع', 'حالة', 'أخبار'],
            status: LocationStatus.ACTIVE
        }
    };

    private constructor() {}

    static getInstance(): NewsService {
        if (!NewsService.instance) {
            NewsService.instance = new NewsService();
        }
        return NewsService.instance;
    }

    private async fetchWithRetry(retries = 3): Promise<AlJazeeraResponse> {
        for (let i = 0; i < retries; i++) {
            try {
                const response = await fetch(this.API_URL);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return await response.json();
            } catch (error) {
                if (i === retries - 1) throw error;
                await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
            }
        }
        throw new Error('Failed to fetch news after retries');
    }

    async getLatestUpdates(): Promise<AlJazeeraUpdate[]> {
        const now = new Date();
        if (!this.lastUpdate || 
            !this.cachedData || 
            now.getTime() - this.lastUpdate.getTime() > 5 * 60 * 1000) {
            
            this.cachedData = await this.fetchWithRetry();
            this.lastUpdate = now;
        }
    
        // Process all types of updates
        const allUpdates: AlJazeeraUpdate[] = [
            // Live blog updates
            ...(this.cachedData?.blogs || []),
            
            // Themed news
            ...(this.cachedData?.news?.map(item => ({
                time: 'أخبار',
                link: item.link,
                content: `${item.title} - ${item.postExcerpt}`,
                source: 'الجزيرة',
                type: 'news' as const, // Type assertion to ensure literal type
                parsedTime: 0 // Add default parsedTime
            })) || []),
            
            // Trending news
            ...(this.cachedData?.trending?.map(item => ({
                time: 'شائع',
                link: item.link,
                content: item.title,
                source: 'الجزيرة',
                type: 'trending' as const, // Type assertion to ensure literal type
                parsedTime: 0 // Add default parsedTime
            })) || [])
        ];

        // Sort updates by time (if available) and type
        const sortedUpdates = allUpdates.sort((a, b) => {
            // First sort by type priority
            const typePriority = {
                'urgent': 0,
                'update': 1,
                'news': 2,
                'trending': 3
            };
            
            const typeDiff = (typePriority[a.type || 'news'] || 0) - (typePriority[b.type || 'news'] || 0);
            if (typeDiff !== 0) return typeDiff;

            // Then sort by parsed time if available
            if (a.parsedTime && b.parsedTime) {
                return a.parsedTime - b.parsedTime;
            }

            // Finally, sort by time string
            return a.time.localeCompare(b.time);
        });

        // Filter updates based on content
        const filtered = sortedUpdates.filter(update => this.shouldInclude(update.content));
        
        console.log('All updates:', allUpdates.map(u => ({
            content: u.content,
            type: u.type,
            time: u.time
        })));
        console.log('Filtered updates:', filtered.map(u => ({
            content: u.content,
            type: u.type,
            time: u.time
        })));

        return filtered;
    }

    extractLocationInfo(content: string): { 
        location?: [number, number];
        type?: ReliefLocationType;
        needs?: string[];
        status?: LocationStatus;
        severity?: 'high' | 'medium' | 'low';
        placeName?: string;
    } {
        let location: [number, number] | undefined;
        let type: ReliefLocationType | undefined;
        let needs: string[] = [];
        let status: LocationStatus = LocationStatus.ACTIVE;
        let severity: 'high' | 'medium' | 'low' = 'low';
        let placeName: string | undefined;


        // Sort location keys by length (desc) to match the most specific location first
        const sortedLocations = Object.keys(this.locationMap).sort((a, b) => b.length - a.length);
        
        // Try to match the most specific location name
        for (const loc of sortedLocations) {
            if (content.includes(loc)) {
                const info = this.locationMap[loc];
                location = info.coordinates;
                type = info.type;
                needs = [...info.defaultNeeds];
                placeName = loc;
                break;
            }
        }

        // If no specific location matched, check for general keywords
        const hasGazaContext = content.includes('غزة') || content.includes('قطاع غزة');

        // Fallback: if civilian-focused but no specific location, use Gaza center
        if (!location && this.civilianKeywords.some(keyword => content.includes(keyword)) && hasGazaContext) {
            // location = [31.5017, 34.4668];  // Gaza center coordinates
            // type = ReliefLocationType.SUPPLIES;  // Default to supplies since it's about aid
            // needs = ['Food', 'Water', 'Medical Supplies', 'Shelter', 'Security'];  // Include security due to targeting
            // placeName = 'غزة';  // Default to Gaza

            // Add a small random offset to avoid exact overlap
            const jitter = () => (Math.random() - 0.5) * 0.01; // ~1km jitter
            location = [31.5017 + jitter(), 34.4668 + jitter()];
            type = ReliefLocationType.SUPPLIES;
            needs = ['Food', 'Water', 'Medical Supplies', 'Shelter', 'Security'];
            placeName = 'غزة';
        }

        // Check for context keywords to enhance type and needs
        for (const [context, info] of Object.entries(this.contextKeywords)) {
            if (info.keywords.some(keyword => content.includes(keyword))) {
                if (!type) {
                    type = this.mapContextToReliefType(context);
                }
                needs = [...new Set([...needs, ...info.needs])];
            }
        }

        // Check if the content is military-focused
        const isMilitaryFocused = this.excludeKeywords.some(keyword => content.includes(keyword));

        // Check for severity
        for (const [sev, info] of Object.entries(this.severityKeywords)) {
            if (info.keywords.some(keyword => content.includes(keyword)) && hasGazaContext && !isMilitaryFocused) {
                severity = sev as 'high' | 'medium' | 'low';
                status = info.status;
                break;
            }
        }

        return { location, type, needs, status, severity, placeName };
    }

    private mapContextToReliefType(context: string): ReliefLocationType {
        const typeMap: Record<string, ReliefLocationType> = {
            medical: ReliefLocationType.MEDICAL,
            food: ReliefLocationType.FOOD,
            water: ReliefLocationType.WATER,
            humanitarian: ReliefLocationType.SUPPLIES,
            military: ReliefLocationType.OTHER
        };
        return typeMap[context] || ReliefLocationType.OTHER;
    }
}

export const newsService = NewsService.getInstance();