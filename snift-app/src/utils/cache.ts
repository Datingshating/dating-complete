import AsyncStorage from '@react-native-async-storage/async-storage';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  key: string;
}

const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

export class CacheManager {
  private static instance: CacheManager;
  private cache: Map<string, CacheItem<any>> = new Map();

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  // Set cache item
  async set<T>(key: string, data: T, ttl: number = DEFAULT_TTL): Promise<void> {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + ttl,
    };

    // Store in memory cache
    this.cache.set(key, item);

    // Store in AsyncStorage for persistence
    try {
      await AsyncStorage.setItem(`cache_${key}`, JSON.stringify(item));
    } catch (error) {
      console.warn(`Failed to cache ${key} to AsyncStorage:`, error);
    }
  }

  // Get cache item
  async get<T>(key: string): Promise<T | null> {
    // Check memory cache first
    const memoryItem = this.cache.get(key);
    if (memoryItem && this.isValid(memoryItem)) {
      return memoryItem.data;
    }

    // Check AsyncStorage
    try {
      const storedItem = await AsyncStorage.getItem(`cache_${key}`);
      if (storedItem) {
        const item: CacheItem<T> = JSON.parse(storedItem);
        if (this.isValid(item)) {
          // Update memory cache
          this.cache.set(key, item);
          return item.data;
        } else {
          // Remove expired item
          await this.remove(key);
        }
      }
    } catch (error) {
      console.warn(`Failed to get ${key} from AsyncStorage:`, error);
    }

    return null;
  }

  // Remove cache item
  async remove(key: string): Promise<void> {
    this.cache.delete(key);
    try {
      await AsyncStorage.removeItem(`cache_${key}`);
    } catch (error) {
      console.warn(`Failed to remove ${key} from AsyncStorage:`, error);
    }
  }

  // Clear all cache
  async clear(): Promise<void> {
    this.cache.clear();
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('cache_'));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.warn('Failed to clear cache from AsyncStorage:', error);
    }
  }

  // Check if cache item is valid
  private isValid(item: CacheItem<any>): boolean {
    return Date.now() < item.expiry;
  }

  // Clean expired items
  async cleanExpired(): Promise<void> {
    const now = Date.now();
    
    // Clean memory cache
    for (const [key, item] of this.cache.entries()) {
      if (now >= item.expiry) {
        this.cache.delete(key);
      }
    }

    // Clean AsyncStorage
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('cache_'));
      
      for (const key of cacheKeys) {
        const storedItem = await AsyncStorage.getItem(key);
        if (storedItem) {
          const item: CacheItem<any> = JSON.parse(storedItem);
          if (now >= item.expiry) {
            await AsyncStorage.removeItem(key);
          }
        }
      }
    } catch (error) {
      console.warn('Failed to clean expired cache:', error);
    }
  }
}

// Convenience functions
export const cacheManager = CacheManager.getInstance();

// Cache decorator for API functions
export function withCache<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  options: CacheOptions
) {
  return async (...args: T): Promise<R> => {
    const cacheKey = `${options.key}_${JSON.stringify(args)}`;
    
    // Try to get from cache first
    const cached = await cacheManager.get<R>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    // Execute function and cache result
    const result = await fn(...args);
    await cacheManager.set(cacheKey, result, options.ttl);
    
    return result;
  };
}

// Specific cache keys
export const CACHE_KEYS = {
  USER_PROFILE: 'user_profile',
  MATCHES: 'matches',
  REQUESTS: 'requests',
  CHAT_MESSAGES: 'chat_messages',
  DISCOVERY_FEED: 'discovery_feed',
  USER_PACK: 'user_pack',
} as const;
