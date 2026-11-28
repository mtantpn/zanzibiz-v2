/*
  # Revoke PUBLIC Execute Privileges on SECURITY DEFINER Functions

  ## Problem
  All functions in the public schema have an implicit grant to the PUBLIC role
  (shown as `=X/postgres` in pg_proc.proacl). This means every role — including
  `anon` — inherits EXECUTE even after explicit per-role REVOKEs, because
  PostgreSQL privilege resolution checks PUBLIC grants as a fallback.

  ## Fix
  1. REVOKE EXECUTE FROM PUBLIC on every sensitive function.
  2. Re-GRANT only to the roles that legitimately need it:
     - increment_view_count, increment_contact_count → anon + authenticated
       (anonymous visitors and logged-in users trigger these by browsing listings)
     - boost_listing → authenticated only
       (business owners call this from their dashboard)
     - All admin, analytics, payment, and internal trigger functions →
       no grant to anon/authenticated; service_role already has access

  ## Functions affected (PUBLIC grant removed)
  - add_tokens_to_business
  - admin_create_user
  - admin_delete_listing
  - aggregate_daily_stats
  - assign_client_id_trigger
  - ban_user
  - boost_listing
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
  - increment_contact_count
  - increment_view_count
  - send_welcome_email_trigger
  - simulate_token_purchase
  - unban_user
*/

-- ============================================================
-- Revoke from PUBLIC (the root cause — PUBLIC grant overrides
-- all explicit per-role revokes)
-- ============================================================
REVOKE EXECUTE ON FUNCTION public.add_tokens_to_business(uuid, integer) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_create_user(text, text, text, text, text, integer) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_delete_listing(uuid, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.aggregate_daily_stats(date) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.assign_client_id_trigger() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.ban_user(uuid, text, boolean, timestamptz) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.boost_listing(uuid, uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.change_user_type(uuid, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.finalize_credit_topup(text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.finalize_topup_credit(text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.generate_business_identifier() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.generate_client_id() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_listing_performance(integer) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_platform_insights() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_revenue_analytics(integer) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_user_growth_data(integer) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.grant_tokens_to_business(uuid, integer, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.increment_contact_count(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.increment_view_count(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.send_welcome_email_trigger() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.simulate_token_purchase(uuid, integer, text, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.unban_user(uuid) FROM PUBLIC;

-- Also explicitly revoke from anon and authenticated on all
REVOKE EXECUTE ON FUNCTION public.add_tokens_to_business(uuid, integer) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.admin_create_user(text, text, text, text, text, integer) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.admin_delete_listing(uuid, text) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.aggregate_daily_stats(date) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.assign_client_id_trigger() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.ban_user(uuid, text, boolean, timestamptz) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.boost_listing(uuid, uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.change_user_type(uuid, text) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.finalize_credit_topup(text) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.finalize_topup_credit(text) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.generate_business_identifier() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.generate_client_id() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_listing_performance(integer) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_platform_insights() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_revenue_analytics(integer) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_user_growth_data(integer) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.grant_tokens_to_business(uuid, integer, text) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.increment_contact_count(uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.increment_view_count(uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.send_welcome_email_trigger() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.simulate_token_purchase(uuid, integer, text, text) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.unban_user(uuid) FROM anon, authenticated;

-- ============================================================
-- Re-grant only what is legitimately needed by clients
-- ============================================================

-- Anonymous browsing triggers view/contact analytics
GRANT EXECUTE ON FUNCTION public.increment_view_count(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_contact_count(uuid) TO anon, authenticated;

-- Business dashboard: authenticated users boost their own listings
GRANT EXECUTE ON FUNCTION public.boost_listing(uuid, uuid) TO authenticated;

-- Also update default privileges so future recreations of these functions
-- do not automatically re-grant to PUBLIC
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE EXECUTE ON FUNCTIONS FROM anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE EXECUTE ON FUNCTIONS FROM authenticated;
