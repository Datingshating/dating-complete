import { z } from 'zod';
import { apiClient } from './apiClient';
import { AdminUser, ApiResponse, AdminApproveData } from './types';

// Zod schemas for response validation
const AdminUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  gender: z.string(),
  date_of_birth: z.string(),
  whatsapp_number: z.string(),
  instagram_handle: z.string().optional(),
  bio: z.string(),
  relationship_status: z.string(),
  interest_1: z.string(),
  interest_1_desc: z.string().optional(),
  interest_2: z.string(),
  interest_2_desc: z.string().optional(),
  interest_3: z.string(),
  interest_3_desc: z.string().optional(),
});

const ApiResponseSchema = z.object({
  ok: z.boolean().optional(),
  data: z.any().optional(),
  error: z.string().optional(),
  message: z.string().optional(),
});

export const adminApi = {
  // Get pending registrations - matching website endpoint
  getPendingRegistrations: async (): Promise<AdminUser[]> => {
    try {
      const response = await apiClient.get('/api/admin/pending');
      const validatedData = z.array(AdminUserSchema).parse(response.data);
      return validatedData;
    } catch (error) {
      console.warn('GetPendingRegistrations response validation failed:', error);
      return [];
    }
  },

  // Get all users - matching website endpoint
  getAllUsers: async (): Promise<AdminUser[]> => {
    try {
      const response = await apiClient.get('/api/admin/users');
      const validatedData = z.array(AdminUserSchema).parse(response.data);
      return validatedData;
    } catch (error) {
      console.warn('GetAllUsers response validation failed:', error);
      return [];
    }
  },

  // Approve user - matching website endpoint
  approveUser: async (data: AdminApproveData): Promise<ApiResponse> => {
    try {
      const response = await apiClient.post('/api/admin/approve', data);
      const validatedData = ApiResponseSchema.parse(response.data);
      return validatedData;
    } catch (error) {
      console.warn('ApproveUser response validation failed:', error);
      return { error: 'Validation failed' };
    }
  },

  // Note: Reject functionality not implemented in backend yet
  // rejectUser: async (data: AdminApproveData): Promise<ApiResponse> => { ... }
};
