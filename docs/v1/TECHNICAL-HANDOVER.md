# ZanziBiz V1 — Technical Handover Document

**Date:** 2026-11-21
**Version:** V1 (final production state)
**Domain:** zanzibiz.com
**Supabase Project:** https://jaoyujiwqzzrdhmzntlj.supabase.co

---

## 1. Executive Summary

ZanziBiz is a local business directory and travel-guide platform for Zanzibar. It supports three user roles (regular users, business owners, admins), a token-based economy for boosting listings, a ClickPesa mobile-money top-up flow, blog/travel-guide content, bilingual English/Swahili UI, and a PWA installable shell. The frontend is a multi-page static site built with Vite + Tailwind, hosted on Netlify. The backend is Supabase (Postgres + Auth + Storage + Edge Functions).

This document is the authoritative technical handover for engineering teams.

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser (PWA)                         │
│  Multi-page HTML + vanilla JS modules (Vite-bundled)         │
│  Talks to Supabase via anon key (RLS-enforced)               │
└───────────────┬──────────────────────────┬───────────────────┘
                │                          │
                ▼                          ▼
┌───────────────────────────┐   ┌──────────────────────────────┐
│   Supabase Postgres       │   │   Supabase Edge Functions    │
│   - 18 tables (RLS on)    │   │   - ClickPesa topup flow (6) │
│   - 27 functions/RPCs     │   │   - clickpesa-webhook (1)    │
│   - 8 triggers            │   │   - send-welcome-email (1)   │
│   - 1 view                │   │   - clickpesa-preview/test(2)│
│   - 3 storage buckets     │   └──────────────────────────────┘
└─────────────┬─────────────┘
              │
              ▼
        auth.users (31)
              │  handle_new_user trigger
              ▼
        profiles (31) ──┬── business_profiles (20) ── listings (118)
                        ├── favorites (14)
                        ├── blog_posts (32)
                        └── (empty: reviews, messages, analytics, bans…)
