import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from "crypto";
import Razorpay from 'razorpay';
import jwt from 'jsonwebtoken'; // Add JWT import at the top
import { createServer } from 'http';
import { Server } from 'socket.io';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN?.split(",") || ["http://localhost:5173", "https://thesnift.com"],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
  upgradeTimeout: 10000,
  allowEIO3: true
});

// Cache for match status and conversation IDs to avoid repeated DB queries
const matchCache = new Map<string, boolean>(); // key: "userId1:userId2", value: isMatched
const conversationCache = new Map<string, string>(); // key: "userId1:userId2", value: conversationId

// Helper function to create consistent cache keys
const getCacheKey = (userId1: string, userId2: string): string => {
  return [userId1, userId2].sort().join(':');
};

// Helper function to check if users are matched (with caching)
const areUsersMatched = async (userId1: string, userId2: string): Promise<boolean> => {
  const cacheKey = getCacheKey(userId1, userId2);
  
  // Check cache first
  if (matchCache.has(cacheKey)) {
    return matchCache.get(cacheKey)!;
  }
  
  // Query database if not in cache
  const { data: matchData, error: matchError } = await supabase
    .from('matches')
    .select('id')
    .or(`and(user_a_id.eq.${userId1},user_b_id.eq.${userId2}),and(user_a_id.eq.${userId2},user_b_id.eq.${userId1})`)
    .single();

  const isMatched = !matchError && !!matchData;
  
  // Cache the result
  matchCache.set(cacheKey, isMatched);
  
  return isMatched;
};

// Helper function to get conversation ID (with caching)
const getConversationId = async (userId1: string, userId2: string): Promise<string> => {
  const cacheKey = getCacheKey(userId1, userId2);
  
  // Check cache first
  if (conversationCache.has(cacheKey)) {
    return conversationCache.get(cacheKey)!;
  }
  
  // Query database if not in cache
  const { data: existingConv, error: checkError } = await supabase
    .from('conversations')
    .select('id')
    .or(`and(user_a_id.eq.${userId1 < userId2 ? userId1 : userId2},user_b_id.eq.${userId1 < userId2 ? userId2 : userId1})`)
    .single();

  let convId: string;
  
  if (existingConv) {
    convId = existingConv.id;
  } else {
    // Create new conversation
    const { data: newConv, error: createError } = await supabase
      .from('conversations')
      .insert({
        id: randomUUID(),
        user_a_id: userId1 < userId2 ? userId1 : userId2,
        user_b_id: userId1 < userId2 ? userId2 : userId1
      })
      .select('id')
      .single();

    if (createError) {
      throw createError;
    }
    
    convId = newConv.id;
  }
  
  // Cache the result
  conversationCache.set(cacheKey, convId);
  
  return convId;
};

// Cache invalidation functions
const invalidateMatchCache = (userId1: string, userId2: string) => {
  const cacheKey = getCacheKey(userId1, userId2);
  matchCache.delete(cacheKey);
};

const invalidateConversationCache = (userId1: string, userId2: string) => {
  const cacheKey = getCacheKey(userId1, userId2);
  conversationCache.delete(cacheKey);
};

// Clear all caches (useful for debugging or when data changes significantly)
const clearAllCaches = () => {
  matchCache.clear();
  conversationCache.clear();
  console.log('All caches cleared');
};


app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: [
      "http://localhost:5173",   // for local dev
      "https://thesnift.com"     // for production
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

app.options("*", cors()); // handle preflight
console.log("CORS origins:", process.env.CORS_ORIGIN?.split(",") || ["http://localhost:5173", "https://thesnift.com"])

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('Supabase connection initialized');

// Health
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, uptime: process.uptime() });
});

// Debug: Clear all caches
app.post("/api/debug/clear-caches", (_req, res) => {
  clearAllCaches();
  res.json({ message: "All caches cleared" });
});

// Database test endpoint
app.get("/api/test-db", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      throw error;
    }
    
    res.json({ 
      ok: true, 
      message: 'Supabase connection successful',
      supabase_url: supabaseUrl,
      supabase_key: supabaseAnonKey
    });
  } catch (err) {
    console.error("Supabase connection test failed:", err);
    res.status(500).json({ error: "Supabase connection failed", details: err instanceof Error ? err.message : 'Unknown error' });
  }
});

// Test Razorpay configuration
app.get("/api/test-razorpay", (req, res) => {
  res.json({
    razorpay_key_id: process.env.RAZORPAY_KEY_ID,
    razorpay_secret: process.env.RAZORPAY_SECRET,
    current_key: process.env.RAZORPAY_KEY_ID || 'rzp_test_1234567890'
  });
});

// Debug: List all users (for testing)
app.get("/api/debug/users", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, status, login_id, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    res.json({ users: data });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Public: registration (collect details for review)
app.post("/api/register", async (req, res) => {
  try {
    const {
      name,
      gender,
      dateOfBirth,
      whatsappNumber,
      instagramHandle,
      location,
      customLocation,
      bio,
      relationshipStatus,
      partnerExpectations,
      interest1,
      interest2,
      interest3,
      interest4,
      interest5,
      interest6,
    } = req.body || {};

    // Validate required fields
    if (!name || !gender || !dateOfBirth || !whatsappNumber || !instagramHandle || !location || !bio || !relationshipStatus || !partnerExpectations || !interest1 || !interest2 || !interest3 || !interest4 || !interest5 || !interest6) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Validate bio minimum 25 words
    const wordCount = bio.trim().split(/\s+/).length;
    if (wordCount < 25) {
      return res.status(400).json({ error: "Bio must contain at least 25 words" });
    }

    // Validate partner expectations minimum 25 words
    const expectationsWordCount = partnerExpectations.trim().split(/\s+/).length;
    if (expectationsWordCount < 25) {
      return res.status(400).json({ error: "Partner expectations must contain at least 25 words" });
    }

    // Create user record
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        id: randomUUID(),
        name,
        gender,
        date_of_birth: dateOfBirth,
        whatsapp_number: whatsappNumber,
        instagram_handle: instagramHandle,
        location,
        custom_location: customLocation,
        status: 'pending'
      })
      .select()
      .single();

    if (userError) {
      throw userError;
    }

    // Create profile record
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: userData.id,
        bio,
        relationship_status: relationshipStatus,
        partner_expectations: partnerExpectations,
        interest_1: interest1,
        interest_2: interest2,
        interest_3: interest3,
        interest_4: interest4,
        interest_5: interest5,
        interest_6: interest6
      });

    if (profileError) {
      throw profileError;
    }

    res.json({ ok: true, message: "Registration submitted for review" });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: "Registration failed" });
  }
});

// Auth: login via credentials (issued after approval)
app.post("/api/login", async (req, res) => {
  const { loginId, password } = req.body || {};
  if (!loginId || !password) return res.status(400).json({ error: "Missing" });
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, password_hash, name, is_admin')
      .eq('login_id', loginId)
      .eq('status', 'approved')
      .single();

    if (error || !data) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Verify password
    const bcrypt = await import('bcrypt');
    const isValid = await bcrypt.compare(password, data.password_hash);
    
    if (!isValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT token - Fixed JWT usage
    const token = jwt.sign(
      { 
        userId: data.id, 
        loginId: loginId,
        name: data.name,
        is_admin: data.is_admin
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '10d' }
    );

    // Set JWT token in HTTP-only cookie
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({ 
      ok: true, 
      userId: data.id,
      name: data.name,
      is_admin: data.is_admin,
      token: token // Also send token in response for client-side storage
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: "Login failed" });
  }
});

