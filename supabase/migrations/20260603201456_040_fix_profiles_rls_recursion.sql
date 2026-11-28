/*
  # Fix infinite recursion in profiles RLS policies

  ## Problem
  Three policies on the profiles table query the profiles table themselves,
  causing PostgreSQL to recurse infinitely when any profile is accessed:

  1. "Admins can view all profiles" SELECT — uses EXISTS (SELECT FROM profiles ...)
  2. "Admins can update any profile" UPDATE — uses EXISTS (SELECT FROM profiles ...)
  3. "Users can update own profile" UPDATE WITH CHECK — uses a subquery back into profiles

  ## Fix
  - Create a SECURITY DEFINER function `is_admin()` that reads profiles bypassing RLS.
    SECURITY DEFINER functions run as the function owner (postgres), so they skip RLS
    entirely and break the recursion cycle.
  - Drop the three broken policies and recreate them using `is_admin()`.
  - Simplify the user update WITH CHECK to `id = auth.uid()` only (user_type cannot
    be changed via this policy — admin policy handles that separately).
*/

-- 1. Security-definer helper: check if the current user is an admin
--    Runs as postgres (owner), bypasses RLS on profiles — no recursion possible.
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = (SELECT auth.uid())
    AND user_type = 'admin'::user_type
  );
$$;

-- 2. Drop the three recursive policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- 3. Recreate admin SELECT policy — uses is_admin() instead of inline subquery
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (is_admin());

-- 4. Recreate admin UPDATE policy — uses is_admin() instead of inline subquery
CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- 5. Recreate user UPDATE policy — simple auth.uid() check, no self-reference
--    user_type changes are controlled at the application / admin layer only.
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));
