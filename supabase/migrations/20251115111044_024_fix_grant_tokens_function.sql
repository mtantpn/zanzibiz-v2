/*
  # Fix Token Granting Function
  
  1. Changes
    - Create grant_tokens_to_business RPC function for admins
    - Properly updates token balance and creates transaction record
    - Includes admin permission check and audit logging
  
  2. Security
    - SECURITY DEFINER to bypass RLS
    - Admin-only access check
    - Logs action in admin_actions table
*/

-- Function to grant tokens to business
CREATE OR REPLACE FUNCTION grant_tokens_to_business(
  target_business_id uuid,
  token_amount integer,
  grant_reason text DEFAULT 'Admin grant'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_user_id uuid := auth.uid();
BEGIN
  -- Check if caller is admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = admin_user_id
    AND user_type = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can grant tokens';
  END IF;

  -- Update business token balance
  UPDATE business_profiles
  SET
    token_balance = token_balance + token_amount,
    total_tokens_purchased = total_tokens_purchased + token_amount
  WHERE id = target_business_id;

  -- Insert transaction record
  INSERT INTO token_transactions (
    business_id,
    amount,
    type,
    description,
    payment_status
  ) VALUES (
    target_business_id,
    token_amount,
    'granted',
    grant_reason,
    'completed'
  );

  -- Log admin action
  INSERT INTO admin_actions (
    admin_id,
    action_type,
    target_type,
    target_id,
    details
  ) VALUES (
    admin_user_id,
    'grant_tokens',
    'business',
    target_business_id,
    jsonb_build_object(
      'amount', token_amount,
      'reason', grant_reason
    )
  );
END;
$$;