// JWT Middleware for protected routes - Fixed JWT usage
const authenticateToken = async (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    (req as any).user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid token" });
  }
};

// Logout endpoint
app.post("/api/logout", (req, res) => {
  res.clearCookie('authToken');
  res.json({ ok: true, message: "Logged out successfully" });
});

// Admin verification endpoint (extra security check)
app.get("/api/admin/verify", authenticateToken, async (req, res) => {
  const userId = (req as any).user.userId;
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, is_admin, status')
      .eq('id', userId)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: "User not found" });
    }

    // Extra security: Check if user is admin and approved
    if (!data.is_admin || data.status !== 'approved') {
      return res.status(403).json({ error: "Admin access denied" });
    }

    res.json({ 
      ok: true, 
      is_admin: true,
      user_id: userId 
    });
  } catch (err) {
    console.error('Admin verification error:', err);
    res.status(500).json({ error: "Admin verification failed" });
  }
});

// Current user: fetch profile (protected route)
  app.get("/api/me", authenticateToken, async (req, res) => {
    const userId = (req as any).user.userId;
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          id, name, gender, date_of_birth, whatsapp_number, instagram_handle, status, location, custom_location, is_admin,
          profiles (
            bio, relationship_status, interest_1, interest_2, interest_3, interest_4, interest_5, interest_6
          )
        `)
        .eq('id', userId)
        .single();

      if (error || !data) {
        return res.status(404).json({ error: "Not found" });
      }

      // Flatten the data structure
      const userData: any = {
        ...data,
        ...(data.profiles || {})
      };
      if (data.profiles) {
        delete userData.profiles;
      }

      res.json(userData);
    } catch (err) {
      console.error('Error fetching user profile:', err);
      res.status(500).json({ error: "Failed to load" });
    }
  });

// ... rest of your existing code ...
// Current user: update profile (approved users)
app.put("/api/me", async (req, res) => {
  const { userId, bio, relationshipStatus, interest1, interest2, interest3, interest4, interest5, interest6 } = req.body || {};
  if (!userId) return res.status(400).json({ error: "Missing userId" });
  
  try {
    // Check if user exists and is approved
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('status')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      return res.status(404).json({ error: "Not found" });
    }

    if (userData.status !== 'approved') {
      return res.status(403).json({ error: "Not approved" });
    }

    // Validate bio minimum 25 words
    if (bio) {
      const wordCount = bio.trim().split(/\s+/).length;
      if (wordCount < 25) {
        return res.status(400).json({ error: "Bio must contain at least 25 words" });
      }
    }

    // Upsert profile data
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        user_id: userId,
        bio: bio || '',
        relationship_status: relationshipStatus || null,
        interest_1: interest1 || '',
        interest_2: interest2 || '',
        interest_3: interest3 || '',
        interest_4: interest4 || '',
        interest_5: interest5 || '',
        interest_6: interest6 || ''
      });

    if (profileError) {
      throw profileError;
    }

    res.json({ ok: true });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ error: "Failed to update" });
  }
});

// Feed: list others' profiles (no photos)
app.get("/api/feed", async (req, res) => {
  const userId = String(req.query.userId || "");
  
  try {
    // First, get all users that the current user is already matched with
    const { data: matchedUsers, error: matchError } = await supabase
      .from('matches')
      .select('user_a_id, user_b_id')
      .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`);

    if (matchError) {
      throw matchError;
    }

    // Extract the IDs of matched users
    const matchedUserIds = (matchedUsers || []).map((match: any) => 
      match.user_a_id === userId ? match.user_b_id : match.user_a_id
    );

    // Get all approved users excluding current user
    const { data, error } = await supabase
      .from('users')
      .select(`
        id, name, gender, date_of_birth, location, custom_location,
        profiles!inner (
          bio, relationship_status, partner_expectations, interest_1, interest_2, interest_3, interest_4, interest_5, interest_6
        )
      `)
      .eq('status', 'approved')
      .neq('id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      throw error;
    }

    // Filter out matched users and flatten the data structure
    const filteredData = (data || []).filter((item: any) => 
      !matchedUserIds.includes(item.id)
    );

    const flattenedData = filteredData.map((item: any) => {
      // Calculate age from date_of_birth
      let age = 0;
      if (item.date_of_birth) {
        const birthDate = new Date(item.date_of_birth);
        const today = new Date();
        age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
      }

      const profile = Array.isArray(item.profiles) ? item.profiles[0] : item.profiles;
      
      return {
        id: item.id,
        name: item.name,
        gender: item.gender,
        date_of_birth: item.date_of_birth,
        location: item.location,
        custom_location: item.custom_location,
        bio: profile?.bio || '',
        relationship_status: profile?.relationship_status || '',
        partner_expectations: profile?.partner_expectations || '',
        interest_1: profile?.interest_1 || '',
        interest_2: profile?.interest_2 || '',
        interest_3: profile?.interest_3 || '',
        interest_4: profile?.interest_4 || '',
        interest_5: profile?.interest_5 || '',
        interest_6: profile?.interest_6 || '',
        age: age > 0 ? age : 0
      };
    });

    res.json(flattenedData);
  } catch (err) {
    console.error('Error fetching feed:', err);
    res.status(500).json({ error: "Failed to load feed" });
  }
});

// Send connection request with short message
app.post("/api/requests", async (req, res) => {
  const { fromUserId, toUserId, message } = req.body || {};
  if (!fromUserId || !toUserId) return res.status(400).json({ error: "Missing" });
  
  try {
    // Check sender's pack and requests limit
    const { data: pack, error: packError } = await supabase
      .from('user_packs')
      .select('requests_remaining, requests_total, pack_name')
      .eq('user_id', fromUserId)
      .single();

    if (packError && packError.code !== 'PGRST116') {
      throw packError;
    }

    if (!pack) {
      return res.status(402).json({
        error: 'No active pack. Please purchase a pack to send requests.',
        errorCode: 'NO_PACK'
      });
    }

    const requestsRemaining = pack.requests_remaining;
    if (requestsRemaining !== -1 && requestsRemaining <= 0) {
      return res.status(403).json({
        error: 'You have reached your connection request limit for your plan. Upgrade to continue.',
        errorCode: 'REQUESTS_LIMIT_REACHED',
        remaining: 0,
        total: pack.requests_total,
        packName: pack.pack_name
      });
    }

    // Create the request
    const id = randomUUID();
    const { error } = await supabase
      .from('connection_requests')
      .insert({
        id,
        from_user_id: fromUserId,
        to_user_id: toUserId,
        message: (message || "").slice(0, 200)
      });

    if (error) {
      throw error;
    }

    // Decrement requests_remaining if not unlimited
    if (requestsRemaining !== -1) {
      const { error: decError } = await supabase
        .from('user_packs')
        .update({ requests_remaining: requestsRemaining - 1 })
        .eq('user_id', fromUserId);
      if (decError) {
        console.error('Failed to decrement requests_remaining:', decError);
      }
    }

    // Emit WebSocket event for real-time notification
    io.to(`user_${toUserId}`).emit('request_received');
    io.to(`user_${fromUserId}`).emit('request_sent_success');

    res.json({ sent: true, id });
  } catch (err) {
    console.error('Error sending request:', err);
    res.status(500).json({ error: "Failed to send request" });
  }
});

