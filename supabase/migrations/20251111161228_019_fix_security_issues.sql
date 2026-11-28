/*
  # Fix Security and Performance Issues

  1. Changes
    - Add missing indexes for foreign keys
    - Optimize RLS policies to use (SELECT auth.uid()) pattern
    - Fix function search paths for security
    - Remove duplicate permissive policies
    
  2. Performance
    - Improves query performance with proper indexing
    - Reduces RLS policy overhead with subquery pattern
    
  3. Security
    - Sets immutable search paths on functions
    - Consolidates permissive policies
*/

-- ================================================
-- PART 1: Add Missing Indexes for Foreign Keys
-- ================================================

-- Messages table indexes
CREATE INDEX IF NOT EXISTS idx_messages_listing_id ON messages(listing_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);

-- Token transactions table index
CREATE INDEX IF NOT EXISTS idx_token_transactions_business_id ON token_transactions(business_id);

-- User bans table index
CREATE INDEX IF NOT EXISTS idx_user_bans_banned_by ON user_bans(banned_by);

-- ================================================
-- PART 2: Optimize RLS Policies - Listings Table
-- ================================================

-- Drop existing policies and recreate with optimized pattern
DROP POLICY IF EXISTS "Business owners can create listings" ON listings;
DROP POLICY IF EXISTS "Business owners can update own listings" ON listings;
DROP POLICY IF EXISTS "Business owners can delete own listings" ON listings;
DROP POLICY IF EXISTS "Business owners can view own listings" ON listings;
DROP POLICY IF EXISTS "Anyone can view active listings" ON listings;

-- Recreate with optimized (SELECT auth.uid()) pattern
CREATE POLICY "Business owners can create listings"
  ON listings FOR INSERT
  TO authenticated
  WITH CHECK (
    business_id IN (
      SELECT id FROM business_profiles 
      WHERE user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Business owners can update own listings"
  ON listings FOR UPDATE
  TO authenticated
  USING (
    business_id IN (
      SELECT id FROM business_profiles 
      WHERE user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Business owners can delete own listings"
  ON listings FOR DELETE
  TO authenticated
  USING (
    business_id IN (
      SELECT id FROM business_profiles 
      WHERE user_id = (SELECT auth.uid())
    )
  );

-- Consolidate SELECT policies into one
CREATE POLICY "Users can view listings"
  ON listings FOR SELECT
  TO authenticated
  USING (
    status = 'active' OR
    business_id IN (
      SELECT id FROM business_profiles 
      WHERE user_id = (SELECT auth.uid())
    )
  );

-- ================================================
-- PART 3: Optimize RLS Policies - Reviews Table
-- ================================================

DROP POLICY IF EXISTS "Authenticated users can create reviews" ON reviews;
DROP POLICY IF EXISTS "Users can update own reviews" ON reviews;
DROP POLICY IF EXISTS "Users can delete own reviews" ON reviews;

CREATE POLICY "Authenticated users can create reviews"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own reviews"
  ON reviews FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete own reviews"
  ON reviews FOR DELETE
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- ================================================
-- PART 4: Optimize RLS Policies - Favorites Table
-- ================================================

DROP POLICY IF EXISTS "Users can create own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can view own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can delete own favorites" ON favorites;

CREATE POLICY "Users can create own favorites"
  ON favorites FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can view own favorites"
  ON favorites FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete own favorites"
  ON favorites FOR DELETE
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- ================================================
-- PART 5: Optimize RLS Policies - Messages Table
-- ================================================

DROP POLICY IF EXISTS "Users can create messages" ON messages;
DROP POLICY IF EXISTS "Users can view own messages" ON messages;
DROP POLICY IF EXISTS "Recipients can update message read status" ON messages;

CREATE POLICY "Users can create messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (sender_id = (SELECT auth.uid()));

CREATE POLICY "Users can view own messages"
  ON messages FOR SELECT
  TO authenticated
  USING (
    sender_id = (SELECT auth.uid()) OR 
    recipient_id = (SELECT auth.uid())
  );

CREATE POLICY "Recipients can update message read status"
  ON messages FOR UPDATE
  TO authenticated
  USING (recipient_id = (SELECT auth.uid()));

-- ================================================
-- PART 6: Optimize RLS Policies - Other Tables
-- ================================================

-- Listing Analytics
DROP POLICY IF EXISTS "Business owners can view own analytics" ON listing_analytics;
CREATE POLICY "Business owners can view own analytics"
  ON listing_analytics FOR SELECT
  TO authenticated
  USING (
    listing_id IN (
      SELECT l.id FROM listings l
      JOIN business_profiles bp ON l.business_id = bp.id
      WHERE bp.user_id = (SELECT auth.uid())
    )
  );

-- Business Profiles
DROP POLICY IF EXISTS "Business owners can create own profile" ON business_profiles;
DROP POLICY IF EXISTS "Business owners can update own profile" ON business_profiles;

CREATE POLICY "Business owners can create own profile"
  ON business_profiles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Business owners can update own profile"
  ON business_profiles FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- Token Transactions
DROP POLICY IF EXISTS "Business owners can create transactions" ON token_transactions;
DROP POLICY IF EXISTS "Business owners can view own transactions" ON token_transactions;

CREATE POLICY "Business owners can create transactions"
  ON token_transactions FOR INSERT
  TO authenticated
  WITH CHECK (
    business_id IN (
      SELECT id FROM business_profiles 
      WHERE user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Business owners can view own transactions"
  ON token_transactions FOR SELECT
  TO authenticated
  USING (
    business_id IN (
      SELECT id FROM business_profiles 
      WHERE user_id = (SELECT auth.uid())
    )
  );

-- Profiles
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = (SELECT auth.uid()));

-- Page Views
DROP POLICY IF EXISTS "Admins can view page views" ON page_views;
CREATE POLICY "Admins can view page views"
  ON page_views FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = (SELECT auth.uid()) AND user_type = 'admin'
    )
  );

-- Daily Stats
DROP POLICY IF EXISTS "Admins can view daily stats" ON daily_stats;
CREATE POLICY "Admins can view daily stats"
  ON daily_stats FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = (SELECT auth.uid()) AND user_type = 'admin'
    )
  );

-- User Bans - Consolidate duplicate policies
DROP POLICY IF EXISTS "Admins can view user bans" ON user_bans;
DROP POLICY IF EXISTS "Admins can manage user bans" ON user_bans;

CREATE POLICY "Admins can manage user bans"
  ON user_bans FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = (SELECT auth.uid()) AND user_type = 'admin'
    )
  );

