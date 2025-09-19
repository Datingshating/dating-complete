import { z } from 'zod';
import { apiClient } from './apiClient';
import { ConnectionRequest, SendRequestData, ApiResponse } from './types';

// Zod schemas for response validation
const ConnectionRequestSchema = z.object({
  id: z.string(),
  from_user_id: z.string().optional(), // Optional for outgoing requests
  to_user_id: z.string().optional(),   // Optional for incoming requests
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
  errorCode: z.string().optional(),
  total: z.number().optional(),
});

export const requestsApi = {
  // Get incoming connection requests - matching website endpoint
  getIncomingRequests: async (userId: string): Promise<ConnectionRequest[]> => {
    try {
      const response = await apiClient.get(`/api/requests/incoming?userId=${userId}`);
      const validatedData = z.array(ConnectionRequestSchema).parse(response.data);
      return validatedData;
    } catch (error) {
      console.warn('GetIncomingRequests response validation failed:', error);
      return [];
    }
  },

  // Get outgoing connection requests - new endpoint for mobile
  getOutgoingRequests: async (userId: string): Promise<ConnectionRequest[]> => {
    try {
      const response = await apiClient.get(`/api/requests/outgoing?userId=${userId}`);
      const validatedData = z.array(ConnectionRequestSchema).parse(response.data);
      return validatedData;
    } catch (error) {
      console.warn('GetOutgoingRequests response validation failed:', error);
      return [];
    }
  },

  // Send connection request - matching website endpoint and payload
  sendRequest: async (data: SendRequestData): Promise<ApiResponse> => {
    try {
      const response = await apiClient.post('/api/requests', data);
      const validatedData = ApiResponseSchema.parse(response.data);
      return validatedData;
    } catch (error) {
      console.warn('SendRequest response validation failed:', error);
      return { error: 'Validation failed' };
    }
  },

  // Accept connection request - matching website endpoint
  acceptRequest: async (requestId: string): Promise<ApiResponse> => {
    try {
      const response = await apiClient.post(`/api/requests/${requestId}/accept`);
      const validatedData = ApiResponseSchema.parse(response.data);
      return validatedData;
    } catch (error) {
      console.warn('AcceptRequest response validation failed:', error);
      return { error: 'Validation failed' };
    }
  },

  // Decline connection request - new endpoint for mobile
  declineRequest: async (requestId: string): Promise<ApiResponse> => {
    try {
      const response = await apiClient.post(`/api/requests/${requestId}/decline`);
      const validatedData = ApiResponseSchema.parse(response.data);
      return validatedData;
    } catch (error) {
      console.warn('DeclineRequest response validation failed:', error);
      return { error: 'Validation failed' };
    }
  },

  // Withdraw connection request - new endpoint for mobile
  withdrawRequest: async (requestId: string): Promise<ApiResponse> => {
    try {
      const response = await apiClient.delete(`/api/requests/${requestId}`);
      const validatedData = ApiResponseSchema.parse(response.data);
      return validatedData;
    } catch (error) {
      console.warn('WithdrawRequest response validation failed:', error);
      return { error: 'Validation failed' };
    }
  },
};
