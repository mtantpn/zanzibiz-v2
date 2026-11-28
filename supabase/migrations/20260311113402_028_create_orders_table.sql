/*
  # Create orders table for ClickPesa payment tracking

  ## Summary
  Introduces a clean `orders` table that acts as the authoritative payment record
  for every token top-up checkout session. Each order maps 1-to-1 with a row in
  `token_topups` via the shared `order_reference` / `topup_reference` value.

  ## New Tables
  - `orders`
    - `id` (uuid, primary key)
    - `order_reference` (text, unique) — matches token_topups.topup_reference
    - `user_id` (uuid, FK → auth.users) — the authenticated user who started checkout
    - `business_id` (uuid, FK → business_profiles) — owning business account
    - `amount` (integer) — amount in TZS
    - `token_amount` (integer) — tokens to be credited on success
    - `status` (text) — PENDING | PROCESSING | SUCCESS | FAILED | EXPIRED
    - `payer_phone` (text, nullable) — masked phone used for USSD push
    - `clickpesa_order_reference` (text, nullable) — reference returned by ClickPesa
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  ## Security
  - RLS enabled on orders
  - Authenticated users can only read their own orders
  - Service role (edge functions) handles all writes via SUPABASE_SERVICE_ROLE_KEY

  ## Notes
  - order_reference is intentionally identical to token_topups.topup_reference so the
    two tables stay in sync without a foreign key (allows independent querying)
  - Indexes added on user_id, business_id, order_reference, and status
*/

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_reference text UNIQUE NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id uuid NOT NULL REFERENCES business_profiles(id) ON DELETE CASCADE,
  amount integer NOT NULL DEFAULT 1500,
  token_amount integer NOT NULL DEFAULT 300,
  status text NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING','PROCESSING','SUCCESS','FAILED','EXPIRED')),
  payer_phone text,
  clickpesa_order_reference text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_business_id ON orders(business_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_reference ON orders(order_reference);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
