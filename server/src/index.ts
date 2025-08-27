import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { Pool } from 'pg';
import { randomUUID } from "crypto";
import Razorpay from 'razorpay';
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

// Initialize PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:Rishi%231203@localhost:5432/dating',
});

console.log('PostgreSQL connection initialized');

// Health
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, uptime: process.uptime() });
});

// Database test endpoint
app.get("/api/test-db", async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(*) as count FROM users');
    
    res.json({ 
      ok: true, 
      message: 'PostgreSQL connection successful',
      user_count: result.rows[0].count
    });
  } catch (err) {
    console.error("PostgreSQL connection test failed:", err);
    res.status(500).json({ error: "PostgreSQL connection failed", details: err instanceof Error ? err.message : 'Unknown error' });
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
    if (!name || !gender || !dateOfBirth || !whatsappNumber || !instagramHandle || !bio || !relationshipStatus || !location) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Validate location
    if (location === 'Others' && !customLocation) {
      return res.status(400).json({ error: "Please enter your city name when selecting 'Others'" });
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

    // Determine the final location value
    const finalLocation = location === 'Others' ? customLocation : location;
    
    const userId = randomUUID();

    // Insert user into PostgreSQL
    const userResult = await pool.query(
      'INSERT INTO users (id, name, gender, date_of_birth, whatsapp_number, instagram_handle, location, custom_location, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [userId, name, gender, dateOfBirth, whatsappNumber, instagramHandle, finalLocation, customLocation, 'pending']
    );

    if (userResult.rowCount === 0) {
      console.error('User insertion failed');
      return res.status(500).json({ error: "Failed to register user" });
    }

    // Insert profile into PostgreSQL
    const profileResult = await pool.query(
      'INSERT INTO profiles (user_id, bio, relationship_status, interest_1, interest_1_desc, interest_2, interest_2_desc, interest_3, interest_3_desc) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
      [userId, bio, relationshipStatus, interest1, interest1Desc, interest2, interest2Desc, interest3, interest3Desc]
    );

    if (profileResult.rowCount === 0) {
      console.error('Profile insertion failed');
      return res.status(500).json({ error: "Failed to register profile" });
    }

    res.json({ status: "submitted", message: "Hold on! We'll review and verify your profile." });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: "Failed to register" });
  }
});

// Admin: list pending
app.get("/api/admin/pending", async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        u.id, u.name, u.gender, u.date_of_birth, u.whatsapp_number, 
        u.instagram_handle, u.location, u.custom_location,
        p.bio, p.relationship_status, p.interest_1, p.interest_1_desc, 
        p.interest_2, p.interest_2_desc, p.interest_3, p.interest_3_desc
      FROM users u
      INNER JOIN profiles p ON u.id = p.user_id
      WHERE u.status = 'pending'
      ORDER BY u.created_at ASC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching pending users:', error);
    res.status(500).json({ error: "Failed to fetch pending" });
  }
});

// Admin: approve and generate credentials
app.post("/api/admin/approve", async (req, res) => {
  try {
    const { userId } = req.body || {};
    if (!userId) return res.status(400).json({ error: "userId required" });

    const loginId = `D${Math.floor(100000 + Math.random() * 900000)}`; // e.g., D123456
    const rawPassword = Math.random().toString(36).slice(-10);

    // Hash password using bcrypt
    const bcrypt = await import('bcrypt');
    const passwordHash = await bcrypt.hash(rawPassword, 10);

    const result = await pool.query(
      'UPDATE users SET status = $1, login_id = $2, password_hash = $3 WHERE id = $4 AND status = $5 RETURNING id, login_id',
      ['approved', loginId, passwordHash, userId, 'pending']
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "User not found or not pending" });
    }

    res.json({ approved: true, credentials: { loginId, password: rawPassword } });
  } catch (err) {
    console.error('Error approving user:', err);
    res.status(500).json({ error: "Failed to approve" });
  }
});

