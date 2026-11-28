/*
  # Add Token Purchase Function

  1. New Functions
    - `add_tokens_to_business` - Safely adds tokens to a business when a purchase is completed
      - Updates token_balance in business_profiles
      - Updates total_tokens_purchased
      - Creates a transaction record in token_transactions
      - Atomic operation to ensure data consistency

  2. Security
    - Function is SECURITY DEFINER to allow token balance updates
    - Only processes completed purchases
    - Prevents double-processing of the same purchase
*/

CREATE OR REPLACE FUNCTION add_tokens_to_business(
  purchase_id uuid,
  token_amount integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_business_id uuid;
  purchase_status text;
BEGIN
  SELECT business_id, payment_status
  INTO target_business_id, purchase_status
  FROM token_purchases
  WHERE id = purchase_id;

  IF target_business_id IS NULL THEN
    RAISE EXCEPTION 'Purchase not found';
  END IF;

  IF purchase_status != 'completed' THEN
    RAISE EXCEPTION 'Purchase is not completed';
  END IF;

  IF EXISTS (
    SELECT 1 FROM token_transactions
    WHERE reference_number = purchase_id::text
    AND type = 'purchase'
  ) THEN
    RAISE EXCEPTION 'Tokens already added for this purchase';
  END IF;

  UPDATE business_profiles
  SET
    token_balance = token_balance + token_amount,
    total_tokens_purchased = total_tokens_purchased + token_amount,
    updated_at = now()
  WHERE id = target_business_id;

  INSERT INTO token_transactions (
    business_id,
    amount,
    type,
    description,
    payment_status,
    reference_number
  ) VALUES (
    target_business_id,
    token_amount,
    'purchase',
    'Token purchase',
    'completed',
    purchase_id::text
  );
END;
$$;