// Accept request -> creates a match
app.post("/api/requests/:id/accept", async (req, res) => {
  const id = req.params.id;
  
  try {
    // Get the request details first
    const { data: requestData, error: requestError } = await supabase
      .from('connection_requests')
      .select('from_user_id, to_user_id')
      .eq('id', id)
      .eq('status', 'pending')
      .single();

    if (requestError || !requestData) {
      return res.status(404).json({ error: "Request not found or already processed" });
    }

    const a = requestData.from_user_id;
    const b = requestData.to_user_id;

    // Check both users' packs for matches limit
    const { data: packA } = await supabase
      .from('user_packs')
      .select('matches_remaining, matches_total, pack_name')
      .eq('user_id', a)
      .single();
    const { data: packB } = await supabase
      .from('user_packs')
      .select('matches_remaining, matches_total, pack_name')
      .eq('user_id', b)
      .single();

    // If either user has no pack or no remaining matches (and not unlimited), block
    if (!packA || (packA.matches_remaining !== -1 && packA.matches_remaining <= 0)) {
      return res.status(403).json({
        error: 'Sender has reached matches limit. Ask them to upgrade.',
        errorCode: 'MATCHES_LIMIT_REACHED_SENDER',
        remaining: packA ? Math.max(0, packA.matches_remaining) : 0,
        total: packA ? packA.matches_total : 0,
        packName: packA ? packA.pack_name : undefined
      });
    }
    if (!packB || (packB.matches_remaining !== -1 && packB.matches_remaining <= 0)) {
      return res.status(403).json({
        error: 'You have reached your matches limit for your plan. Upgrade to continue.',
        errorCode: 'MATCHES_LIMIT_REACHED',
        remaining: packB ? Math.max(0, packB.matches_remaining) : 0,
        total: packB ? packB.matches_total : 0,
        packName: packB ? packB.pack_name : undefined
      });
    }

    // Create the match
    const { error: matchError } = await supabase
      .from('matches')
      .insert({
        id: randomUUID(),
        user_a_id: a < b ? a : b,
        user_b_id: a < b ? b : a
      });

    if (matchError) {
      console.error('Error creating match:', matchError);
    } else {
      // Invalidate match cache for these users
      invalidateMatchCache(a, b);
      console.log(`Match cache invalidated for users ${a} and ${b}`);
    }

    // Delete the request
    const { error: deleteError } = await supabase
      .from('connection_requests')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting request:', deleteError);
    }

    // Decrement matches_remaining for both users if not unlimited
    if (packA.matches_remaining !== -1) {
      await supabase
        .from('user_packs')
        .update({ matches_remaining: packA.matches_remaining - 1 })
        .eq('user_id', a);
    }
    if (packB.matches_remaining !== -1) {
      await supabase
        .from('user_packs')
        .update({ matches_remaining: packB.matches_remaining - 1 })
        .eq('user_id', b);
    }

    console.log(`Match created and request deleted for users ${a} and ${b}`);
    res.json({ matched: true });
  } catch (err) {
    console.error('Error accepting request:', err);
    res.status(500).json({ error: "Failed to accept request" });
  }
});

// List matches for a user
app.get("/api/matches", async (req, res) => {
  const userId = String(req.query.userId || "");
  
  try {
    const { data, error } = await supabase
      .from('matches')
      .select(`
        id,
        user_a_id,
        user_b_id,
        user_a:users!matches_user_a_id_fkey (
          id, name, date_of_birth, instagram_handle, location, custom_location,
          profiles (
            bio, relationship_status, partner_expectations, interest_1, interest_2, interest_3, interest_4, interest_5, interest_6
          )
        ),
        user_b:users!matches_user_b_id_fkey (
          id, name, date_of_birth, instagram_handle, location, custom_location,
          profiles (
            bio, relationship_status, partner_expectations, interest_1, interest_2, interest_3, interest_4, interest_5, interest_6
          )
        )
      `)
      .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Process the data to get the other user's information
    const processedData = data.map((match: any) => {
      const isUserA = match.user_a_id === userId;
      const otherUser = isUserA ? match.user_b : match.user_a;
      const otherUserId = isUserA ? match.user_b_id : match.user_a_id;
      
      // Calculate age from date_of_birth
      let age = 0;
      if (otherUser.date_of_birth) {
        const birthDate = new Date(otherUser.date_of_birth);
        const today = new Date();
        age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
      }
      
      return {
        id: match.id,
        other_user_id: otherUserId,
        name: otherUser.name || '',
        bio: otherUser.profiles?.[0]?.bio || '',
        relationship_status: otherUser.profiles?.[0]?.relationship_status || '',
        partner_expectations: otherUser.profiles?.[0]?.partner_expectations || '',
        interest_1: otherUser.profiles?.[0]?.interest_1 || '',
        interest_2: otherUser.profiles?.[0]?.interest_2 || '',
        interest_3: otherUser.profiles?.[0]?.interest_3 || '',
        interest_4: otherUser.profiles?.[0]?.interest_4 || '',
        interest_5: otherUser.profiles?.[0]?.interest_5 || '',
        interest_6: otherUser.profiles?.[0]?.interest_6 || '',
        instagram_handle: otherUser.instagram_handle,
        location: otherUser.location,
        custom_location: otherUser.custom_location,
        age: age > 0 ? age : 0
      };
    });

    res.json(processedData);
  } catch (err) {
    console.error('Error fetching matches:', err);
    res.status(500).json({ error: "Failed to fetch matches" });
  }
});

// Optimized chat model: uses caching to avoid repeated DB queries
app.post("/api/chat/send", async (req, res) => {
  const { fromUserId, toUserId, content } = req.body || {};
  if (!fromUserId || !toUserId || !content) return res.status(400).json({ error: "Missing fromUserId, toUserId, or content" });
  
  console.log(`Chat send request: from ${fromUserId} to ${toUserId}, content: "${content}"`);
  
  try {
    const startTime = Date.now();
    
    // Ensure users are matched before allowing chat (cached)
    const isMatched = await areUsersMatched(fromUserId, toUserId);
    if (!isMatched) {
      console.log(`Chat blocked: Users ${fromUserId} and ${toUserId} are not matched`);
      return res.status(403).json({ error: "Chat allowed only between matched users" });
    }

    // Get conversation ID (cached, creates if doesn't exist)
    const convId = await getConversationId(fromUserId, toUserId);
    
    const checkTime = Date.now() - startTime;
    console.log(`Match and conversation checks completed in ${checkTime}ms (cached)`);

    // Create message data first
    const messageId = randomUUID();
    const messageData = {
      id: messageId,
      sender_id: fromUserId,
      content: String(content).slice(0, 1000),
      created_at: new Date().toISOString()
    };
    
    // Save to database FIRST to ensure persistence
const { error: messageError } = await supabase
.from('messages')
.insert({
  id: messageId,
  conversation_id: convId,
  sender_id: fromUserId,
  content: String(content).slice(0, 1000)
});

if (messageError) {
console.error('Database save failed:', messageError);
return res.status(500).json({ error: "Failed to save message to database" });
}

console.log(`Message saved to database successfully`);

// Now emit WebSocket events AFTER successful database save
try {
// Check if users are connected before emitting
const toUserRoom = io.sockets.adapter.rooms.get(`user_${toUserId}`);
const fromUserRoom = io.sockets.adapter.rooms.get(`user_${fromUserId}`);

// Emit to recipient if they're connected
if (toUserRoom && toUserRoom.size > 0) {
  io.to(`user_${toUserId}`).emit('new_message', messageData);
  console.log(`Message sent via WebSocket to recipient ${toUserId}`);
} else {
  console.log(`Recipient ${toUserId} not connected, message saved to database`);
}

// Emit to sender for confirmation
if (fromUserRoom && fromUserRoom.size > 0) {
  io.to(`user_${fromUserId}`).emit('new_message', messageData);
  console.log(`Message confirmation sent via WebSocket to sender ${fromUserId}`);
}

} catch (wsError) {
console.error('WebSocket emission failed:', wsError);
// Don't fail the request since message is already saved to database
// Client can fetch messages from database if WebSocket fails
}

const totalTime = Date.now() - startTime;
console.log(`Message processed in ${totalTime}ms (DB: ${checkTime}ms, WS: ${totalTime - checkTime}ms)`);
    
    res.json({ sent: true, conversationId: convId, id: messageId });
  } catch (err) {
    console.error('Failed to send message:', err);
    res.status(500).json({ error: "Failed to send message", details: err instanceof Error ? err.message : 'Unknown error' });
  }
});

