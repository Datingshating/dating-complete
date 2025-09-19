import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Configuration - matching website's VITE_API_URL
// For local development, use your local IP address instead of localhost
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.15:8080';

// Create axios instance with default config matching website behavior
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token from AsyncStorage (mirroring website's localStorage behavior)
apiClient.interceptors.request.use(
  async (config: AxiosRequestConfig) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('Failed to get auth token from AsyncStorage:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling (mirroring website behavior)
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - clear storage and redirect to login (mirroring website behavior)
      try {
        await AsyncStorage.multiRemove([
          'authToken',
          'userId', 
          'userName',
          'isAdmin'
        ]);
        // TODO: Implement navigation to login screen
        console.log('User session expired, redirecting to login');
      } catch (storageError) {
        console.warn('Failed to clear storage on 401:', storageError);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