```

### Hosting & domains
- **Frontend:** Netlify (`dist/` published, `_redirects` for clean URLs)
- **Database / Auth / Storage / Functions:** Supabase (Bolt-managed project)
- **Domain:** zanzibiz.com → Netlify DNS
- **Edge Functions:** run on Supabase Deno runtime, callable via `/functions/v1/<slug>`

---

## 3. Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Build tool | Vite | ^5.0.0 |
| CSS | Tailwind CSS + @tailwindcss/typography | ^3.4.19 / ^0.5.19 |
| JS minifier | Terser | ^5.46.0 |
| DB client | @supabase/supabase-js | ^2.39.0 |
| Fonts | Playfair Display, Plus Jakarta Sans | Google Fonts CDN |
| Animation | anime.js v3.2.1 | CDN |
| PWA | Custom service worker + manifest.json | — |
| i18n | Custom dictionary (en, sw) | `lib/i18n.js` |
| Backend | Supabase (PostgreSQL 15+) | Managed |
| Edge runtime | Deno | Supabase-hosted |
| Payment | ClickPesa (Tanzanian mobile money, USSD push) | Edge Functions |
| Email | Resend | `send-welcome-email` function |
| Maps | Google Maps (link-only), What3Words (stored field) | No API key |

---

## 4. Project Structure

```
project/
├── index.html                  # Homepage
├── about.html, contact.html, privacy.html, terms.html, affiliate.html, webstart.html
├── blog.html → /travel-guide (301)  blog-post.html  travel-guide.html
├── travel-guide/{flights,where-to-stay,hotels,tours,airport-transfers}.html
├── auth/{login,signup}.html
├── business/{dashboard,listing,topup}.html
├── admin/{dashboard,payments}.html + admin-enhanced.js
├── user/{profile,settings,liked}.html
├── directory/{index,category}.html
├── download.html               # Download Center (base64-embedded bundles)
├── lib/
│   ├── supabase.js             # Supabase client + all data-access functions
│   ├── auth-guard.js           # Client-side route guard (UX, not security)
│   ├── i18n.js                 # EN/SW translation dictionary
│   ├── lang-selector.js        # Language dropdown
│   ├── page-translator.js      # Auto-translates page content
│   ├── mock-payments.js        # Legacy mock payment (superseded by ClickPesa)
│   ├── live-info-widget.js     # Stone Town time / weather / USD→TZS
│   ├── pwa.js                  # Service worker registration
│   └── design-system.css       # Custom design tokens
├── src/tailwind.css            # Tailwind input
├── public/                     # Static assets (copied to dist/)
│   ├── _redirects              # Netlify clean-URL rewrites
│   ├── sw.js, manifest.json, offline.html
│   ├── robots.txt, sitemap.xml
│   ├── *.png / *.ico / *.jpeg  # Icons, logo, hero images
│   ├── v1_schema_export.sql    # Authoritative schema (regenerated)
│   ├── v1_schema_bundle.zip    # Schema + manifest bundle
│   ├── zanzibiz-v1a-final-migration-bundle-v2.zip  # Read-only migration export
│   ├── database-backup.zip, storage-*.zip          # Backups
│   └── ...
├── supabase/
│   ├── migrations/             # 43 SQL migration files (chronological)
│   ├── functions/              # 9 Edge Functions (see Section 7)
│   └── seed*.sql               # 4 seed scripts
├── backups/
│   ├── csv/                    # 18 JSON table exports
│   ├── schema/schema-dump.txt  # Full introspected schema
│   ├── storage/                # Storage objects on disk + checksums
│   ├── storage-manifest/STORAGE-MANIFEST.json
│   ├── checksums.sha256
│   └── VALIDATION-REPORT.md
├── package.json, vite.config.js, tailwind.config.js
├── .env                        # VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
└── *.md                        # Project documentation (20+ files)
```

### Vite entry points (27 multi-page inputs)
Configured in `vite.config.js → rollupOptions.input`: homepage, login, signup, businessDashboard, businessTopup, businessListing, adminDashboard, adminPayments, userProfile, userSettings, userLiked, offline, blog, blogPost, webstart, travelGuide + 5 travel-guide subpages, about, contact, privacy, terms, affiliate, directoryIndex, directoryCategory, download.

---

## 5. Database Schema

### 5.1 Tables (18, all RLS-enabled)

| # | Table | Rows | Purpose |
|---|-------|------|---------|
| 1 | `profiles` | 31 | User accounts; FK→`auth.users.id` ON DELETE CASCADE; `user_type` enum (user/business/admin) |
| 2 | `business_profiles` | 20 | Business owner profile + token balance (default 100) |
| 3 | `listings` | 118 | Business listings; `status` active/boosted; `category` enum |
| 4 | `blog_posts` | 32 | Travel-guide articles; `status` draft/published; JSONB `images`, `content_images`, `tags`, `useful_links` |
| 5 | `favorites` | 14 | User↔listing saves (UNIQUE user_id+listing_id) |
| 6 | `token_topups` | 24 | ClickPesa top-up order records |
| 7 | `orders` | 19 | Payment orders (1,500 TZS for 300 tokens) |
| 8 | `token_transactions` | 2 | Token spend/grant ledger |
| 9 | `payment_events` | 1 | ClickPesa webhook event log |
| 10 | `business_wallets` | 2 | Per-business wallet (1:1 with business_profiles) |
| 11 | `reviews` | 0 | Listing reviews (schema exists, no UI) |
| 12 | `messages` | 0 | User→business messages (schema exists, no UI) |
| 13 | `page_views` | 0 | Analytics (table exists, tracking not firing) |
| 14 | `listing_analytics` | 0 | Per-listing analytics |
| 15 | `daily_stats` | 0 | Aggregated daily stats |
| 16 | `token_ledger` | 0 | Legacy ledger (unused) |
| 17 | `token_purchases` | 0 | Legacy purchases (unused) |
| 18 | `user_bans` | 0 | User ban records (no enforcement UI) |

**Total records:** 263 across 18 tables.

### 5.2 Key foreign keys (21 total)
- `profiles.id` → `auth.users(id)` ON DELETE CASCADE (the auth FK — added in the regenerated schema export)
- `business_profiles.user_id` → `profiles(id)` (1:1, UNIQUE)
- `listings.business_id` → `business_profiles(id)` (1:N)
- `blog_posts.created_by` → `profiles(id)`
- `favorites.user_id` → `profiles(id)`, `favorites.listing_id` → `listings(id)`
- `business_wallets.business_id` → `business_profiles(id)` (1:1)
- `token_topups/orders/token_transactions.business_id` → `business_profiles(id)`
- `reviews/messages/listing_analytics.listing_id` → `listings(id)`
- `user_bans.user_id`, `user_bans.banned_by` → `profiles(id)`

### 5.3 Extensions
- `pgcrypto` — `gen_random_uuid()`
- `uuid-ossp` — UUID generation helpers
- `http` — used by the `send_welcome_email_trigger()` function to call the Edge Function via `pg_net`/HTTP

### 5.4 Triggers (8)
| Trigger | Table | Event | Function |
|---------|-------|-------|----------|
| `on_profile_created_send_welcome_email` | profiles | AFTER INSERT | `send_welcome_email_trigger()` |
| `handle_new_user` | profiles | AFTER INSERT (auth) | `handle_new_user()` — auto-creates profile on signup |
| `assign_business_client_id` | business_profiles | BEFORE INSERT | `assign_client_id_trigger()` |
| `trigger_set_business_identifier` | business_profiles | BEFORE INSERT | `set_business_identifier()` |
| `update_*_updated_at` (×5) | business_profiles, listings, profiles, reviews, token_topups | BEFORE UPDATE | `update_updated_at_column()` |

### 5.5 Database functions / RPCs (27)
Key callable RPCs (invoked from the frontend via `.rpc()`):

| Function | Purpose |
|----------|---------|
| `is_admin()` | Returns true if `auth.uid()` profile has `user_type='admin'` |
| `boost_listing(listing_uuid, days)` | Deduct tokens + set `boost_expires_at` (SECURITY DEFINER) |
| `increment_view_count(listing_uuid)` | Increment listing view counter |
| `increment_contact_count(listing_uuid)` | Increment listing contact counter |
| `change_user_type(user_id, new_type)` | Admin changes a user's role |
| `purchase_tokens(business_id, amount, payment_method)` | Legacy purchase (superseded by ClickPesa flow) |
| `add_tokens_to_business(purchase_id, amount)` | Credit tokens to business |
| `grant_tokens_to_business(business_id, amount)` | Admin grants tokens |
| `finalize_topup_credit(...)` / `finalize_credit_topup(...)` | Credit tokens after ClickPesa confirmation |
| `admin_create_user(...)` | Admin creates new user |
| `admin_delete_listing(...)` | Admin deletes listing |
| `ban_user(...)` / `unban_user(...)` | Admin user moderation |
| `aggregate_daily_stats()` | Roll up daily stats |
| `get_listing_average_rating(listing_uuid)` | Avg rating for a listing |
| `get_listing_review_count(listing_uuid)` | Review count for a listing |
| `get_listing_performance(...)` | Per-listing performance record |
| `get_platform_insights()` | Platform-wide analytics (admin) |
| `get_revenue_analytics()` | Revenue analytics (admin) |
| `get_user_growth_data()` | User growth record (admin) |
| `generate_business_identifier()` / `generate_client_id()` | Auto-generate identifiers |
| `simulate_token_purchase(...)` | Testing helper |
| `handle_new_user()` / `send_welcome_email_trigger()` / `set_business_identifier()` / `assign_client_id_trigger()` / `update_updated_at_column()` | Trigger functions |

### 5.6 Views (1)
- `public_business_profiles` — public-safe subset of `business_profiles` columns.

### 5.7 Indexes (20+)
Btree UNIQUE on all PKs; plus `idx_listings_category`, `idx_listings_status`, `idx_listings_slug`, `idx_listings_business_id`, `idx_blog_posts_slug`, `idx_blog_posts_status`, `idx_blog_posts_category`, `idx_favorites_user_listing` (UNIQUE), `idx_token_topups_topup_reference` (UNIQUE), `idx_orders_order_reference` (UNIQUE).

### 5.8 Row Level Security
**All 18 tables have RLS enabled.** Policy patterns:

- **Public read:** `listings` (status active/boosted), `blog_posts` (status published), `business_profiles`, `profiles` (all visible).
- **Owner-scoped:** `favorites` (user_id = auth.uid()), `listings` INSERT/UPDATE/DELETE (business owned by auth.uid()), `business_profiles` (user_id = auth.uid()), `profiles` UPDATE (id = auth.uid()), `reviews`/`messages` INSERT (sender/user = auth.uid()).
- **Admin-scoped:** `blog_posts` INSERT/UPDATE/DELETE, `listings` UPDATE/DELETE (any), `business_profiles` UPDATE (any), `profiles` SELECT/UPDATE (any), `token_transactions` INSERT (grant), `token_topups`/`orders` SELECT (all), `user_bans` INSERT.
- **Storage policies (12):** Public SELECT on `blog-images`, `listing-images`, `profile-pictures`; authenticated INSERT on all three; owner-scoped UPDATE/DELETE on `profile-pictures` (auth.uid() = folder name); admin-scoped UPDATE/DELETE on `blog-images`. (Listing-images UPDATE/DELETE is broader than ideal — any authenticated user.)

**Total:** 55 public-schema policies + 12 storage policies = 67 RLS policies.

### 5.9 Storage buckets (3)

| Bucket | Objects | Size | Public | Allowed MIME |
|--------|---------|------|--------|--------------|
| `blog-images` | 175 | 164.6 MB | Yes | none (no restriction) |
| `listing-images` | 72 | 17.6 MB | Yes | jpeg, jpg, png, webp, gif; 5 MB limit |
| `profile-pictures` | 7 | 1.4 MB | Yes | jpeg, jpg, png, webp; 1 MB limit |
| **Total** | **254** | **183.7 MB** | | |

Object URLs: `https://jaoyujiwqzzrdhmzntlj.supabase.co/storage/v1/object/public/{bucket}/{path}`

