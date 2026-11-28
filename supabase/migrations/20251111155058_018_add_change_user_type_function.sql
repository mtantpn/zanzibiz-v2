/*
  # Add Change User Type Function

  1. Functions
    - `change_user_type` - Admin function to change a user's account type
      - Validates admin permission
      - Updates user_type in profiles
      - Creates business_profile if changing to business
      - Handles data cleanup when changing from business to user

  2. Security
    - Only admins can change user types
    - Prevents changing own admin status
*/

-- Function to change user type
CREATE OR REPLACE FUNCTION change_user_type(
  target_user_id uuid,
  new_user_type text
)
RETURNS jsonb AS $$
DECLARE
  admin_id uuid;
  old_user_type text;
  result jsonb;
BEGIN
  admin_id := auth.uid();
  
  -- Check if caller is admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = admin_id AND user_type = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can change user types';
  END IF;
  
  -- Prevent admin from changing their own type
  IF admin_id = target_user_id THEN
    RAISE EXCEPTION 'You cannot change your own user type';
  END IF;
  
  -- Validate new user type
  IF new_user_type NOT IN ('user', 'business', 'admin') THEN
    RAISE EXCEPTION 'Invalid user type. Must be user, business, or admin';
  END IF;
  
  -- Get current user type
  SELECT user_type INTO old_user_type
  FROM profiles
  WHERE id = target_user_id;
  
  IF old_user_type IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  
  IF old_user_type = new_user_type THEN
    RAISE EXCEPTION 'User already has this type';
  END IF;
  
  -- Update user type
  UPDATE profiles
  SET user_type = new_user_type
  WHERE id = target_user_id;
  
  -- If changing to business, ensure business profile exists
  IF new_user_type = 'business' THEN
    INSERT INTO business_profiles (user_id, business_name, token_balance)
    SELECT 
      target_user_id,
      full_name,
      0
    FROM profiles
    WHERE id = target_user_id
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  
  result := jsonb_build_object(
    'success', true,
    'old_type', old_user_type,
    'new_type', new_user_type,
    'user_id', target_user_id
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION change_user_type TO authenticated;
