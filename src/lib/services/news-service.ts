import { LocationStatus, ReliefLocationType } from "@/types/map";

interface AlJazeeraUpdate {
    time: string;
    link: string;
    content: string;
}

interface AlJazeeraResponse {
    headline: {
        title: string;
        link: string;
    };
    blogs: AlJazeeraUpdate[];
    news: Array<{
        link: string;
        title: string;
    }>;
}

class NewsService {
    private static instance: NewsService;
    // private readonly API_URL = 'https://aljazeera-articles.vercel.app/get-liveblog';
    private readonly API_URL = '/api/get-liveblog-news';
    private lastUpdate: Date | null = null;
    private cachedData: AlJazeeraResponse | null = null;

    // Exclude keywords for military/Israeli news
    private readonly excludeKeywords = [
        'إسرائيلي', 'جنود إسرائيليين', 'جندي إسرائيلي', 'الجيش الإسرائيلي',
        'قوات الاحتلال', 'كمين', 'اشتباك', 'هجوم', 'قصف',
        'مقتل جندي', 'مقتل جنود', 'إصابة جندي', 'إصابة جنود',
        'الجيش', 'إطلاق نار', 'عملية عسكرية', 'توغل', 'دبابة', 'صاروخ', 'مروحية', 'طائرة حربية',
        'مستوطنة', 'مستوطنين', 'مستوطن', 'إسرائيليون', 'إسرائيليين', 'إسرائيلي',
        'جنود الاحتلال', 'قوات إسرائيلية', 'قوات خاصة', 'قوات عسكرية', 'موقع عسكري', 'مواقع عسكرية',
        'مقتل ضابط', 'إصابة ضابط', 'ضابط إسرائيلي', 'ضباط إسرائيليين',
    ];

    // Civilian/humanitarian focus keywords
    private readonly civilianKeywords = [
        'مدني', 'مدنيين', 'مستشفى', 'مشفى', 'إغاثة', 'مساعدات', 'نزوح', 'لاجئ', 'عائلة', 'أطفال', 'نساء',
        'مأوى', 'مخيم', 'جرحى', 'مصاب', 'شهيد', 'مقتل مدني', 'توزيع مساعدات', 'مياه', 'طعام', 'دواء', 'عيادة', 'إسعاف'
    ];

    private shouldInclude(content: string): boolean {
        const isMilitary = this.excludeKeywords.some(keyword => content.includes(keyword));
        const isCivilian = this.civilianKeywords.some(keyword => content.includes(keyword));
        // Allow if civilian/humanitarian, even if military terms are present
        return isCivilian || !isMilitary;
    }