---

## 6. Authentication & Roles

| Aspect | Implementation |
|--------|---------------|
| Provider | Supabase Auth — email/password only |
| Email confirmation | **Disabled** (users sign in immediately after signup) |
| Session | `persistSession: true`, `autoRefreshToken: true` (localStorage) |
| Route protection | `lib/auth-guard.js` — client-side guard with role checks (`any`/`business`/`admin`). **This is UX only — RLS is the real security boundary.** |
| Role enum | `user` \| `business` \| `admin` (PostgreSQL enum on `profiles.user_type`) |
| Role assignment | Set at signup via `user_metadata.user_type`; changeable via `change_user_type()` RPC (admin) |
| Profile creation | `handle_new_user()` trigger auto-creates a `profiles` row on `auth.users` INSERT |
| Welcome email | `send_welcome_email_trigger()` fires on `profiles` INSERT → calls `send-welcome-email` Edge Function via HTTP → Resend API |
| Social login / magic link | Not configured |
| Password reset | Login page has "Forgot password?" link; Supabase Auth email templates — **verify end-to-end** |

### Admin account
- Email: `madu@zanzibiz.com`
- Password: managed by Supabase Auth (not stored in any file). Reset via Supabase Dashboard → Authentication → Users.

### Auth users (31)
Full list is in `backups/csv/profiles.json`. Demo users include `demo1@zanzibiz.com`, `demo@zanzibiz.com`, plus real business sign-ups from 2026-03 through 2026-07.

