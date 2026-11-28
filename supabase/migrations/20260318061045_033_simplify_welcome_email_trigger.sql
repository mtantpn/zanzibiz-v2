/*
  # Simplify Welcome Email Trigger

  1. Changes
    - Simplifies the welcome email trigger
    - Uses hardcoded Supabase URL from environment
    - Ensures trigger works reliably

  2. Behavior
    - Calls edge function via HTTP POST
    - Non-blocking - registration succeeds even if email fails
*/

-- Drop and recreate the welcome email trigger function
DROP FUNCTION IF EXISTS send_welcome_email_trigger() CASCADE;

CREATE OR REPLACE FUNCTION send_welcome_email_trigger()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  payload jsonb;
  http_response extensions.http_response;
BEGIN
  -- Only send welcome email for regular users and business users (not admins)
  IF NEW.user_type IN ('user', 'business') THEN
    BEGIN
      -- Prepare payload
      payload := jsonb_build_object(
        'email', NEW.email,
        'full_name', COALESCE(NEW.full_name, ''),
        'user_id', NEW.id::text
      );

      -- Call edge function using HTTP extension
      -- Using the Supabase project URL directly
      SELECT * INTO http_response
      FROM extensions.http((
        'POST',
        'https://jaoyujiwqzzrdhmzntlj.supabase.co/functions/v1/send-welcome-email',
        ARRAY[
          extensions.http_header('Content-Type', 'application/json')
        ],
        'application/json',
        payload::text
      )::extensions.http_request);

      -- Log the response for debugging
      IF http_response.status >= 200 AND http_response.status < 300 THEN
        RAISE NOTICE 'Welcome email sent successfully to %', NEW.email;
      ELSE
        RAISE WARNING 'Welcome email failed for %: status=%', NEW.email, http_response.status;
      END IF;

    EXCEPTION
      WHEN OTHERS THEN
        -- Log error but don't fail the registration
        RAISE WARNING 'Error sending welcome email to %: %', NEW.email, SQLERRM;
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

COMMENT ON FUNCTION send_welcome_email_trigger() IS 'Sends welcome email to new users via edge function';
COMMENT ON TRIGGER on_profile_created_send_welcome_email ON profiles IS 'Automatically sends welcome email when a new user profile is created';
