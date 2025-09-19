import { z } from 'zod';
import { apiClient } from './config';
import { MatchItem, ApiResponse } from './types';

// Zod schemas for response validation
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

const ApiResponseSchema = z.object({
  ok: z.boolean().optional(),
  data: z.any().optional(),
  error: z.string().optional(),
  message: z.string().optional(),
});

export const matchesApi = {
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
};
