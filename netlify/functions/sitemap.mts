// Live sitemap built from the database, so every active listing and
// published guide is listed the moment it goes live.
import type { Config } from "@netlify/functions";
import { db, esc, SITE } from "./_lib/seo.mts";

const STATIC = [
  "/", "/directory", "/travel-guide", "/travel-guide/all",
  "/travel-guide/flights-to-zanzibar", "/travel-guide/where-to-stay", "/travel-guide/hotels",
  "/travel-guide/tours", "/travel-guide/airport-transfers", "/webstart", "/about", "/contact",
  "/affiliate", "/privacy", "/terms",
];

// Keep in step with CATEGORIES in directory.mts.
const CATEGORIES = ["accommodation", "activities", "automotive", "business", "events", "jobs", "useful-info"];

export default async () => {
  // If the database is down, still serve the static URLs and every category
  // (a 500 here makes search engines retry the whole sitemap later).
  let dbOk = true;
  const [listings, posts] = await Promise.all([
    db<any[]>("listings?select=slug,category,updated_at&status=in.(active,boosted,featured)&slug=not.is.null&order=updated_at.desc&limit=5000").catch(() => ((dbOk = false), [])),
    db<any[]>("blog_posts?select=slug,updated_at&status=eq.published&order=updated_at.desc&limit=5000").catch(() => []),
  ]);
  // Only categories with at least one listing: empty ones are noindex.
  const catLastmod = new Map<string, string>();
  for (const l of listings) if (l.category && !catLastmod.has(l.category)) catLastmod.set(l.category, l.updated_at || "");
  const categories = CATEGORIES.filter((c) => !dbOk || catLastmod.has(c));
  const url = (loc: string, lastmod?: string) =>
    `<url><loc>${esc(SITE + loc)}</loc>${lastmod ? `<lastmod>${lastmod.slice(0, 10)}</lastmod>` : ""}</url>`;
  const xml = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...STATIC.map((p) => url(p)),
    ...categories.map((c) => url(`/directory/${c}`, catLastmod.get(c))),
    ...listings.map((l) => url(`/business/${encodeURIComponent(l.slug)}`, l.updated_at)),
    ...posts.map((p) => url(`/travel-guide/${encodeURIComponent(p.slug)}`, p.updated_at)),
    `</urlset>`,
  ].join("\n");
  return new Response(xml, {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      // A partial sitemap (database down) is cached briefly, not for an hour.
      "netlify-cdn-cache-control": dbOk
        ? "public, s-maxage=3600, stale-while-revalidate=86400"
        : "public, s-maxage=300",
    },
  });
};

export const config: Config = { path: "/sitemap.xml" };
