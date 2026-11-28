/*
  # Update token top-up amount to 1,500 TZS (test pricing)

  Changes the finalize_topup_credit function to validate against
  1,500 TZS instead of 30,000 TZS for test transactions.
*/

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

  IF v_topup.amount_tzs != 1500 OR v_topup.token_amount != 300 THEN
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