    // Expanded location mapping for Gaza
    private readonly locationMap: Record<string, { 
        coordinates: [number, number];
        type: ReliefLocationType;
        defaultNeeds: string[];
    }> = {
        'غزة': { coordinates: [31.5017, 34.4668], type: ReliefLocationType.MEDICAL, defaultNeeds: ['Medical Supplies', 'Food', 'Water', 'Shelter'] },
        'خان يونس': { coordinates: [31.3452, 34.3037], type: ReliefLocationType.MEDICAL, defaultNeeds: ['Medical Supplies', 'Food', 'Water'] },
        'رفح': { coordinates: [31.2968, 34.2435], type: ReliefLocationType.SUPPLIES, defaultNeeds: ['Food', 'Water', 'Shelter'] },
        'دير البلح': { coordinates: [31.4170, 34.3500], type: ReliefLocationType.MEDICAL, defaultNeeds: ['Medical Supplies', 'Food'] },
        'جباليا': { coordinates: [31.5367, 34.4983], type: ReliefLocationType.SHELTER, defaultNeeds: ['Shelter', 'Food', 'Water', 'Blankets'] },
        'بيت حانون': { coordinates: [31.5522, 34.5361], type: ReliefLocationType.SHELTER, defaultNeeds: ['Shelter', 'Food', 'Water'] },
        'النصيرات': { coordinates: [31.4492, 34.3922], type: ReliefLocationType.SHELTER, defaultNeeds: ['Shelter', 'Food', 'Water'] },
        'مستشفى الشفاء': { coordinates: [31.5231, 34.4667], type: ReliefLocationType.MEDICAL, defaultNeeds: ['Medical Supplies', 'Staff', 'Equipment'] },
        'مستشفى الأوروبي': { coordinates: [31.3450, 34.3030], type: ReliefLocationType.MEDICAL, defaultNeeds: ['Medical Supplies', 'Staff', 'Equipment'] },
        'مستشفى ناصر': { coordinates: [31.3400, 34.3030], type: ReliefLocationType.MEDICAL, defaultNeeds: ['Medical Supplies', 'Staff', 'Equipment'] },
        'مخيم': { coordinates: [31.5010, 34.4660], type: ReliefLocationType.SHELTER, defaultNeeds: ['Shelter', 'Food', 'Water', 'Blankets'] },
        'مأوى': { coordinates: [31.5010, 34.4660], type: ReliefLocationType.SHELTER, defaultNeeds: ['Shelter', 'Food', 'Water'] },
        'الحدود': { coordinates: [31.5010, 34.4660], type: ReliefLocationType.OTHER, defaultNeeds: ['Security', 'Emergency Response'] },
        'الحدود مع مصر': { coordinates: [31.5010, 34.4660], type: ReliefLocationType.OTHER, defaultNeeds: ['Security', 'Emergency Response'] },
        'الحدود مع إسرائيل': { coordinates: [31.5010, 34.4660], type: ReliefLocationType.OTHER, defaultNeeds: ['Security', 'Emergency Response'] },
        'الحدود مع البحر': { coordinates: [31.5010, 34.4660], type: ReliefLocationType.OTHER, defaultNeeds: ['Security', 'Emergency Response'] },
        'الحدود البحرية': { coordinates: [31.5010, 34.4660], type: ReliefLocationType.OTHER, defaultNeeds: ['Security', 'Emergency Response'] },
        'الحدود البرية': { coordinates: [31.5010, 34.4660], type: ReliefLocationType.OTHER, defaultNeeds: ['Security', 'Emergency Response'] },
        'الحدود البرية مع مصر': { coordinates: [31.5010, 34.4660], type: ReliefLocationType.OTHER, defaultNeeds: ['Security', 'Emergency Response'] },
        'الحدود البرية مع إسرائيل': { coordinates: [31.5010, 34.4660], type: ReliefLocationType.OTHER, defaultNeeds: ['Security', 'Emergency Response'] },
        'الحدود البرية مع البحر': { coordinates: [31.5010, 34.4660], type: ReliefLocationType.OTHER, defaultNeeds: ['Security', 'Emergency Response'] },
    };

    // Enhanced keyword mapping for better context understanding
    private readonly contextKeywords = {
        medical: {
            keywords: ['إصابة', 'جرحى', 'مستشفى', 'طبي', 'صحي', 'علاج', 'جرح', 'دم'],
            needs: ['Medical Supplies', 'Staff', 'Equipment', 'Blood', 'Medicines']
        },
        military: {
            keywords: ['قصف', 'اشتباك', 'كمين', 'جندي', 'عسكري', 'هجوم', 'قصف'],
            needs: ['Security', 'Emergency Response', 'Evacuation Support']
        },
        humanitarian: {
            keywords: ['مساعدات', 'إغاثة', 'إجلاء', 'مأوى', 'مخيم', 'طعام', 'ماء', 'دواء'],
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
            keywords: ['قتل', 'استشهاد', 'قصف', 'اشتباك', 'كمين', 'دمار', 'تدمير'],
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
    
        const allUpdates = this.cachedData?.blogs || [];
        const filtered = allUpdates.filter(update => this.shouldInclude(update.content));
        console.log('All updates:', allUpdates.map(u => u.content));
        console.log('Filtered updates:', filtered.map(u => u.content));
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

        // Try to match the most specific location name
        for (const [loc, info] of Object.entries(this.locationMap)) {
            if (content.includes(loc)) {
                location = info.coordinates;
                type = info.type;
                needs = [...info.defaultNeeds];
                placeName = loc;
                break;
            }
        }

        // Fallback: if about Gaza and civilian, but no specific location, use Gaza center
        if (!location && content.includes('غزة') && this.civilianKeywords.some(keyword => content.includes(keyword))) {
            location = [31.5017, 34.4668];
            type = ReliefLocationType.OTHER;
            needs = ['Medical Supplies', 'Food', 'Water', 'Shelter'];
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

        // Check for severity
        for (const [sev, info] of Object.entries(this.severityKeywords)) {
            if (info.keywords.some(keyword => content.includes(keyword))) {
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