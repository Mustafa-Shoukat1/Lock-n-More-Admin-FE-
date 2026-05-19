-- Orders Table for Payment and Shopify Sync
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  platform VARCHAR(50) NOT NULL, -- 'tiktok', 'whatsapp', 'instagram'

  product_id BIGINT NOT NULL,
  variant_id BIGINT NOT NULL,

  quantity INTEGER DEFAULT 1,
  price DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',

  stripe_session_id VARCHAR(255),
  stripe_payment_intent_id VARCHAR(255),

  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'paid', 'failed', 'cancelled'

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_orders_user_platform ON orders(user_id, platform);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_session ON orders(stripe_session_id);
