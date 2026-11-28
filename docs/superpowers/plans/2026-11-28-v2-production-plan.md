# ZanziBiz V2 Production Implementation Plan

> **For agentic workers (Codex or Claude):** work one task at a time, in order within a phase. Each task lists the files, the steps, the acceptance commands and whether it needs Madu's approval. Steps use checkbox (`- [ ]`) syntax for tracking. When a phase starts, write a detailed TDD sub-plan for it in this folder (`YYYY-MM-DD-phase-N-<name>.md`) with full code per step, then execute that sub-plan.

**Goal:** Ship zanzibiz.com V2 live on Mon 7 Dec 2026 (fast track below), then improve weekly, keeping every live account, listing, dashboard, guide and URL, adding server-rendered SEO and AI-search pages and a comics section, with Android and iOS apps following, ready for a sale pitch from 22 Feb 2027.

**Architecture:** Same Supabase project (`jaoyujiwqzzrdhmzntlj`, after the claim) and same domain. A new Astro 5 front end on Netlify replaces the Vite multi-page V1: public pages are rendered on the server (listings, categories, articles on demand; static guide pages prerendered), signed-in pages are client islands using supabase-js with the same anon key, so existing sessions carry over. Database changes are additive only, each with a written undo. Capacitor wraps the V2 web for the apps.

**Tech stack:** Astro 5 + `@astrojs/netlify`, TypeScript, Tailwind 4 (tokens from `design/DESIGN.md`), `@supabase/supabase-js` 2.x, Supabase Postgres/Auth/Storage/Edge Functions, Netlify (Functions, deploy previews, image CDN), Cloudflare DNS, Vitest, Playwright, Supabase CLI (local stack for RLS tests), Lighthouse CI, Capacitor 6.

**Fallback architecture (if Madu declines Astro, decision D1):** keep V1's Vite multi-page app, add one Netlify Function that renders `/business/:slug`, `/directory/:category` and `/travel-guide/:slug`, and restyle the 29 HTML entries. Tasks below marked `[A]` change in that case; everything else is the same.

---

## Fast track (agreed direction, 28 Nov 2026): live Mon 7 Dec 2026

This supersedes the Astro architecture and the section 4 dates. V2 launches on **V1's code** (Vite multi-page, plain JS, supabase-js) restyled with `design/DESIGN.md`, plus one Netlify Function for public pages. Same Supabase project, logins, URLs (including `/auth/*.html`, `/user/*.html`, `/business/dashboard.html`, `/admin/*.html`) and buckets. Astro (task 2.1) is skipped; revisit after the pitch.

| Day | Tasks |
|---|---|
| Mon 30 Nov | Madu downloads newest Bolt code (1.5) and runs 0.1. Import it into this repo without `public/*.zip`, `backups/`, `dist/`, `download.html`; add 2.2 guard + gitleaks |
| Mon–Tue | 0.2–0.4 security fixes with tests, Madu approves and applies; 0.5 admin audit |
| Tue–Thu | 2.3 design tokens into `lib/design-system.css` + Tailwind config, restyle all 29 pages; one Netlify Function `netlify/functions/render.ts` serving `/business/:slug`, `/directory/:category`, `/travel-guide/:slug`, `/blog/:slug` (forced rules) with real 404/503, canonical, meta, JSON-LD (3.1–3.3); DB sitemap (3.5); robots + llms.txt (3.6); forwards incl. `/blog 301!` (3.7); new `public/sw.js` that clears V1 caches (3.9); remove bolt.new badge |
| Thu | 1.4 new Netlify project `zanzibiz-v2` in Madu's team, password-protected previews |
| Fri 4 Dec | Preview QA: sign-in (email + Google), owner edit, admin, payments still off, every row of `docs/routes.csv`, `scripts/seo-smoke.sh`; Madu go/no-go |
| Mon 7 Dec 06:00 EAT | 5.2 cutover: add zanzibiz.com + www to the new project (TXT verification in Cloudflare if Netlify asks); smoke tests live; rollback = point domain back |

After launch: phase 1 claim + backup (7–11 Dec), dashboards/analytics/moderation/saved/guide answers/RLS suite (14 Dec–8 Jan), apps (14 Dec–15 Jan: Android submit 11 Jan, iOS 15 Jan), comics (live 9 Feb), buyer pack (1–19 Feb), pitch from 22 Feb. Task numbers below still apply; ignore `[A]` Astro file paths and use V1 equivalents.

