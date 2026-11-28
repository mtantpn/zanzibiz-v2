/*
  # Fix Security and Performance Issues

  ## Changes

  ### 1. Add Missing Indexes
  - Add index on blog_posts.created_by (foreign key without index)

  ### 2. Optimize RLS Policies
  - Wrap auth.uid() calls in SELECT for better performance
  - Affects multiple tables: business_profiles, listings, token_transactions, blog_posts, etc.

  ### 3. Remove Duplicate Indexes
  - Drop duplicate indexes to reduce overhead

  ### 4. Remove Unused Indexes
  - Drop indexes that are not being used based on query patterns

  ### 5. Consolidate Multiple Permissive Policies
  - Remove duplicate policies where multiple permissive policies exist

  ### 6. Fix Function Security
  - Set proper search_path for functions to prevent security issues

  ### 7. Fix Insecure RLS Policy
  - Fix page_views policy that allows unrestricted access
*/

-- ============================================================================
-- 1. ADD MISSING INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_blog_posts_created_by ON blog_posts(created_by);

-- ============================================================================
-- 2. REMOVE DUPLICATE INDEXES
-- ============================================================================

DROP INDEX IF EXISTS idx_payment_events_topup_ref;
DROP INDEX IF EXISTS idx_token_ledger_topup_ref;
DROP INDEX IF EXISTS idx_token_topups_clickpesa_order;

-- ============================================================================
-- 3. REMOVE UNUSED INDEXES
-- ============================================================================

DROP INDEX IF EXISTS idx_reviews_user_id;
DROP INDEX IF EXISTS idx_favorites_listing_id;
DROP INDEX IF EXISTS idx_messages_recipient_id;
DROP INDEX IF EXISTS idx_messages_listing_id;
DROP INDEX IF EXISTS idx_messages_sender_id;
DROP INDEX IF EXISTS idx_analytics_listing_date;
DROP INDEX IF EXISTS idx_token_transactions_business_id;
DROP INDEX IF EXISTS idx_page_views_session;
DROP INDEX IF EXISTS idx_page_views_user_id;
DROP INDEX IF EXISTS idx_user_bans_user_id;
DROP INDEX IF EXISTS idx_user_bans_banned_by;
DROP INDEX IF EXISTS idx_token_purchases_business_id;
DROP INDEX IF EXISTS idx_token_purchases_status;
DROP INDEX IF EXISTS idx_token_purchases_created_at;
DROP INDEX IF EXISTS idx_token_topups_business_id;
DROP INDEX IF EXISTS idx_token_topups_client_id;
DROP INDEX IF EXISTS idx_token_topups_status;
DROP INDEX IF EXISTS idx_token_topups_credited;
DROP INDEX IF EXISTS idx_token_ledger_business_id;
DROP INDEX IF EXISTS idx_payment_events_created_at;
DROP INDEX IF EXISTS idx_orders_user_id;
DROP INDEX IF EXISTS idx_orders_business_id;
DROP INDEX IF EXISTS idx_orders_status;

-- ============================================================================
-- 4. CONSOLIDATE AND OPTIMIZE RLS POLICIES
-- ============================================================================

-- BLOG_POSTS: Remove duplicate SELECT policy
DROP POLICY IF EXISTS "Admins can view all blog posts" ON blog_posts;

-- Recreate admin policies with optimized auth checks
DROP POLICY IF EXISTS "Admins can create blog posts" ON blog_posts;
CREATE POLICY "Admins can create blog posts" ON blog_posts
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = (SELECT auth.uid()) 
      AND user_type = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can update blog posts" ON blog_posts;
CREATE POLICY "Admins can update blog posts" ON blog_posts
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = (SELECT auth.uid()) 
      AND user_type = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can delete blog posts" ON blog_posts;
CREATE POLICY "Admins can delete blog posts" ON blog_posts
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = (SELECT auth.uid()) 
      AND user_type = 'admin'
    )
  );

-- BUSINESS_PROFILES: Remove duplicate policies and optimize
DROP POLICY IF EXISTS "Anyone can view business profiles" ON business_profiles;

DROP POLICY IF EXISTS "Admins can update any business profile" ON business_profiles;
CREATE POLICY "Admins can update any business profile" ON business_profiles
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = (SELECT auth.uid()) 
      AND user_type = 'admin'
    )
  );

-- LISTINGS: Remove duplicate SELECT policy
DROP POLICY IF EXISTS "Users can view listings" ON listings;

-- REVIEWS: Remove duplicate SELECT policy
DROP POLICY IF EXISTS "Anyone can view reviews" ON reviews;

-- TOKEN_TRANSACTIONS: Optimize admin policy
DROP POLICY IF EXISTS "Admins can create token transactions" ON token_transactions;
CREATE POLICY "Admins can create token transactions" ON token_transactions
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = (SELECT auth.uid()) 
      AND user_type = 'admin'
    )
  );

-- BUSINESS_WALLETS: Optimize policy
DROP POLICY IF EXISTS "Business owners can view own wallet" ON business_wallets;
CREATE POLICY "Business owners can view own wallet" ON business_wallets
  FOR SELECT TO authenticated
  USING (business_id IN (
    SELECT id FROM business_profiles 
    WHERE user_id = (SELECT auth.uid())
  ));

