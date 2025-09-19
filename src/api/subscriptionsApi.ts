import { z } from 'zod';
import { apiClient } from './apiClient';
import { 
  UserPack, 
  PaymentOrder, 
  PaymentCreateOrderData,
  PaymentVerifyData,
  WhatsAppLinkResponse,
  ApiResponse 
} from './types';

// Zod schemas for response validation
const UserPackSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  pack_id: z.string(),
  pack_name: z.string(),
  matches_total: z.number(),
  matches_remaining: z.number(),
  requests_total: z.number(),
  requests_remaining: z.number(),
  amount_paid: z.number(),
  purchased_at: z.string(),
  expires_at: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

const PaymentOrderSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  razorpay_order_id: z.string(),
  pack_id: z.string(),
  amount: z.number(),
  currency: z.string(),
  status: z.enum(['created', 'paid', 'failed', 'cancelled']),
  razorpay_payment_id: z.string().optional(),
  razorpay_signature: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

const WhatsAppLinkResponseSchema = z.object({
  url: z.string(),
});

const CreateOrderResponseSchema = z.object({
  orderId: z.string(),
  amount: z.number(),
  currency: z.string(),
  key: z.string(),
});

const QRStatusResponseSchema = z.object({
  paymentDetected: z.boolean(),
  transactionId: z.string().optional(),
  amount: z.number().optional(),
  timestamp: z.string().optional(),
  message: z.string().optional(),
});

const ApiResponseSchema = z.object({
  ok: z.boolean().optional(),
  data: z.any().optional(),
  error: z.string().optional(),
  message: z.string().optional(),
});

export const subscriptionsApi = {
  // Get WhatsApp payment link - matching website endpoint
  getWhatsAppLink: async (): Promise<WhatsAppLinkResponse> => {
    try {
      const response = await apiClient.get('/api/payment/whatsapp-link');
      const validatedData = WhatsAppLinkResponseSchema.parse(response.data);
      return validatedData;
    } catch (error) {
      console.warn('GetWhatsAppLink response validation failed:', error);
      return response?.data || { error: 'Validation failed' };
    }
  },

  // Create Razorpay order - matching website endpoint
  createOrder: async (data: PaymentCreateOrderData): Promise<CreateOrderResponseSchema> => {
    try {
      const response = await apiClient.post('/api/payment/create-order', data);
      const validatedData = CreateOrderResponseSchema.parse(response.data);
      return validatedData;
    } catch (error) {
      console.warn('CreateOrder response validation failed:', error);
      return response?.data || { error: 'Validation failed' };
    }
  },

  // Verify payment - matching website endpoint
  verifyPayment: async (data: PaymentVerifyData): Promise<ApiResponse> => {
    try {
      const response = await apiClient.post('/api/payment/verify', data);
      const validatedData = ApiResponseSchema.parse(response.data);
      return validatedData;
    } catch (error) {
      console.warn('VerifyPayment response validation failed:', error);
      return response?.data || { error: 'Validation failed' };
    }
  },

  // Check QR payment status - matching website endpoint
  checkQRStatus: async (data: {
    orderId: string;
    userId: string;
    expectedAmount: number;
    upiVPA: string;
  }): Promise<QRStatusResponseSchema> => {
    try {
      const response = await apiClient.post('/api/payment/check-qr-status', data);
      const validatedData = QRStatusResponseSchema.parse(response.data);
      return validatedData;
    } catch (error) {
      console.warn('CheckQRStatus response validation failed:', error);
      return response?.data || { error: 'Validation failed' };
    }
  },

  // Activate pack manually (for QR payments) - matching website endpoint
  activatePackManual: async (data: {
    userId: string;
    packId: string;
    amount: number;
  }): Promise<ApiResponse> => {
    try {
      const response = await apiClient.post('/api/payment/activate-pack-manual', data);
      const validatedData = ApiResponseSchema.parse(response.data);
      return validatedData;
    } catch (error) {
      console.warn('ActivatePackManual response validation failed:', error);
      return response?.data || { error: 'Validation failed' };
    }
  },

  // Get user's current pack - matching website endpoint
  getUserPack: async (userId: string): Promise<UserPack | null> => {
    try {
      const response = await apiClient.get(`/api/user/pack?userId=${userId}`);
      if (response.data === null) return null;
      const validatedData = UserPackSchema.parse(response.data);
      return validatedData;
    } catch (error) {
      console.warn('GetUserPack response validation failed:', error);
      return response?.data || null;
    }
  },

  // Get user's order history - matching website endpoint
  getUserOrders: async (userId: string): Promise<PaymentOrder[]> => {
    try {
      const response = await apiClient.get(`/api/user/orders?userId=${userId}`);
      const validatedData = z.array(PaymentOrderSchema).parse(response.data);
      return validatedData;
    } catch (error) {
      console.warn('GetUserOrders response validation failed:', error);
      return Array.isArray(response?.data) ? response.data : [];
    }
  },
};
