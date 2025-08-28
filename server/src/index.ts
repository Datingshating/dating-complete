import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from "crypto";
import Razorpay from 'razorpay';
import jwt from 'jsonwebtoken'; // Add JWT import at the top
dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") || ["http://localhost:5173"],
    credentials: true,
  })
);
console.log("Hi  ",process.env.CORS_ORIGIN?.split(",") || ["http://localhost:5173"])

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('Supabase connection initialized');

// Health
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, uptime: process.uptime() });
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
      interest1,
      interest1Desc,
      interest2,
      interest2Desc,
      interest3,
      interest3Desc,
    } = req.body || {};

    // Validate required fields
    if (!name || !gender || !dateOfBirth || !whatsappNumber || !instagramHandle || !location || !bio || !relationshipStatus || !interest1 || !interest2 || !interest3) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Validate bio minimum 25 words
    const wordCount = bio.trim().split(/\s+/).length;
    if (wordCount < 25) {
      return res.status(400).json({ error: "Bio must contain at least 25 words" });
    }

    // Validate interest descriptions minimum 10 words each
    const desc1Words = interest1Desc?.trim().split(/\s+/).length || 0;
    const desc2Words = interest2Desc?.trim().split(/\s+/).length || 0;
    const desc3Words = interest3Desc?.trim().split(/\s+/).length || 0;

    if (desc1Words < 10 || desc2Words < 10 || desc3Words < 10) {
      return res.status(400).json({ error: "Each interest description must contain at least 10 words" });
    }

    // Create user record
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
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
        interest_1: interest1,
        interest_1_desc: interest1Desc,
        interest_2: interest2,
        interest_2_desc: interest2Desc,
        interest_3: interest3,
        interest_3_desc: interest3Desc
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
      .select('id, password_hash, name')
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
        name: data.name 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
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

// Current user: fetch profile (protected route)
app.get("/api/me", authenticateToken, async (req, res) => {
  const userId = (req as any).user.userId;
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select(`
        id, name, gender, date_of_birth, whatsapp_number, instagram_handle, status, location, custom_location,
        profiles (
          bio, relationship_status, interest_1, interest_1_desc, interest_2, interest_2_desc, interest_3, interest_3_desc
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
  const { userId, bio, relationshipStatus, interest1, interest1Desc, interest2, interest2Desc, interest3, interest3Desc } = req.body || {};
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

    // Validate interest descriptions minimum 10 words each
    if (interest1Desc || interest2Desc || interest3Desc) {
      const desc1Words = interest1Desc?.trim().split(/\s+/).length || 0;
      const desc2Words = interest2Desc?.trim().split(/\s+/).length || 0;
      const desc3Words = interest3Desc?.trim().split(/\s+/).length || 0;
      
      if (desc1Words < 10 || desc2Words < 10 || desc3Words < 10) {
        return res.status(400).json({ error: "Each interest description must contain at least 10 words" });
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
        interest_1_desc: interest1Desc || '',
        interest_2: interest2 || '',
        interest_2_desc: interest2Desc || '',
        interest_3: interest3 || '',
        interest_3_desc: interest3Desc || ''
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
    const { data, error } = await supabase
      .from('users')
      .select(`
        id, name, gender, location, custom_location,
        profiles!inner (
          bio, relationship_status, interest_1, interest_1_desc, interest_2, interest_2_desc, interest_3, interest_3_desc
        )
      `)
      .eq('status', 'approved')
      .neq('id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      throw error;
    }

    // Flatten the data structure
    const flattenedData = data.map(item => ({
      ...item,
      ...item.profiles
    }));

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
    }

    // Delete the request
    const { error: deleteError } = await supabase
      .from('connection_requests')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting request:', deleteError);
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
          id, instagram_handle, location, custom_location,
          profiles (
            bio, relationship_status, interest_1, interest_1_desc, interest_2, interest_2_desc, interest_3, interest_3_desc
          )
        ),
        user_b:users!matches_user_b_id_fkey (
          id, instagram_handle, location, custom_location,
          profiles (
            bio, relationship_status, interest_1, interest_1_desc, interest_2, interest_2_desc, interest_3, interest_3_desc
          )
        )
      `)
      .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Process the data to get the other user's information
    const processedData = data.map(match => {
      const isUserA = match.user_a_id === userId;
      const otherUser = isUserA ? match.user_b : match.user_a;
      const otherUserId = isUserA ? match.user_b_id : match.user_a_id;
      
      return {
        id: match.id,
        other_user_id: otherUserId,
        bio: otherUser.profiles?.[0]?.bio || '',
        relationship_status: otherUser.profiles?.[0]?.relationship_status || '',
        interest_1: otherUser.profiles?.[0]?.interest_1 || '',
        interest_1_desc: otherUser.profiles?.[0]?.interest_1_desc || '',
        interest_2: otherUser.profiles?.[0]?.interest_2 || '',
        interest_2_desc: otherUser.profiles?.[0]?.interest_2_desc || '',
        interest_3: otherUser.profiles?.[0]?.interest_3 || '',
        interest_3_desc: otherUser.profiles?.[0]?.interest_3_desc || '',
        instagram_handle: otherUser.instagram_handle,
        location: otherUser.location,
        custom_location: otherUser.custom_location
      };
    });

    res.json(processedData);
  } catch (err) {
    console.error('Error fetching matches:', err);
    res.status(500).json({ error: "Failed to fetch matches" });
  }
});

