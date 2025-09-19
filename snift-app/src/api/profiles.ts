import { z } from 'zod';
import { apiClient } from './apiClient';
import { Profile, MatchItem, ConnectionRequest, ApiResponse } from './types';

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

const MatchItemSchema = z.object({
  id: z.string(),
  other_user_id: z.string(),
  name: z.string(),
  bio: z.string(),
  relationship_status: z.string(),
  partner_expectations: z.string().optional(),
  interest_1: z.string(),
  interest_2: z.string(),
  interest_3: z.string(),
  interest_4: z.string(),
  interest_5: z.string(),
  interest_6: z.string(),
  instagram_handle: z.string().optional(),
  location: z.string().optional(),
  custom_location: z.string().nullable().optional(),
  age: z.number().optional(),
});

const ConnectionRequestSchema = z.object({
  id: z.string(),
  from_user_id: z.string(),
  message: z.string(),
  created_at: z.string(),
  bio: z.string(),
  name: z.string().optional(),
  location: z.string().optional(),
  custom_location: z.string().nullable().optional(),
});

const ApiResponseSchema = z.object({
  ok: z.boolean().optional(),
  data: z.any().optional(),
  error: z.string().optional(),
  message: z.string().optional(),
});

export const profileApi = {
  // Get discovery feed - matching website endpoint
  getFeed: async (userId: string): Promise<Profile[]> => {
    let response;
    try {
      response = await apiClient.get(`/api/feed?userId=${userId}`);
      const validatedData = z.array(ProfileSchema).parse(response.data);
      return validatedData;
    } catch (error) {
      console.warn('GetFeed response validation failed:', error);
      return Array.isArray(response?.data) ? response.data : [];
    }
  },

  // Get specific user profile - matching website endpoint
  getProfile: async (userId: string): Promise<Profile> => {
    let response;
    try {
      response = await apiClient.get(`/api/profile/${userId}`);
      const validatedData = ProfileSchema.parse(response.data);
      return validatedData;
    } catch (error) {
      console.warn('GetProfile response validation failed:', error);
      return response?.data || { error: 'Validation failed' };
    }
  },

  // Get user's matches - matching website endpoint
  getMatches: async (userId: string): Promise<MatchItem[]> => {
    let response;
    try {
      response = await apiClient.get(`/api/matches?userId=${userId}`);
      const validatedData = z.array(MatchItemSchema).parse(response.data);
      return validatedData;
    } catch (error) {
      console.warn('GetMatches response validation failed:', error);
      return Array.isArray(response?.data) ? response.data : [];
    }
  },

  // Get incoming connection requests - matching website endpoint
  getIncomingRequests: async (userId: string): Promise<ConnectionRequest[]> => {
    let response;
    try {
      response = await apiClient.get(`/api/requests/incoming?userId=${userId}`);
      const validatedData = z.array(ConnectionRequestSchema).parse(response.data);
      return validatedData;
    } catch (error) {
      console.warn('GetIncomingRequests response validation failed:', error);
      return Array.isArray(response?.data) ? response.data : [];
    }
  },
};
