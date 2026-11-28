/*
  # Add Listing Contact Details and What3Words Location

  1. Schema Changes
    - Add `phone` column to listings table
    - Add `address` column to listings table  
    - Add `what3words` column to listings table for location
    - Add `opening_hours` column for business hours (JSON)
    - Add `website` column for business website
    - Add `email` column for business email

  2. Notes
    - what3words provides precise 3m x 3m location using 3 words
    - All new columns are optional to maintain backward compatibility
    - opening_hours stored as JSON for flexibility
*/

-- Add new columns to listings table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'phone'
  ) THEN
    ALTER TABLE listings ADD COLUMN phone TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'address'
  ) THEN
    ALTER TABLE listings ADD COLUMN address TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'what3words'
  ) THEN
    ALTER TABLE listings ADD COLUMN what3words TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'opening_hours'
  ) THEN
    ALTER TABLE listings ADD COLUMN opening_hours JSONB DEFAULT '{}'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'website'
  ) THEN
    ALTER TABLE listings ADD COLUMN website TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'email'
  ) THEN
    ALTER TABLE listings ADD COLUMN email TEXT;
  END IF;
END $$;