// Separate route for loading chat history (load once when chat opens)
app.get("/api/chat/history/:conversationId", async (req, res) => {
  const conversationId = req.params.conversationId;
  const userId = String(req.query.userId || "");
  
  if (!conversationId || !userId) return res.status(400).json({ error: "Missing conversationId or userId" });
  
  console.log(`Chat history request: conversationId=${conversationId}, userId=${userId}`);
  
  try {
    // Verify user has access to this conversation
    const { data: convData, error: convError } = await supabase
      .from('conversations')
      .select('user_a_id, user_b_id')
      .eq('id', conversationId)
      .single();

    if (convError || !convData) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    // Check if user is part of this conversation
    if (convData.user_a_id !== userId && convData.user_b_id !== userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Get all messages for this conversation
    const { data: historyData, error: historyError } = await supabase
      .from('messages')
      .select('id, sender_id, content, created_at')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (historyError) {
      throw historyError;
    }

    console.log(`Chat history loaded: ${historyData?.length || 0} messages`);
    res.json(historyData || []);
  } catch (err) {
    console.error('Failed to load chat history:', err);
    res.status(500).json({ error: "Failed to load chat history", details: err instanceof Error ? err.message : 'Unknown error' });
  }
});

// Legacy route for backward compatibility
app.get("/api/chat/history", async (req, res) => {
  const a = String(req.query.userA || "");
  const b = String(req.query.userB || "");
  if (!a || !b) return res.status(400).json({ error: "Missing userA or userB" });
  
  console.log(`Chat history request: userA=${a}, userB=${b}`);
  
  try {
    // ensure matched
    const isMatched = await areUsersMatched(a, b);
    if (!isMatched) {
      console.log(`Chat history blocked: Users ${a} and ${b} are not matched`);
      return res.status(403).json({ error: "Not matched" });
    }
    
    // First get the conversation ID
    const convId = await getConversationId(a, b);

    // Then get messages for that conversation
    const { data, error } = await supabase
      .from('messages')
      .select('id, sender_id, content, created_at')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true });

    if (error) {
      throw error;
    }
    
    console.log(`Chat history: Found ${data?.length || 0} messages for users ${a} and ${b}`);
    res.json(data || []);
  } catch (err) {
    console.error('Failed to load chat history:', err);
    res.status(500).json({ error: "Failed to load history", details: err instanceof Error ? err.message : 'Unknown error' });
  }
});

// List incoming requests for a user
app.get("/api/requests/incoming", async (req, res) => {
  const userId = String(req.query.userId || "");
  if (!userId) return res.status(400).json({ error: "Missing userId" });
  
  try {
    const { data, error } = await supabase
      .from('connection_requests')
      .select(`
        id, from_user_id, message, created_at,
        users!connection_requests_from_user_id_fkey (
          name, location, custom_location,
          profiles (
            bio
          )
        )
      `)
      .eq('to_user_id', userId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Flatten the data structure
    const flattenedData = data.map((item: any) => ({
      id: item.id,
      from_user_id: item.from_user_id,
      message: item.message,
      created_at: item.created_at,
      bio: item.users.profiles?.bio || '',
      name: item.users.name,
      location: item.users.location,
      custom_location: item.users.custom_location
    }));

    res.json(flattenedData);
  } catch (err) {
    console.error('Error fetching incoming requests:', err);
    res.status(500).json({ error: "Failed to fetch incoming" });
  }
});

// Get user's current pack information
app.get("/api/user/pack", async (req, res) => {
  const userId = String(req.query.userId || "");
  if (!userId) return res.status(400).json({ error: "Missing userId" });
  
  try {
    const { data, error } = await supabase
      .from('user_packs')
      .select('pack_id, pack_name, matches_total, matches_remaining, requests_total, requests_remaining, amount_paid, purchased_at, expires_at')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      throw error;
    }
    
    res.json(data || null); // Return null if no pack found
  } catch (err) {
    console.error('Failed to fetch user pack:', err);
    res.status(500).json({ error: "Failed to fetch pack information" });
  }
});

// Get user order history
app.get("/api/user/orders", async (req, res) => {
  const userId = String(req.query.userId || "");
  if (!userId) return res.status(400).json({ error: "Missing userId" });
  
  try {
    const { data, error } = await supabase
      .from('payment_orders')
      .select('id, pack_id, amount, currency, status, razorpay_payment_id, created_at, updated_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }
    
    res.json(data || []);
  } catch (err) {
    console.error('Failed to fetch user orders:', err);
    res.status(500).json({ error: "Failed to fetch order history" });
  }
});

// Get complete profile data for a specific user
app.get("/api/profile/:userId", async (req, res) => {
  const { userId } = req.params;
  if (!userId) return res.status(400).json({ error: "Missing userId" });
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select(`
        id,
        name,
        gender,
        date_of_birth,
        whatsapp_number,
        instagram_handle,
        location,
        custom_location,
        status,
        profiles!inner(
          bio,
          relationship_status,
          partner_expectations,
          interest_1,
          interest_2,
          interest_3,
          interest_4,
          interest_5,
          interest_6,
          is_visible,
          created_at,
          updated_at
        )
      `)
      .eq('id', userId)
      .eq('status', 'approved')
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // not found
        return res.status(404).json({ error: "Profile not found" });
      }
      throw error;
    }
    
    // Calculate age from date_of_birth
    const birthDate = new Date(data.date_of_birth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) ? age - 1 : age;
    
    // Format the response
    const profileData = {
      id: data.id,
      name: data.name,
      gender: data.gender,
      age: actualAge,
      date_of_birth: data.date_of_birth,
      whatsapp_number: data.whatsapp_number,
      instagram_handle: data.instagram_handle,
      location: data.location,
      custom_location: data.custom_location,
      status: data.status,
      bio: (data.profiles as any).bio,
      relationship_status: (data.profiles as any).relationship_status,
      partner_expectations: (data.profiles as any).partner_expectations,
      interest_1: (data.profiles as any).interest_1,
      interest_2: (data.profiles as any).interest_2,
      interest_3: (data.profiles as any).interest_3,
      interest_4: (data.profiles as any).interest_4,
      interest_5: (data.profiles as any).interest_5,
      interest_6: (data.profiles as any).interest_6,
      is_visible: (data.profiles as any).is_visible,
      profile_created_at: (data.profiles as any).created_at,
      profile_updated_at: (data.profiles as any).updated_at
    };
    
    res.json(profileData);
  } catch (err) {
    console.error('Failed to fetch profile:', err);
    res.status(500).json({ error: "Failed to fetch profile information" });
  }
});

