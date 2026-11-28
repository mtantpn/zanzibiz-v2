# Supabase Claim Guide

## Overview

This document describes the official "Claim your Bolt Database in Supabase" process for the ZanziBiz V1 project. It explains exactly what the claim preserves, whether it can be rehearsed, and what happens to V1 during and after the claim.

**IMPORTANT: No claim will be performed without your explicit written approval.**

## 1. What Is the Claim Process?

The Claim process transfers a Bolt-managed Supabase database into your own Supabase organization. After claiming, you have full control of the project through the Supabase dashboard — you can manage the database, auth, storage, edge functions, and settings directly.

The official documentation is at:
- Bolt docs: https://support.bolt.new/integrations/supabase#claim-your-bolt-database-in-supabase
- Supabase project transfer docs: https://supabase.com/docs/guides/platform/project-transfer

## 2. Exact Claim Workflow

### Pre-requisites

1. You must have a Supabase account.
2. You must connect Bolt to your Supabase account (Account Settings > Applications > Supabase).
3. You must be the **owner** of the target Supabase organization.
4. The target organization must not exceed the free project limit (2 free projects) if on the Free Plan.

### Steps

1. Log in to Bolt and open the ZanziBiz V1 project.
2. Click the **Database icon** in the top center of the screen.
3. Click the **Advanced** tab.
4. Click **Claim**.
5. Complete additional steps in Supabase (Supabase will guide you through the transfer).

After completion, the database appears as a project in your Supabase dashboard at https://supabase.com/dashboard/projects.

## 3. What the Claim Preserves

The Claim process is a **project transfer** — it moves the entire Supabase project from Bolt's organization to your organization. This is NOT a data copy; it is an ownership transfer of the same running project.

### Guaranteed preserved (acceptance criteria — must verify after cutover):

| Component | Status | Details |
|-----------|--------|---------|
| **Database schema** | Guaranteed | All 18 tables, columns, primary keys, foreign keys, indexes |
| **Database data** | Guaranteed | All rows in all tables (profiles, listings, blog_posts, etc.) |
| **Auth users (UUIDs)** | Guaranteed | All 31 users with their UUIDs preserved |
| **Password hashes** | Guaranteed | bcrypt hashes remain in `auth.users.encrypted_password` — users can log in with existing passwords |
| **Auth identities** | Guaranteed | All 31 identity records in `auth.identities` |
| **RLS policies** | Guaranteed | All 67 row-level security policies (public + storage) |
| **Database functions** | Guaranteed | All 28 functions in the public schema |
| **Triggers** | Guaranteed | All 9 triggers (auth + public) |
| **Views** | Guaranteed | The `public_business_profiles` view |
| **Extensions** | Guaranteed | The `http` extension in the `extensions` schema |
| **Storage buckets** | Guaranteed | All 3 buckets (blog-images, listing-images, profile-pictures) |
| **Storage objects** | Guaranteed | All 254 files (175 + 72 + 7) with exact paths and metadata |
| **Storage policies** | Guaranteed | All 12 storage RLS policies |
| **Migration history** | Guaranteed | All 34 applied migrations in the `supabase_migrations` table |
| **Project UUID** | Guaranteed | The project's unique ID remains the same |
| **Database UUIDs** | Guaranteed | All UUIDs (user IDs, listing IDs, etc.) remain the same |
| **API URL** | Will change | The project URL changes from Bolt's subdomain to your Supabase project URL |
| **API keys** | Will change | New anon key and service role key are issued |

### Must be verified during cutover (NOT guaranteed — verify after claim):

| Component | Status | Details |
|-----------|--------|---------|
| **Auth sessions** | Must verify | Active sessions MAY remain valid, but this is not guaranteed. If the JWT secret changes during transfer, all sessions are invalidated and users must sign in again. Verify by checking if existing sessions work post-claim. |
| **Auth refresh tokens** | Must verify | Refresh tokens MAY remain valid, but this is not guaranteed. Same JWT secret concern as sessions. If invalidated, users must sign in again. |
| **Edge Function secrets** | Must verify | Secrets (CLICKPESA_CLIENT_ID, CLICKPESA_API_KEY, CLICKPESA_CHECKSUM_SECRET, CLICKPESA_BASE_URL, RESEND_API_KEY, APP_PUBLIC_URL) MAY transfer with the project, but this is not guaranteed. After claiming, verify each secret exists in the Supabase dashboard under Edge Functions > Secrets. Re-enter any missing secrets manually. |
| **Deployed Edge Functions** | Must verify | All 9 Edge Functions SHOULD remain deployed and active, but verify after claiming by checking the Supabase dashboard under Edge Functions. If any function is missing or inactive, redeploy from the source code in `supabase/functions/`. |

### What changes after claiming:

1. **API URL**: The Supabase project URL changes. The `.env` file in the Bolt project must be updated with the new URL and keys.
2. **API keys**: New `SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` are issued. These must be updated in the `.env` file and any client-side code that references them.
3. **Bolt connection**: The Bolt project's database connection is updated to point to the claimed project.

