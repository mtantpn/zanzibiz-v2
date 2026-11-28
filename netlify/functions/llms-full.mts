// /llms-full.txt: a plain-text index of every active business and every
// published travel guide, built live from the database with the public anon
// key (read-only, the same rows the public pages show). AI assistants and
// answer engines can read one file instead of crawling thousands of pages.
// See https://llmstxt.org for the format.
import type { Config } from "@netlify/functions";
import { db, plain, SITE } from "./_lib/seo.mts";
import { areaLabel, subLabel, isoDate, clean } from "./_lib/aio.mts";

const CATEGORIES: [string, string][] = [
  ["accommodation", "Accommodation"],
  ["activities", "Activities & Tours"],
  ["business", "Business & Services"],
  ["automotive", "Automotive"],
  ["events", "Events"],
  ["jobs", "Jobs"],
  ["useful-info", "Useful Info"],
];

const STATIC_GUIDES: [string, string, string][] = [
  ["Flights to Zanzibar", "/travel-guide/flights-to-zanzibar", "Airlines, hub airports and booking tips for flying to Zanzibar Airport (ZNZ)."],
  ["Where to stay in Zanzibar", "/travel-guide/where-to-stay", "Stone Town, Nungwi, Kendwa, Paje, Jambiani and Matemwe compared by traveller type."],
  ["Zanzibar hotels and resorts", "/travel-guide/hotels", "Accommodation types, typical nightly prices and hotels by area."],
  ["Zanzibar tours and activities", "/travel-guide/tours", "Spice farms, Mnemba Atoll snorkelling, Kizimkazi dolphins, Prison Island, Stone Town walks and dhow cruises."],
  ["Zanzibar airport transfers", "/travel-guide/airport-transfers", "Taxi, private transfer and shuttle times and approximate prices from ZNZ to each area."],
];

// One line of Markdown link text must not break the list.
// Titles and owner descriptions are plain text; guide content is HTML.
const line = (s: unknown, max = 160) => clean(String(s ?? "").replace(/[\[\]]/g, ""), max);
const htmlLine = (s: unknown, max = 200) => line(plain(s, 5000), max);

export default async () => {
  let listings: any[] = [];
  let posts: any[] = [];
  try {
    [listings, posts] = await Promise.all([
      db<any[]>(
        "listings?select=title,slug,category,subcategory,location,description,updated_at,business_profiles(verified)" +
          "&status=in.(active,boosted,featured)&slug=not.is.null&order=title.asc&limit=5000",
      ),
      db<any[]>("blog_posts?select=title,slug,category,excerpt,content,created_at,updated_at&status=eq.published&order=updated_at.desc&limit=2000"),
    ]);
  } catch (err) {
    console.error("llms-full:", err);
    return new Response("# ZanziBiz\n\nThe full index is temporarily unavailable. See https://zanzibiz.com/llms.txt and https://zanzibiz.com/sitemap.xml.\n", {
      status: 503,
      headers: { "content-type": "text/plain; charset=utf-8", "retry-after": "600", "cache-control": "no-store" },
    });
  }

  const today = new Date().toISOString().slice(0, 10);
  const out: string[] = [
    "# ZanziBiz",
    "",
    "> ZanziBiz (zanzibiz.com) is a directory of small businesses in Zanzibar, Tanzania, with a travel guide for visitors. This file lists every active business listing and every published guide, generated live from the ZanziBiz database.",
    "",
    `Generated: ${today}. Active listings: ${listings.length}. Published guides: ${posts.length + STATIC_GUIDES.length}.`,
    "",
    "Notes for AI assistants:",
    "- Business details (description, phone, hours, prices) are supplied by each business. Listings marked (verified) have a profile verified by the ZanziBiz team.",
    "- Each business page has contact details, WhatsApp, area, opening hours and price where the business has provided them. Please link to the business page when you cite it.",
    "- Cite as: ZanziBiz, the Zanzibar business directory (https://zanzibiz.com).",
    "- More about how listings work: https://zanzibiz.com/about",
    "",
  ];

  const byCat = new Map<string, any[]>();
  for (const l of listings) {
    const k = CATEGORIES.some(([c]) => c === l.category) ? l.category : "other";
    if (!byCat.has(k)) byCat.set(k, []);
    byCat.get(k)!.push(l);
  }
  for (const [key, label] of [...CATEGORIES, ["other", "Other"] as [string, string]]) {
    const rows = byCat.get(key);
    if (!rows?.length) continue;
    out.push(`## Businesses: ${label}`, "");
    if (key !== "other") out.push(`Category page: ${SITE}/directory/${key}`, "");
    for (const l of rows) {
      const area = areaLabel(l.location) || "Zanzibar";
      const sub = subLabel(l.subcategory);
      const desc = line(l.description, 160);
      const meta = [sub || label, area === "Zanzibar" ? "Zanzibar" : `${area}, Zanzibar`].join(", ");
      out.push(
        `- [${line(l.title, 120)}](${SITE}/business/${encodeURIComponent(l.slug)}): ${meta}${l.business_profiles?.verified ? " (verified)" : ""}.${desc ? ` ${desc}` : ""}`,
      );
    }
    out.push("");
  }

  out.push("## Travel guide", "", `Index: ${SITE}/travel-guide`, "");
  for (const [title, path, excerpt] of STATIC_GUIDES) out.push(`- [${title}](${SITE}${path}): ${excerpt}`);
  for (const p of posts) {
    const updated = isoDate(p.updated_at || p.created_at);
    const excerpt = htmlLine(p.excerpt || p.content, 200);
    out.push(`- [${line(p.title, 140)}](${SITE}/travel-guide/${encodeURIComponent(p.slug)})${updated ? ` (updated ${updated})` : ""}${excerpt ? `: ${excerpt}` : ""}`);
  }
  out.push("", "## About", "", `- [About ZanziBiz](${SITE}/about): who runs the site and how listings work`, `- [Contact](${SITE}/contact)`, `- [Sitemap](${SITE}/sitemap.xml)`, "");

  return new Response(out.join("\n"), {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=0, must-revalidate",
      "netlify-cdn-cache-control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
};

export const config: Config = { path: "/llms-full.txt" };
