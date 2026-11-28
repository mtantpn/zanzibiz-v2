/*
  # Add Welcome Email Trigger for New Users

  1. Changes
    - Creates a trigger function to send welcome emails
    - Attaches trigger to profiles table for new user registrations
    - Calls the send-welcome-email edge function asynchronously

  2. Behavior
    - Triggers after a new profile is inserted
    - Sends welcome email with user's name and email
    - Non-blocking - registration succeeds even if email fails
*/

-- Create function to send welcome email via edge function
CREATE OR REPLACE FUNCTION send_welcome_email_trigger()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  request_id bigint;
  payload jsonb;
BEGIN
  -- Only send welcome email for regular users and business users (not admins)
  IF NEW.user_type IN ('user', 'business') THEN
    -- Prepare payload
    payload := jsonb_build_object(
      'email', NEW.email,
      'full_name', COALESCE(NEW.full_name, ''),
      'user_id', NEW.id::text
    );

    -- Call edge function asynchronously using pg_net
    -- This won't block the registration process
    SELECT net.http_post(
      url := current_setting('app.settings.supabase_url') || '/functions/v1/send-welcome-email',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
      ),
      body := payload
    ) INTO request_id;

    -- Log the request (optional)
    RAISE NOTICE 'Welcome email queued for user % with request_id %', NEW.email, request_id;
  END IF;

  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_profile_created_send_welcome_email ON profiles;

-- Create trigger that fires after profile insertion
CREATE TRIGGER on_profile_created_send_welcome_email
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION send_welcome_email_trigger();

-- Set configuration for edge function URL (these are automatically available in Supabase)
-- This is a fallback in case the settings aren't set
DO $$
BEGIN
  -- These settings should be configured at the database level
  -- They're included here as documentation
  PERFORM set_config('app.settings.supabase_url', current_setting('SUPABASE_URL', true), false);
  PERFORM set_config('app.settings.service_role_key', current_setting('SUPABASE_SERVICE_ROLE_KEY', true), false);
EXCEPTION
  WHEN OTHERS THEN
    -- Settings might not be available in all environments
    RAISE NOTICE 'Could not set app settings: %', SQLERRM;
END;
$$;
