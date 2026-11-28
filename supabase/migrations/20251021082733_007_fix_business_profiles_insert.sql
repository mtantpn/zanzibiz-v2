/*
  # Fix Business Profiles RLS - Add Insert Policy

  1. Changes
    - Add INSERT policy for business_profiles table
    - Allow authenticated users to create their own business profile

  2. Security
    - Users can only insert their own business profile (user_id = auth.uid())
    - Maintains existing SELECT and UPDATE policies
*/

-- Add INSERT policy
CREATE POLICY "Users can create own business profile"
  ON business_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());