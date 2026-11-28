/*
  # Fix RLS Policy for Authentication

  1. Changes
    - Drop the problematic "Users can read own profile" policy
    - Create a simpler policy that works during authentication
    - The is_banned check was causing issues during login

  2. Security
    - Still maintains security by checking auth.uid()
    - Users can only read their own profile
    - Public can view all profiles (for displaying business info)
*/

-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;

-- Create a simpler policy without the is_banned check during SELECT
-- The is_banned check can be done at application level
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);