// Minimal chat model: create conversation on demand and send messages
app.post("/api/chat/send", async (req, res) => {
  const { fromUserId, toUserId, content } = req.body || {};
  if (!fromUserId || !toUserId || !content) return res.status(400).json({ error: "Missing fromUserId, toUserId, or content" });
  
  console.log(`Chat send request: from ${fromUserId} to ${toUserId}, content: "${content}"`);
  
  try {
    // Ensure users are matched before allowing chat
    const { data: matchData, error: matchError } = await supabase
      .from('matches')
      .select('id')
      .or(`and(user_a_id.eq.${fromUserId},user_b_id.eq.${toUserId}),and(user_a_id.eq.${toUserId},user_b_id.eq.${fromUserId})`)
      .single();

    if (matchError || !matchData) {
      console.log(`Chat blocked: Users ${fromUserId} and ${toUserId} are not matched`);
      return res.status(403).json({ error: "Chat allowed only between matched users" });
    }

    // First check if conversation exists
    const { data: existingConv, error: checkError } = await supabase
      .from('conversations')
      .select('id')
      .or(`and(user_a_id.eq.${fromUserId < toUserId ? fromUserId : toUserId},user_b_id.eq.${fromUserId < toUserId ? toUserId : fromUserId})`)
      .single();

    let convId;
    
    if (existingConv) {
      // Conversation exists, use its ID
      convId = existingConv.id;
      console.log(`Using existing conversation ID: ${convId}`);
    } else {
      // Create new conversation
      const { data: newConv, error: createError } = await supabase
        .from('conversations')
        .insert({
          id: randomUUID(),
          user_a_id: fromUserId < toUserId ? fromUserId : toUserId,
          user_b_id: fromUserId < toUserId ? toUserId : fromUserId
        })
        .select('id')
        .single();

      if (createError) {
        throw createError;
      }
      
      convId = newConv.id;
      console.log(`Created new conversation ID: ${convId}`);
    }



    // Send message
    const { error: messageError } = await supabase
      .from('messages')
      .insert({
        id: randomUUID(),
        conversation_id: convId,
        sender_id: fromUserId,
        content: String(content).slice(0, 1000)
      });

    if (messageError) {
      throw messageError;
    }

    console.log(`Message sent successfully`);
    res.json({ sent: true, conversationId: convId });
  } catch (err) {
    console.error('Failed to send message:', err);
    res.status(500).json({ error: "Failed to send message", details: err instanceof Error ? err.message : 'Unknown error' });
  }
});

app.get("/api/chat/history", async (req, res) => {
  const a = String(req.query.userA || "");
  const b = String(req.query.userB || "");
  if (!a || !b) return res.status(400).json({ error: "Missing userA or userB" });
  
  console.log(`Chat history request: userA=${a}, userB=${b}`);
  
  try {
    // ensure matched
    const { data: matchData, error: matchError } = await supabase
      .from('matches')
      .select('id')
      .or(`and(user_a_id.eq.${a},user_b_id.eq.${b}),and(user_a_id.eq.${b},user_b_id.eq.${a})`)
      .single();

    if (matchError || !matchData) {
      console.log(`Chat history blocked: Users ${a} and ${b} are not matched`);
      return res.status(403).json({ error: "Not matched" });
    }
    
    // First get the conversation ID
    const { data: historyConvData, error: convError } = await supabase
      .from('conversations')
      .select('id')
      .or(`and(user_a_id.eq.${a < b ? a : b},user_b_id.eq.${a < b ? b : a})`)
      .single();

    if (convError) {
      // No conversation exists yet, return empty array
      console.log(`No conversation found for users ${a} and ${b}`);
      return res.json([]);
    }

    // Then get messages for that conversation
    const { data, error } = await supabase
      .from('messages')
      .select('id, sender_id, content, created_at')
      .eq('conversation_id', historyConvData.id)
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
    const flattenedData = data.map(item => ({
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
    const packDetails: any = {
      starter: { name: 'Starter', matches: 5, requests: 50 },
      intermediate: { name: 'Intermediate', matches: 8, requests: 100 },
      pro: { name: 'Pro', matches: 15, requests: -1 } // -1 for unlimited
    }[packId];
    
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
    const packDetails: any = {
      starter: { name: 'Starter', matches: 5, requests: 50 },
      intermediate: { name: 'Intermediate', matches: 8, requests: 100 },
      pro: { name: 'Pro', matches: 15, requests: -1 } // -1 for unlimited
    }[packId];
    
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

// Payment info redirect (WhatsApp) - Legacy
app.get("/api/payment/whatsapp-link", (_req, res) => {
  const phone = process.env.WHATSAPP_BUSINESS_PHONE || "911234567890";
  const text = encodeURIComponent(
    "Hi! I'd like to purchase a match pack. My loginId is <your-id>."
  );
  const url = `https://wa.me/${phone}?text=${text}`;
  res.json({ url });
});

const port = Number(process.env.PORT || 8080);
app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
});


