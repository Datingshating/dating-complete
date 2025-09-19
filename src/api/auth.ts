import { z } from 'zod';
import { apiClient } from './apiClient';
import { 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest, 
  User, 
  ApiResponse,
  ChangeCredentialsData 
} from './types';

// Zod schemas for response validation
const LoginResponseSchema = z.object({
  ok: z.boolean(),
  userId: z.string(),
  name: z.string(),
  is_admin: z.boolean(),
  token: z.string(),
});

const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  gender: z.string(),
  date_of_birth: z.string(),
  whatsapp_number: z.string(),
  instagram_handle: z.string().optional(),
  location: z.string().optional(),
  custom_location: z.string().optional(),
  status: z.string(),
  login_id: z.string().optional(),
  is_admin: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

const ApiResponseSchema = z.object({
  ok: z.boolean().optional(),
  data: z.any().optional(),
  error: z.string().optional(),
  message: z.string().optional(),
});

export const authApi = {
  // Register new user - matching website endpoint
  register: async (data: RegisterRequest): Promise<ApiResponse> => {
    try {
      const response = await apiClient.post('/api/register', data);
      const validatedData = ApiResponseSchema.parse(response.data);
      return validatedData;
    } catch (error) {
      console.warn('Register response validation failed:', error);
      return response?.data || { error: 'Validation failed' };
    }
  },

  // Login user - matching website endpoint and payload
  login: async (loginId: string, password: string): Promise<LoginResponse> => {
    try {
      const response = await apiClient.post('/api/login', {
        loginId,
        password,
      });
      const validatedData = LoginResponseSchema.parse(response.data);
      return validatedData;
    } catch (error) {
      console.warn('Login response validation failed:', error);
      return response?.data || { error: 'Validation failed' };
    }
  },

  // Logout user - matching website endpoint
  logout: async (): Promise<ApiResponse> => {
    try {
      const response = await apiClient.post('/api/logout');
      const validatedData = ApiResponseSchema.parse(response.data);
      return validatedData;
    } catch (error) {
      console.warn('Logout response validation failed:', error);
      return response?.data || { error: 'Validation failed' };
    }
  },

  // Get current user profile - matching website endpoint
  getMe: async (): Promise<User> => {
    try {
      const response = await apiClient.get('/api/me');
      const validatedData = UserSchema.parse(response.data);
      return validatedData;
    } catch (error) {
      console.warn('GetMe response validation failed:', error);
      return response?.data || { error: 'Validation failed' };
    }
  },

  // Change credentials - matching website endpoint
  changeCredentials: async (data: ChangeCredentialsData): Promise<ApiResponse> => {
    try {
      const response = await apiClient.post('/api/privacy/change-credentials', data);
      const validatedData = ApiResponseSchema.parse(response.data);
      return validatedData;
    } catch (error) {
      console.warn('ChangeCredentials response validation failed:', error);
      return response?.data || { error: 'Validation failed' };
    }
  },
};