// Create Razorpay order
app.post("/api/payment/create-order", async (req, res) => {
  const { userId, packId, amount } = req.body || {};
  console.log('Create order request:', { userId, packId, amount });
  
  if (!userId || !packId || !amount) {
    console.log('Missing required fields:', { userId: !!userId, packId: !!packId, amount: !!amount });
    return res.status(400).json({ error: "Missing required fields" });
  }
  
  // Verify user exists and is approved
  try {
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, status')
      .eq('id', userId)
      .eq('status', 'approved')
      .single();
    
    if (userError || !userData) {
      console.log('User not found or not approved:', userId);
      return res.status(401).json({ error: "User not found or not approved" });
    }
  } catch (err) {
    console.error('Error checking user:', err);
    return res.status(500).json({ error: "Failed to verify user" });
  }
  
  try {
    // Initialize Razorpay instance
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_1234567890',
      key_secret: process.env.RAZORPAY_SECRET || 'test_secret'
    });
    
    // Create Razorpay order
    const options = {
      amount: amount * 100, // amount in paisa
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1
    };
    
    const razorpayOrder = await razorpay.orders.create(options) as any;
    console.log('Razorpay order created:', razorpayOrder.id);
    
    // Store order in database
    const { error: orderError } = await supabase
      .from('payment_orders')
      .insert({
        user_id: userId,
        razorpay_order_id: razorpayOrder.id,
        pack_id: packId,
        amount: amount * 100,
        currency: 'INR',
        status: 'created'
      });

    if (orderError) {
      throw orderError;
    }
    
    console.log(`Order stored in DB: ${razorpayOrder.id} for user ${userId}, pack ${packId}, amount ₹${amount}`);
    
    res.json({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID || 'rzp_test_1234567890'
    });
  } catch (err) {
    console.error("Failed to create order:", err);
    res.status(500).json({ error: "Failed to create order", details: err instanceof Error ? err.message : 'Unknown error' });
  }
});

// Manual pack activation for QR payments (₹1 test mode)
app.post("/api/payment/activate-pack-manual", async (req, res) => {
  const { userId, packId, amount } = req.body || {};
  console.log('Manual pack activation request:', { userId, packId, amount });
  
  if (!userId || !packId) {
    console.log('Missing required fields for manual pack activation');
    return res.status(400).json({ error: "Missing required fields" });
  }
  
  // Verify user exists and is approved
  try {
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .eq('status', 'approved')
      .single();
    
    if (userError || !userData) {
      console.log('User not found or not approved:', userId);
      return res.status(401).json({ error: "User not found or not approved" });
    }
  } catch (err) {
    console.error('Error checking user:', err);
    return res.status(500).json({ error: "Failed to verify user" });
  }
  
  try {
    // Get pack details
    const packDetailsMap: any = {
      starter: { name: 'Starter', matches: 5, requests: 50 },
      intermediate: { name: 'Intermediate', matches: 8, requests: 100 },
      pro: { name: 'Pro', matches: 15, requests: -1 } // -1 for unlimited
    };
    const packDetails = packDetailsMap[packId as keyof typeof packDetailsMap];
    
    if (!packDetails) {
      throw new Error('Invalid pack ID');
    }
    
    // Create a manual payment order record
    const manualOrderId = `manual_qr_${Date.now()}_${userId.slice(-8)}`;
    const { error: orderError } = await supabase
      .from('payment_orders')
      .insert({
        user_id: userId,
        razorpay_order_id: manualOrderId,
        pack_id: packId,
        amount: amount || 100,
        currency: 'INR',
        status: 'paid',
        razorpay_payment_id: 'manual_qr_payment'
      });

    if (orderError) {
      throw orderError;
    }
    
    // Activate user pack
    const { error: packError } = await supabase
      .from('user_packs')
      .upsert({
        user_id: userId,
        pack_id: packId,
        pack_name: packDetails.name,
        matches_total: packDetails.matches,
        matches_remaining: packDetails.matches,
        requests_total: packDetails.requests,
        requests_remaining: packDetails.requests,
        amount_paid: amount || 100,
        purchased_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
      });

    if (packError) {
      throw packError;
    }
    
    console.log(`Pack ${packId} activated manually for user ${userId} with ₹1 QR payment`);
    
    res.json({ 
      success: true, 
      message: `${packDetails.name} pack activated successfully!`,
      pack: {
        id: packId,
        name: packDetails.name,
        matches: packDetails.matches,
        requests: packDetails.requests
      }
    });
    
  } catch (err) {
    console.error("Failed to activate pack manually:", err);
    res.status(500).json({ error: "Failed to activate pack", details: err instanceof Error ? err.message : 'Unknown error' });
  }
});

// Check QR payment status (simulated for ₹1 test payments)
app.post("/api/payment/check-qr-status", async (req, res) => {
  const { orderId, userId, expectedAmount, upiVPA } = req.body || {};
  console.log('QR Payment status check:', { orderId, userId, expectedAmount, upiVPA });
  
  if (!orderId || !userId) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  
  try {
    // REAL IMPLEMENTATION GUIDE:
    // 1. Integrate with your bank's API (ICICI Bank API, for example)
    // 2. Call: GET /api/transactions?account=rishiagrawal117-3@okicici&from=timestamp&amount=1
    // 3. Look for a ₹1 transaction received after QR generation time
    // 4. Match transaction reference with orderId if possible
    // 5. Return paymentDetected: true when found
    
    // CURRENT: Simulation for testing (replace with real API)
    // This simulates payment detection after 30 seconds for demo purposes
    
    // Check if this QR code was generated recently (within last 10 minutes)
    const orderTimestamp = parseInt(orderId.split('_')[1]);
    const currentTime = Date.now();
    const timeDifference = currentTime - orderTimestamp;
    
    // Simulate random payment detection after 30 seconds (for testing)
    const shouldDetectPayment = timeDifference > 30000 && Math.random() > 0.3;
    
    if (shouldDetectPayment) {
      // Simulate transaction ID
      const mockTransactionId = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;
      
      console.log(`Simulated payment detected for order ${orderId}, transaction: ${mockTransactionId}`);
      
      res.json({
        paymentDetected: true,
        transactionId: mockTransactionId,
        amount: expectedAmount,
        timestamp: new Date().toISOString()
      });
    } else {
      res.json({
        paymentDetected: false,
        message: "No payment detected yet"
      });
    }
    
  } catch (err) {
    console.error("Failed to check QR payment status:", err);
    res.status(500).json({ error: "Failed to check payment status" });
  }
});

