import { z } from 'zod';
import { apiClient } from './config';
import { Message, ChatSendData, ApiResponse } from './types';

// Zod schemas for response validation
const MessageSchema = z.object({
  id: z.string(),
  sender_id: z.string(),
  content: z.string(),
  created_at: z.string(),
});

const ApiResponseSchema = z.object({
  ok: z.boolean().optional(),
  data: z.any().optional(),
  error: z.string().optional(),
  message: z.string().optional(),
});

export const chatApi = {
  // Send message - matching website endpoint
  sendMessage: async (data: ChatSendData): Promise<ApiResponse> => {
    try {
      const response = await apiClient.post('/api/chat/send', data);
      const validatedData = ApiResponseSchema.parse(response.data);
      return validatedData;
    } catch (error) {
      console.warn('SendMessage response validation failed:', error);
      return response?.data || { error: 'Validation failed' };
    }
  },

  // Get chat history by user IDs - matching website endpoint
  getChatHistory: async (userA: string, userB: string): Promise<Message[]> => {
    try {
      const response = await apiClient.get(`/api/chat/history?userA=${userA}&userB=${userB}`);
      const validatedData = z.array(MessageSchema).parse(response.data);
      return validatedData;
    } catch (error) {
      console.warn('GetChatHistory response validation failed:', error);
      return Array.isArray(response?.data) ? response.data : [];
    }
  },

  // Get chat history by conversation ID - matching website endpoint
  getConversationHistory: async (conversationId: string, userId: string): Promise<Message[]> => {
    try {
      const response = await apiClient.get(`/api/chat/history/${conversationId}?userId=${userId}`);
      const validatedData = z.array(MessageSchema).parse(response.data);
      return validatedData;
    } catch (error) {
      console.warn('GetConversationHistory response validation failed:', error);
      return Array.isArray(response?.data) ? response.data : [];
    }
  },
};