-- TOKEN_TOPUPS: Consolidate policies
DROP POLICY IF EXISTS "Admins can view all topups" ON token_topups;
DROP POLICY IF EXISTS "Business owners can view own topups" ON token_topups;
CREATE POLICY "Business owners can view own topups" ON token_topups
  FOR SELECT TO authenticated
  USING (
    business_id IN (
      SELECT id FROM business_profiles 
      WHERE user_id = (SELECT auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = (SELECT auth.uid()) 
      AND user_type = 'admin'
    )
  );

-- TOKEN_LEDGER: Consolidate policies
DROP POLICY IF EXISTS "Admins can view all ledger" ON token_ledger;
DROP POLICY IF EXISTS "Business owners can view own ledger" ON token_ledger;
CREATE POLICY "Users can view relevant ledger entries" ON token_ledger
  FOR SELECT TO authenticated
  USING (
    business_id IN (
      SELECT id FROM business_profiles 
      WHERE user_id = (SELECT auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = (SELECT auth.uid()) 
      AND user_type = 'admin'
    )
  );

-- PAYMENT_EVENTS: Optimize policy
DROP POLICY IF EXISTS "Admins can view all payment events" ON payment_events;
CREATE POLICY "Admins can view all payment events" ON payment_events
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = (SELECT auth.uid()) 
      AND user_type = 'admin'
    )
  );

-- ORDERS: Optimize policy
DROP POLICY IF EXISTS "Users can read own orders" ON orders;
CREATE POLICY "Users can read own orders" ON orders
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- PAGE_VIEWS: Fix insecure policy
DROP POLICY IF EXISTS "Anyone can insert page views" ON page_views;
CREATE POLICY "Authenticated users can insert page views" ON page_views
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()) OR user_id IS NULL);

CREATE POLICY "Anonymous page view tracking" ON page_views
  FOR INSERT TO anon
  WITH CHECK (user_id IS NULL);

-- ============================================================================
-- 5. FIX FUNCTION SECURITY
-- ============================================================================

-- Drop and recreate functions with proper search_path

DROP FUNCTION IF EXISTS generate_client_id() CASCADE;
CREATE FUNCTION generate_client_id()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id text;
  done bool;
BEGIN
  done := false;
  WHILE NOT done LOOP
    new_id := 'CL' || lpad(floor(random() * 100000000)::text, 8, '0');
    done := NOT EXISTS(SELECT 1 FROM business_profiles WHERE client_id = new_id);
  END LOOP;
  RETURN new_id;
END;
$$;

DROP FUNCTION IF EXISTS assign_client_id_trigger() CASCADE;
CREATE FUNCTION assign_client_id_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.client_id IS NULL THEN
    NEW.client_id := generate_client_id();
  END IF;
  RETURN NEW;
END;
$$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS assign_business_client_id ON business_profiles;
CREATE TRIGGER assign_business_client_id
  BEFORE INSERT ON business_profiles
  FOR EACH ROW
  EXECUTE FUNCTION assign_client_id_trigger();

DROP FUNCTION IF EXISTS grant_tokens_to_business(uuid, integer, text);
CREATE FUNCTION grant_tokens_to_business(
  target_business_id uuid,
  token_amount integer,
  grant_reason text DEFAULT 'Admin grant'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO token_transactions (business_id, amount, transaction_type, description)
  VALUES (target_business_id, token_amount, 'granted', grant_reason);
END;
$$;

DROP FUNCTION IF EXISTS finalize_credit_topup(text);
CREATE FUNCTION finalize_credit_topup(
  p_topup_reference text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_topup record;
  v_clickpesa_ref text;
BEGIN
  SELECT * INTO v_topup
  FROM token_topups
  WHERE topup_reference = p_topup_reference
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Topup not found');
  END IF;

  IF v_topup.status = 'completed' AND v_topup.credited = true THEN
    RETURN json_build_object('success', false, 'error', 'Topup already credited');
  END IF;

  v_clickpesa_ref := v_topup.clickpesa_order_ref;

  UPDATE token_topups
  SET 
    status = 'completed',
    credited = true,
    updated_at = now()
  WHERE topup_reference = p_topup_reference;

  INSERT INTO token_ledger (
    business_id,
    amount,
    transaction_type,
    description,
    topup_reference
  ) VALUES (
    v_topup.business_id,
    v_topup.tokens_to_credit,
    'topup',
    'Token topup via ClickPesa - ' || COALESCE(v_clickpesa_ref, p_topup_reference),
    p_topup_reference
  );

  RETURN json_build_object(
    'success', true,
    'business_id', v_topup.business_id,
    'tokens_credited', v_topup.tokens_to_credit
  );
END;
$$;

DROP FUNCTION IF EXISTS boost_listing(uuid, uuid);
CREATE FUNCTION boost_listing(
  listing_id uuid, 
  business_profile_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_balance integer;
  boost_cost integer := 10;
BEGIN
  SELECT balance INTO current_balance
  FROM business_profiles
  WHERE id = business_profile_id;

  IF current_balance < boost_cost THEN
    RAISE EXCEPTION 'Insufficient tokens. Required: %, Available: %', boost_cost, current_balance;
  END IF;

  UPDATE listings
  SET 
    boosted_until = NOW() + INTERVAL '7 days',
    updated_at = NOW()
  WHERE id = listing_id AND business_profile_id = business_profile_id;

  INSERT INTO token_transactions (business_id, amount, transaction_type, description)
  VALUES (business_profile_id, -boost_cost, 'boost', 'Boosted listing for 7 days');
END;
$$;
