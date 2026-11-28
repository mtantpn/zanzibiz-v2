/*
  # Add Token Purchase System

  1. New Tables
    - `token_purchases`
      - `id` (uuid, primary key)
      - `business_id` (uuid, foreign key to business_profiles)
      - `amount` (integer) - Number of tokens purchased
      - `payment_method` (text) - 'mpesa' or 'card'
      - `payment_status` (text) - 'pending', 'completed', 'failed'
      - `transaction_reference` (text) - Mock transaction ID
      - `phone_number` (text, nullable) - For M-Pesa payments
      - `created_at` (timestamptz)
      - `completed_at` (timestamptz, nullable)

  2. Security
    - Enable RLS on `token_purchases` table
    - Business owners can view their own purchases
    - Business owners can create and update purchase records

  3. Notes
    - This is an MVP system for demonstration purposes
    - Actual payment integration (M-Pesa, Stripe) to be added later
    - Transaction references are mock values for now
*/

-- Create token_purchases table
CREATE TABLE IF NOT EXISTS token_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES business_profiles(id) ON DELETE CASCADE,
  amount integer NOT NULL CHECK (amount > 0),
  payment_method text NOT NULL CHECK (payment_method IN ('mpesa', 'card')),
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed')),
  transaction_reference text NOT NULL,
  phone_number text,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Enable RLS
ALTER TABLE token_purchases ENABLE ROW LEVEL SECURITY;

-- Business owners can view their own purchases
CREATE POLICY "Business owners can view own purchases"
  ON token_purchases FOR SELECT
  TO authenticated
  USING (
    business_id IN (
      SELECT id FROM business_profiles WHERE user_id = auth.uid()
    )
  );

-- Business owners can create purchase records
CREATE POLICY "Business owners can create purchases"
  ON token_purchases FOR INSERT
  TO authenticated
  WITH CHECK (
    business_id IN (
      SELECT id FROM business_profiles WHERE user_id = auth.uid()
    )
  );

-- Business owners can update their own purchases (for status updates)
CREATE POLICY "Business owners can update own purchases"
  ON token_purchases FOR UPDATE
  TO authenticated
  USING (
    business_id IN (
      SELECT id FROM business_profiles WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    business_id IN (
      SELECT id FROM business_profiles WHERE user_id = auth.uid()
    )
  );

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_token_purchases_business_id ON token_purchases(business_id);
CREATE INDEX IF NOT EXISTS idx_token_purchases_status ON token_purchases(payment_status);
CREATE INDEX IF NOT EXISTS idx_token_purchases_created_at ON token_purchases(created_at DESC);