/*
  # Grant analytics RPCs to authenticated role

  Migration 037 ran a blanket REVOKE on all functions from PUBLIC/anon/authenticated.
  These four analytics functions were created before that migration and lost their grants.
  The admin dashboard calls them directly from the browser as an authenticated user,
  so without EXECUTE on the authenticated role they silently fail.

  Functions affected:
  - get_revenue_analytics(p_days integer)   → Revenue (30d) card + Token Sales card
  - get_platform_insights()                 → Engagement + Messages cards
  - get_listing_performance(p_limit integer) → Top Performing Listings table
  - get_user_growth_data(p_days integer)     → available for future use

  All four are SECURITY DEFINER so they bypass RLS safely.
*/

GRANT EXECUTE ON FUNCTION get_revenue_analytics(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION get_platform_insights() TO authenticated;
GRANT EXECUTE ON FUNCTION get_listing_performance(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_growth_data(integer) TO authenticated;