Risks to 7 Dec: newest code only in Bolt; hosting in Bolt's Netlify account (domain verification or release by Bolt); security fixes need Madu's yes; less testing than the January plan (dashboard polish moves to week 2).

---

## 0. Ground rules for every task

1. Never commit secrets, `.env`, database exports, Auth data, user rows or storage archives. The V1 backup repo `mtantpn/v2moving` contains all of these in `public/` and `backups/`; copy source files from it one by one, never the folders.
2. The browser holds only the public anon key. Service-role keys live in Supabase and Netlify secrets.
3. Every migration is additive (new tables, nullable columns or columns with defaults, new views, new policies, new functions) and ships with `supabase/migrations/down/<same-name>.down.sql`.
4. V1 must keep working against the database until V2 has been live for 14 days. Never rename or drop a column, table, enum value, bucket or function V1 uses.
5. No production change (database, Netlify production deploy, DNS, Cloudflare, Supabase settings, edge function deploy, payment config) without Madu's written go-ahead in the project thread. Everything else goes through a pull request and a Netlify deploy preview.
6. Public pages only ever show approved, active listings and published guides. Drafts, pending, rejected, expired and private records never reach HTML, JSON-LD, sitemaps or caches.
7. No claims the data cannot back: no "verified" until D4 defines it, no public counters of messages or revenue, no guarantees.

## 1. What exists today (inventory, 28 Nov 2026)

| Asset | Where | State |
|---|---|---|
| Live site | zanzibiz.com, served by Netlify | Built in bolt.new. Live bundle (`main-0T6DFXAq.js`) does not match the backup snapshot, so the newest source is still in Bolt |
| Netlify hosting | Not in Madu's Netlify team | Madu's team (Pro) has 9 projects, none serving zanzibiz.com. The site sits in an account Bolt controls. Needs a transfer or a domain move (task 1.4) |
| Database, Auth, Storage | Supabase project `jaoyujiwqzzrdhmzntlj` | Bolt-managed. 361 profiles, 139 business profiles, 123 listings, 32 blog posts, 24 top-ups, 19 orders (Bolt panel, 27 Nov). Buckets `blog-images`, `listing-images`, `profile-pictures` |
| Supabase org | `aisqnweb`, Pro | Holds only an unrelated project. Ready to receive the claim |
| DNS | Cloudflare | Apex DNS-only to Netlify; `www` proxied |
| V1 source snapshot | GitHub `mtantpn/v2moving` @ `082d4ed`; local bare repo in the Zanzibiz v2 production folder | Contains recovery exports. Read-only reference |
| V2 repo | GitHub `mtantpn/zanzibiz-v2` | `main` has README rules. Draft PR #1 holds the design prototype |
| Design direction | `design/prototype/` on PR #1, `design/DESIGN.md` | Agreed 27 Nov: white, Plus Jakarta Sans, Zanzibar yellow `#FFC72C` primary, flag blue links, green only for WhatsApp, real local photos. Supersedes the Lagoon palette in `codex-prompt-lagoon.md` |
| Feature list | Doc "ZanziBiz V2 features to agree" | 23 features, decisions not yet set, 6 open questions |
| Review | Doc "ZanziBiz V2 production plan review" | Security findings V1 to V13, rendering comparison, app risks |

### V1 features to preserve (route → V2 equivalent)