---

## 7. Edge Functions (9 deployed)

All functions live in `supabase/functions/<slug>/index.ts`, deployed via the Supabase MCP `deploy_edge_functions` tool. CORS headers are mandatory on every response.

| Slug | JWT | Purpose |
|------|-----|---------|
| `topup-create` | Yes | Create a token top-up order |
| `topup-initiate` | Yes | Initiate ClickPesa USSD push |
| `topup-verify` | Yes | Verify payment status |
| `topup-status` | No | Check payment status (public) |
| `topup-confirm` | No | Confirm payment + credit tokens (called by webhook) |
| `clickpesa-webhook` | No | Receive ClickPesa payment webhooks (HMAC-SHA256 checksum verified with `CLICKPESA_CHECKSUM_SECRET`) |
| `clickpesa-preview` | Yes | Preview USSD push request |
| `clickpesa-test` | No* | Test ClickPesa connectivity |
| `send-welcome-email` | No | Send welcome email via Resend (called by DB trigger) |

\* `clickpesa-test` has `verifyJWT: false` in the live deployment (was originally JWT-required in docs).

Shared module: `supabase/functions/_shared/clickpesa.ts` — ClickPesa helpers including `verifyWebhookChecksum()` (timing-safe comparison). **Security note:** if `CLICKPESA_CHECKSUM_SECRET` is unset, verification is skipped (returns `true`) — a misconfiguration risk.

