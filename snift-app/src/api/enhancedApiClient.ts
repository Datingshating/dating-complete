import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNetInfo } from '../hooks/useNetInfo';

// API Configuration
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.15:8080';

// Enhanced retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 30000, // 30 seconds
  retryCondition: (error: AxiosError) => {
    // Retry on network errors, timeouts, and 5xx server errors
    return (
      !error.response || // Network error
      error.code === 'ECONNABORTED' || // Timeout
      (error.response.status >= 500 && error.response.status < 600) // Server errors
    );
  },
};

// Calculate exponential backoff delay
const calculateDelay = (attempt: number): number => {
  const delay = RETRY_CONFIG.baseDelay * Math.pow(2, attempt);
  return Math.min(delay, RETRY_CONFIG.maxDelay);
};

// Enhanced API client with retry logic
export const enhancedApiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // Increased timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor with enhanced error handling
enhancedApiClient.interceptors.request.use(
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
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Enhanced response interceptor with retry logic
enhancedApiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retryCount?: number };
    
    // Initialize retry count if not exists
    if (!originalRequest._retryCount) {
      originalRequest._retryCount = 0;
    }

    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      try {
        await AsyncStorage.multiRemove([
          'authToken',
          'userId', 
          'userName',
          'isAdmin'
        ]);
        console.log('User session expired, redirecting to login');
        // TODO: Implement navigation to login screen
      } catch (storageError) {
        console.warn('Failed to clear storage on 401:', storageError);
      }
      return Promise.reject(error);
    }

    // Retry logic
    if (
      originalRequest._retryCount < RETRY_CONFIG.maxRetries &&
      RETRY_CONFIG.retryCondition(error)
    ) {
      originalRequest._retryCount++;
      const delay = calculateDelay(originalRequest._retryCount - 1);
      
      console.log(`Retrying request (attempt ${originalRequest._retryCount}/${RETRY_CONFIG.maxRetries}) after ${delay}ms delay`);
      
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(enhancedApiClient(originalRequest));
        }, delay);
      });
    }

    // Log error details for debugging
    console.error('API Error:', {
      url: originalRequest.url,
      method: originalRequest.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      retryCount: originalRequest._retryCount,
    });

    return Promise.reject(error);
  }
);

// Enhanced API call wrapper with additional error handling
export const apiCall = async <T>(
  apiFunction: () => Promise<T>,
  options: {
    showErrorAlert?: boolean;
    errorMessage?: string;
    onError?: (error: any) => void;
  } = {}
): Promise<T> => {
  const { showErrorAlert = true, errorMessage, onError } = options;

  try {
    return await apiFunction();
  } catch (error: any) {
    console.error('API call failed:', error);
    
    // Call custom error handler if provided
    if (onError) {
      onError(error);
      return Promise.reject(error);
    }

    // Show user-friendly error message
    if (showErrorAlert) {
      const message = errorMessage || getErrorMessage(error);
      // TODO: Replace with proper alert system
      console.error('User Error:', message);
    }

    return Promise.reject(error);
  }
};

// Get user-friendly error message
const getErrorMessage = (error: any): string => {
  if (error.response) {
    // Server responded with error status
    const status = error.response.status;
    const data = error.response.data;
    
    if (data?.message) {
      return data.message;
    }
    
    switch (status) {
      case 400:
        return 'Invalid request. Please check your input.';
      case 401:
        return 'Please log in again.';
      case 403:
        return 'You don\'t have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 429:
        return 'Too many requests. Please try again later.';
      case 500:
        return 'Server error. Please try again later.';
      case 502:
      case 503:
      case 504:
        return 'Service temporarily unavailable. Please try again later.';
      default:
        return 'Something went wrong. Please try again.';
    }
  } else if (error.request) {
    // Network error
    return 'Network error. Please check your internet connection.';
  } else {
    // Other error
    return 'An unexpected error occurred. Please try again.';
  }
};

export default enhancedApiClient;
