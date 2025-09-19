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
  id: z.string().optional(),
  name: z.string().optional(),
  gender: z.string().optional(),
  date_of_birth: z.string().optional(),
  whatsapp_number: z.string().optional(),
  instagram_handle: z.string().optional(),
  location: z.string().optional(),
  custom_location: z.string().nullable().optional(),
  status: z.string().optional(),
  login_id: z.string().optional(),
  is_admin: z.boolean().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
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
    let response;
    try {
      response = await apiClient.post('/api/login', {
        loginId,
        password,
      });
      const validatedData = LoginResponseSchema.parse(response.data);
      return validatedData;
    } catch (error) {
      console.warn('Login response validation failed:', error);
      // Return a proper LoginResponse object with ok: false
      return {
        ok: false,
        userId: '',
        name: '',
        is_admin: false,
        token: '',
        error: response?.data?.error || 'Login failed'
      };
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
    let response;
    try {
      response = await apiClient.get('/api/me');
      const validatedData = UserSchema.parse(response.data);
      return validatedData;
    } catch (error) {
      console.warn('GetMe response validation failed:', error);
      throw error; // Re-throw the error so AuthGate can handle it properly
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