### ClickPesa flow
```
Client → topup-create   (creates order row, returns topup_reference)
       → topup-initiate (calls ClickPesa USSD push API)
ClickPesa → clickpesa-webhook (HMAC-verified)
         → topup-confirm (credits tokens via finalize_topup_credit())
Client polls → topup-status (returns current state)
```

---

## 8. Frontend Data Access Layer (`lib/supabase.js`)

The Supabase client is a singleton reading `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` from `.env`. Exported functions:

**Auth:** `signUp`, `signIn`, `signOut`, `getCurrentUser`, `getUserProfile`
**Listings:** `getListings`, `getBoostedListings`, `getRegularListings`, `getListingsCount`, `createListing`, `updateListing`, `deleteListing`, `boostListing`
**Business:** `getBusinessProfile`, `createBusinessProfile`, `getBusinessListings`, `purchaseTokens`
**Favorites:** `getFavorites`, `toggleFavorite`
**Reviews:** `createReview` (UI not wired)
**Messages:** `getMessages`, `sendMessage`, `markMessageAsRead` (UI not wired)
**Analytics:** `getAnalytics`, `incrementViewCount`, `incrementContactCount`

**Known issue:** `boostListing` performs a client-side token-balance check + deduction (race condition risk). The server-side `boost_listing()` SECURITY DEFINER RPC is safer.

---

## 9. Migrations (43 files)

All migrations live in `supabase/migrations/` and apply in chronological order. Highlights:

| Range | Purpose |
|-------|---------|
| 001–002 | Initial schema (profiles, listings, business_profiles, reviews, favorites, messages) + admin/categories |
| 003–012 | Listing details, boost function, RLS fixes, listing-images bucket, profile pictures |
| 013–018 | Token purchases, signup fixes, analytics tables, change_user_type |
| 019–020 | Security fixes, admin user creation + analytics RPCs |
| 021–025 | Blog posts table, useful links, seed content, content images, grant-tokens fix |
| 026–028 | ClickPesa topup functions, 1,500 TZS package, orders table |
| 029–033 | Security/perf fixes, profile-pictures bucket, welcome-email trigger, `http` extension |
| 034–043 | Admin edit/create listings, security permission fixes, revoke public EXECUTE, comprehensive RLS audit, SECURITY DEFINER fixes, is_admin grants, analytics grants, admin blog read |

