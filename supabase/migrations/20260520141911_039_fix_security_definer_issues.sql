/*
  # Fix SECURITY DEFINER Issues

  ## Summary
  Addresses all flagged security advisor issues:

  1. **public_business_profiles view** — Recreated without SECURITY DEFINER so it runs
     as the calling role (SECURITY INVOKER is the default for views). The previous
     SECURITY DEFINER property allowed the view to bypass RLS, leaking rows that the
     caller should not see.

  2. **increment_view_count / increment_contact_count** — Converted from SECURITY DEFINER
     to SECURITY INVOKER. Both anon and authenticated already have table-level grants on
     listings and listing_analytics, and RLS policies govern what rows they can touch, so
     SECURITY DEFINER is unnecessary and was an unintentional privilege escalation path.

  3. **boost_listing** — Kept as SECURITY DEFINER (required for atomic cross-table token
     deduction that bypasses RLS correctly), but:
     - Revoked EXECUTE from the anon role (only authenticated users should boost listings)
     - Added an ownership check: the calling user must own the business_profile_id supplied,
       preventing one authenticated user from spending another user's tokens.
*/

-- ── 1. Fix public_business_profiles view ──────────────────────────────────────
-- Drop and recreate without SECURITY DEFINER (default is SECURITY INVOKER)
DROP VIEW IF EXISTS public.public_business_profiles;

CREATE VIEW public.public_business_profiles AS
  SELECT
    id,
    business_name,
    business_type,
    description,
    verified,
    created_at
  FROM business_profiles;

-- Grant read access to anon and authenticated (same as before)
GRANT SELECT ON public.public_business_profiles TO anon, authenticated;


-- ── 2. Fix increment_view_count — switch to SECURITY INVOKER ──────────────────
CREATE OR REPLACE FUNCTION public.increment_view_count(listing_uuid UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
  UPDATE listings
  SET view_count = view_count + 1
  WHERE id = listing_uuid;

  INSERT INTO listing_analytics (listing_id, date, views)
  VALUES (listing_uuid, CURRENT_DATE, 1)
  ON CONFLICT (listing_id, date)
  DO UPDATE SET views = listing_analytics.views + 1;
END;
$$;

-- Ensure both roles can still call it
GRANT EXECUTE ON FUNCTION public.increment_view_count(UUID) TO anon, authenticated;


-- ── 3. Fix increment_contact_count — switch to SECURITY INVOKER ───────────────
CREATE OR REPLACE FUNCTION public.increment_contact_count(listing_uuid UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
  UPDATE listings
  SET contact_count = contact_count + 1
  WHERE id = listing_uuid;

  INSERT INTO listing_analytics (listing_id, date, contacts)
  VALUES (listing_uuid, CURRENT_DATE, 1)
  ON CONFLICT (listing_id, date)
  DO UPDATE SET contacts = listing_analytics.contacts + 1;
END;
$$;

-- Ensure both roles can still call it
GRANT EXECUTE ON FUNCTION public.increment_contact_count(UUID) TO anon, authenticated;


-- ── 4. Fix boost_listing — add ownership check + revoke anon access ───────────
CREATE OR REPLACE FUNCTION public.boost_listing(
  listing_id UUID,
  business_profile_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_balance INTEGER;
  profile_owner   UUID;
BEGIN
  -- Verify the calling user owns this business profile
  SELECT user_id INTO profile_owner
  FROM business_profiles
  WHERE id = business_profile_id;

  IF profile_owner IS NULL THEN
    RAISE EXCEPTION 'Business profile not found.';
  END IF;

  IF profile_owner <> auth.uid() THEN
    RAISE EXCEPTION 'Permission denied: you do not own this business profile.';
  END IF;

  -- Get current token balance
  SELECT token_balance INTO current_balance
  FROM business_profiles
  WHERE id = business_profile_id;

  IF current_balance < 10 THEN
    RAISE EXCEPTION 'Insufficient tokens. Need 10 tokens to boost listing.';
  END IF;

  -- Deduct tokens
  UPDATE business_profiles
  SET
    token_balance      = token_balance - 10,
    total_tokens_spent = total_tokens_spent + 10
  WHERE id = business_profile_id;

  -- Update listing status and expiry
  UPDATE listings
  SET
    status          = 'boosted',
    boost_expires_at = NOW() + INTERVAL '30 days',
    updated_at      = NOW()
  WHERE id = listing_id
    AND business_profile_id = boost_listing.business_profile_id;
END;
$$;

-- Only authenticated users may boost; revoke anon access
REVOKE EXECUTE ON FUNCTION public.boost_listing(UUID, UUID) FROM anon;
GRANT  EXECUTE ON FUNCTION public.boost_listing(UUID, UUID) TO authenticated;
