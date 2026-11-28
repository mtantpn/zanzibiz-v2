/*
  # Comprehensive auth flow fix — correct function signatures

  ## Problems
  1. is_admin() has EXECUTE revoked from authenticated (migration 037 blanket-revoked
     all functions; migration 040 created is_admin() after that, so no grant exists).
     → "permission denied for function is_admin" on every login attempt.

  2. business_profiles admin SELECT/UPDATE policies use inline EXISTS (SELECT FROM profiles)
     subqueries, which risk the same recursion issue we fixed on profiles in migration 040.

  3. increment_view_count / increment_contact_count are SECURITY INVOKER (not DEFINER)
     and need explicit grants to work for anonymous visitors calling them.

  ## Fixes applied
  1. GRANT EXECUTE on is_admin() to authenticated.
  2. Rebuild business_profiles admin policies using is_admin().
  3. Confirm grants on the two counter functions.
  4. Confirm grant on boost_listing for authenticated users.
*/

-- ─── 1. Grant is_admin() to authenticated role ────────────────────────────────
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;

-- ─── 2. Fix business_profiles admin policies ─────────────────────────────────
DROP POLICY IF EXISTS "Admins can view all business profiles" ON business_profiles;
DROP POLICY IF EXISTS "Admins can update any business profile" ON business_profiles;
DROP POLICY IF EXISTS "Admins can manage all business profiles" ON business_profiles;

CREATE POLICY "Admins can view all business profiles"
  ON business_profiles FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can update any business profile"
  ON business_profiles FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ─── 3. Ensure counter functions have grants ─────────────────────────────────
GRANT EXECUTE ON FUNCTION increment_view_count(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION increment_contact_count(uuid) TO anon, authenticated;

-- ─── 4. Ensure boost_listing grant for authenticated users ───────────────────
GRANT EXECUTE ON FUNCTION boost_listing(uuid, uuid) TO authenticated;

-- ─── 5. Harden handle_new_user — no end-user should call it directly ─────────
REVOKE EXECUTE ON FUNCTION handle_new_user() FROM anon, authenticated;
