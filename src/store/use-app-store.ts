import { create } from 'zustand';
import { ReliefLocation, ReliefLocationType } from '@/types/map';

interface AppState {
  // Map State
  locations: ReliefLocation[];
  selectedLocation: ReliefLocation | null;
  activeFilters: ReliefLocationType[];
  searchQuery: string;
  
  // Timeline State
  currentDate: Date;
  isTimelinePlaying: boolean;
  playbackSpeed: number;
  
  // Statistics State
  timeRange: '24h' | 'week' | 'month';
  aidDeliveryData: {
    date: string;
    trucks: number;
    delivered: number;
    blocked: number;
  }[];
  criticalNeeds: {
    category: string;
    current: number;
    required: number;
    unit: string;
    urgency: 'critical' | 'high' | 'medium';
  }[];
  
  // Actions
  setSelectedLocation: (location: ReliefLocation | null) => void;
  setActiveFilters: (filters: ReliefLocationType[]) => void;
  setSearchQuery: (query: string) => void;
  setCurrentDate: (date: Date) => void;
  setTimelinePlaying: (isPlaying: boolean) => void;
  setPlaybackSpeed: (speed: number) => void;
  setTimeRange: (range: '24h' | 'week' | 'month') => void;
  updateAidData: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  locations: [],
  selectedLocation: null,
  activeFilters: Object.values(ReliefLocationType),
  searchQuery: '',
  currentDate: new Date(),
  isTimelinePlaying: false,
  playbackSpeed: 1,
  timeRange: 'week',
  
  aidDeliveryData: [], // Will be populated by API
  criticalNeeds: [], // Will be populated by API
  
  // Actions
  setSelectedLocation: (location) => set({ selectedLocation: location }),
  
  setActiveFilters: (filters) => set({ activeFilters: filters }),
  
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  setCurrentDate: (date) => {
    set({ currentDate: date });
    get().updateAidData();
  },
  
  setTimelinePlaying: (isPlaying) => set({ isTimelinePlaying: isPlaying }),
  
  setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),
  
  setTimeRange: (range) => {
    set({ timeRange: range });
    get().updateAidData();
  },
  
  updateAidData: async () => {
    try {
      // This would be an API call in production
      const { timeRange, currentDate } = get();
      
      // Simulate API call with mock data
      const mockData = generateMockData(timeRange, currentDate);
      set({
        aidDeliveryData: mockData.deliveryData,
        criticalNeeds: mockData.criticalNeeds,
      });
    } catch (error) {
      console.error('Error updating aid data:', error);
    }
  },
}));

// Helper function to generate mock data
function generateMockData(timeRange: '24h' | 'week' | 'month', currentDate: Date) {
  // Generate realistic mock data based on timeRange and currentDate
  const deliveryData = [];
  const daysToGenerate = timeRange === '24h' ? 24 : timeRange === 'week' ? 7 : 30;
  
  for (let i = 0; i < daysToGenerate; i++) {
    const date = new Date(currentDate);
    date.setDate(date.getDate() - i);
    
    deliveryData.unshift({
      date: date.toLocaleDateString(),
      trucks: Math.floor(Math.random() * 40) + 40,
      delivered: Math.floor(Math.random() * 30) + 30,
      blocked: Math.floor(Math.random() * 15) + 5,
    });
  }
  
  return {
    deliveryData,
    criticalNeeds: [
      {
        category: "Medical Supplies",
        current: Math.floor(Math.random() * 50) + 20,
        required: 100,
        unit: "tons",
        urgency: "critical" as const,
      },
      {
        category: "Food Aid",
        current: Math.floor(Math.random() * 200) + 100,
        required: 400,
        unit: "trucks",
        urgency: "high" as const,
      },
      {
        category: "Clean Water",
        current: Math.floor(Math.random() * 40) + 10,
        required: 100,
        unit: "million liters",
        urgency: "critical" as const,
      },
      {
        category: "Shelter Capacity",
        current: Math.floor(Math.random() * 40) + 40,
        required: 100,
        unit: "thousand spaces",
        urgency: "medium" as const,
      },
    ],
  };
}