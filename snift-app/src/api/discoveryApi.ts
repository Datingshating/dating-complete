import { z } from 'zod';
import { apiClient } from './apiClient';
import { Profile, ApiResponse } from './types';

// Zod schemas for response validation
const ProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  gender: z.string(),
  age: z.number().optional(),
  date_of_birth: z.string().optional(),
  whatsapp_number: z.string().optional(),
  instagram_handle: z.string().optional(),
  location: z.string().optional(),
  custom_location: z.string().nullable().optional(),
  bio: z.string(),
  relationship_status: z.string(),
  partner_expectations: z.string().optional(),
  interest_1: z.string(),
  interest_2: z.string(),
  interest_3: z.string(),
  interest_4: z.string(),
  interest_5: z.string(),
  interest_6: z.string(),
  is_visible: z.boolean().optional(),
  profile_created_at: z.string().optional(),
  profile_updated_at: z.string().optional(),
});

const ApiResponseSchema = z.object({
  ok: z.boolean().optional(),
  data: z.any().optional(),
  error: z.string().optional(),
  message: z.string().optional(),
});

// Filter types for discovery
export interface DiscoveryFilters {
  ageRange?: [number, number];
  gender?: string;
  relationshipStatus?: string;
  location?: string;
}

export interface DiscoveryParams {
  userId: string;
  page?: number;
  limit?: number;
  filters?: DiscoveryFilters;
}

export interface DiscoveryResponse {
  profiles: Profile[];
  hasMore: boolean;
  total: number;
  page: number;
}

export const discoveryApi = {
  // Get discovery feed with pagination and filters - matching website endpoint
  getFeed: async (params: DiscoveryParams): Promise<DiscoveryResponse> => {
    try {
      const queryParams = new URLSearchParams({
        userId: params.userId,
        page: (params.page || 1).toString(),
        limit: (params.limit || 20).toString(),
      });

      // Add filters if provided
      if (params.filters) {
        if (params.filters.ageRange) {
          queryParams.append('minAge', params.filters.ageRange[0].toString());
          queryParams.append('maxAge', params.filters.ageRange[1].toString());
        }
        if (params.filters.gender) {
          queryParams.append('gender', params.filters.gender);
        }
        if (params.filters.relationshipStatus) {
          queryParams.append('relationshipStatus', params.filters.relationshipStatus);
        }
        if (params.filters.location) {
          queryParams.append('location', params.filters.location);
        }
      }

      const response = await apiClient.get(`/api/feed?${queryParams.toString()}`);
      
      // Handle both array response (legacy) and paginated response
      if (Array.isArray(response.data)) {
        return {
          profiles: z.array(ProfileSchema).parse(response.data),
          hasMore: false,
          total: response.data.length,
          page: 1,
        };
      } else {
        return {
          profiles: z.array(ProfileSchema).parse(response.data.profiles || []),
          hasMore: response.data.hasMore || false,
          total: response.data.total || 0,
          page: response.data.page || 1,
        };
      }
    } catch (error) {
      console.warn('GetFeed response validation failed:', error);
      return {
        profiles: [],
        hasMore: false,
        total: 0,
        page: 1,
      };
    }
  },

  // Get specific user profile - matching website endpoint
  getProfile: async (userId: string): Promise<Profile> => {
    try {
      const response = await apiClient.get(`/api/profile/${userId}`);
      const validatedData = ProfileSchema.parse(response.data);
      return validatedData;
    } catch (error) {
      console.warn('GetProfile response validation failed:', error);
      return { 
        id: '',
        name: '',
        gender: '',
        bio: '',
        relationship_status: '',
        interest_1: '',
        interest_2: '',
        interest_3: '',
        interest_4: '',
        interest_5: '',
        interest_6: '',
        error: 'Validation failed' 
      } as Profile;
    }
  },

  // Send like/request to a profile
  sendRequest: async (fromUserId: string, toUserId: string, message: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await apiClient.post('/api/requests', {
        fromUserId,
        toUserId,
        message,
      });
      return { success: true, message: response.data.message };
    } catch (error) {
      console.error('Send request failed:', error);
      return { success: false, message: 'Failed to send request' };
    }
  },
};
