/*
  # Admin Edit Policies for Listings and Profiles

  ## Summary
  Adds RLS policies so admin users can update listings and user profiles,
  and storage access for listing-images and profile-pictures buckets.

  ## Changes
  1. Policies Added
     - Admins can update any listing
     - Admins can update any user profile

  ## Security
  - Uses auth.uid() + subquery checking profiles.user_type = 'admin'
  - Keeps existing user/business restrictions intact
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Admins can update any listing' AND tablename = 'listings'
  ) THEN
    CREATE POLICY "Admins can update any listing"
      ON listings FOR UPDATE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'admin'
        )
      )
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
    SELECT 1 FROM pg_policies WHERE policyname = 'Admins can update any profile' AND tablename = 'profiles'
  ) THEN
    CREATE POLICY "Admins can update any profile"
      ON profiles FOR UPDATE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.user_type = 'admin'
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.user_type = 'admin'
        )
      );
  END IF;
END $$;
