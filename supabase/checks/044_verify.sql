-- Read-only checks to run after migration 044.
select count(*) filter (where user_type = 'admin') as admins, count(*) as profiles from profiles;
select tgname from pg_trigger where tgrelid = 'public.profiles'::regclass and not tgisinternal;
select pg_get_functiondef('public.handle_new_user'::regproc) ilike '%requested = ''business''%' as signup_whitelisted;
-- Manual test (staging or with a throwaway account):
--   1. supabase.auth.signUp({ email, password, options: { data: { user_type: 'admin' } } })
--      -> profile.user_type must be 'user'.
--   2. As that user: supabase.from('profiles').update({ user_type: 'admin' }).eq('id', uid)
--      -> must fail with "Not allowed to change account type".
