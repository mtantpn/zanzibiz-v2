/*
  # Block self-promotion to admin (fixes V1 and V2, confirmed live 28 Nov 2026)

  V1: handle_new_user() cast the signup metadata straight to user_type, so a
      browser could sign up with user_type = 'admin'.
  V2: the "Users can update own profile" policy only checks id = auth.uid(),
      so a signed-in user could PATCH their own user_type to 'admin'.

  Fix:
  1. Signup only accepts 'user' or 'business' from metadata. Anything else
     becomes 'user'. Business profile creation is unchanged.
  2. A trigger on profiles rejects any change of user_type, and any insert
     of an admin row, made by a signed-in user who is not already an admin.
     Service role, the SQL editor and the signup trigger (no auth.uid())
     are unaffected, so admins and support can still change roles.

  Before applying: compare handle_new_user() below with the live definition
  (select pg_get_functiondef('public.handle_new_user'::regproc)) and keep any
  live-only lines.
*/

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  requested text;
  new_user_type user_type;
  new_business_name text;
BEGIN
  requested := lower(coalesce(NEW.raw_user_meta_data->>'user_type', 'user'));
  IF requested = 'business' THEN
    new_user_type := 'business';
  ELSE
    new_user_type := 'user';
  END IF;

  INSERT INTO public.profiles (id, email, full_name, user_type)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    new_user_type
  );

  IF new_user_type = 'business' THEN
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
$function$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;

CREATE OR REPLACE FUNCTION public.guard_profile_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  -- No signed-in user: service role, SQL editor or the signup trigger.
  IF (SELECT auth.uid()) IS NULL THEN
    RETURN NEW;
  END IF;

  IF public.is_admin() THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' AND NEW.user_type = 'admin'::user_type THEN
    RAISE EXCEPTION 'Not allowed to create an admin profile' USING ERRCODE = '42501';
  END IF;

  IF TG_OP = 'UPDATE' AND NEW.user_type IS DISTINCT FROM OLD.user_type THEN
    RAISE EXCEPTION 'Not allowed to change account type' USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.guard_profile_role() FROM anon, authenticated, public;

DROP TRIGGER IF EXISTS guard_profile_role ON public.profiles;
CREATE TRIGGER guard_profile_role
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.guard_profile_role();
