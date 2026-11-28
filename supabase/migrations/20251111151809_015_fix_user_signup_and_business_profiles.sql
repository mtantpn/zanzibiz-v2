/*
  # Fix User Signup and Business Profile Creation

  1. Changes
    - Update handle_new_user function to automatically create business_profiles for business users
    - Ensure business_identifier is properly generated via trigger
    
  2. Security
    - Maintains existing RLS policies
    - Business profiles created securely through SECURITY DEFINER function

  3. Notes
    - This fixes the "Database error saving new user" issue
    - Business users will now have both profile and business_profile created on signup
*/

-- Update the handle_new_user function to create business profile for business users
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_user_type user_type;
  new_business_name text;
BEGIN
  -- Get user type from metadata, default to 'user'
  new_user_type := COALESCE((NEW.raw_user_meta_data->>'user_type')::user_type, 'user');
  
  -- Insert into profiles table
  INSERT INTO profiles (id, email, full_name, user_type)
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
    
    INSERT INTO business_profiles (user_id, business_name, token_balance)
    VALUES (NEW.id, new_business_name, 100);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add policy for users to insert their own business profile
DROP POLICY IF EXISTS "Business owners can create own profile" ON business_profiles;
CREATE POLICY "Business owners can create own profile"
  ON business_profiles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());