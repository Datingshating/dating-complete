// Performance testing utilities for large lists

export interface TestItem {
  id: string;
  name: string;
  age: number;
  bio: string;
  created_at: string;
  other_user_id: string;
}

// Generate test data for performance testing
export const generateTestData = (count: number): TestItem[] => {
  const names = [
    'Alex', 'Jordan', 'Taylor', 'Casey', 'Morgan', 'Riley', 'Avery', 'Quinn',
    'Blake', 'Cameron', 'Drew', 'Emery', 'Finley', 'Hayden', 'Jamie', 'Kendall',
    'Logan', 'Parker', 'Peyton', 'Reese', 'Sage', 'Skyler', 'Sydney', 'Tatum'
  ];

  const bios = [
    'Love hiking and outdoor adventures!',
    'Coffee enthusiast and book lover.',
    'Traveling the world one city at a time.',
    'Fitness fanatic and healthy living advocate.',
    'Artist and creative soul.',
    'Tech geek and gaming enthusiast.',
    'Foodie who loves trying new restaurants.',
    'Music lover and concert goer.',
    'Pet parent to the cutest dog ever.',
    'Yoga instructor and mindfulness practitioner.',
    'Photographer capturing life\'s moments.',
    'Chef who loves cooking for others.',
    'Dancer and fitness instructor.',
    'Writer and storyteller.',
    'Environmental activist and nature lover.',
    'Entrepreneur building the next big thing.',
  ];

  return Array.from({ length: count }, (_, index) => ({
    id: `test-${index}`,
    name: names[index % names.length] + ` ${index}`,
    age: 22 + (index % 15),
    bio: bios[index % bios.length],
    created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    other_user_id: `user-${index}`,
  }));
};

// Performance monitoring utilities
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startTiming(label: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      if (!this.metrics.has(label)) {
        this.metrics.set(label, []);
      }
      
      this.metrics.get(label)!.push(duration);
      
      if (__DEV__) {
        console.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
      }
    };
  }

  getAverageTime(label: string): number {
    const times = this.metrics.get(label);
    if (!times || times.length === 0) return 0;
    
    return times.reduce((sum, time) => sum + time, 0) / times.length;
  }

  getMetrics(): Record<string, { average: number; count: number; min: number; max: number }> {
    const result: Record<string, { average: number; count: number; min: number; max: number }> = {};
    
    for (const [label, times] of this.metrics.entries()) {
      if (times.length > 0) {
        result[label] = {
          average: this.getAverageTime(label),
          count: times.length,
          min: Math.min(...times),
          max: Math.max(...times),
        };
      }
    }
    
    return result;
  }

  clearMetrics(): void {
    this.metrics.clear();
  }

  logMetrics(): void {
    if (__DEV__) {
      console.log('📊 Performance Metrics:', this.getMetrics());
    }
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();

// FlatList performance optimization recommendations
export const getFlatListOptimizationTips = () => [
  'Use getItemLayout for fixed height items',
  'Set windowSize to 10-15 for better memory usage',
  'Use initialNumToRender to control initial render count',
  'Set maxToRenderPerBatch to 5-10 items',
  'Use removeClippedSubviews for better memory management',
  'Implement proper keyExtractor for stable keys',
  'Use memo() for renderItem components',
  'Set updateCellsBatchingPeriod to 50ms',
  'Use onEndReachedThreshold of 0.5',
  'Avoid complex calculations in renderItem',
];

// Memory usage monitoring
export const logMemoryUsage = (label: string) => {
  if (__DEV__ && (global as any).performance?.memory) {
    const memory = (global as any).performance.memory;
    console.log(`🧠 Memory Usage (${label}):`, {
      used: `${Math.round(memory.usedJSHeapSize / 1024 / 1024)}MB`,
      total: `${Math.round(memory.totalJSHeapSize / 1024 / 1024)}MB`,
      limit: `${Math.round(memory.jsHeapSizeLimit / 1024 / 1024)}MB`,
    });
  }
};