### What does NOT change:

- All user UUIDs
- All listing IDs
- All business profile IDs
- All blog post IDs
- All token balances and transaction history
- All storage object paths
- All RLS policies and security configuration
- All Edge Function code and secrets
- All password hashes (users can still log in)

## 4. Can the Claim Be Rehearsed?

### Short answer: No, the claim itself cannot be rehearsed without affecting V1.

The claim is a one-way ownership transfer — once you claim the database, it is no longer managed by Bolt. There is no "unclaim" or "return to Bolt" option.

### Alternative rehearsal approach:

You CAN rehearse the migration without claiming, using a **copy to staging**:

1. **Create a new Supabase project** (your staging project).
2. **Export the schema** from V1 using the migration files in `supabase/migrations/` — apply all 34 migrations to the staging project.
3. **Export the data** from V1 using the JSON exports in `backups/csv/` and `backups/auth/` — insert all rows into the staging project.
4. **Upload storage files** to the staging project's storage buckets (see `STORAGE-EXPORT-GUIDE.md`).
5. **Deploy Edge Functions** to the staging project (see `supabase/functions/` directory).
6. **Test V2** against the staging project.
7. **Validate** all data, auth, storage, and functions work correctly.

This staging rehearsal does NOT affect V1 in any way. V1 continues to run on Bolt without interruption.

## 5. Claim vs. Connect — Which to Choose?

| | Claim | Connect (new project) |
|---|---|---|
| Data preservation | Automatic — everything stays in place | Manual — must export/import all data |
| User disruption | None — users keep their sessions | Users must sign in again (new JWT secret) |
| Storage files | Automatic — all 254 files stay | Manual — must download and re-upload all 254 files |
| Edge Functions | Automatic — all 9 functions stay deployed | Manual — must redeploy all 9 functions |
| Secrets | Automatic — all secrets stay configured | Manual — must reconfigure all secrets |
| RLS policies | Automatic — all policies stay | Manual — must re-apply all migrations |
| Reversibility | Not reversible | N/A (V1 stays on Bolt) |
| Downtime | 1-2 minutes during transfer | None (V1 stays live) |

**Recommendation**: Use the Claim process when you are ready to take ownership. Use the Connect + staging approach for V2 testing before claiming.

## 6. What Happens to V1 During Claim?

- **During the claim**: There may be a brief 1-2 minute downtime as the project is transferred between organizations.
- **After the claim**: The project is fully owned by your Supabase organization. Bolt can still connect to it (the connection is updated automatically), but you also have direct Supabase dashboard access.
- **V1 hosting**: Bolt continues to host the frontend. The claim only transfers the database/backend ownership, not the frontend hosting.
- **V1 domain**: The Bolt-hosted domain is unaffected by the database claim.

## 7. Approval Required

**Do NOT perform the claim until you explicitly approve it in writing.**

The claim is a one-way operation. Once performed:
- The database is under your Supabase organization's control
- Bolt can still connect to it, but the relationship changes
- The API URL and keys change, requiring `.env` updates

Before claiming, ensure:
1. V2 testing against a staging copy is complete
2. The new `.env` values are ready to deploy
3. A rollback plan is in place (see `HANDOVER-MIGRATION.md` cutover plan)

## 8. Migration Acceptance Criteria

The following are the ONLY items that must be preserved for the migration to be accepted as successful:

### Guaranteed (must be true after claim):

- [ ] All 31 user UUIDs preserved in `auth.users`
- [ ] All 31 bcrypt password hashes preserved (users can log in with existing passwords)
- [ ] All public table data preserved (profiles=31, business_profiles=20, listings=118, blog_posts=32, favorites=14, orders=19, token_topups=24, token_transactions=2, business_wallets=2, payment_events=1)
- [ ] All 254 storage objects preserved across 3 buckets (175 blog-images, 72 listing-images, 7 profile-pictures)
- [ ] All 67 RLS policies active (18 public tables + 12 storage policies)
- [ ] All 28 database functions present and callable
- [ ] All 9 triggers present and active
- [ ] All 34 migrations recorded in migration history

### Must be verified (re-enter or verify during cutover, not guaranteed):

- [ ] Edge Function secrets re-entered or verified in Supabase dashboard (CLICKPESA_CLIENT_ID, CLICKPESA_API_KEY, CLICKPESA_CHECKSUM_SECRET, CLICKPESA_BASE_URL, RESEND_API_KEY, APP_PUBLIC_URL)
- [ ] All 9 Edge Functions verified as ACTIVE in Supabase dashboard (redeploy from source if any are missing)
- [ ] Auth sessions: if invalidated, users sign in again (acceptable — not a failure)
- [ ] Auth refresh tokens: if invalidated, users sign in again (acceptable — not a failure)
- [ ] New API URL and keys updated in `.env` and client-side code
