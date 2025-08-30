-- Enable pgcrypto for bcrypt(crypt) if not already
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Users who register; approved users receive login_id and password
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  name TEXT NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('male','female','trans')),
  date_of_birth DATE NOT NULL,
  whatsapp_number TEXT UNIQUE NOT NULL,
  instagram_handle TEXT,
  location TEXT,
  custom_location TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  login_id TEXT UNIQUE,
  password_hash TEXT,
  is_admin BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  bio TEXT NOT NULL,
  relationship_status TEXT NOT NULL CHECK (relationship_status IN ('single','in a relationship','recent breakup','its complicated','divorced')),
  interest_1 TEXT NOT NULL,
  interest_1_desc TEXT NOT NULL,
  interest_2 TEXT NOT NULL,
  interest_2_desc TEXT NOT NULL,
  interest_3 TEXT NOT NULL,
  interest_3_desc TEXT NOT NULL,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Optional audit trail for manual reviews
CREATE TABLE IF NOT EXISTS profile_reviews (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES users(id),
  decision TEXT NOT NULL CHECK (decision IN ('approved','rejected')),
  notes TEXT,
  reviewed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Requests to connect (short message)
CREATE TABLE IF NOT EXISTS connection_requests (
  id UUID PRIMARY KEY,
  from_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','declined')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_requests_to_user ON connection_requests(to_user_id, status);

-- Matches
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY,
  user_a_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_b_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_match_pair UNIQUE (user_a_id, user_b_id),
  CONSTRAINT chk_match_order CHECK (user_a_id < user_b_id)
);

-- Chat
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY,
  user_a_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_b_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_conv_pair UNIQUE (user_a_id, user_b_id),
  CONSTRAINT chk_conv_order CHECK (user_a_id < user_b_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_messages_conv ON messages(conversation_id, created_at);

-- User Packs: track current pack subscription and remaining usage
CREATE TABLE IF NOT EXISTS user_packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  pack_id TEXT NOT NULL CHECK (pack_id IN ('starter','intermediate','pro')),
  pack_name TEXT NOT NULL,
  matches_total INT NOT NULL,
  matches_remaining INT NOT NULL,
  requests_total INT NOT NULL, -- -1 for unlimited
  requests_remaining INT NOT NULL, -- -1 for unlimited
  amount_paid INT NOT NULL,
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ, -- NULL for lifetime packs
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Payment Orders: Razorpay order tracking
CREATE TABLE IF NOT EXISTS payment_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  razorpay_order_id TEXT NOT NULL UNIQUE,
  pack_id TEXT NOT NULL,
  amount INT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'created' CHECK (status IN ('created','paid','failed','cancelled')),
  razorpay_payment_id TEXT,
  razorpay_signature TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Purchases: packs of N matches, payment handled via WhatsApp (legacy)
CREATE TABLE IF NOT EXISTS purchases (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pack_size INT NOT NULL CHECK (pack_size IN (1,2,4,8,12,20)),
  amount_rupees INT NOT NULL CHECK (pack_size > 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Triggers to maintain updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'users_set_updated_at'
  ) THEN
    CREATE TRIGGER users_set_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'profiles_set_updated_at'
  ) THEN
    CREATE TRIGGER profiles_set_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'user_packs_set_updated_at'
  ) THEN
    CREATE TRIGGER user_packs_set_updated_at BEFORE UPDATE ON user_packs
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'payment_orders_set_updated_at'
  ) THEN
    CREATE TRIGGER payment_orders_set_updated_at BEFORE UPDATE ON payment_orders
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
END $$;
