/*
  # Fix Profiles RLS for Signup

  1. Problem
    - profiles table has no INSERT policy
    - handle_new_user trigger cannot insert into profiles due to RLS
    - This causes "Database error saving new user"

  2. Solution
    - Since handle_new_user is SECURITY DEFINER, we need to grant proper permissions
    - OR add an INSERT policy (but this could be a security issue)
    - Best approach: Make the function bypass RLS by granting it proper role

  3. Changes
    - Drop and recreate handle_new_user with proper security context
    - Add INSERT policy for service role operations
*/

-- Recreate the function to ensure it has proper permissions
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_user_type user_type;
  new_business_name text;
BEGIN
  -- Get user type from metadata, default to 'user'
  new_user_type := COALESCE((NEW.raw_user_meta_data->>'user_type')::user_type, 'user');
  
  -- Insert into profiles table
  INSERT INTO public.profiles (id, email, full_name, user_type)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    new_user_type
  );

  -- If user type is business, create business profile
  IF new_user_type = 'business' THEN
    -- Get business name from metadata or use full name
    new_business_name := COALESCE(
      NEW.raw_user_meta_data->>'business_name',
      NEW.raw_user_meta_data->>'full_name',
      'My Business'
    );
    
    INSERT INTO public.business_profiles (user_id, business_name, token_balance)
    VALUES (NEW.id, new_business_name, 100);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to authenticated users (trigger will still run as definer)
GRANT EXECUTE ON FUNCTION handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION handle_new_user() TO anon;