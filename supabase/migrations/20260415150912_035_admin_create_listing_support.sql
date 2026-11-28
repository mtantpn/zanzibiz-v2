/*
  # Admin Create Listing Support

  ## Summary
  Enables admins to create listings on behalf of businesses/people who are
  not registered on the platform.

  ## Changes
  1. New Column on `listings`
     - `listed_by_name` (text, nullable) - display name when no business profile is linked
  2. Schema Change
     - `business_id` on `listings` made nullable (was NOT NULL)
       so admin-created listings without a registered business can exist
  3. Security
     - New RLS INSERT policy allowing admins to create any listing
     - New RLS SELECT policy so admins can see all listings (including inactive/pending)

  ## Notes
  - Existing listings are unaffected; business_id remains set for all current rows
  - The site falls back to `listed_by_name` when `business_id` is null
*/

ALTER TABLE listings ALTER COLUMN business_id DROP NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'listed_by_name'
  ) THEN
    ALTER TABLE listings ADD COLUMN listed_by_name text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Admins can insert any listing' AND tablename = 'listings'
  ) THEN
    CREATE POLICY "Admins can insert any listing"
      ON listings FOR INSERT
      TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'admin'
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Admins can view all listings' AND tablename = 'listings'
  ) THEN
    CREATE POLICY "Admins can view all listings"
      ON listings FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'admin'
        )
      );
  END IF;
END $$;
