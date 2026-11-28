// Live sitemap built from the database, so every active listing and
// published guide is listed the moment it goes live.
import type { Config } from "@netlify/functions";
import { db, esc, SITE } from "./_lib/seo.mts";

const STATIC = [
  "/", "/directory", "/directory/accommodation", "/directory/activities", "/directory/automotive",
  "/directory/business", "/directory/events", "/directory/jobs", "/travel-guide",
  "/travel-guide/flights-to-zanzibar", "/travel-guide/where-to-stay", "/travel-guide/hotels",
  "/travel-guide/tours", "/travel-guide/airport-transfers", "/webstart", "/about", "/contact",
  "/affiliate", "/privacy", "/terms",
];

export default async () => {
  // If the database is down, still serve the static URLs (a 500 here makes
  // search engines retry the whole sitemap later).
  const [listings, posts] = await Promise.all([
    db<any[]>("listings?select=slug,updated_at&status=in.(active,boosted,featured)&slug=not.is.null&order=updated_at.desc&limit=5000").catch(() => []),
    db<any[]>("blog_posts?select=slug,updated_at&status=eq.published&order=updated_at.desc&limit=5000").catch(() => []),
  ]);
  const url = (loc: string, lastmod?: string) =>
    `<url><loc>${esc(SITE + loc)}</loc>${lastmod ? `<lastmod>${lastmod.slice(0, 10)}</lastmod>` : ""}</url>`;
  const xml = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...STATIC.map((p) => url(p)),
    ...listings.map((l) => url(`/business/${encodeURIComponent(l.slug)}`, l.updated_at)),
    ...posts.map((p) => url(`/travel-guide/${encodeURIComponent(p.slug)}`, p.updated_at)),
    `</urlset>`,
  ].join("\n");
  return new Response(xml, {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "netlify-cdn-cache-control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
};

export const config: Config = { path: "/sitemap.xml" };