**Regenerated schema export:** `public/v1_schema_export.sql` is the authoritative single-file restore schema — includes all 3 extensions (pgcrypto, uuid-ossp, http), 18 tables, 21 FKs (including the auth FK), 28 functions, 67 RLS policies (55 public + 12 storage), 8 triggers, 20 indexes, 1 view, 3 storage buckets. Restore-tested in a temporary `v1_restore_test` schema and dropped after validation.

---

## 10. Environment Variables & Secrets

### Client-side (`.env`, exposed to browser)
| Variable | Purpose |
|----------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key |

### Server-side (Supabase Edge Function secrets — not in `.env`)
| Secret | Purpose |
|--------|---------|
| `SUPABASE_URL` | Server-side Supabase URL |
| `SUPABASE_ANON_KEY` | Server-side anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (bypasses RLS) |
| `SUPABASE_DB_URL` | Direct Postgres connection string |
| `CLICKPESA_CLIENT_ID` | ClickPesa merchant client ID |
| `CLICKPESA_API_KEY` | ClickPesa merchant API key |
| `CLICKPESA_CHECKSUM_SECRET` | Webhook HMAC-SHA256 secret |
| `CLICKPESA_BASE_URL` | ClickPesa API base URL |
| `APP_PUBLIC_URL` | Public app URL (callbacks) |
| `RESEND_API_KEY` | Resend email API key |

### External accounts to transfer
Supabase (project ownership), Netlify (site + env vars), zanzibiz.com DNS, ClickPesa merchant, Resend (sending domain verification), Google Search Console (if claimed), Pexels (passive).

---

## 11. API Surface

The app uses Supabase's auto-generated PostgREST API — no custom API server. All data goes through the JS client or `.rpc()` calls. Edge Functions expose these endpoints:

| Endpoint | Method | Auth |
|----------|--------|------|
| `/functions/v1/topup-create` | POST | JWT |
| `/functions/v1/topup-initiate` | POST | JWT |
| `/functions/v1/topup-verify` | POST | JWT |
| `/functions/v1/topup-status` | GET | none |
| `/functions/v1/topup-confirm` | POST | none |
| `/functions/v1/clickpesa-webhook` | POST | none (HMAC) |
| `/functions/v1/clickpesa-preview` | POST | JWT |
| `/functions/v1/clickpesa-test` | GET | none |
| `/functions/v1/send-welcome-email` | POST | none |

REST data API: `https://jaoyujiwqzzrdhmzntlj.supabase.co/rest/v1/<table>` (anon key + RLS).

---

## 12. PWA & SEO

### PWA
- `public/manifest.json` — installable, icons reuse the logo for all sizes (placeholder)
- `public/sw.js` — service worker (version `v3`). **Background sync stubs are non-functional.** Push listener exists but no push server / VAPID keys.
- `public/offline.html` — offline fallback page
- **Known issue:** a stale service worker was intercepting download requests and returning HTML fallbacks. The Download Center now embeds files as base64 blobs to bypass this.

### SEO
- `public/robots.txt` — allow all, references sitemap
- `public/sitemap.xml` — ~160 URLs (homepage, directory, categories, travel guide, ~117 listing pages, static pages)
- `public/_redirects` — Netlify clean-URL rewrites (200 rewrites) + one 301 (`/blog → /travel-guide`)
- JSON-LD schema: Article (blog posts), Blog (listing), LocalBusiness (business listing), BreadcrumbList (category), WebSite (directory), TouristDestination (travel-guide hub). **Homepage lacks JSON-LD — add WebSite + Organization.**
- **Gaps:** OG image is a Pexels stock photo (replace with branded image); hero stats "1000+ Businesses" / "5000+ Reviews" are hardcoded and inaccurate (actual: 118 listings, 0 reviews); dynamic `/business/:slug` and `/travel-guide/:slug` pages are client-side rendered — verify crawlability via Search Console.

