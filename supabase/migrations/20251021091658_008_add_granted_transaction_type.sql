/*
  # Add 'granted' transaction type

  1. Changes
    - Add 'granted' value to transaction_type enum
    - This allows admins to grant tokens to businesses

  2. Purpose
    - Support admin token allocation feature
    - Track tokens given by admins separately from purchases
*/

-- Add 'granted' to the transaction_type enum
ALTER TYPE transaction_type ADD VALUE IF NOT EXISTS 'granted';