| V1 page or function | Route | V2 |
|---|---|---|
| Home | `/` | `src/pages/index.astro` (SSR, short cache) |
| Directory index | `/directory`, `/directory/` | `src/pages/directory/index.astro` |
| Category | `/directory/:category` (slugs: accommodation, activities, automotive, business, events, jobs) | `src/pages/directory/[category].astro` (SSR, paginated `?page=N`) |
| Listing | `/business/:slug` | `src/pages/business/[slug].astro` (SSR, real 404) |
| Travel guide hub + 5 static guides | `/travel-guide`, `/travel-guide/{flights-to-zanzibar,where-to-stay,hotels,tours,airport-transfers}` | prerendered pages, same URLs |
| Guide article | `/travel-guide/:slug`, `/blog/:slug` | `src/pages/travel-guide/[slug].astro` (SSR); `/blog/:slug` 301 to it (D3) |
| Blog list | `/blog` | 301 to `/travel-guide` (forced, fixes V7) |
| About, Contact, Privacy, Terms, Affiliate, WebStart | `/about` `/contact` `/privacy` `/terms` `/affiliate` `/webstart` | prerendered, same URLs |
| Login (email + Google), Signup | `/auth/login.html`, `/auth/signup.html` | `/auth/login`, `/auth/signup`; `.html` paths 301 |
| User profile, settings, liked | `/user/profile.html`, `/user/settings.html`, `/user/liked.html` | `/account`, `/account/settings`, `/saved`; old paths 301 |
| Business dashboard (my listings, add/edit listing, boost, featured, tokens) | `/business/dashboard.html` | `/business/dashboard` island |
| Token top-up (paused) | `/business/topup.html` | kept behind flag `PAYMENTS_ENABLED=false` |
| Admin (overview, traffic timeline, site evolution, listings, users, create user, moderation, guides CMS, grant tokens, useful info, top listings) | `/admin/dashboard.html` | `/admin` island, same features |
| Admin payments | `/admin/payments.html` | `/admin/payments` |
| PWA + offline page | `public/sw.js`, `offline.html`, manifest | new `sw.js` at the same path that first clears V1 caches (task 3.9) |
| EN/SW language | `lib/i18n.js`, `lib/page-translator.js` (client-side) | server-rendered strings; `/sw/` pages later (D5) |
| Live info widget | `lib/live-info-widget.js` | port as a component |
| Edge functions | `topup-create`, `topup-initiate`, `topup-verify`, `topup-status`, `topup-confirm`, `clickpesa-webhook`, `clickpesa-preview`, `clickpesa-test`, `send-welcome-email` | keep; harden webhook; remove or lock `clickpesa-test` |

## 2. What is missing

| Gap | Owner | Blocks |
|---|---|---|
| Security fixes V1 (signup role), V2 (self role change), V3 (unsigned webhook), V4 (`clickpesa-test`) confirmed and fixed on live | Madu approves, agent drafts | Everything public |
| Supabase claim into `aisqnweb` | Madu (click in Bolt) | Backups, staging, migrations |
| Netlify site for zanzibiz.com in Madu's team, or a domain move plan | Madu + Bolt support | Cutover |
| Newest V1 source from Bolt (live differs from snapshot) | Madu downloads from Bolt | Accurate parity check |
| Full backup + restore rehearsal | Agent after claim | Data-loss guarantee |
| Staging Supabase project (or branch) with sanitized data | Agent after claim | RLS tests, previews |
| Tests and CI (none today) | Agent | Every merge |
| Error monitoring and uptime checks | Agent, Madu creates accounts | Launch |
| Clean analytics baseline (V11 fix, contact-tap events, Search Console, Bing Webmaster) | Agent + Madu verifies domains | Buyer metrics |
| Apple Developer (organization, D-U-N-S) and Google Play (organization) accounts | Madu, start Mon 30 Nov | Apps |
| Content: real photos with permission, Swahili reviewer, official WhatsApp number, category list, "verified" definition | Madu | Phase 4 and 5 |
| Comics: artist, written rights assignment, first 3 episodes, cadence | Madu | Comics launch |
| Privacy policy matched to stored data (EU visitors) | Madu + agent draft | Launch |

## 3. Decisions for Madu

| # | Decision | Recommendation |
|---|---|---|
| D1 | Front end: Astro rebuild vs restyle V1 + one render function | Astro. Every page is being redesigned anyway, and Astro gives shared layouts, server rendering, sitemap and image handling for less custom code |
| D2 | Keep all current URLs | Yes. No slug or category renames before the apps ship |
| D3 | One canonical for articles | `/travel-guide/:slug` canonical; `/blog/:slug` 301 to it |
| D4 | What "Verified" means | Phone call plus business document check, recorded with date and checker. Label stays off until then |
| D5 | Swahili as crawlable `/sw/` pages | After launch (Feb). Launch with server-rendered EN and the language toggle |
| D6 | AI crawlers | Allow search and answer bots (OAI-SearchBot, ChatGPT-User, PerplexityBot, Claude-SearchBot, Googlebot, Bingbot); allow or block training bots (GPTBot, ClaudeBot, Google-Extended, CCBot) as Madu prefers. Check Cloudflare's AI bot blocking is not on |
| D7 | New listings: live straight away or after approval | After approval, with a 24-hour target |
| D8 | Token purchases | Stay paused through the sale pitch. Ship the hardened webhook so it is ready |
| D9 | Hosting move | New Netlify project in Madu's team; move the domain at cutover; keep V1's site untouched for rollback |

## 4. Timeline