// Verify Razorpay payment and activate pack
app.post("/api/payment/verify", async (req, res) => {
  const { userId, packId, orderId, paymentId, signature } = req.body || {};
  console.log('Payment verification request:', { userId, packId, orderId, paymentId: !!paymentId, signature: !!signature });
  
  if (!userId || !packId || !orderId || !paymentId || !signature) {
    console.log('Missing required fields for verification');
    return res.status(400).json({ error: "Missing required fields" });
  }
  
  try {
    // Verify the signature with Razorpay
    const crypto = await import('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_SECRET || 'test_secret')
      .update(orderId + '|' + paymentId)
      .digest('hex');
    
    if (expectedSignature !== signature) {
      console.log('Signature verification failed:', { expected: expectedSignature, received: signature });
      return res.status(400).json({ error: "Invalid payment signature" });
    }
    
    console.log('Payment signature verified successfully');
    
    // Update payment order status
    const { error: orderError } = await supabase
      .from('payment_orders')
      .update({
        status: 'paid',
        razorpay_payment_id: paymentId,
        razorpay_signature: signature
      })
      .eq('razorpay_order_id', orderId);

    if (orderError) {
      throw orderError;
    }
    
    // Get pack details
    const packDetailsMap: any = {
      starter: { name: 'Starter', matches: 5, requests: 50 },
      intermediate: { name: 'Intermediate', matches: 8, requests: 100 },
      pro: { name: 'Pro', matches: 15, requests: -1 } // -1 for unlimited
    };
    const packDetails = packDetailsMap[packId as keyof typeof packDetailsMap];
    
    if (!packDetails) {
      throw new Error('Invalid pack ID');
    }
    
    // Get order details
    const { data: orderData, error: orderDataError } = await supabase
      .from('payment_orders')
      .select('amount')
      .eq('razorpay_order_id', orderId)
      .single();

    if (orderDataError) {
      throw orderDataError;
    }
    
    const amountPaid = orderData.amount || 0;
    
    // Create or update user pack
    const { error: packError } = await supabase
      .from('user_packs')
      .upsert({
        user_id: userId,
        pack_id: packId,
        pack_name: packDetails.name,
        matches_total: packDetails.matches,
        matches_remaining: packDetails.matches,
        requests_total: packDetails.requests,
        requests_remaining: packDetails.requests,
        amount_paid: amountPaid / 100,
        purchased_at: new Date().toISOString()
      });

    if (packError) {
      throw packError;
    }
    
    console.log(`Pack activated: ${packId} for user ${userId}`);
    
    res.json({ success: true, message: "Payment verified and pack activated" });
  } catch (err) {
    console.error("Failed to verify payment:", err);
    res.status(500).json({ error: "Failed to verify payment" });
  }
});

// Admin: Get pending registrations
app.get("/api/admin/pending", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select(`
        id, name, gender, date_of_birth, whatsapp_number, instagram_handle, location, custom_location,
        profiles!inner (
          bio, relationship_status, interest_1, interest_2, interest_3, interest_4, interest_5, interest_6
        )
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Flatten the data structure to match what Admin component expects
    const flattenedData = data.map(item => {
      const profile = Array.isArray(item.profiles) ? item.profiles[0] : item.profiles;
      return {
        id: item.id,
        name: item.name,
        gender: item.gender,
        date_of_birth: item.date_of_birth,
        whatsapp_number: item.whatsapp_number,
        instagram_handle: item.instagram_handle,
        bio: profile?.bio || '',
        relationship_status: profile?.relationship_status || '',
        interest_1: profile?.interest_1 || '',
        interest_1_desc: profile?.interest_1 || '',
        interest_2: profile?.interest_2 || '',
        interest_2_desc: profile?.interest_2 || '',
        interest_3: profile?.interest_3 || '',
        interest_3_desc: profile?.interest_3 || ''
      };
    });

    res.json(flattenedData);
  } catch (err) {
    console.error('Error fetching pending registrations:', err);
    res.status(500).json({ error: "Failed to fetch pending registrations" });
  }
});

// Admin: Approve user and generate credentials
app.post("/api/admin/approve", async (req, res) => {
  const { userId } = req.body || {};
  if (!userId) return res.status(400).json({ error: "Missing userId" });

  try {
    // Get user data first
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('whatsapp_number, name')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      return res.status(404).json({ error: "User not found" });
    }

    // Generate login ID and password
    const loginId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const password = Math.random().toString(36).substr(2, 8);
    
    // Hash the password
    const bcrypt = await import('bcrypt');
    const passwordHash = await bcrypt.hash(password, 10);

    // Update user status and add credentials
    const { error: updateError } = await supabase
      .from('users')
      .update({
        status: 'approved',
        login_id: loginId,
        password_hash: passwordHash
      })
      .eq('id', userId);

    if (updateError) {
      throw updateError;
    }

    console.log(`User ${userId} approved with login ID: ${loginId}`);

    // Generate WhatsApp credentials link
    const userPhone = userData.whatsapp_number;
    const userName = userData.name || 'User';
    const cleanPhone = userPhone.replace(/[\s+]/g, '');
    
    const message = `🎉 Welcome to Snift, ${userName}!

Your account has been approved! Here are your login credentials:

📱 Login ID: ${loginId}
🔑 Password: ${password}

You can now login at: ${process.env.CLIENT_URL || 'http://localhost:5173'}/login

Happy matching! 💕`;

    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

    console.log('Generated WhatsApp credentials URL:', whatsappUrl);

    res.json({
      ok: true,
      message: "User approved successfully",
      credentials: {
        loginId,
        password
      },
      whatsappUrl
    });
  } catch (err) {
    console.error('Error approving user:', err);
    res.status(500).json({ error: "Failed to approve user" });
  }
});

// Admin: Get all users with their credentials and profile info
app.get("/api/admin/users", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select(`
        id, name, gender, date_of_birth, whatsapp_number, instagram_handle, location, custom_location, 
        status, login_id, created_at, updated_at,
        profiles!inner (
          bio, relationship_status, partner_expectations, interest_1, interest_2, interest_3, 
          interest_4, interest_5, interest_6, is_visible, created_at, updated_at
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Flatten the data structure
    const flattenedData = data.map(item => {
      const profile = Array.isArray(item.profiles) ? item.profiles[0] : item.profiles;
      return {
        id: item.id,
        name: item.name,
        gender: item.gender,
        date_of_birth: item.date_of_birth,
        whatsapp_number: item.whatsapp_number,
        instagram_handle: item.instagram_handle,
        location: item.location,
        custom_location: item.custom_location,
        status: item.status,
        login_id: item.login_id,
        created_at: item.created_at,
        updated_at: item.updated_at,
        bio: profile?.bio || '',
        relationship_status: profile?.relationship_status || '',
        partner_expectations: profile?.partner_expectations || '',
        interest_1: profile?.interest_1 || '',
        interest_2: profile?.interest_2 || '',
        interest_3: profile?.interest_3 || '',
        interest_4: profile?.interest_4 || '',
        interest_5: profile?.interest_5 || '',
        interest_6: profile?.interest_6 || '',
        is_visible: profile?.is_visible || false,
        profile_created_at: profile?.created_at,
        profile_updated_at: profile?.updated_at
      };
    });

    res.json(flattenedData);
  } catch (err) {
    console.error('Error fetching all users:', err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Admin: Get user packs and purchases
app.get("/api/admin/packs", async (req, res) => {
  try {
    // Get user packs (current active packs)
    const { data: userPacks, error: packsError } = await supabase
      .from('user_packs')
      .select(`
        id, user_id, pack_id, pack_name, matches_total, matches_remaining, 
        requests_total, requests_remaining, amount_paid, purchased_at, expires_at, created_at, updated_at,
        users!inner (
          id, name, whatsapp_number, instagram_handle, login_id
        )
      `)
      .order('purchased_at', { ascending: false });

    if (packsError) {
      throw packsError;
    }

    // Get payment orders (all payment history)
    const { data: paymentOrders, error: ordersError } = await supabase
      .from('payment_orders')
      .select(`
        id, user_id, razorpay_order_id, pack_id, amount, currency, status, 
        razorpay_payment_id, created_at, updated_at,
        users!inner (
          id, name, whatsapp_number, instagram_handle, login_id
        )
      `)
      .order('created_at', { ascending: false });

    if (ordersError) {
      throw ordersError;
    }

    // Get legacy purchases (WhatsApp payments)
    const { data: purchases, error: purchasesError } = await supabase
      .from('purchases')
      .select(`
        id, user_id, pack_size, amount_rupees, status, created_at,
        users!inner (
          id, name, whatsapp_number, instagram_handle, login_id
        )
      `)
      .order('created_at', { ascending: false });

    if (purchasesError) {
      throw purchasesError;
    }

    // Flatten user packs data
    const flattenedPacks = userPacks.map((pack: any) => ({
      id: pack.id,
      user_id: pack.user_id,
      user_name: pack.users.name,
      user_whatsapp: pack.users.whatsapp_number,
      user_instagram: pack.users.instagram_handle,
      user_login_id: pack.users.login_id,
      pack_id: pack.pack_id,
      pack_name: pack.pack_name,
      matches_total: pack.matches_total,
      matches_remaining: pack.matches_remaining,
      requests_total: pack.requests_total,
      requests_remaining: pack.requests_remaining,
      amount_paid: pack.amount_paid,
      purchased_at: pack.purchased_at,
      expires_at: pack.expires_at,
      created_at: pack.created_at,
      updated_at: pack.updated_at,
      type: 'active_pack'
    }));

    // Flatten payment orders data
    const flattenedOrders = paymentOrders.map((order: any) => ({
      id: order.id,
      user_id: order.user_id,
      user_name: order.users.name,
      user_whatsapp: order.users.whatsapp_number,
      user_instagram: order.users.instagram_handle,
      user_login_id: order.users.login_id,
      pack_id: order.pack_id,
      amount: order.amount / 100, // Convert from paisa to rupees
      currency: order.currency,
      status: order.status,
      razorpay_order_id: order.razorpay_order_id,
      razorpay_payment_id: order.razorpay_payment_id,
      created_at: order.created_at,
      updated_at: order.updated_at,
      type: 'payment_order'
    }));

    // Flatten purchases data
    const flattenedPurchases = purchases.map((purchase: any) => ({
      id: purchase.id,
      user_id: purchase.user_id,
      user_name: purchase.users.name,
      user_whatsapp: purchase.users.whatsapp_number,
      user_instagram: purchase.users.instagram_handle,
      user_login_id: purchase.users.login_id,
      pack_size: purchase.pack_size,
      amount_rupees: purchase.amount_rupees,
      status: purchase.status,
      created_at: purchase.created_at,
      type: 'legacy_purchase'
    }));

    res.json({
      activePacks: flattenedPacks,
      paymentOrders: flattenedOrders,
      legacyPurchases: flattenedPurchases
    });
  } catch (err) {
    console.error('Error fetching packs data:', err);
    res.status(500).json({ error: "Failed to fetch packs data" });
  }
});

// Admin: Get full profile details for a specific user
app.get("/api/admin/profile/:userId", async (req, res) => {
  const { userId } = req.params;
  if (!userId) return res.status(400).json({ error: "Missing userId" });
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select(`
        id, name, gender, date_of_birth, whatsapp_number, instagram_handle, location, custom_location, 
        status, login_id, created_at, updated_at,
        profiles!inner (
          bio, relationship_status, partner_expectations, interest_1, interest_2, interest_3, 
          interest_4, interest_5, interest_6, is_visible, created_at, updated_at
        )
      `)
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: "User not found" });
      }
      throw error;
    }

    // Calculate age from date_of_birth
    const birthDate = new Date(data.date_of_birth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) ? age - 1 : age;
    
    const profile = Array.isArray(data.profiles) ? data.profiles[0] : data.profiles;
    
    // Format the response
    const profileData = {
      id: data.id,
      name: data.name,
      gender: data.gender,
      age: actualAge,
      date_of_birth: data.date_of_birth,
      whatsapp_number: data.whatsapp_number,
      instagram_handle: data.instagram_handle,
      location: data.location,
      custom_location: data.custom_location,
      status: data.status,
      login_id: data.login_id,
      created_at: data.created_at,
      updated_at: data.updated_at,
      bio: profile?.bio || '',
      relationship_status: profile?.relationship_status || '',
      partner_expectations: profile?.partner_expectations || '',
      interest_1: profile?.interest_1 || '',
      interest_2: profile?.interest_2 || '',
      interest_3: profile?.interest_3 || '',
      interest_4: profile?.interest_4 || '',
      interest_5: profile?.interest_5 || '',
      interest_6: profile?.interest_6 || '',
      is_visible: profile?.is_visible || false,
      profile_created_at: profile?.created_at,
      profile_updated_at: profile?.updated_at
    };
    
    res.json(profileData);
  } catch (err) {
    console.error('Failed to fetch user profile:', err);
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
});

// Admin: Manually assign/update subscription pack for a user
app.post("/api/admin/assign-pack", authenticateToken, async (req, res) => {
  const { userId, packId, amount, notes } = req.body || {};
  
  if (!userId || !packId) {
    return res.status(400).json({ error: "Missing userId or packId" });
  }

  try {
    // Verify user exists and is approved
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, name, status')
      .eq('id', userId)
      .eq('status', 'approved')
      .single();
    
    if (userError || !userData) {
      return res.status(404).json({ error: "User not found or not approved" });
    }

    // Get pack details
    const packDetailsMap: any = {
      starter: { name: 'Starter', matches: 5, requests: 50 },
      intermediate: { name: 'Intermediate', matches: 8, requests: 100 },
      pro: { name: 'Pro', matches: 15, requests: -1 } // -1 for unlimited
    };
    const packDetails = packDetailsMap[packId as keyof typeof packDetailsMap];
    
    if (!packDetails) {
      return res.status(400).json({ error: 'Invalid pack ID' });
    }

    // Create a manual payment order record for tracking
    const manualOrderId = `admin_manual_${Date.now()}_${userId.slice(-8)}`;
    const { error: orderError } = await supabase
      .from('payment_orders')
      .insert({
        user_id: userId,
        razorpay_order_id: manualOrderId,
        pack_id: packId,
        amount: (amount || 0) * 100, // Convert to paisa
        currency: 'INR',
        status: 'paid',
        razorpay_payment_id: 'admin_manual_assignment'
      });

    if (orderError) {
      throw orderError;
    }

    // Assign/update user pack
    const { error: packError } = await supabase
      .from('user_packs')
      .upsert({
        user_id: userId,
        pack_id: packId,
        pack_name: packDetails.name,
        matches_total: packDetails.matches,
        matches_remaining: packDetails.matches,
        requests_total: packDetails.requests,
        requests_remaining: packDetails.requests,
        amount_paid: amount || 0,
        purchased_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
      });

    if (packError) {
      throw packError;
    }

    console.log(`Admin manually assigned pack ${packId} to user ${userId} (${userData.name})`);
    
    res.json({ 
      success: true, 
      message: `${packDetails.name} pack assigned successfully to ${userData.name}`,
      pack: {
        id: packId,
        name: packDetails.name,
        matches: packDetails.matches,
        requests: packDetails.requests,
        amount: amount || 0
      }
    });
    
  } catch (err) {
    console.error("Failed to assign pack:", err);
    res.status(500).json({ error: "Failed to assign pack", details: err instanceof Error ? err.message : 'Unknown error' });
  }
});

// Admin: Update user pack (extend, modify, or reset)
app.put("/api/admin/update-pack", authenticateToken, async (req, res) => {
  const { userId, action, value, notes } = req.body || {};
  
  if (!userId || !action) {
    return res.status(400).json({ error: "Missing userId or action" });
  }

  try {
    // Get current pack
    const { data: currentPack, error: packError } = await supabase
      .from('user_packs')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (packError && packError.code !== 'PGRST116') {
      throw packError;
    }

    if (!currentPack) {
      return res.status(404).json({ error: "No active pack found for this user" });
    }

    let updateData: any = {};

    switch (action) {
      case 'extend_matches':
        updateData.matches_remaining = Math.max(0, currentPack.matches_remaining + (value || 0));
        break;
      case 'extend_requests':
        if (currentPack.requests_remaining === -1) {
          return res.status(400).json({ error: "Cannot extend unlimited requests" });
        }
        updateData.requests_remaining = Math.max(0, currentPack.requests_remaining + (value || 0));
        break;
      case 'reset_matches':
        updateData.matches_remaining = currentPack.matches_total;
        break;
      case 'reset_requests':
        updateData.requests_remaining = currentPack.requests_total;
        break;
      case 'extend_expiry':
        const currentExpiry = new Date(currentPack.expires_at);
        const newExpiry = new Date(currentExpiry.getTime() + (value || 30) * 24 * 60 * 60 * 1000);
        updateData.expires_at = newExpiry.toISOString();
        break;
      default:
        return res.status(400).json({ error: "Invalid action" });
    }

    // Update the pack
    const { error: updateError } = await supabase
      .from('user_packs')
      .update(updateData)
      .eq('user_id', userId);

    if (updateError) {
      throw updateError;
    }

    console.log(`Admin updated pack for user ${userId}: ${action} with value ${value}`);
    
    res.json({ 
      success: true, 
      message: `Pack updated successfully: ${action}`,
      updatedData: updateData
    });
    
  } catch (err) {
    console.error("Failed to update pack:", err);
    res.status(500).json({ error: "Failed to update pack", details: err instanceof Error ? err.message : 'Unknown error' });
  }
});

// Admin: Get user's current pack details
app.get("/api/admin/user-pack/:userId", authenticateToken, async (req, res) => {
  const { userId } = req.params;
  
  if (!userId) {
    return res.status(400).json({ error: "Missing userId" });
  }

  try {
    const { data: packData, error: packError } = await supabase
      .from('user_packs')
      .select(`
        *,
        users!inner (
          id, name, whatsapp_number, instagram_handle, login_id
        )
      `)
      .eq('user_id', userId)
      .single();

    if (packError && packError.code !== 'PGRST116') {
      throw packError;
    }

    if (!packData) {
      return res.json({ pack: null, message: "No active pack found" });
    }

    // Flatten the data
    const flattenedData = {
      id: packData.id,
      user_id: packData.user_id,
      user_name: packData.users.name,
      user_whatsapp: packData.users.whatsapp_number,
      user_instagram: packData.users.instagram_handle,
      user_login_id: packData.users.login_id,
      pack_id: packData.pack_id,
      pack_name: packData.pack_name,
      matches_total: packData.matches_total,
      matches_remaining: packData.matches_remaining,
      requests_total: packData.requests_total,
      requests_remaining: packData.requests_remaining,
      amount_paid: packData.amount_paid,
      purchased_at: packData.purchased_at,
      expires_at: packData.expires_at,
      created_at: packData.created_at,
      updated_at: packData.updated_at
    };

    res.json({ pack: flattenedData });
    
  } catch (err) {
    console.error("Failed to fetch user pack:", err);
    res.status(500).json({ error: "Failed to fetch user pack", details: err instanceof Error ? err.message : 'Unknown error' });
  }
});

// Payment info redirect (WhatsApp)
app.get("/api/payment/whatsapp-link", (_req, res) => {
  const phone = process.env.WHATSAPP_NUMBER || "+919631126841";
  // Remove + sign and any spaces for WhatsApp API
  const cleanPhone = phone.replace(/[\s+]/g, '');
  const text = "Hi! I want to purchase a pack";
  
  // Try the simplest approach first
  const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
  
  console.log('Generated WhatsApp URL:', url);
  console.log('Phone number:', cleanPhone);
  console.log('Message:', text);
  console.log('Encoded message:', encodeURIComponent(text));
  
  res.json({ url });
});

// Send credentials via WhatsApp
app.post("/api/admin/send-credentials", async (req, res) => {
  const { userId, loginId, password, userName } = req.body || {};
  
  if (!userId || !loginId || !password) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Get user's WhatsApp number
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('whatsapp_number, name')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      return res.status(404).json({ error: "User not found" });
    }

    const userPhone = userData.whatsapp_number;
    const actualUserName = userData.name || userName || 'User';
    
    // Remove + sign and any spaces for WhatsApp API
    const cleanPhone = userPhone.replace(/[\s+]/g, '');
    
    // Create the credentials message
    const message = `🎉 Welcome to Snift, ${actualUserName}!

Your account has been approved! Here are your login credentials:

📱 Login ID: ${loginId}
🔑 Password: ${password}

You can now login at: ${process.env.CLIENT_URL || 'http://localhost:5173'}/login

Happy matching! 💕`;

    // Generate WhatsApp URL
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    
    console.log('Sending credentials via WhatsApp:');
    console.log('User:', actualUserName);
    console.log('Phone:', cleanPhone);
    console.log('Login ID:', loginId);
    console.log('WhatsApp URL:', url);
    
    res.json({ 
      success: true, 
      url,
      message: "Credentials WhatsApp link generated successfully" 
    });
  } catch (err) {
    console.error('Error generating WhatsApp credentials link:', err);
    res.status(500).json({ error: "Failed to generate WhatsApp link" });
  }
});

// Socket.IO event handlers
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Handle user authentication
  socket.on('authenticate', (data) => {
    try {
      const { userId } = data;
      if (userId) {
        socket.join(`user_${userId}`);
        console.log(`User ${userId} joined their room`);
        // Send acknowledgment
        socket.emit('authenticated', { success: true, userId });
      } else {
        socket.emit('authenticated', { success: false, error: 'Missing userId' });
      }
    } catch (error) {
      console.error('Authentication error:', error);
      socket.emit('authenticated', { success: false, error: 'Authentication failed' });
    }
  });
  
  // Handle message acknowledgment
  socket.on('message_received', (data) => {
    console.log('Message received acknowledgment:', data);
  });
  
  // Handle connection errors
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
  

  

  
  socket.on('disconnect', (reason) => {
    console.log('User disconnected:', socket.id, 'Reason:', reason);
    // Clean up any user-specific data if needed
  });
});

const port = Number(process.env.PORT || 8080);
server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  console.log(`Socket.IO server ready for real-time chat`);
});


