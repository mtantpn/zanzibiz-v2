# ZanziBiz V1 — Production Handover Document

**Date:** 2026-08-14
**Version:** V1 (final state before V2 build)
**Domain:** zanzibiz.com

---

## Table of Contents

1. [Source Code & GitHub](#1-source-code--github)
2. [Technology Inventory](#2-technology-inventory)
3. [External Accounts & Environment Variables](#3-external-accounts--environment-variables)
4. [Production Database Export](#4-production-database-export)
5. [Migrations, Seed Scripts, Admin Credentials & Deployment](#5-migrations-seed-scripts-admin-credentials--deployment)
6. [Unfinished, Mocked & Placeholder Features](#6-unfinished-mocked--placeholder-features)
7. [SEO Audit](#7-seo-audit)
8. [Authentication, Security, Moderation & Backup](#8-authentication-security-moderation--backup)
9. [V1 Preservation & V2 Separation](#9-v1-preservation--v2-separation)

---

## 1. Source Code & GitHub

### Repository Status

A local git repository has been initialised in the project directory with branch `main`. The GitHub account available to this session is **`mtantpn`** (https://github.com/mtantpn). An attempt to create a remote repository (`zanzibiz-v1`) programmatically was rejected by the token's permissions (403 — personal access token lacks `repo` scope).

### Action Required to Complete GitHub Export

1. **Create the repository manually** on GitHub:
   - Go to https://github.com/new (or your organisation's new-repo page)
   - Name: `zanzibiz-v1` (or your preferred name)
   - Visibility: **Private**
   - Do NOT initialise with README (the local repo already has content)
2. **Add the remote and push:**
   ```bash
   git remote add origin git@github.com:mtantpn/zanzibiz-v1.git
   git add -A
   git commit -m "V1 production handover — full source code"
   git push -u origin main
   ```
3. If pushing to an **organisation** repository, replace the remote URL accordingly.

### What's Included

- All HTML pages (homepage, auth, business dashboard, admin, user, blog, travel guide, directory, static pages)
- All JavaScript libraries (`lib/` directory)
- All Supabase migrations (33 files in `supabase/migrations/`)
- All Supabase Edge Functions (9 functions in `supabase/functions/`)
- Seed SQL scripts (`supabase/seed*.sql`)
- Tailwind config, Vite config, package.json
- PWA assets (manifest, service worker, icons, offline page)
- SEO assets (robots.txt, sitemap.xml, _redirects)
- All project documentation (.md files)

### What's Excluded (via .gitignore)

- `node_modules/` — reinstall with `npm install`
- `.env` — contains Supabase keys (see Section 3)
- `dist/` — build output, regenerated with `npm run build`

---

## 2. Technology Inventory

### Frontend

| Component | Technology | Version |
|-----------|-----------|---------|
| Build tool | Vite | ^5.0.0 |
| CSS framework | Tailwind CSS | ^3.4.19 |
| CSS plugins | @tailwindcss/typography | ^0.5.19 |
| CSS postprocessor | Autoprefixer | ^10.5.0 |
| JS minifier | Terser | ^5.46.0 |
| Fonts | Playfair Display (display), Plus Jakarta Sans (body) | Google Fonts CDN |
| Animation | anime.js v3.2.1 | CDN |
| PWA | Custom service worker + manifest.json | — |
| Backend client | @supabase/supabase-js | ^2.39.0 |
| Runtime helper | tslib | ^2.6.2 |

### Hosting

| Component | Platform | Notes |
|-----------|----------|-------|
| Frontend hosting | Netlify | `_redirects` file present; clean URL rewrites configured |
| Domain | zanzibiz.com | DNS must point to Netlify |
| Build command | `npm run build` | Outputs to `dist/` |
| Publish directory | `dist/` | Served by Netlify |

### Database

| Component | Technology | Notes |
|-----------|-----------|-------|
| Database | Supabase (PostgreSQL) | Managed Postgres |
| Connection | Supabase JS client | Uses anon key (client-side) |
| Migrations | 33 SQL migration files | Applied via Supabase MCP |
| Seed scripts | 4 SQL seed files | `supabase/seed*.sql`, `supabase/seed_blog_posts.sql` |

### Authentication

| Component | Technology | Notes |
|-----------|-----------|-------|
| Auth provider | Supabase Auth | Email/password only |
| Session management | Supabase session tokens | `persistSession: true`, `autoRefreshToken: true` |
| Route protection | Custom `auth-guard.js` | Client-side guard with role checks (any/business/admin) |
| Email confirmation | Disabled | Users can sign in immediately after signup |
| User types | Enum: `user`, `business`, `admin` | Stored in `profiles.user_type` |

### Storage

| Component | Technology | Notes |
|-----------|-----------|-------|
| File storage | Supabase Storage | Two buckets: `listing-images`, `profile-pictures` |
| Image uploads | Client-side to Supabase Storage | Business listing images and user profile pictures |

### Maps

| Component | Technology | Notes |
|-----------|-----------|-------|
| Maps | Google Maps (link-only) | No embedded map; links to `maps.google.com` for directions |
| Location | What3Words | Stored as `what3words` field on listings; links to what3words.com |
| Map integration level | **Link-only** | No API key, no embedded maps, no tile rendering |

### Search

| Component | Technology | Notes |
|-----------|-----------|-------|
| Search | Supabase PostgREST `.or()` filter | Client-side `ilike` search on title and description |
| Full-text search | **Not implemented** | No PostgreSQL full-text search, no Algolia, no ElasticSearch |
| Search scope | Listings only | Blog/travel guide search not implemented |

### Analytics

| Component | Technology | Notes |
|-----------|-----------|-------|
| Analytics backend | Supabase tables | `page_views`, `listing_analytics`, `daily_stats` tables exist |
| View tracking | `incrementViewCount()` RPC | Increments listing view counter |
| Contact tracking | `incrementContactCount()` RPC | Increments listing contact counter |
| Google Analytics | **Not integrated** | No GA, GTM, or similar third-party analytics |
| Analytics UI | Admin dashboard | Shows counts from Supabase tables |

### Payment Provider

| Component | Technology | Notes |
|-----------|-----------|-------|
| Payment provider | ClickPesa | Tanzanian mobile money (USSD push) |
| Integration | Supabase Edge Functions | 9 functions for topup flow |
| Payment flow | Create → Initiate → Webhook → Confirm → Status | Full ClickPesa USSD push lifecycle |
| Amount | 1,500 TZS for 300 tokens | Fixed package |
| Webhook verification | HMAC-SHA256 checksum | `CLICKPESA_CHECKSUM_SECRET` |
| Mock payment fallback | `lib/mock-payments.js` | Simulates M-Pesa and card payments (90% success rate) |

### Email Provider

| Component | Technology | Notes |
|-----------|-----------|-------|
| Email provider | Resend | `RESEND_API_KEY` in Edge Function secrets |
| Email function | `send-welcome-email` Edge Function | Sends HTML welcome email on signup |
| Trigger | Database trigger on `profiles` insert | Calls Edge Function via `pg_net` HTTP extension |
| SMTP | Not configured | Resend API only |
| Email types | Welcome email only | No password reset, notification, or transactional emails |

### Internationalisation

| Component | Technology | Notes |
|-----------|-----------|-------|
| i18n system | Custom (`lib/i18n.js`) | 844-line translation dictionary |
| Languages | English (en), Swahili (sw) | Full UI translation |
| Language selector | `lib/lang-selector.js` | Dropdown in nav bar |
| Page translation | `lib/page-translator.js` | Auto-translates page content |

---

## 3. External Accounts & Environment Variables

### Environment Variables (`.env`)

The `.env` file contains **client-side** variables (prefixed `VITE_`):

| Variable | Purpose | Where Used |
|----------|---------|------------|
| `VITE_SUPABASE_URL` | Supabase project URL | `lib/supabase.js` (client-side) |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key | `lib/supabase.js` (client-side) |

### Supabase Edge Function Secrets (server-side)

These are configured in the Supabase dashboard (not in `.env`):

| Secret Name | Purpose |
|-------------|---------|
| `SUPABASE_URL` | Supabase project URL (server-side) |
| `SUPABASE_ANON_KEY` | Supabase anon key (server-side) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (bypasses RLS) |
| `SUPABASE_DB_URL` | Direct Postgres connection string |
| `CLICKPESA_CLIENT_ID` | ClickPesa API client ID |
| `CLICKPESA_API_KEY` | ClickPesa API key |
| `CLICKPESA_CHECKSUM_SECRET` | ClickPesa webhook HMAC secret |
| `CLICKPESA_BASE_URL` | ClickPesa API base URL |
| `APP_PUBLIC_URL` | Public app URL (for callbacks) |
| `RESEND_API_KEY` | Resend email API key |

### Accounts to Transfer

| Account | URL | What to Transfer |
|---------|-----|------------------|
| **Supabase** | https://supabase.com/dashboard | Project ownership, organisation membership, API keys |
| **Netlify** | https://app.netlify.com | Site ownership, deploy keys, environment variables |
| **Domain/DNS** | (registrar unknown) | DNS management for zanzibiz.com — A/CNAME records pointing to Netlify |
| **ClickPesa** | https://clickpesa.com | Merchant account, API credentials |
| **Resend** | https://resend.com | API key, sending domain verification (zanzibiz.com) |
| **Google Search Console** | https://search.google.com/search-console | Property ownership for zanzibiz.com (if claimed) |
| **Google Maps** | No API key | No account to transfer (link-only usage) |
| **What3Words** | No API key | No account to transfer (link-only usage) |
| **Pexels** | https://pexels.com | API key for stock images (used in OG images and hero) |

### Transfer Checklist

For each account above:
1. Change the password / transfer ownership
2. Rotate API keys and update them in Supabase secrets and Netlify env vars
3. Update billing contact if applicable
4. Verify the new owner has full access

---

## 4. Production Database Export

### Database Overview

| Metric | Value |
|--------|-------|
| Total tables | 18 |
| Total views | 1 |
| Total functions | 23 |
| RLS-enabled tables | 18 (all tables) |
| Total migrations | 33 |

### Table Inventory (with row counts)

| Table | Rows | Purpose |
|-------|------|---------|
| `profiles` | 31 | User accounts (user_type: user/business/admin) |
| `business_profiles` | 20 | Business owner profiles with token balance |
| `listings` | 118 | Business listings (113 active, 5 boosted) |
| `blog_posts` | 32 | Travel guide articles |
| `favorites` | 14 | User liked/saved listings |
| `token_topups` | 24 | Token purchase records |
| `orders` | 19 | Payment orders |
| `token_transactions` | 2 | Token spend/earn ledger entries |
| `business_wallets` | 2 | Business wallet records |
| `payment_events` | 1 | ClickPesa payment webhook events |
| `reviews` | 0 | Listing reviews (table exists, no data) |
| `messages` | 0 | User-to-business messages (table exists, no data) |
| `page_views` | 0 | Analytics page views (table exists, no data) |
| `listing_analytics` | 0 | Per-listing analytics (table exists, no data) |
| `daily_stats` | 0 | Aggregated daily statistics (table exists, no data) |
| `token_ledger` | 0 | Token ledger (table exists, no data) |
| `token_purchases` | 0 | Legacy token purchases (table exists, no data) |
| `user_bans` | 0 | User ban records (table exists, no data) |

### Listing Categories (with counts)

| Category | Count |
|----------|-------|
| business | 77 |
| activities | 12 |
| jobs | 12 |
| automotive | 7 |
| accommodation | 5 |
| events | 4 |
| useful-info | 1 |

### Listing Statuses

| Status | Count |
|--------|-------|
| active | 113 |
| boosted | 5 |

### Business Verification

All 20 business profiles have `verified = false`. No businesses have been verified.

### Admin User

| Field | Value |
|-------|-------|
| Email | madu@zanzibiz.com |
| Name | admin |
| User type | admin |
| Created | 2025-11-11 |

**Admin password is not stored in the database** — it was set during signup via Supabase Auth. The password must be obtained from the current owner or reset via Supabase Auth admin panel.

### How to Export the Full Database

```bash
# Using pg_dump with the SUPABASE_DB_URL from Edge Function secrets
pg_dump "$SUPABASE_DB_URL" \
  --schema=public \
  --no-owner \
  --no-privileges \
  --format=custom \
  --file=zanzibiz-v1-backup.dump

# To restore:
pg_restore --dbname="$NEW_DB_URL" --no-owner --no-privileges zanzibiz-v1-backup.dump
```

Alternatively, use the Supabase dashboard: **Project → Database → Backups → Download**.

### Storage Buckets

| Bucket | Purpose | Public |
|--------|---------|--------|
| `listing-images` | Business listing photos | Yes (public read) |
| `profile-pictures` | User profile pictures | Yes (public read) |

---

## 5. Migrations, Seed Scripts, Admin Credentials & Deployment

### Database Migrations (33 files)

All migrations are in `supabase/migrations/` and are applied in chronological order:

| # | Filename | Purpose |
|---|----------|---------|
| 001 | `001_initial_schema.sql` | Core tables: profiles, listings, business_profiles, reviews, favorites, messages |
| 002 | `002_admin_and_categories.sql` | Admin role setup, category seeding |
| 003 | `20251021071547_003_add_listing_details.sql` | Listing detail fields (hours, features, what3words) |
| 004 | `20251021071929_004_boost_listing_function.sql` | Boost listing RPC function |
| 005 | `20251021074413_005_fix_rls_for_auth.sql` | RLS policy fixes for auth flow |
| 006 | `20251021082229_006_fix_rls_recursion.sql` | Fix RLS recursion on profiles |
| 007 | `20251021082733_007_fix_business_profiles_insert.sql` | Fix business profile insert RLS |
| 008 | `20251021091658_008_add_granted_transaction_type.sql` | Add `granted` transaction type |
| 009 | `20251021091825_009_create_listing_images_bucket.sql` | Create listing-images storage bucket |
| 010 | `20251021100545_010_add_admin_token_transaction_policy.sql` | Admin token transaction RLS |
| 011 | `20251021100605_011_add_admin_business_profile_policy.sql` | Admin business profile RLS |
| 012 | `20251021102334_012_add_profile_pictures.sql` | Profile picture column + bucket |
| 013 | `20251111151132_013_add_token_purchases_table.sql` | Token purchases table |
| 014 | `20251111151207_014_add_token_purchase_function.sql` | Token purchase RPC |
| 015 | `20251111151809_015_fix_user_signup_and_business_profiles.sql` | Fix signup RLS |
| 016 | `20251111152310_016_fix_profiles_rls_for_signup.sql` | Fix profiles RLS for signup |
| 017 | `20251111153406_017_add_analytics_and_traffic_tracking.sql` | Analytics tables |
| 018 | `20251111155058_018_add_change_user_type_function.sql` | Change user type RPC |
| 019 | `20251111161228_019_fix_security_issues.sql` | Security fixes |
| 020 | `20251111162337_020_add_admin_user_creation_and_analytics.sql` | Admin user creation + analytics RPCs |
| 021 | `20251115093130_021_create_blog_posts_table.sql` | Blog posts table |
| 022 | `20251115094545_022_add_useful_links_to_blog_posts.sql` | Useful links on blog posts |
| 023 | `20251115102019_seed_blog_content.sql` | Seed blog/travel guide content |
| 024 | `20251115111044_024_fix_grant_tokens_function.sql` | Fix grant tokens function |
| 025 | `20260103121203_025_add_content_images_to_blog_posts.sql` | Content images on blog posts |
| 026 | `20260306105413_026_clickpesa_topup_functions.sql` | ClickPesa topup Edge Functions support |
| 027 | `20260306113609_027_update_topup_amount_1500_tzs.sql` | Set topup amount to 1,500 TZS |
| 028 | `20260311113402_028_create_orders_table.sql` | Orders table for payments |
| 029 | `20260312071033_029_fix_security_and_performance_issues.sql` | Security + performance fixes |
| 030 | `20260318060308_030_create_profile_pictures_bucket.sql` | Profile pictures storage bucket |
| 031 | `20260318060954_031_add_welcome_email_trigger.sql` | Welcome email DB trigger |
| 032 | `20260318061023_032_enable_http_extension_for_emails.sql` | Enable pg_net for email trigger |
| 033 | `20260318061045_033_simplify_welcome_email_trigger.sql` | Simplify email trigger |
| 034 | `20260410141859_034_admin_edit_listings_and_profiles.sql` | Admin edit capabilities |
| 035 | `20260415150912_035_admin_create_listing_support.sql` | Admin listing creation |
| 036 | `20260513143406_036_fix_security_permissions.sql` | Security permission fixes |
| 037 | `20260513151611_037_revoke_public_execute_on_functions.sql` | Revoke public function execution |
| 038 | `20260520083432_038_comprehensive_rls_audit_fix.sql` | Comprehensive RLS audit |
| 039 | `20260520141911_039_fix_security_definer_issues.sql` | Fix SECURITY DEFINER issues |
| 040 | `20260603201456_040_fix_profiles_rls_recursion.sql` | Fix profiles RLS recursion (again) |
| 041 | `20260603202042_041_fix_is_admin_grants_and_business_policies.sql` | Fix is_admin grants |
| 042 | `20260605113830_042_grant_analytics_rpcs_to_authenticated.sql` | Grant analytics RPCs |
| 043 | `20260703065228_043_admin_can_read_all_blog_posts.sql` | Admin blog post read access |

### Seed Scripts

| File | Purpose |
|------|---------|
| `supabase/seed.sql` | Initial seed data (categories, demo listings) |
| `supabase/seed_complete.sql` | Complete seed data |
| `supabase/seed_blog_posts.sql` | Blog/travel guide article seeding |
| `supabase/update_listings_details.sql` | Update listing detail fields |

### Admin Credentials & Roles

| Role | Enum Value | How Assigned | Current Count |
|------|-----------|--------------|---------------|
| Regular user | `user` | Default on signup | ~10 |
| Business owner | `business` | Selected at signup or changed via `change_user_type` RPC | ~20 |
| Admin | `admin` | Manually set in DB or via admin panel | 1 |

**Admin account:** `madu@zanzibiz.com` — password is managed by Supabase Auth and is not stored in any file. To reset: use Supabase Dashboard → Authentication → Users → click user → "Send password recovery" or set a new password directly.

### API Documentation

The app uses Supabase's auto-generated REST API (PostgREST). No custom API server exists. All data operations go through:

1. **Supabase JS client** (`lib/supabase.js`) — CRUD operations on all tables
2. **Supabase RPC functions** — Server-side functions called via `.rpc()`:
   - `purchase_tokens(business_id, token_amount, payment_method)`
   - `add_tokens_to_business(purchase_id, token_amount)`
   - `increment_view_count(listing_uuid)`
   - `increment_contact_count(listing_uuid)`
   - `change_user_type(user_id, new_type)`
   - `is_admin()` — checks if current user is admin
   - Various analytics RPCs

3. **Supabase Edge Functions** (Deno runtime):
   - `topup-create` — Creates a token topup order (JWT required)
   - `topup-initiate` — Initiates ClickPesa USSD push (JWT required)
   - `topup-verify` — Verifies payment (JWT required)
   - `topup-status` — Checks payment status (public)
   - `topup-confirm` — Confirms payment and credits tokens (public, called by webhook)
   - `clickpesa-webhook` — Receives ClickPesa payment webhooks (public)
   - `clickpesa-preview` — Previews USSD push request (JWT required)
   - `clickpesa-test` — Tests ClickPesa connectivity (JWT required)
   - `send-welcome-email` — Sends welcome email via Resend (public, called by DB trigger)

### Deployment Instructions

#### Frontend (Netlify)

1. **Connect repository:** Link the GitHub repository to Netlify
2. **Build settings:**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: 18 or higher
3. **Environment variables (Netlify dashboard):**
   - `VITE_SUPABASE_URL` — Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` — Supabase anon key
4. **Deploy:** Push to `main` branch triggers automatic deploy
5. **Domain:** Configure zanzibiz.com in Netlify domain settings
6. **Redirects:** `public/_redirects` is automatically included in build output

#### Supabase

1. Migrations are already applied to the production database
2. Edge Functions are already deployed (9 functions active)
3. Secrets are already configured (10 secrets set)
4. Storage buckets are already created (2 buckets)

#### Local Development

```bash
npm install
cp .env.example .env  # Create .env with Supabase URL and anon key
npm run dev            # Starts Vite dev server on port 3000
```

---

## 6. Unfinished, Mocked & Placeholder Features

### Mocked / Simulated

| Feature | Status | Details |
|---------|--------|---------|
| **Mock payment processor** | Mock implementation exists | `lib/mock-payments.js` simulates M-Pesa and card payments with 90% success rate. Real ClickPesa integration exists alongside this in Edge Functions. The mock file is still present but the production flow uses ClickPesa Edge Functions. |
| **Service Worker background sync** | Stub only | `syncFavorites()`, `syncReviews()`, `syncMessages()` in `sw.js` are empty stubs — they log to console but do nothing. Background sync is non-functional. |
| **Push notifications** | Receiver only | The service worker has a `push` event listener but there is no push server sending notifications. No VAPID keys configured. |

### Unfinished / Not Implemented

| Feature | Status | Details |
|---------|--------|---------|
| **Reviews** | Table exists, 0 rows | The `reviews` table and `createReview()` function exist, but no review UI is visible on listing pages. Reviews are not displayed. |
| **Messages** | Table exists, 0 rows | The `messages` table and `sendMessage()`/`getMessages()` functions exist, but no messaging UI is present. |
| **Business verification** | Not implemented | All 20 businesses have `verified = false`. No verification workflow or UI exists. The "Verified" badge shows on listings but no business is actually verified. |
| **Full-text search** | Not implemented | Search uses basic `ilike` on title/description only. No PostgreSQL full-text, no search ranking. |
| **Blog search** | Not implemented | No search functionality for blog/travel guide articles. |
| **Google Analytics** | Not integrated | No GA/GTM tags. Analytics are stored in Supabase tables but `page_views`, `listing_analytics`, and `daily_stats` tables have 0 rows (tracking may not be firing). |
| **Email notifications** | Welcome email only | Only the welcome email is sent. No password reset emails, listing approval emails, message notifications, or marketing emails. |
| **Password reset** | UI exists, backend not verified | Login page has "Forgot password?" link but the reset flow has not been verified end-to-end. |
| **User bans** | Table exists, 0 rows | `user_bans` table and `is_banned` column exist but no ban UI or enforcement is visible. |
| **Token ledger** | Table exists, 0 rows | `token_ledger` table exists but appears unused (token tracking uses `token_transactions` instead). |
| **Affiliate program** | Static page only | `affiliate.html` is a static page with no backend, no tracking, no affiliate dashboard. |
| **WebStart** | Static page only | `webstart.html` is a landing page with no backend integration. |

### Placeholder Data

| Item | Details |
|------|---------|
| PWA screenshots | `manifest.json` uses the logo image for all screenshot sizes (not actual screenshots) |
| PWA icons | All icon sizes use the same `Zanzibiz.com-logo.png` file |
| OG image | References a Pexels stock photo URL, not a branded image |
| Hero stats | "1000+ Businesses" and "5000+ Reviews" are hardcoded; actual counts are 118 listings and 0 reviews |

---

## 7. SEO Audit

### robots.txt

- **Status:** Present and correct
- **Content:** `User-agent: * / Allow: /`
- **Sitemap:** Referenced at `https://zanzibiz.com/sitemap.xml`
- **Issues:** None

### sitemap.xml

- **Status:** Present and comprehensive
- **URLs listed:** ~160 URLs (homepage, directory, categories, travel guide hub, 5 static travel guide pages, ~30 travel guide articles, ~117 business listing pages, webstart, trust pages)
- **Last modified dates:** Range from 2025-11-15 to 2026-07-02
- **Issues:**
  - Business listing URLs use `/business/:slug` format which relies on `_redirects` rewrite — these are dynamically rendered, not pre-built. Search engine crawlability depends on Netlify's prerendering or the pages being server-rendered.
  - Sitemap does not include `/blog` (redirected to `/travel-guide`) or `/blog-post.html` individual article pages (they are under `/travel-guide/:slug` instead)

### Canonical URLs

- **Homepage:** `<link rel="canonical" href="https://zanzibiz.com/">` — present
- **Other pages:** Should be verified page-by-page; the homepage has canonical set

### Redirects (`_redirects`)

| From | To | Type | Notes |
|------|----|------|-------|
| `/blog` | `/travel-guide` | 301 | Permanent redirect |
| `/blog/:slug` | `/blog-post.html?slug=:slug` | 200 (rewrite) | Clean URL preserved |
| `/business/:slug` | `/business/listing.html?slug=:slug` | 200 (rewrite) | Clean URL preserved |
| `/directory` | `/directory/index.html` | 200 (rewrite) | Clean URL |
| `/directory/:category` | `/directory/category.html?category=:category` | 200 (rewrite) | Clean URL |
| `/travel-guide` | `/travel-guide.html` | 200 (rewrite) | Clean URL |
| `/travel-guide/:slug` | `/blog-post.html?slug=:slug` | 200 (rewrite) | Dynamic article URLs |
| `/about`, `/contact`, `/privacy`, `/terms`, `/affiliate`, `/webstart` | Respective `.html` files | 200 (rewrite) | Clean URLs |

**Note:** 200 rewrites are not true redirects — they serve content at the clean URL. This is correct for SEO. The only true redirect is `/blog → /travel-guide` (301).

### Metadata

| Page | Title | Description | OG Tags | Twitter Cards |
|------|-------|-------------|---------|---------------|
| Homepage | Yes | Yes | Yes (og:title, og:description, og:url, og:image, og:type, og:site_name) | Yes (summary_large_image) |
| Other pages | Should be verified individually | — | — | — |

### Schema Markup (JSON-LD)

| Page | Schema Type | Status |
|------|-------------|--------|
| Homepage | Not found | No JSON-LD on homepage |
| Blog post pages | Article schema | Present in `blog-post.html` |
| Blog listing | Blog schema | Present in `blog.html` |
| Business listing | LocalBusiness schema | Present in `business/listing.html` (dynamically populated) |
| Directory category | BreadcrumbList schema | Present in `directory/category.html` |
| Directory index | WebSite schema | Present in `directory/index.html` |
| Travel guide hub | TouristDestination schema | Present in `travel-guide.html` |

**Gap:** The homepage has no JSON-LD schema markup. Consider adding `WebSite` + `SearchAction` schema.

### Indexability Status

- **robots.txt:** Allows all crawlers
- **Sitemap:** Comprehensive, submitted via robots.txt
- **Canonical:** Set on homepage
- **Clean URLs:** Configured via Netlify redirects
- **HTTPS:** Assumed (zanzibiz.com should have SSL via Netlify)
- **Mobile-friendly:** Responsive design with Tailwind breakpoints
- **PWA:** Installable with manifest and service worker

### SEO Issues to Address

1. **Homepage lacks JSON-LD schema** — add WebSite + Organization schema
2. **Dynamic pages may not be crawlable** — `/business/:slug` and `/travel-guide/:slug` are client-side rendered; verify with Google Search Console
3. **OG image is a Pexels stock photo** — should be replaced with a branded image
4. **Hero stats are inaccurate** — "1000+ Businesses" and "5000+ Reviews" don't match actual data (118 listings, 0 reviews)
5. **Verify canonical tags on all pages** — only homepage has been confirmed

---

## 8. Authentication, Security, Moderation & Backup

### Authentication

| Aspect | Implementation |
|--------|---------------|
| Provider | Supabase Auth (email/password) |
| Email confirmation | Disabled — users can sign in immediately |
| Password reset | UI link exists; verify Supabase Auth email templates are configured |
| Social login | Not configured |
| Magic link | Not configured |
| Session persistence | `persistSession: true` (localStorage) |
| Token refresh | `autoRefreshToken: true` |
| Route protection | Client-side `auth-guard.js` with role checks |
| Role types | `user`, `business`, `admin` (PostgreSQL enum) |
| Role assignment | Set at signup via `user_metadata.user_type`; changeable via `change_user_type` RPC |

### Security

#### Row Level Security (RLS)

- **All 18 tables have RLS enabled** — no table is publicly accessible without policies
- Policies use `auth.uid()` for ownership checks (not `current_user`)
- Separate policies per CRUD verb (SELECT, INSERT, UPDATE, DELETE)
- Admin policies check `profiles.user_type = 'admin'` via subquery

#### Security Definer Functions

- 23 database functions exist
- Multiple migrations (019, 037, 038, 039) specifically fix SECURITY DEFINER issues
- Migration 037 revokes public execute on functions
- Migration 041 fixes is_admin grants

#### Client-Side Security Notes

- The app uses the Supabase **anon key** client-side (visible in browser). This is by design — RLS policies enforce data access control.
- The **service role key** is only used in Edge Functions (server-side), never exposed to the browser.
- `auth-guard.js` provides client-side route protection but this is **not a security boundary** — it's UX. RLS is the real security boundary.
- The `boostListing` function in `lib/supabase.js` performs a client-side token balance check and deduction. This is a potential race condition — a determined user could boost multiple listings simultaneously before the balance updates. The server-side `purchase_tokens` RPC is safer.

#### ClickPesa Webhook Security

- Webhook checksum verification uses HMAC-SHA256 with `CLICKPESA_CHECKSUM_SECRET`
- `verifyWebhookChecksum()` in `supabase/functions/_shared/clickpesa.ts` uses timing-safe comparison
- If `CLICKPESA_CHECKSUM_SECRET` is not set, verification is **skipped** (returns `true`) — this is a security risk in misconfigured environments

#### CORS

- All Edge Functions include proper CORS headers
- `Access-Control-Allow-Origin: *` (all origins allowed) — appropriate for a public API

### Moderation

| Feature | Status |
|---------|--------|
| Content moderation | **Not implemented** — no approval workflow for listings |
| User banning | Table exists (`user_bans`), `is_banned` column on profiles, but no ban UI or enforcement |
| Listing flagging | **Not implemented** — admin dashboard has "Flagged Content" label but no flagging mechanism |
| Report system | **Not implemented** |
| Spam prevention | **Not implemented** — no rate limiting, no CAPTCHA, no honeypot |
| Image moderation | **Not implemented** — uploaded images are not scanned or approved |

### Backup

| Aspect | Status |
|--------|--------|
| Database backups | Supabase provides automatic daily backups (managed) |
| Manual backup | Can be done via `pg_dump` or Supabase dashboard |
| Storage backups | **Not configured** — Supabase Storage does not automatically back up files |
| Code backups | GitHub repository (once pushed) |
| Disaster recovery | No documented DR plan |

#### Recommended Backup Strategy

1. **Database:** Enable Supabase PITR (Point-in-Time Recovery) if on Pro plan
2. **Storage:** Periodically sync storage buckets to an external backup (S3, Google Cloud Storage)
3. **Code:** Push to GitHub after every change
4. **Documentation:** Keep this handover document in the repository

---

## 9. V1 Preservation & V2 Separation

### V1 Status

- V1 is the **current production site** at zanzibiz.com
- No changes have been made to the design or functionality during this handover
- The only change made was fixing the "Business Directory" menu link from `#listings` to `#regularSection` (the correct anchor ID)
- The build passes successfully (`npm run build` exits 0)

### V2 Recommendations

1. **Create a new GitHub repository** for V2 (e.g., `zanzibiz-v2`)
2. **Use a separate Supabase project** for V2 development to avoid touching production data
3. **Use a staging domain** (e.g., `v2.zanzibiz.com` or `staging.zanzibiz.com`) for V2 testing
4. **Do not modify the V1 repository** — it is the production source of truth
5. **When V2 is ready:** Deploy V2 to a new Netlify site, test thoroughly, then update DNS to point zanzibiz.com to V2
6. **Keep V1 running** on a backup domain (e.g., `v1.zanzibiz.com`) for rollback capability

### V1 → V2 Migration Path

When V2 is ready to go live:
1. Take a final database backup from V1's Supabase project
2. Restore into V2's Supabase project (or migrate data with a script)
3. Migrate storage bucket files
4. Update DNS to point to V2's Netlify site
5. Keep V1 accessible on a subdomain for 30 days as rollback

---

## Appendix: File Structure

```
project/
├── .env                          # Supabase client keys (not in git)
├── .gitignore                    # Excludes node_modules, .env
├── package.json                  # Dependencies and scripts
├── vite.config.js                # Vite build config (27 entry points)
├── tailwind.config.js            # Tailwind theme with brand colors
├── index.html                    # Homepage
├── about.html                    # About page
├── contact.html                  # Contact page
├── privacy.html                  # Privacy policy
├── terms.html                    # Terms of service
├── affiliate.html                # Affiliate info page
├── webstart.html                 # WebStart landing page
├── blog.html                     # Blog listing (redirects to travel-guide)
├── blog-post.html                # Individual blog/travel guide article
├── travel-guide.html             # Travel guide hub
├── auth/
│   ├── login.html                # Login page
│   └── signup.html               # Signup page
├── business/
│   ├── dashboard.html            # Business owner dashboard
│   ├── listing.html              # Individual listing detail page
│   └── topup.html                 # Token purchase (ClickPesa) page
├── admin/
│   ├── dashboard.html            # Admin dashboard
│   ├── admin-enhanced.js         # Admin dashboard logic
│   └── payments.html             # Admin payments view
├── user/
│   ├── profile.html               # User profile page
│   ├── settings.html              # User settings page
│   └── liked.html                 # Liked/saved listings
├── directory/
│   ├── index.html                 # Directory hub
│   └── category.html             # Category filter page
├── travel-guide/
│   ├── flights-to-zanzibar.html
│   ├── where-to-stay.html
│   ├── hotels.html
│   ├── tours.html
│   └── airport-transfers.html
├── lib/
│   ├── supabase.js                # Supabase client + all data functions
│   ├── auth-guard.js              # Route protection with role checks
│   ├── i18n.js                    # Translation dictionary (en, sw)
│   ├── lang-selector.js           # Language dropdown component
│   ├── page-translator.js         # Auto page translation
│   ├── mock-payments.js           # Mock payment processor
│   ├── live-info-widget.js        # Live info widget
│   ├── pwa.js                     # PWA registration
│   └── design-system.css          # Custom CSS design tokens
├── src/
│   └── tailwind.css               # Tailwind input CSS
├── public/
│   ├── _redirects                 # Netlify redirect rules
│   ├── robots.txt                 # SEO robots
│   ├── sitemap.xml                # SEO sitemap
│   ├── manifest.json              # PWA manifest
│   ├── sw.js                      # Service worker
│   ├── offline.html               # PWA offline page
│   ├── browserconfig.xml          # Windows tile config
│   ├── *.png, *.ico, *.jpeg       # Icons and images
│   └── robots.txt
├── supabase/
│   ├── migrations/                # 33 SQL migration files
│   ├── functions/                 # 9 Edge Functions
│   │   ├── _shared/clickpesa.ts   # ClickPesa shared module
│   │   ├── topup-create/
│   │   ├── topup-initiate/
│   │   ├── topup-verify/
│   │   ├── topup-status/
│   │   ├── topup-confirm/
│   │   ├── clickpesa-webhook/
│   │   ├── clickpesa-preview/
│   │   ├── clickpesa-test/
│   │   └── send-welcome-email/
│   ├── seed.sql
│   ├── seed_complete.sql
│   ├── seed_blog_posts.sql
│   └── update_listings_details.sql
└── *.md                           # Project documentation files
```

---

*This document was generated on 2026-08-14 as part of the ZanziBiz V1 production handover.*