-- Token Purchases
DROP POLICY IF EXISTS "Business owners can create purchases" ON token_purchases;
DROP POLICY IF EXISTS "Business owners can view own purchases" ON token_purchases;
DROP POLICY IF EXISTS "Business owners can update own purchases" ON token_purchases;

CREATE POLICY "Business owners can create purchases"
  ON token_purchases FOR INSERT
  TO authenticated
  WITH CHECK (
    business_id IN (
      SELECT id FROM business_profiles 
      WHERE user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Business owners can view own purchases"
  ON token_purchases FOR SELECT
  TO authenticated
  USING (
    business_id IN (
      SELECT id FROM business_profiles 
      WHERE user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Business owners can update own purchases"
  ON token_purchases FOR UPDATE
  TO authenticated
  USING (
    business_id IN (
      SELECT id FROM business_profiles 
      WHERE user_id = (SELECT auth.uid())
    )
  );

-- ================================================
-- PART 7: Fix Function Search Paths
-- ================================================

-- Update all functions to have immutable search paths
ALTER FUNCTION update_updated_at_column() SET search_path = public, pg_temp;
ALTER FUNCTION increment_view_count(uuid) SET search_path = public, pg_temp;
ALTER FUNCTION increment_contact_count(uuid) SET search_path = public, pg_temp;
ALTER FUNCTION get_listing_average_rating(uuid) SET search_path = public, pg_temp;
ALTER FUNCTION get_listing_review_count(uuid) SET search_path = public, pg_temp;
ALTER FUNCTION generate_business_identifier() SET search_path = public, pg_temp;
ALTER FUNCTION simulate_token_purchase(uuid, integer, text, text) SET search_path = public, pg_temp;
ALTER FUNCTION set_business_identifier() SET search_path = public, pg_temp;
ALTER FUNCTION add_tokens_to_business(uuid, integer) SET search_path = public, pg_temp;
ALTER FUNCTION ban_user(uuid, text, boolean, timestamptz) SET search_path = public, pg_temp;
ALTER FUNCTION unban_user(uuid) SET search_path = public, pg_temp;
ALTER FUNCTION admin_delete_listing(uuid, text) SET search_path = public, pg_temp;
ALTER FUNCTION aggregate_daily_stats(date) SET search_path = public, pg_temp;
ALTER FUNCTION change_user_type(uuid, text) SET search_path = public, pg_temp;