---

## 13. Internationalization

- `lib/i18n.js` — 844-line EN/SW translation dictionary
- `lib/lang-selector.js` — dropdown in nav bar, persists choice
- `lib/page-translator.js` — auto-translates page content via `data-i18n` attributes
- Languages: English (default), Swahili

---

## 14. Unfinished / Mocked / Placeholder Features

| Feature | Status |
|---------|--------|
| Reviews | Table + `createReview()` exist; no UI on listing pages |
| Messages | Table + functions exist; no messaging UI |
| Business verification | `verified` column exists; all 20 businesses are `false`; no verification workflow |
| Full-text search | Not implemented (basic `ilike` on title/description only) |
| Blog search | Not implemented |
| Google Analytics | Not integrated; `page_views`/`listing_analytics`/`daily_stats` have 0 rows |
| Email notifications | Welcome email only — no password reset, approval, or message emails |
| Password reset | UI link exists; flow not verified end-to-end |
| User bans | Table + `is_banned` column; no ban UI or enforcement |
| Token ledger | Table exists, unused (token_transactions used instead) |
| Affiliate program | Static page only, no backend |
| Mock payments | `lib/mock-payments.js` — 90% success simulation; superseded by ClickPesa but file remains |
| Service worker background sync | Empty stubs (`syncFavorites`, `syncReviews`, `syncMessages`) |
| Push notifications | Receiver only, no push server |
| Content moderation | Not implemented — no listing approval, flagging, spam prevention, or image moderation |
| PWA screenshots/icons | All sizes use the logo (placeholder) |

---

## 15. Backups & Exports

| Artifact | Location | Contents |
|----------|----------|----------|
| Table JSON exports (18) | `backups/csv/*.json` | All 18 tables, 263 total records |
| Schema dump | `backups/schema/schema-dump.txt` | Full introspected schema |
| Authoritative schema SQL | `public/v1_schema_export.sql` | Single-file restore schema (regenerated, restore-tested) |
| Schema bundle ZIP | `public/v1_schema_bundle.zip` | Schema + migration history + manifest |
| SHA-256 manifest | `public/v1_sha256_manifest.txt` | Checksums + restore test results |
| Storage manifest | `backups/storage-manifest/STORAGE-MANIFEST.json` | 254 objects, 3 buckets |
| Storage objects on disk | `backups/storage/files/{bucket}/...` | All 254 files backed up locally |
| Storage checksums | `backups/storage/storage_checksums.sha256` | Per-object SHA-256 |
| Validation report | `backups/VALIDATION-REPORT.md` | Row counts + storage counts match live DB |
| Full DB backup (recommended) | via `pg_dump "$SUPABASE_DB_URL" --schema=public --schema=auth --schema=storage --format=custom` | Includes auth.users + password hashes |
| V1A Final Migration Bundle V2 | `public/zanzibiz-v1a-final-migration-bundle-v2.zip` (132,107 bytes, SHA-256 `b44c0ffceb22d52d729fad2e784e08e29dacbb66c4c9b007dc87b345c57d2f8b`) | Read-only export: 18 JSON data files, 254-object media map (149 mapped / 105 unmapped), SEO URL inventory, auth status, validation reports, MANIFEST.json + SHA256SUMS.txt |

### V1A bundle V2 contents
- `data/` — 18 JSON files (263 records)
- `media/v1_media_map.json` — 254 Storage objects with SHA-256, size, mime, entity mapping
- `auth/AUTH-MIGRATION-STATUS.md` — confirms `database-backup.zip` as auth source
- `seo/v1_url_inventory.csv` — 183 URLs; `seo/v1_redirect_recommendations.csv` — 11 redirects
- `reports/` — DATA-INVENTORY, MEDIA-INVENTORY, MEDIA-MAPPING-RECONCILIATION, EXPORT-VALIDATION, README-RESTORE
- `MANIFEST.json` + `SHA256SUMS.txt` (no self-checksum)

