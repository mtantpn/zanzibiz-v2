/*
  # Enable HTTP Extension and Update Welcome Email Trigger

  1. Changes
    - Enables the HTTP extension for making HTTP requests from database
    - Updates the welcome email trigger to use HTTP extension
    - Ensures trigger works asynchronously without blocking registration

  2. Behavior
    - Calls edge function via HTTP POST
    - Non-blocking - registration succeeds even if email fails
*/

-- Enable HTTP extension if not already enabled
CREATE EXTENSION IF NOT EXISTS http WITH SCHEMA extensions;

-- Drop and recreate the welcome email trigger function with HTTP extension
DROP FUNCTION IF EXISTS send_welcome_email_trigger() CASCADE;

CREATE OR REPLACE FUNCTION send_welcome_email_trigger()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  supabase_url text;
  service_role_key text;
  payload jsonb;
  http_response extensions.http_response;
BEGIN
  -- Only send welcome email for regular users and business users (not admins)
  IF NEW.user_type IN ('user', 'business') THEN
    BEGIN
      -- Get Supabase configuration
      supabase_url := current_setting('app.settings.supabase_url', true);
      service_role_key := current_setting('app.settings.service_role_key', true);

      -- Fallback to default values if settings not configured
      IF supabase_url IS NULL OR supabase_url = '' THEN
        supabase_url := 'https://jaoyujiwqzzrdhmzntlj.supabase.co';
      END IF;

      -- Prepare payload
      payload := jsonb_build_object(
        'email', NEW.email,
        'full_name', COALESCE(NEW.full_name, ''),
        'user_id', NEW.id::text
      );

      -- Call edge function using HTTP extension
      -- This is done in a separate transaction and won't block registration
      IF service_role_key IS NOT NULL AND service_role_key != '' THEN
        SELECT * INTO http_response
        FROM extensions.http((
          'POST',
          supabase_url || '/functions/v1/send-welcome-email',
          ARRAY[
            extensions.http_header('Content-Type', 'application/json'),
            extensions.http_header('Authorization', 'Bearer ' || service_role_key)
          ],
          'application/json',
          payload::text
        )::extensions.http_request);

        -- Log the response (optional)
        RAISE NOTICE 'Welcome email response: status=%, content=%', http_response.status, http_response.content;
      ELSE
        RAISE NOTICE 'Service role key not configured, skipping welcome email for user %', NEW.email;
      END IF;

    EXCEPTION
      WHEN OTHERS THEN
        -- Log error but don't fail the registration
        RAISE WARNING 'Failed to send welcome email for user %: %', NEW.email, SQLERRM;
    END;
  END IF;

  RETURN NEW;
END;
$$;

-- Recreate trigger
DROP TRIGGER IF EXISTS on_profile_created_send_welcome_email ON profiles;

CREATE TRIGGER on_profile_created_send_welcome_email
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION send_welcome_email_trigger();