| Phase | Dates | Gate (must pass to close) |
|---|---|---|
| 0. Confirm and secure | Mon 30 Nov – Fri 4 Dec | V1–V4 confirmed or ruled out in writing; fixes live with approval; admin list matches Madu's list |
| 1. Own and back up | Mon 7 Dec – Fri 11 Dec (claim Tue 8 Dec, quiet hour) | Claim done; restore copy matches row counts on all 18 public tables and object counts in 3 buckets; known account signs in on the copy |
| 2. Foundation (runs from 30 Nov) | Mon 30 Nov – Fri 11 Dec | CI green on `main`: lint, types, unit, secret scan, export guard; deploy previews per PR |
| 3. Public site, SEO and AI search | Mon 14 Dec – Fri 8 Jan (light 24 Dec – 1 Jan) | Raw HTML smoke test passes on 20 sampled URLs; unknown slug 404; sitemap count = public listing count; Lighthouse mobile Perf ≥ 85, A11y ≥ 95 |
| 4. Accounts and dashboards parity | Mon 4 Jan – Wed 20 Jan | Playwright parity suite passes for visitor, user, owner and admin on staging; RLS tests pass |
| 5. QA, content and cutover | Mon 18 Jan – Wed 27 Jan (go-live Tue 26 Jan) | Launch checklist complete; 48 h after go-live: error rate < 1%, sign-ins and listing edits working, no rise in 404s |
| 6. Apps | Mon 11 Jan – Fri 5 Feb | Android submitted by Mon 25 Jan; iOS submitted by Fri 29 Jan; deep links open 5 listing URLs |
| 7. Comics | Build 18 – 29 Jan; launch Tue 9 Feb | 3 episodes live with EN/SW transcripts, credits and rights on file |
| 8. Buyer pack | Mon 1 Feb – Fri 19 Feb; pitch from Mon 22 Feb | Checklist in section 6 complete |

App go/no-go: if phase 3 is not live on a preview with stable URLs by Fri 8 Jan, apps move to February. Web launch never waits for the apps.

---

## 5. Tasks

### Phase 0. Confirm and secure

#### Task 0.1: Read-only live checks (Madu runs, approval: yes)
**Files:** Create `docs/runbooks/live-readonly-checks.md`
- [ ] Write the queries: `select pg_get_functiondef('public.handle_new_user'::regproc);`, `select policyname, cmd, qual, with_check from pg_policies where tablename = 'profiles';`, `select user_type, count(*) from profiles group by 1;`
- [ ] Madu runs them in Bolt's SQL editor and reports only yes/no and counts, never rows.
- [ ] Record outcome for V1 and V2 in the runbook.
- [ ] Madu lists deployed edge functions and their "Verify JWT" setting from Bolt or Supabase; record names only.
**Acceptance:** runbook states V1, V2, V3, V4 as confirmed or ruled out.

#### Task 0.2: Security migration (approval: yes before production)
**Files:** Create `supabase/migrations/20261201000000_v2_role_guard.sql`, `supabase/migrations/down/20261201000000_v2_role_guard.down.sql`, `tests/rls/role_guard.test.sql`
- [ ] Write failing pgTAP test: insert into `auth.users` with `raw_user_meta_data = '{"user_type":"admin"}'` creates a profile with `user_type = 'user'`; an authenticated user updating own `user_type` to `admin` raises.
- [ ] Run `supabase test db` on the local stack built from V1 migrations; expect FAIL.
- [ ] Migration: replace `handle_new_user()` so `user_type` is `'business_owner'` only when metadata says so and `'user'` otherwise, never `'admin'`; add `BEFORE UPDATE` trigger `profiles_protect_user_type` that raises unless `is_admin(auth.uid())` or the caller is `service_role`.
- [ ] Down script restores the previous function body taken from Task 0.1's output.
- [ ] Run test; expect PASS. Commit `fix(db): block self-assigned admin role`.
**Acceptance:** `supabase test db` passes; Madu approves; applied in the SQL editor; Task 0.1 query re-run shows the new function.

#### Task 0.3: Webhook hardening (approval: yes before deploy)
**Files:** Modify `supabase/functions/clickpesa-webhook/index.ts`; Create `supabase/functions/clickpesa-webhook/verify.ts`, `supabase/functions/clickpesa-webhook/verify.test.ts`
- [ ] Tests (Deno): no signature header returns 401; wrong signature 401; missing `CLICKPESA_CHECKSUM_SECRET` returns 500 and credits nothing; valid signature but ClickPesa status lookup not `SUCCESS` credits nothing; replayed event credits once.
- [ ] Implement: signature required; constant-time compare; re-query ClickPesa order status by reference before `finalize_topup_credit`; record event id in `payment_events` with a unique constraint for idempotency.
- [ ] `deno test supabase/functions/clickpesa-webhook/`; expect PASS.
**Acceptance:** tests pass; deployed only with approval; purchases remain paused.

