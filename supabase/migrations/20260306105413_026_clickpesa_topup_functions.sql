/*
  # ClickPesa Top-up System - Functions and Indexes

  Adds the finalize_topup_credit function, indexes, and ensures tables are correctly configured.
  Safe to run on existing tables — uses IF NOT EXISTS and OR REPLACE.
*/

-- Ensure token_topups status constraint exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'token_topups' AND constraint_name = 'token_topups_status_check'
  ) THEN
    ALTER TABLE token_topups ADD CONSTRAINT token_topups_status_check CHECK (
      status IN (
        'CREATED','PENDING_PAYMENT','PROCESSING',
        'SUCCESS','SETTLED','FAILED',
        'ON_HOLD','REFUNDED','REVERSED','EXPIRED'
      )
    );
  END IF;
END $$;

-- Ensure token_ledger unique constraint on topup_reference
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'token_ledger' AND constraint_name = 'token_ledger_topup_ref_unique'
  ) THEN
    ALTER TABLE token_ledger ADD CONSTRAINT token_ledger_topup_ref_unique UNIQUE (topup_reference);
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_token_topups_business_id ON token_topups(business_id);
CREATE INDEX IF NOT EXISTS idx_token_topups_client_id ON token_topups(client_id);
CREATE INDEX IF NOT EXISTS idx_token_topups_topup_reference ON token_topups(topup_reference);
CREATE INDEX IF NOT EXISTS idx_token_topups_clickpesa_order_ref ON token_topups(clickpesa_order_reference);
CREATE INDEX IF NOT EXISTS idx_token_topups_status ON token_topups(status);
CREATE INDEX IF NOT EXISTS idx_token_topups_credited ON token_topups(credited);
CREATE INDEX IF NOT EXISTS idx_token_ledger_business_id ON token_ledger(business_id);
CREATE INDEX IF NOT EXISTS idx_token_ledger_topup_reference ON token_ledger(topup_reference);
CREATE INDEX IF NOT EXISTS idx_payment_events_topup_reference ON payment_events(topup_reference);
CREATE INDEX IF NOT EXISTS idx_payment_events_created_at ON payment_events(created_at DESC);

-- Populate wallet from existing business_profiles balances
INSERT INTO business_wallets (business_id, token_balance, updated_at)
SELECT id, COALESCE(token_balance, 0), COALESCE(updated_at, now())
FROM business_profiles
ON CONFLICT (business_id) DO NOTHING;

-- ============================================================
-- finalize_topup_credit: Atomic, idempotent token crediting
-- ============================================================
CREATE OR REPLACE FUNCTION finalize_topup_credit(p_topup_reference text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_topup token_topups%ROWTYPE;
BEGIN
  SELECT * INTO v_topup
  FROM token_topups
  WHERE topup_reference = p_topup_reference
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Top-up order not found');
  END IF;

  IF v_topup.credited THEN
    RETURN jsonb_build_object(
      'success', true, 'already_credited', true, 'tokens_added', 0,
      'message', 'Tokens already credited for this top-up'
    );
  END IF;

  IF v_topup.status NOT IN ('SUCCESS', 'SETTLED') THEN
    RETURN jsonb_build_object(
      'success', false, 'error', 'Payment not in a verified success state',
      'current_status', v_topup.status
    );
  END IF;

  IF v_topup.amount_tzs != 30000 OR v_topup.token_amount != 300 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Amount integrity check failed');
  END IF;

  BEGIN
    INSERT INTO token_ledger (business_id, topup_reference, delta_tokens, reason)
    VALUES (
      v_topup.business_id,
      p_topup_reference,
      v_topup.token_amount,
      'ClickPesa top-up ' || p_topup_reference
    );
  EXCEPTION WHEN unique_violation THEN
    RETURN jsonb_build_object(
      'success', true, 'already_credited', true, 'tokens_added', 0,
      'message', 'Duplicate blocked by ledger constraint'
    );
  END;

  UPDATE business_profiles
  SET
    token_balance = token_balance + v_topup.token_amount,
    total_tokens_purchased = COALESCE(total_tokens_purchased, 0) + v_topup.token_amount,
    updated_at = now()
  WHERE id = v_topup.business_id;

  INSERT INTO business_wallets (business_id, token_balance, updated_at)
  VALUES (v_topup.business_id, v_topup.token_amount, now())
  ON CONFLICT (business_id) DO UPDATE
    SET
      token_balance = business_wallets.token_balance + v_topup.token_amount,
      updated_at = now();

  UPDATE token_topups
  SET credited = true, credited_at = now(), updated_at = now()
  WHERE topup_reference = p_topup_reference;

  RETURN jsonb_build_object(
    'success', true,
    'credited', true,
    'tokens_added', v_topup.token_amount,
    'business_id', v_topup.business_id::text,
    'topup_reference', p_topup_reference
  );
END;
$$;
