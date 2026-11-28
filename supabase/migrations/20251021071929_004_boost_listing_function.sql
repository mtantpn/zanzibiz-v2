/*
  # Create Boost Listing Function

  1. Function
    - `boost_listing` function to handle boosting a listing
    - Deducts 10 tokens from business profile
    - Updates listing status to 'boosted'
    - Sets boost expiry to 30 days from now

  2. Changes
    - Add boost_expires_at column to listings table
    - Create boost_listing function with transaction safety
*/

-- Add boost expiry column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'boost_expires_at'
  ) THEN
    ALTER TABLE listings ADD COLUMN boost_expires_at TIMESTAMPTZ;
  END IF;
END $$;

-- Create boost listing function
CREATE OR REPLACE FUNCTION boost_listing(
  listing_id UUID,
  business_profile_id UUID
)
RETURNS VOID AS $$
DECLARE
  current_balance INTEGER;
BEGIN
  -- Get current token balance
  SELECT token_balance INTO current_balance
  FROM business_profiles
  WHERE id = business_profile_id;

  -- Check if enough tokens
  IF current_balance < 10 THEN
    RAISE EXCEPTION 'Insufficient tokens. Need 10 tokens to boost listing.';
  END IF;

  -- Deduct tokens
  UPDATE business_profiles
  SET 
    token_balance = token_balance - 10,
    total_tokens_spent = total_tokens_spent + 10
  WHERE id = business_profile_id;

  -- Update listing status and set expiry
  UPDATE listings
  SET 
    status = 'boosted',
    boost_expires_at = NOW() + INTERVAL '30 days',
    updated_at = NOW()
  WHERE id = listing_id AND business_profile_id = boost_listing.business_profile_id;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;