// Auth: login via credentials (issued after approval)
app.post("/api/login", async (req, res) => {
  const { loginId, password } = req.body || {};
  if (!loginId || !password) return res.status(400).json({ error: "Missing" });
  
  try {
    const result = await pool.query(
      'SELECT id, password_hash FROM users WHERE login_id = $1 AND status = $2',
      [loginId, 'approved']
    );

    if (result.rowCount === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = result.rows[0];

    // Verify password
    const bcrypt = await import('bcrypt');
    const isValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    res.json({ ok: true, userId: user.id });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: "Login failed" });
  }
});

// Current user: fetch profile
app.get("/api/me", async (req, res) => {
  const userId = String(req.query.userId || "");
  if (!userId) return res.status(400).json({ error: "Missing userId" });
  
  try {
    const result = await pool.query(`
      SELECT 
        u.id, u.name, u.gender, u.date_of_birth, u.whatsapp_number, 
        u.instagram_handle, u.status, u.location, u.custom_location,
        p.bio, p.relationship_status, p.interest_1, p.interest_1_desc, 
        p.interest_2, p.interest_2_desc, p.interest_3, p.interest_3_desc
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      WHERE u.id = $1
    `, [userId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching user profile:', err);
    res.status(500).json({ error: "Failed to load" });
  }
});

// Current user: update profile (approved users)
app.put("/api/me", async (req, res) => {
  const { userId, bio, relationshipStatus, interest1, interest1Desc, interest2, interest2Desc, interest3, interest3Desc } = req.body || {};
  if (!userId) return res.status(400).json({ error: "Missing userId" });
  
  try {
    // Check if user exists and is approved
    const userResult = await pool.query(
      'SELECT status FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rowCount === 0) {
      return res.status(404).json({ error: "Not found" });
    }

    if (userResult.rows[0].status !== 'approved') {
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
    const profileResult = await pool.query(`
      INSERT INTO profiles (user_id, bio, relationship_status, interest_1, interest_1_desc, interest_2, interest_2_desc, interest_3, interest_3_desc)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (user_id) DO UPDATE SET
        bio = EXCLUDED.bio,
        relationship_status = EXCLUDED.relationship_status,
        interest_1 = EXCLUDED.interest_1,
        interest_1_desc = EXCLUDED.interest_1_desc,
        interest_2 = EXCLUDED.interest_2,
        interest_2_desc = EXCLUDED.interest_2_desc,
        interest_3 = EXCLUDED.interest_3,
        interest_3_desc = EXCLUDED.interest_3_desc
    `, [userId, bio || '', relationshipStatus || null, interest1 || '', interest1Desc || '', interest2 || '', interest2Desc || '', interest3 || '', interest3Desc || '']);

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
    const result = await pool.query(`
      SELECT 
        u.id, u.name, u.gender, u.location, u.custom_location,
        p.bio, p.relationship_status, p.interest_1, p.interest_1_desc, 
        p.interest_2, p.interest_2_desc, p.interest_3, p.interest_3_desc
      FROM users u
      INNER JOIN profiles p ON u.id = p.user_id
      WHERE u.status = 'approved' AND u.id != $1
      ORDER BY u.created_at DESC
      LIMIT 50
    `, [userId]);

    res.json(result.rows);
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
    const result = await pool.query(
      'INSERT INTO connection_requests (id, from_user_id, to_user_id, message) VALUES ($1, $2, $3, $4)',
      [id, fromUserId, toUserId, (message || "").slice(0, 200)]
    );

    if (result.rowCount === 0) {
      throw new Error('Failed to insert request');
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
    const requestResult = await pool.query(
      'SELECT from_user_id, to_user_id FROM connection_requests WHERE id = $1 AND status = $2',
      [id, 'pending']
    );

    if (requestResult.rowCount === 0) {
      return res.status(404).json({ error: "Request not found or already processed" });
    }

    const request = requestResult.rows[0];
    const a = request.from_user_id;
    const b = request.to_user_id;

    // Create the match
    const matchResult = await pool.query(
      'INSERT INTO matches (id, user_a_id, user_b_id) VALUES ($1, $2, $3) ON CONFLICT (user_a_id, user_b_id) DO NOTHING',
      [randomUUID(), a < b ? a : b, a < b ? b : a]
    );

    if (matchResult.rowCount === 0) {
      console.log('Match already exists or failed to create');
    }

    // Delete the request
    const deleteResult = await pool.query(
      'DELETE FROM connection_requests WHERE id = $1',
      [id]
    );

    if (deleteResult.rowCount === 0) {
      console.log('Failed to delete request');
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
    const result = await pool.query(`
      SELECT 
        m.id,
        CASE 
          WHEN m.user_a_id = $1 THEN m.user_b_id 
          ELSE m.user_a_id 
        END as other_user_id,
        u.instagram_handle, u.location, u.custom_location,
        p.bio, p.relationship_status, p.interest_1, p.interest_1_desc, 
        p.interest_2, p.interest_2_desc, p.interest_3, p.interest_3_desc
      FROM matches m
      JOIN users u ON (
        CASE 
          WHEN m.user_a_id = $1 THEN m.user_b_id 
          ELSE m.user_a_id 
        END = u.id
      )
      LEFT JOIN profiles p ON u.id = p.user_id
      WHERE m.user_a_id = $1 OR m.user_b_id = $1
      ORDER BY m.created_at DESC
    `, [userId]);

    res.json(result.rows);
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
    const matchResult = await pool.query(
      'SELECT id FROM matches WHERE (user_a_id = $1 AND user_b_id = $2) OR (user_a_id = $2 AND user_b_id = $1)',
      [fromUserId, toUserId]
    );

    if (matchResult.rowCount === 0) {
      console.log(`Chat blocked: Users ${fromUserId} and ${toUserId} are not matched`);
      return res.status(403).json({ error: "Chat allowed only between matched users" });
    }

    // Create or update conversation
    const convResult = await pool.query(`
      INSERT INTO conversations (id, user_a_id, user_b_id)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_a_id, user_b_id) DO UPDATE SET updated_at = now()
      RETURNING id
    `, [randomUUID(), fromUserId < toUserId ? fromUserId : toUserId, fromUserId < toUserId ? toUserId : fromUserId]);

    const convId = convResult.rows[0].id;
    console.log(`Conversation ID: ${convId}`);

    // Send message
    const messageResult = await pool.query(
      'INSERT INTO messages (id, conversation_id, sender_id, content) VALUES ($1, $2, $3, $4)',
      [randomUUID(), convId, fromUserId, String(content).slice(0, 1000)]
    );

    if (messageResult.rowCount === 0) {
      throw new Error('Failed to insert message');
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
    const matchResult = await pool.query(
      'SELECT id FROM matches WHERE (user_a_id = $1 AND user_b_id = $2) OR (user_a_id = $2 AND user_b_id = $1)',
      [a, b]
    );

    if (matchResult.rowCount === 0) {
      console.log(`Chat history blocked: Users ${a} and ${b} are not matched`);
      return res.status(403).json({ error: "Not matched" });
    }
    
    const result = await pool.query(`
      SELECT m.id, m.sender_id, m.content, m.created_at
      FROM messages m
      JOIN conversations c ON m.conversation_id = c.id
      WHERE (c.user_a_id = $1 AND c.user_b_id = $2) OR (c.user_a_id = $2 AND c.user_b_id = $1)
      ORDER BY m.created_at ASC
    `, [a < b ? a : b, a < b ? b : a]);

    console.log(`Chat history: Found ${result.rows.length} messages for users ${a} and ${b}`);
    res.json(result.rows);
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
    const result = await pool.query(`
      SELECT 
        cr.id, cr.from_user_id, cr.message, cr.created_at,
        u.name, u.location, u.custom_location,
        p.bio
      FROM connection_requests cr
      JOIN users u ON cr.from_user_id = u.id
      LEFT JOIN profiles p ON u.id = p.user_id
      WHERE cr.to_user_id = $1 AND cr.status = 'pending'
      ORDER BY cr.created_at DESC
    `, [userId]);

    res.json(result.rows);
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
    const result = await pool.query(
      'SELECT pack_id, pack_name, matches_total, matches_remaining, requests_total, requests_remaining, amount_paid, purchased_at, expires_at FROM user_packs WHERE user_id = $1',
      [userId]
    );
    
    res.json(result.rows[0] || null); // Return null if no pack found
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
    const userResult = await pool.query(
      'SELECT id, status FROM users WHERE id = $1 AND status = $2',
      [userId, 'approved']
    );
    
    if (userResult.rowCount === 0) {
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
    const orderResult = await pool.query(
      'INSERT INTO payment_orders (user_id, razorpay_order_id, pack_id, amount, currency, status) VALUES ($1, $2, $3, $4, $5, $6)',
      [userId, razorpayOrder.id, packId, amount * 100, 'INR', 'created']
    );

    if (orderResult.rowCount === 0) {
      throw new Error('Failed to store order');
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
    const userResult = await pool.query(
      'SELECT id FROM users WHERE id = $1 AND status = $2',
      [userId, 'approved']
    );
    
    if (userResult.rowCount === 0) {
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
    const orderResult = await pool.query(
      'INSERT INTO payment_orders (user_id, razorpay_order_id, pack_id, amount, currency, status, razorpay_payment_id) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [userId, manualOrderId, packId, amount || 100, 'INR', 'paid', 'manual_qr_payment']
    );

    if (orderResult.rowCount === 0) {
      throw new Error('Failed to create manual order');
    }
    
    // Activate user pack
    const packResult = await pool.query(`
      INSERT INTO user_packs (user_id, pack_id, pack_name, matches_total, matches_remaining, requests_total, requests_remaining, amount_paid, purchased_at, expires_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (user_id) DO UPDATE SET
        pack_id = EXCLUDED.pack_id,
        pack_name = EXCLUDED.pack_name,
        matches_total = EXCLUDED.matches_total,
        matches_remaining = EXCLUDED.matches_remaining,
        requests_total = EXCLUDED.requests_total,
        requests_remaining = EXCLUDED.requests_remaining,
        amount_paid = EXCLUDED.amount_paid,
        purchased_at = EXCLUDED.purchased_at,
        expires_at = EXCLUDED.expires_at
    `, [userId, packId, packDetails.name, packDetails.matches, packDetails.matches, packDetails.requests, packDetails.requests, amount || 100, new Date().toISOString(), new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()]);

    if (packResult.rowCount === 0) {
      throw new Error('Failed to activate pack');
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
    const orderResult = await pool.query(
      'UPDATE payment_orders SET status = $1, razorpay_payment_id = $2, razorpay_signature = $3 WHERE razorpay_order_id = $4',
      ['paid', paymentId, signature, orderId]
    );

    if (orderResult.rowCount === 0) {
      throw new Error('Order not found');
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
    const orderDataResult = await pool.query(
      'SELECT amount FROM payment_orders WHERE razorpay_order_id = $1',
      [orderId]
    );

    if (orderDataResult.rowCount === 0) {
      throw new Error('Order data not found');
    }
    
    const amountPaid = orderDataResult.rows[0].amount || 0;
    
    // Create or update user pack
    const packResult = await pool.query(`
      INSERT INTO user_packs (user_id, pack_id, pack_name, matches_total, matches_remaining, requests_total, requests_remaining, amount_paid, purchased_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (user_id) DO UPDATE SET
        pack_id = EXCLUDED.pack_id,
        pack_name = EXCLUDED.pack_name,
        matches_total = EXCLUDED.matches_total,
        matches_remaining = EXCLUDED.matches_remaining,
        requests_total = EXCLUDED.requests_total,
        requests_remaining = EXCLUDED.requests_remaining,
        amount_paid = EXCLUDED.amount_paid,
        purchased_at = EXCLUDED.purchased_at
    `, [userId, packId, packDetails.name, packDetails.matches, packDetails.matches, packDetails.requests, packDetails.requests, amountPaid / 100, new Date().toISOString()]);

    if (packResult.rowCount === 0) {
      throw new Error('Failed to activate pack');
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