#### Task 0.4: Remove `clickpesa-test` (approval: yes)
- [ ] Delete the function from the deployed project (Madu or agent with approval). Keep the source out of V2.
**Acceptance:** `curl -s -o /dev/null -w '%{http_code}' https://jaoyujiwqzzrdhmzntlj.supabase.co/functions/v1/clickpesa-test` returns 404.

#### Task 0.5: Admin audit (approval: yes)
- [ ] Madu runs `select id, email from auth.users u join profiles p using (id) where p.user_type = 'admin';` and confirms each one. Unknown admins are set to `user` with approval.

#### Task 0.6: Store accounts (Madu, start Mon 30 Nov)
- [ ] Request D-U-N-S for the company; enrol Apple Developer as an organization.
- [ ] Create Google Play Console as an organization account (avoids the closed-testing wait for new personal accounts; verify current terms).

### Phase 1. Own and back up

#### Task 1.1: Fallback export (before claim)
- [ ] Export every table from Bolt's Tables panel to CSV into the local workspace folder `recovery/2026-12-07/` (never into a repo).
- [ ] Record row counts per table in `docs/runbooks/claim-day.md`.

#### Task 1.2: Claim day runbook (approval: yes, Madu clicks)
**Files:** Create `docs/runbooks/claim-day.md`
- [ ] Pre-checks: Madu is Owner of `aisqnweb`; Bolt shows that exact org; nothing else deploys that day.
- [ ] Bolt → Claim in Supabase (not "Change database").
- [ ] Post-checks within 15 minutes: homepage lists businesses; a listing image loads; an existing signed-in browser stays signed in; owner edits a test listing; admin opens the dashboard; Supabase dashboard shows the project in `aisqnweb`.

#### Task 1.3: Full backup and restore rehearsal
**Files:** Create `docs/runbooks/backup-restore.md`, `scripts/backup/dump.sh`, `scripts/backup/storage-sync.ts`, `scripts/backup/verify-counts.sql`
- [ ] `pg_dump` of all schemas including `auth` and `storage` using `SUPABASE_DB_URL` from the local environment (never committed); output to the private recovery folder.
- [ ] Storage sync of the 3 buckets with SHA-256 manifest.
- [ ] Restore into a new isolated project `zanzibiz-restore-test` in `aisqnweb` with email and payment secrets left unset.
- [ ] Run `verify-counts.sql` on both; counts must match for 18 tables; object counts must match for 3 buckets.
- [ ] Sign in on the restore with a known test account.
- [ ] Enable daily backups and PITR on the production project (Pro add-on decision for Madu).
**Acceptance:** runbook written so someone else can repeat it; counts match.

#### Task 1.4: Hosting ownership
- [ ] Madu asks Bolt support which Netlify account serves zanzibiz.com and whether the site can be transferred to his team, or the custom domain released at cutover.
- [ ] Create Netlify project `zanzibiz-v2` in Madu's team linked to `mtantpn/zanzibiz-v2`, deploy previews on, password protection on, `X-Robots-Tag: noindex` on non-production contexts.
- [ ] Lower Cloudflare TTL on apex and `www` to 300 s by 20 Jan.

#### Task 1.5: Newest V1 source
- [ ] Madu downloads the current project from Bolt; agent diffs it against `082d4ed` and records changed files in `docs/v1-diff.md`. Exports and `public/*.zip` stay out.

#### Task 1.6: Staging data
- [ ] Create `zanzibiz-staging` (or a Supabase branch) from migrations; seed with `supabase/seed/staging.sql` containing fake owners, 40 fake listings across the 6 categories, 6 guides, one admin. No production rows.

### Phase 2. Foundation (starts Mon 30 Nov, no production access needed)

#### Task 2.1: Scaffold `[A]`
**Files:** Create `package.json`, `astro.config.mjs`, `tsconfig.json`, `netlify.toml`, `src/layouts/Base.astro`, `src/pages/index.astro`, `.nvmrc` (Node 22)
- [ ] `npm create astro@latest . -- --template minimal --typescript strict`; add `@astrojs/netlify`, `@astrojs/sitemap` (static pages only), Tailwind 4, `@supabase/supabase-js`.
- [ ] `output: 'server'` with `export const prerender = true` on static pages.
- [ ] `npm run build` passes; commit.

