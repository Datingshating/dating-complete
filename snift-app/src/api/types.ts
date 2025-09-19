// API Types matching the web application - extracted from website code

// Core User Types
export interface User {
  id: string;
  name: string;
  gender: 'male' | 'female' | 'trans';
  date_of_birth: string;
  whatsapp_number: string;
  instagram_handle?: string;
  location?: string;
  custom_location?: string;
  status: 'pending' | 'approved' | 'rejected';
  login_id?: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
  // Profile fields (flattened from /api/me response)
  bio?: string;
  relationship_status?: string;
  partner_expectations?: string;
  interest_1?: string;
  interest_2?: string;
  interest_3?: string;
  interest_4?: string;
  interest_5?: string;
  interest_6?: string;
}

// Profile Types (matching website Profile type)
export interface Profile {
  id: string;
  name: string;
  gender: string;
  age?: number;
  date_of_birth?: string;
  whatsapp_number?: string;
  instagram_handle?: string;
  location?: string;
  custom_location?: string;
  bio: string;
  relationship_status: string;
  partner_expectations?: string;
  interest_1: string;
  interest_2: string;
  interest_3: string;
  interest_4: string;
  interest_5: string;
  interest_6: string;
  is_visible?: boolean;
  profile_created_at?: string;
  profile_updated_at?: string;
}

// Match Types (matching website MatchItem type)
export interface MatchItem {
  id: string;
  other_user_id: string;
  name: string;
  bio: string;
  relationship_status: string;
  partner_expectations?: string;
  interest_1: string;
  interest_2: string;
  interest_3: string;
  interest_4: string;
  interest_5: string;
  interest_6: string;
  instagram_handle?: string;
  location?: string;
  custom_location?: string;
  age?: number;
  created_at?: string;
}

// Connection Request Types (matching website incoming requests)
export interface ConnectionRequest {
  id: string;
  from_user_id?: string; // For incoming requests
  to_user_id?: string;   // For outgoing requests
  message: string;
  created_at: string;
  bio: string;
  name?: string;
  location?: string;
  custom_location?: string;
}

// Chat/Message Types
export interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

// Pack/Subscription Types (matching website pack system)
export interface UserPack {
  id: string;
  user_id: string;
  pack_id: string;
  pack_name: string;
  matches_total: number;
  matches_remaining: number;
  requests_total: number;
  requests_remaining: number;
  amount_paid: number;
  purchased_at: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

// Payment Types (matching website payment system)
export interface PaymentOrder {
  id: string;
  user_id: string;
  razorpay_order_id: string;
  pack_id: string;
  amount: number;
  currency: string;
  status: 'created' | 'paid' | 'failed' | 'cancelled';
  razorpay_payment_id?: string;
  razorpay_signature?: string;
  created_at: string;
  updated_at: string;
}

// Admin Types (matching website admin functionality)
export interface AdminUser extends User {
  password?: string;
  credentials?: {
    login_id: string;
    password: string;
  };
  whatsappUrl?: string;
}

export interface PackData {
  id: string;
  name: string;
  description: string;
  price: number;
  matches_total: number;
  requests_total: number;
  duration_days: number;
  is_active: boolean;
  created_at: string;
  type: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  ok?: boolean;
  data?: T;
  error?: string;
  message?: string;
  errorCode?: string;
  total?: number;
}

// Auth Request/Response Types
export interface LoginRequest {
  loginId: string;
  password: string;
}

export interface LoginResponse {
  ok: boolean;
  userId: string;
  name: string;
  is_admin: boolean;
  token: string;
  error?: string;
}

export interface RegisterRequest {
  name: string;
  gender: 'male' | 'female' | 'trans';
  dateOfBirth: string;
  whatsappNumber: string;
  instagramHandle: string;
  location: string;
  customLocation?: string;
  bio: string;
  relationshipStatus: string;
  partnerExpectations: string;
  interest1: string;
  interest2: string;
  interest3: string;
  interest4: string;
  interest5: string;
  interest6: string;
}

// Request/Connection Types
export interface SendRequestData {
  fromUserId: string;
  toUserId: string;
  message: string;
}

// Chat Types
export interface ChatSendData {
  fromUserId: string;
  toUserId: string;
  content: string;
}

// Payment Types
export interface PaymentCreateOrderData {
  userId: string;
  packId: string;
  amount: number;
}

export interface PaymentVerifyData {
  userId: string;
  packId: string;
  orderId: string;
  paymentId: string;
  signature: string;
}

export interface WhatsAppLinkResponse {
  url: string;
}

// Privacy/Settings Types
export interface ChangeCredentialsData {
  userId: string;
  newLoginId: string;
  newPassword: string;
}

// Admin Types
export interface AdminApproveData {
  userId: string;
}

export interface AdminAssignPackData {
  userId: string;
  packId: string;
  amount: number;
}

export interface AdminUpdatePackData {
  userId: string;
  action: string;
  value: number;
}

// Socket.IO event types
export interface SocketEvents {
  authenticate: (data: { userId: string }) => void;
  authenticated: (data: { success: boolean; userId?: string; error?: string }) => void;
  new_message: (message: Message) => void;
  'message:send': (data: { fromUserId: string; toUserId: string; content: string }) => void;
  'message:ack': (data: { messageId: string; status: string }) => void;
  typing: (data: { userId: string; isTyping: boolean }) => void;
  seen: (data: { userId: string; messageId: string }) => void;
  join_room: (data: { roomId: string }) => void;
  leave_room: (data: { roomId: string }) => void;
  request_received: () => void;
  match_updated: () => void;
  connect: () => void;
  disconnect: () => void;
  connect_error: (error: Error) => void;
  reconnect: () => void;
}
