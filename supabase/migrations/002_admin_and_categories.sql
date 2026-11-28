/*
  # Admin Roles and Updated Categories

  1. Changes
    - Add admin role to user_type enum
    - Add banned status for users
    - Add reporting system
    - Update categories structure

  2. New Tables
    - user_bans: Track banned users
    - reports: User reports on listings/reviews
    - admin_actions: Audit log for admin actions
*/

-- Update user_type enum to include admin
ALTER TYPE user_type ADD VALUE IF NOT EXISTS 'admin';

-- Add is_banned column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_banned boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ban_reason text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS banned_at timestamptz;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS banned_by uuid REFERENCES profiles(id);

-- User bans table
CREATE TABLE IF NOT EXISTS user_bans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  banned_by uuid REFERENCES profiles(id) NOT NULL,
  reason text NOT NULL,
  duration_days integer,
  expires_at timestamptz,
  is_permanent boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  reported_type text NOT NULL CHECK (reported_type IN ('listing', 'review', 'user')),
  reported_id uuid NOT NULL,
  reason text NOT NULL,
  description text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),
  resolved_by uuid REFERENCES profiles(id),
  resolution_notes text,
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Admin actions audit log
CREATE TABLE IF NOT EXISTS admin_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  action_type text NOT NULL,
  target_type text,
  target_id uuid,
  details jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE user_bans ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_bans
CREATE POLICY "Admins can view all bans"
  ON user_bans FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'admin'
    )
  );

CREATE POLICY "Admins can create bans"
  ON user_bans FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'admin'
    )
  );

-- RLS Policies for reports
CREATE POLICY "Users can create reports"
  ON reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view own reports"
  ON reports FOR SELECT
  TO authenticated
  USING (auth.uid() = reporter_id);

CREATE POLICY "Admins can view all reports"
  ON reports FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'admin'
    )
  );

CREATE POLICY "Admins can update reports"
  ON reports FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'admin'
    )
  );

-- RLS Policies for admin_actions
CREATE POLICY "Admins can view all actions"
  ON admin_actions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'admin'
    )
  );

CREATE POLICY "Admins can create actions"
  ON admin_actions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'admin'
    )
  );

-- Update profiles RLS to block banned users
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id AND is_banned = false);

CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.user_type = 'admin'
    )
  );

CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.user_type = 'admin'
    )
  );

-- Function to ban a user
CREATE OR REPLACE FUNCTION ban_user(
  target_user_id uuid,
  ban_reason text,
  duration_days integer DEFAULT NULL,
  is_permanent boolean DEFAULT false
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_user_id uuid := auth.uid();
  expires_at_date timestamptz;
BEGIN
  -- Check if caller is admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = admin_user_id
    AND user_type = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can ban users';
  END IF;

  -- Calculate expiry date
  IF is_permanent THEN
    expires_at_date := NULL;
  ELSIF duration_days IS NOT NULL THEN
    expires_at_date := now() + (duration_days || ' days')::interval;
  END IF;

  -- Update profile
  UPDATE profiles
  SET
    is_banned = true,
    ban_reason = ban_reason,
    banned_at = now(),
    banned_by = admin_user_id
  WHERE id = target_user_id;

  -- Insert ban record
  INSERT INTO user_bans (
    user_id,
    banned_by,
    reason,
    duration_days,
    expires_at,
    is_permanent
  ) VALUES (
    target_user_id,
    admin_user_id,
    ban_reason,
    duration_days,
    expires_at_date,
    is_permanent
  );

  -- Log admin action
  INSERT INTO admin_actions (
    admin_id,
    action_type,
    target_type,
    target_id,
    details
  ) VALUES (
    admin_user_id,
    'ban_user',
    'user',
    target_user_id,
    jsonb_build_object(
      'reason', ban_reason,
      'duration_days', duration_days,
      'is_permanent', is_permanent
    )
  );
END;
$$;

-- Function to unban a user
CREATE OR REPLACE FUNCTION unban_user(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_user_id uuid := auth.uid();
BEGIN
  -- Check if caller is admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = admin_user_id
    AND user_type = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can unban users';
  END IF;

  -- Update profile
  UPDATE profiles
  SET
    is_banned = false,
    ban_reason = NULL,
    banned_at = NULL,
    banned_by = NULL
  WHERE id = target_user_id;

  -- Log admin action
  INSERT INTO admin_actions (
    admin_id,
    action_type,
    target_type,
    target_id
  ) VALUES (
    admin_user_id,
    'unban_user',
    'user',
    target_user_id
  );
END;
$$;

-- Function to grant tokens to business
CREATE OR REPLACE FUNCTION grant_tokens_to_business(
  target_business_id uuid,
  token_amount integer,
  grant_reason text DEFAULT 'Admin grant'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_user_id uuid := auth.uid();
BEGIN
  -- Check if caller is admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = admin_user_id
    AND user_type = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can grant tokens';
  END IF;

  -- Update business token balance
  UPDATE business_profiles
  SET
    token_balance = token_balance + token_amount,
    total_tokens_purchased = total_tokens_purchased + token_amount
  WHERE id = target_business_id;

  -- Insert transaction record
  INSERT INTO token_transactions (
    business_id,
    amount,
    type,
    description,
    payment_status
  ) VALUES (
    target_business_id,
    token_amount,
    'purchase',
    grant_reason,
    'completed'
  );

  -- Log admin action
  INSERT INTO admin_actions (
    admin_id,
    action_type,
    target_type,
    target_id,
    details
  ) VALUES (
    admin_user_id,
    'grant_tokens',
    'business',
    target_business_id,
    jsonb_build_object(
      'amount', token_amount,
      'reason', grant_reason
    )
  );
END;
$$;

-- Function to delete listing (admin only)
CREATE OR REPLACE FUNCTION admin_delete_listing(target_listing_id uuid, deletion_reason text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_user_id uuid := auth.uid();
BEGIN
  -- Check if caller is admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = admin_user_id
    AND user_type = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can delete listings';
  END IF;

  -- Delete listing
  DELETE FROM listings WHERE id = target_listing_id;

  -- Log admin action
  INSERT INTO admin_actions (
    admin_id,
    action_type,
    target_type,
    target_id,
    details
  ) VALUES (
    admin_user_id,
    'delete_listing',
    'listing',
    target_listing_id,
    jsonb_build_object('reason', deletion_reason)
  );
END;
$$;

-- Function to delete review (admin only)
CREATE OR REPLACE FUNCTION admin_delete_review(target_review_id uuid, deletion_reason text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_user_id uuid := auth.uid();
BEGIN
  -- Check if caller is admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = admin_user_id
    AND user_type = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can delete reviews';
  END IF;

  -- Delete review
  DELETE FROM reviews WHERE id = target_review_id;

  -- Log admin action
  INSERT INTO admin_actions (
    admin_id,
    action_type,
    target_type,
    target_id,
    details
  ) VALUES (
    admin_user_id,
    'delete_review',
    'review',
    target_review_id,
    jsonb_build_object('reason', deletion_reason)
  );
END;
$$;