#### Task 2.2: CI
**Files:** Create `.github/workflows/ci.yml`, `scripts/guard-build-output.sh`
- [ ] Jobs: `npm ci`, `astro check`, `vitest run`, `gitleaks detect`, build, then `scripts/guard-build-output.sh dist` which fails on any `*.zip`, `*.sql`, `*.csv`, `backups/`, `auth`, `profiles.json` in output.
- [ ] Test the guard: add a dummy `public/x.zip` on a branch, CI fails; remove it.

#### Task 2.3: Design tokens and components
**Files:** Create `src/styles/tokens.css`, `src/components/{Header,Footer,SearchPill,CategoryBar,ListingCard,ActionBar,Badge,Pagination,Breadcrumbs}.astro`
- [ ] Port colours, type, spacing and card rules from `design/DESIGN.md` and `design/prototype/index.html`.
- [ ] Self-host Plus Jakarta Sans (woff2, `font-display: swap`).
- [ ] Storybook is not needed; a `/dev/components` page behind `import.meta.env.DEV` shows every component.

#### Task 2.4: Data layer
**Files:** Create `src/lib/supabase/server.ts`, `src/lib/supabase/browser.ts`, `src/lib/queries/{listings,categories,guides,search}.ts`, `tests/unit/queries.test.ts`
- [ ] Server client uses anon key, no session persistence. Browser client keeps supabase-js defaults so the storage key `sb-jaoyujiwqzzrdhmzntlj-auth-token` matches V1 and sessions carry over (verify against V1 `lib/supabase.js`).
- [ ] Queries copy V1's public filters (status values and boost/featured ordering from `lib/supabase.js`) and never select private columns.
- [ ] Search escapes PostgREST `.or()` input (fixes V13): test that `a,b)` does not alter the filter.

#### Task 2.5: Route inventory and redirect map
**Files:** Create `docs/routes.csv`, `scripts/route-inventory.ts`, `public/_redirects` (V2)
- [ ] Merge sitemap URLs, V1 `_redirects`, the 29 Vite inputs and Search Console top pages into `docs/routes.csv` with columns `old_path,new_path,status`.
- [ ] Every V1 path resolves in one hop: 200 on the same URL, or a single 301.

#### Task 2.6: Analytics baseline
**Files:** Create `supabase/migrations/20261208000000_listing_analytics_daily.sql` + down, `src/lib/track.ts`
- [ ] Add `listing_events(listing_id, kind, created_at)` with `kind in ('view','whatsapp','call','directions','share','save')`, insert-only for anon via RPC with rate limit; no IP or user agent stored. Leave V1's `listing_analytics` untouched (V11 fixed by not depending on it).
- [ ] Madu verifies the domain in Google Search Console and Bing Webmaster Tools; agent adds Cloudflare Web Analytics.

### Phase 3. Public site, SEO and AI search

#### Task 3.1: Listing page `[A]`
**Files:** Create `src/pages/business/[slug].astro`, `src/lib/seo/jsonld.ts`, `tests/e2e/listing.spec.ts`, `scripts/seo-smoke.sh`
- [ ] Smoke test first: `curl -s $URL/business/<fixture-slug>` contains the business name in `<h1>`, `<link rel="canonical" href="https://zanzibiz.com/business/<slug>">`, a unique `<title>` and `<meta name="description">`, OG tags and `LocalBusiness` JSON-LD with name, address, telephone, openingHours, geo when present, image, url; `curl -o /dev/null -w '%{http_code}' $URL/business/does-not-exist` is 404.
- [ ] Render with `Cache-Control: public, max-age=0` and `Netlify-CDN-Cache-Control: public, s-maxage=300, stale-while-revalidate=86400`, plus `Netlify-Cache-Tag: listing-<id>`.
- [ ] 503 with `Retry-After: 60` when Supabase errors.
- [ ] Action bar: WhatsApp (`https://wa.me/<digits>`), Call (`tel:`), Directions (Google Maps URL), Share (Web Share API), Save; each fires `track()`.
- [ ] Related listings: same category and area, 6 links.

