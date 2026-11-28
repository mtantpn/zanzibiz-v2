/*
  # Add admin business profile update policy

  1. Changes
    - Add RLS policy to allow admins to update business profiles
    - Enables admin token allocation feature

  2. Security
    - Only users with user_type = 'admin' can update any business profile
    - Required for granting tokens to businesses
*/

-- Allow admins to update any business profile
CREATE POLICY "Admins can update any business profile"
ON business_profiles
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.user_type = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.user_type = 'admin'
    )
);