---

## 16. Deployment

### Local development
```bash
npm install
npm run dev    # Vite dev server on port 3000
```

### Production build
```bash
npm run build  # outputs to dist/, minified with Terser (console.log dropped)
```

### Netlify deployment
1. Connect GitHub repo
2. Build command: `npm run build` | Publish directory: `dist`
3. Environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
4. Push to `main` triggers deploy
5. `public/_redirects` is copied into `dist/` automatically

### Supabase
- Migrations already applied to production (43 files)
- Edge Functions deployed (9 active)
- Secrets configured (10)
- Storage buckets created (3)

---

## 17. V2 Migration Path

1. Create a new GitHub repo (`zanzibiz-v2`) and a **separate** Supabase project for V2 development
2. Do not modify the V1 repo — it is the production source of truth
3. Use a staging domain (`v2.zanzibiz.com`) for V2 testing
4. When V2 is ready: deploy to a new Netlify site, test thoroughly, then update DNS to point zanzibiz.com to V2
5. Keep V1 running on a backup subdomain (`v1.zanzibiz.com`) for 30 days as rollback
6. To preserve auth users with existing passwords, claim the Bolt Supabase database into your Supabase org **only after V2 is validated** (irreversible, changes project URL + keys)

### Cutover principle
Every step is reversible until the final DNS switch. DNS revert is the primary rollback mechanism. Since the frontend-only cutover keeps the same Supabase database, no data sync is needed and user sessions persist (auth tokens are tied to the Supabase project URL, not the frontend domain).

---

## 18. Known Security Considerations

1. **`boostListing` client-side token deduction** — race condition. Prefer the `boost_listing()` SECURITY DEFINER RPC.
2. **ClickPesa webhook checksum skip** — if `CLICKPESA_CHECKSUM_SECRET` is unset, verification returns `true`. Ensure the secret is always configured.
3. **Listing-images UPDATE/DELETE policy** — any authenticated user can update/delete any listing image (broader than ideal). Tighten to owner-scoped.
4. **`auth-guard.js` is UX, not security** — RLS is the real boundary. Do not rely on client-side guards for access control.
5. **Anon key is visible in the browser** — by design. RLS enforces data access. Never expose the service role key client-side.
6. **No content moderation** — no listing approval, flagging, spam prevention, or image scanning.
7. **CORS `Access-Control-Allow-Origin: *`** on all Edge Functions — appropriate for a public API but be aware.

---

## 19. Key Files Quick Reference

| File | Purpose |
|------|---------|
| `lib/supabase.js` | Supabase client + all data-access functions |
| `lib/auth-guard.js` | Client-side route guard |
| `lib/i18n.js` | EN/SW translation dictionary |
| `vite.config.js` | 27 entry points, Terser minification, vendor chunk |
| `tailwind.config.js` | Brand theme |
| `public/v1_schema_export.sql` | Authoritative single-file schema restore |
| `public/_redirects` | Netlify clean-URL rules |
| `public/sw.js` | Service worker (v3) |
| `supabase/functions/_shared/clickpesa.ts` | ClickPesa shared helpers (HMAC verification) |
| `backups/csv/*.json` | All 18 table exports |
| `backups/storage-manifest/STORAGE-MANIFEST.json` | Full storage object manifest |
| `HANDOVER.md` | Production handover (Aug 2026) |
| `HANDOVER-MIGRATION.md` | Ownership & migration package (Aug 2026) |
| `download.html` | Download Center (base64-embedded bundles bypassing stale SW) |

---

*This document was generated on 2026-11-21 as the consolidated technical handover for ZanziBiz V1. It supersedes no prior agreement but consolidates the architectural, backend, functional, and structural overview for engineering continuity.*
