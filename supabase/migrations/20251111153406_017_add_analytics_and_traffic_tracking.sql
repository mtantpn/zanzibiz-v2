/*
  # Add Analytics and Traffic Tracking

  1. New Tables
    - `page_views` - Track all page views with timestamps
      - `id` (uuid, primary key)
      - `user_id` (uuid, nullable - for logged in users)
      - `session_id` (text) - Browser session identifier
      - `page_url` (text) - URL visited
      - `referrer` (text, nullable)
      - `user_agent` (text)
      - `ip_address` (inet, nullable)
      - `created_at` (timestamptz)
    
    - `daily_stats` - Aggregated daily statistics
      - `id` (uuid, primary key)
      - `date` (date, unique)
      - `total_page_views` (integer)
      - `unique_visitors` (integer)
      - `new_users` (integer)
      - `new_listings` (integer)
      - `new_reviews` (integer)
      - `created_at` (timestamptz)
    
    - `user_bans` - Track banned users
      - `id` (uuid, primary key)
      - `user_id` (uuid) - User being banned
      - `banned_by` (uuid) - Admin who banned
      - `reason` (text)
      - `is_permanent` (boolean)
      - `banned_until` (timestamptz, nullable)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all new tables
    - Only admins can view analytics data
    - Track user sessions securely

  3. Functions
    - Function to aggregate daily stats
    - Function to ban/unban users
    - Function to track page views
*/

-- Page Views Table
CREATE TABLE IF NOT EXISTS page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  session_id text NOT NULL,
  page_url text NOT NULL,
  referrer text,
  user_agent text,
  ip_address inet,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_session ON page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_page_views_user_id ON page_views(user_id);

-- Daily Stats Table
CREATE TABLE IF NOT EXISTS daily_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL UNIQUE,
  total_page_views integer DEFAULT 0,
  unique_visitors integer DEFAULT 0,
  new_users integer DEFAULT 0,
  new_listings integer DEFAULT 0,
  new_reviews integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_daily_stats_date ON daily_stats(date DESC);

-- User Bans Table
CREATE TABLE IF NOT EXISTS user_bans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  banned_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  reason text NOT NULL,
  is_permanent boolean DEFAULT false,
  banned_until timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_bans_user_id ON user_bans(user_id);

-- Add is_banned column to profiles if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'is_banned'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_banned boolean DEFAULT false;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_bans ENABLE ROW LEVEL SECURITY;

-- RLS Policies for page_views (admin only)
CREATE POLICY "Admins can view page views"
  ON page_views FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'admin'
    )
  );

CREATE POLICY "Anyone can insert page views"
  ON page_views FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- RLS Policies for daily_stats (admin only)
CREATE POLICY "Admins can view daily stats"
  ON daily_stats FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'admin'
    )
  );

-- RLS Policies for user_bans (admin only)
CREATE POLICY "Admins can view user bans"
  ON user_bans FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'admin'
    )
  );

CREATE POLICY "Admins can manage user bans"
  ON user_bans FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'admin'
    )
  );

-- Function to aggregate daily stats
CREATE OR REPLACE FUNCTION aggregate_daily_stats(target_date date DEFAULT CURRENT_DATE)
RETURNS void AS $$
BEGIN
  INSERT INTO daily_stats (
    date,
    total_page_views,
    unique_visitors,
    new_users,
    new_listings,
    new_reviews
  )
  VALUES (
    target_date,
    (SELECT COUNT(*) FROM page_views WHERE DATE(created_at) = target_date),
    (SELECT COUNT(DISTINCT session_id) FROM page_views WHERE DATE(created_at) = target_date),
    (SELECT COUNT(*) FROM profiles WHERE DATE(created_at) = target_date),
    (SELECT COUNT(*) FROM listings WHERE DATE(created_at) = target_date),
    (SELECT COUNT(*) FROM reviews WHERE DATE(created_at) = target_date)
  )
  ON CONFLICT (date) DO UPDATE SET
    total_page_views = EXCLUDED.total_page_views,
    unique_visitors = EXCLUDED.unique_visitors,
    new_users = EXCLUDED.new_users,
    new_listings = EXCLUDED.new_listings,
    new_reviews = EXCLUDED.new_reviews;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to ban user
CREATE OR REPLACE FUNCTION ban_user(
  target_user_id uuid,
  ban_reason text,
  is_permanent boolean DEFAULT false,
  ban_until timestamptz DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  admin_id uuid;
BEGIN
  admin_id := auth.uid();
  
  -- Check if caller is admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = admin_id AND user_type = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can ban users';
  END IF;
  
  -- Ban the user
  UPDATE profiles
  SET is_banned = true
  WHERE id = target_user_id;
  
  -- Record the ban
  INSERT INTO user_bans (user_id, banned_by, reason, is_permanent, banned_until)
  VALUES (target_user_id, admin_id, ban_reason, is_permanent, ban_until);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to unban user
CREATE OR REPLACE FUNCTION unban_user(target_user_id uuid)
RETURNS void AS $$
DECLARE
  admin_id uuid;
BEGIN
  admin_id := auth.uid();
  
  -- Check if caller is admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = admin_id AND user_type = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can unban users';
  END IF;
  
  -- Unban the user
  UPDATE profiles
  SET is_banned = false
  WHERE id = target_user_id;
  
  -- Delete ban records
  DELETE FROM user_bans
  WHERE user_id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to delete listing (admin)
CREATE OR REPLACE FUNCTION admin_delete_listing(
  target_listing_id uuid,
  deletion_reason text
)
RETURNS void AS $$
DECLARE
  admin_id uuid;
BEGIN
  admin_id := auth.uid();
  
  -- Check if caller is admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = admin_id AND user_type = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can delete listings';
  END IF;
  
  -- Delete the listing
  DELETE FROM listings
  WHERE id = target_listing_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION aggregate_daily_stats TO authenticated;
GRANT EXECUTE ON FUNCTION ban_user TO authenticated;
GRANT EXECUTE ON FUNCTION unban_user TO authenticated;
GRANT EXECUTE ON FUNCTION admin_delete_listing TO authenticated;