#### Task 3.2: Category and directory pages `[A]`
- [ ] Real H1 per category, area filter as query params, `?page=N` with `<a href>` links, self canonical per page, `ItemList` + `BreadcrumbList` JSON-LD, empty category returns 200 with a useful message (not 404).

#### Task 3.3: Guides
- [ ] Hub and 5 static guide pages prerendered with `Article` and `BreadcrumbList` JSON-LD, author, `datePublished`, `dateModified`.
- [ ] Article page SSR from `blog_posts` (published only), with "Businesses mentioned" linking to listings.
- [ ] Add a short dated answer box (60–120 words) and an FAQ block at the top of each guide, marked up as `FAQPage` where it is a real Q&A.

#### Task 3.4: Home and search
- [ ] Home per prototype order; real counts only from the database.
- [ ] `/search?q=&area=` SSR results with `noindex, follow`; `WebSite` + `SearchAction` JSON-LD on home; `Organization` JSON-LD with logo and `sameAs`.

#### Task 3.5: Sitemaps and feeds
**Files:** Create `src/pages/sitemap.xml.ts`, `src/pages/sitemaps/[type].xml.ts`, `src/pages/rss.xml.ts`
- [ ] Index plus `listings`, `categories`, `guides`, `static` sitemaps; listings only approved and active, `lastmod` from `updated_at`.
- [ ] Test: number of `<loc>` in the listings sitemap equals `select count(*)` of public listings on staging.
- [ ] IndexNow key file and a ping on listing approve or update (via a Supabase database webhook to a Netlify Function).

#### Task 3.6: AI search readiness
**Files:** Create `public/robots.txt`, `src/pages/llms.txt.ts`
- [ ] `robots.txt` per D6 with sitemap line.
- [ ] `llms.txt` describing ZanziBiz, the main sections and links to the sitemap and top guides.
- [ ] Every public page readable without JavaScript (Playwright test with `javaScriptEnabled: false`).
- [ ] Check Cloudflare Bots and AI crawl settings match D6 (Madu, approval).

#### Task 3.7: Redirects
- [ ] `/blog` → `/travel-guide` 301 forced; `/blog/:slug` → `/travel-guide/:slug` 301 (D3); `.html` account paths 301 to new paths; `www` → apex 301.
- [ ] Test every row of `docs/routes.csv` against the preview: one hop, expected status.

#### Task 3.8: Performance and accessibility
- [ ] Netlify Image CDN for listing photos with `srcset` and width/height set; Lighthouse CI on home, category, listing, guide: Perf ≥ 85, A11y ≥ 95, SEO = 100, CLS < 0.1.

#### Task 3.9: Service worker handover
**Files:** Create `public/sw.js`, `tests/e2e/sw-upgrade.spec.ts`
- [ ] New `sw.js` at the same path deletes all V1 caches on `activate`, never caches Supabase REST or authenticated responses, caches only hashed static assets and the offline page.
- [ ] Test: install V1 `sw.js` in Playwright, then load V2; old caches are gone and the page shows V2.

### Phase 4. Accounts and dashboards parity

#### Task 4.1: Auth pages
- [ ] Email/password and Google sign-in, signup with "I run a business" choice (sets metadata `user_type: business_owner` only), password reset, email confirmation; redirect URLs for preview and production added in Supabase Auth (approval).
- [ ] Playwright: existing V1 session in localStorage stays signed in on V2.

#### Task 4.2: User area
- [ ] `/account` (profile, picture upload to `profile-pictures/<uid>/`), `/account/settings` (password change), `/saved` (device-local saves merged into `favorites` after sign-in).

#### Task 4.3: Owner onboarding and dashboard
- [ ] Four-step listing form with live preview and WhatsApp number format check; images to `listing-images/<uid>/`, JPEG/PNG/WebP only, max 5 MB, max 10 per listing (storage policy test).
- [ ] Dashboard: my listings with status, edit, hours, photos, monthly views and contact taps from `listing_events`, boost/featured state shown read-only while payments are paused.

#### Task 4.4: Admin
- [ ] Port every V1 admin feature listed in section 1, plus a moderation queue for new and edited listings and reported listings, a guide editor with image upload to `blog-images/`, and a comics editor (Task 7.2).
- [ ] Admin routes check `is_admin` server-side via RLS-backed queries; no admin data in any cache.

#### Task 4.5: RLS test suite
**Files:** Create `tests/rls/*.test.sql`
- [ ] For each of visitor, user, owner, admin: allowed and denied reads and writes on `profiles`, `business_profiles`, `listings`, `blog_posts`, `favorites`, `messages`, `orders`, wallets and ledger tables, storage buckets.

