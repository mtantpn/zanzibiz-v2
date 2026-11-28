/*
  # Fix RLS Infinite Recursion

  1. Changes
    - Drop all existing policies on profiles table
    - Create simple, non-recursive policies
    - Use auth.uid() directly without subqueries
    - Public can view all profiles (for business listings)
    - Authenticated users can read and update their own profile

  2. Security
    - Still maintains security by checking auth.uid()
    - Removes circular references that caused recursion
    - Admin checks will be done at application level
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;

-- Create simple policies without recursion
CREATE POLICY "Anyone can view profiles"
  ON profiles
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);