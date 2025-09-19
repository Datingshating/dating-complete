import { z } from 'zod';
import { apiClient } from './apiClient';
import { User, Profile, ApiResponse } from './types';

// Zod schemas for response validation
const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  gender: z.enum(['male', 'female', 'trans']),
  date_of_birth: z.string(),
  whatsapp_number: z.string(),
  instagram_handle: z.string().optional(),
  location: z.string().optional(),
  custom_location: z.string().nullable().optional(),
  status: z.enum(['pending', 'approved', 'rejected']),
  login_id: z.string().optional(),
  is_admin: z.boolean(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  // Profile fields (flattened from /api/me response)
  bio: z.string().optional(),
  relationship_status: z.string().optional(),
  partner_expectations: z.string().optional(),
  interest_1: z.string().optional(),
  interest_2: z.string().optional(),
  interest_3: z.string().optional(),
  interest_4: z.string().optional(),
  interest_5: z.string().optional(),
  interest_6: z.string().optional(),
});

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

// Update profile request type
export interface UpdateProfileRequest {
  userId: string;
  bio?: string;
  relationshipStatus?: string;
  partnerExpectations?: string;
  interest1?: string;
  interest2?: string;
  interest3?: string;
  interest4?: string;
  interest5?: string;
  interest6?: string;
}

export const profilesApi = {
  // Get current user profile - matching website endpoint
  getMe: async (): Promise<User> => {
    try {
      const response = await apiClient.get('/api/me');
      const validatedData = UserSchema.parse(response.data);
      return validatedData;
    } catch (error: any) {
      console.warn('GetMe response validation failed:', error);
      return error.response?.data || { error: 'Validation failed' };
    }
  },

  // Update current user profile - matching website endpoint
  updateProfile: async (data: UpdateProfileRequest): Promise<ApiResponse> => {
    try {
      const response = await apiClient.put('/api/me', data);
      const validatedData = ApiResponseSchema.parse(response.data);
      return validatedData;
    } catch (error: any) {
      console.warn('UpdateProfile response validation failed:', error);
      return error.response?.data || { error: 'Validation failed' };
    }
  },

  // Get specific user profile - matching website endpoint
  getProfile: async (userId: string): Promise<Profile> => {
    try {
      const response = await apiClient.get(`/api/profile/${userId}`);
      const validatedData = ProfileSchema.parse(response.data);
      return validatedData;
    } catch (error: any) {
      console.warn('GetProfile response validation failed:', error);
      return error.response?.data || { error: 'Validation failed' };
    }
  },
};