#### Task 4.6: Parity suite
- [ ] Playwright journeys on staging: visitor search → listing → WhatsApp; signup → create listing → admin approves → public page live → sitemap includes it; owner edits hours → page updates within 5 minutes; admin bans a user; user saves and unsaves.

### Phase 5. QA, content and cutover

#### Task 5.1: Content
- [ ] Madu supplies photos with permission, the official WhatsApp number, the category list, and the Swahili reviewer signs off UI strings.
- [ ] Privacy policy and terms updated to match what is stored.

#### Task 5.2: Launch checklist (`docs/runbooks/cutover.md`)
- [ ] Full backup taken that morning; V1 Netlify site left intact; Bolt badge script gone; monitoring and uptime checks on; Search Console sitemap submitted.
- [ ] Cutover Tue 26 Jan, 06:00 EAT: attach zanzibiz.com and www to the `zanzibiz-v2` Netlify project (approval); verify TLS, then run `scripts/seo-smoke.sh https://zanzibiz.com` and the parity suite against production read-only paths.
- [ ] Rollback: point the domain back to the V1 site; database unchanged, so no data step.

#### Task 5.3: Watch window
- [ ] 48 h of error, 404 and sign-in monitoring; daily Search Console coverage check for 14 days.

### Phase 6. Apps

#### Task 6.1: Capacitor shell
**Files:** Create `apps/mobile/capacitor.config.ts`, `apps/mobile/android/`, `apps/mobile/ios/`
- [ ] Load the production site with native share, `tel:` and WhatsApp intents, saved listings and guides stored offline, a native bottom bar (Search, Guide, Saved, Account) so it is more than a website wrapper (Apple guideline 4.2).
- [ ] Deep links: `public/.well-known/assetlinks.json` and `public/.well-known/apple-app-site-association` served with `Content-Type: application/json`; `/business/*`, `/travel-guide/*` open in the app.
- [ ] Android: internal test by Mon 18 Jan, production submit Mon 25 Jan. iOS: TestFlight by Fri 22 Jan, submit Fri 29 Jan.

### Phase 7. Comics (Hadithi za Kisiwa)

#### Task 7.1: Schema
**Files:** Create `supabase/migrations/20270118000000_comics.sql` + down, `tests/rls/comics.test.sql`
- [ ] Tables `comic_series(id, slug, title_en, title_sw, description_en, description_sw, cover_path, status)`, `comic_episodes(id, series_id, slug, number, title_en, title_sw, published_at, status, credits, rights_note)`, `comic_panels(id, episode_id, position, image_path, alt_en, alt_sw, transcript_en, transcript_sw)`; bucket `comics` public read, admin write; anon reads only `status = 'published'`.

#### Task 7.2: Pages and admin
- [ ] `/comics` hub, `/comics/[series]`, `/comics/[series]/[episode]` SSR; full EN/SW transcript in HTML under the panels; `ComicStory` JSON-LD; credits; previous/next; share; links to related listings and guides (for example a bajaji fare comic links to the airport transfer guide).
- [ ] Admin comics editor: upload panels, alt text, transcripts, publish date.

### Phase 8. Buyer pack

#### Task 8.1: Data room (`docs/buyer/` private, not in the public repo if it holds figures)
- [ ] Metrics with the SQL behind them: active owners, published listings, sign-up-to-publish time, contact taps per month, organic sessions (from 30 Nov baseline).
- [ ] Reconciled P&L from WebStart and token revenue with ClickPesa and bank records.
- [ ] Security note: what was found and fixed.
- [ ] Restore rehearsal repeated by someone other than Madu.
- [ ] Ownership list: GitHub, domain registrar, Cloudflare, Netlify, Supabase, ClickPesa, Resend, Search Console, Bing, Apple, Google Play, brand and comics rights.

---

## 6. Self-review against the request

- Keep everything live (functionality, dashboards, accounts, listings, guides): section 1 table, tasks 2.4, 3.1–3.4, 4.1–4.6, rule 4.
- No data loss: tasks 1.1–1.3, rule 3, cutover with no data step.
- Full SEO and AI search: tasks 3.1–3.8, 2.6.
- Comics: phase 7.
- Supabase and Netlify premium: tasks 1.2–1.6, 3.1 caching, 5.2.
- Apps end of January: phase 6 with the 8 Jan go/no-go.
- Sale pitch: phase 8.
