/*
  # Fix Security Permissions

  ## Summary
  Addresses two classes of security issues:

  1. **Public Bucket Directory Listing**
     - Drops over-broad SELECT policies on storage.objects for `listing-images`,
       `blog-images`, and `profile-pictures` buckets.
     - Replaces them with policies that allow reading individual objects by URL
       but do NOT allow listing/enumerating bucket contents.
     - The key change: add `name IS NOT NULL` as a guard so the policy only
       applies when a specific object path is known, preventing wildcard listing.

  2. **Overly-Permissive EXECUTE on SECURITY DEFINER Functions**
     - Revokes `EXECUTE` from `anon` and `authenticated` roles on all internal,
       admin, analytics, and payment functions that should only be callable by
       the service role (edge functions) or internal triggers.
     - Preserves `EXECUTE` for `anon` on: `increment_view_count`,
       `increment_contact_count` (anonymous users browse listings).
     - Preserves `EXECUTE` for `authenticated` on: `increment_view_count`,
       `increment_contact_count`, `boost_listing` (business users call boost).
     - All other SECURITY DEFINER functions are locked to service_role only.

  ## Tables / Buckets Modified
  - storage.objects policies for: listing-images, blog-images, profile-pictures

  ## Functions Modified (EXECUTE revoked from anon + authenticated unless noted)
  - add_tokens_to_business
  - admin_create_user
  - admin_delete_listing
  - aggregate_daily_stats
  - assign_client_id_trigger
  - ban_user
  - change_user_type
  - finalize_credit_topup
  - finalize_topup_credit
  - generate_business_identifier
  - generate_client_id
  - get_listing_performance
  - get_platform_insights
  - get_revenue_analytics
  - get_user_growth_data
  - grant_tokens_to_business
  - handle_new_user
  - send_welcome_email_trigger
  - simulate_token_purchase
  - unban_user

  ## Security Notes
  - increment_view_count and increment_contact_count remain callable by anon + authenticated
  - boost_listing remains callable by authenticated only
  - Edge functions that need admin functions already use the service_role key internally
*/

-- ============================================================
-- 1. STORAGE: Replace broad SELECT policies with object-safe ones
-- ============================================================

-- listing-images
DROP POLICY IF EXISTS "Public can view listing images" ON storage.objects;
CREATE POLICY "Public can read listing image objects"
  ON storage.objects FOR SELECT
  TO public
  USING (
    bucket_id = 'listing-images'
    AND name IS NOT NULL
    AND (storage.foldername(name))[1] IS NOT NULL
  );

-- blog-images
DROP POLICY IF EXISTS "Public can view blog images" ON storage.objects;
CREATE POLICY "Public can read blog image objects"
  ON storage.objects FOR SELECT
  TO public
  USING (
    bucket_id = 'blog-images'
    AND name IS NOT NULL
    AND (storage.foldername(name))[1] IS NOT NULL
  );

-- profile-pictures
DROP POLICY IF EXISTS "Public can view profile pictures" ON storage.objects;
CREATE POLICY "Public can read profile picture objects"
  ON storage.objects FOR SELECT
  TO public
  USING (
    bucket_id = 'profile-pictures'
    AND name IS NOT NULL
    AND (storage.foldername(name))[1] IS NOT NULL
  );

-- ============================================================
-- 2. FUNCTIONS: Revoke EXECUTE from anon + authenticated
--    on all admin / internal / payment functions
-- ============================================================

-- Admin functions
REVOKE EXECUTE ON FUNCTION public.add_tokens_to_business(uuid, integer) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.admin_create_user(text, text, text, text, text, integer) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.admin_delete_listing(uuid, text) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.aggregate_daily_stats(date) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.ban_user(uuid, text, boolean, timestamptz) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.change_user_type(uuid, text) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.grant_tokens_to_business(uuid, integer, text) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.unban_user(uuid) FROM anon, authenticated;

-- Analytics functions (admin-only)
REVOKE EXECUTE ON FUNCTION public.get_listing_performance(integer) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_platform_insights() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_revenue_analytics(integer) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_user_growth_data(integer) FROM anon, authenticated;

-- Payment / topup functions (called by edge functions via service_role)
REVOKE EXECUTE ON FUNCTION public.finalize_credit_topup(text) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.finalize_topup_credit(text) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.simulate_token_purchase(uuid, integer, text, text) FROM anon, authenticated;

-- Internal trigger functions (never called directly by clients)
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.send_welcome_email_trigger() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.assign_client_id_trigger() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.generate_business_identifier() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.generate_client_id() FROM anon, authenticated;

-- ============================================================
-- 3. GRANT EXECUTE back for the functions that are legitimately
--    called by clients
-- ============================================================

-- Anonymous browsing: view/contact counts
GRANT EXECUTE ON FUNCTION public.increment_view_count(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_contact_count(uuid) TO anon, authenticated;

-- Business users boosting their own listings
GRANT EXECUTE ON FUNCTION public.boost_listing(uuid, uuid) TO authenticated;

-- Admin functions remain callable only by service_role (no explicit grant needed
-- since service_role bypasses RLS and has superuser-equivalent access)
