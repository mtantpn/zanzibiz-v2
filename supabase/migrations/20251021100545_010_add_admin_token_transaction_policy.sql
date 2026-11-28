/*
  # Add admin token transaction policy

  1. Changes
    - Add RLS policy to allow admins to create token transactions
    - Admins can grant tokens to any business

  2. Security
    - Only users with user_type = 'admin' can create transactions
    - Admins can also view all transactions
*/

-- Allow admins to insert token transactions for any business
CREATE POLICY "Admins can create token transactions"
ON token_transactions
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.user_type = 'admin'
    )
);

-- Allow admins to view all token transactions
CREATE POLICY "Admins can view all transactions"
ON token_transactions
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.user_type = 'admin'
    )
);