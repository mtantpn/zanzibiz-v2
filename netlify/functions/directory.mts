// Server-renders /directory/:category so search engines get the category's
// real title, an ItemList of its listings and plain <a href> links to every
// listing in the first HTML response. Unknown categories get a real 404.
// The page script (directory/category.html) still runs and swaps in the
// interactive grid, using the same titles and structured data.
import type { Config, Context } from "@netlify/functions";
import { db, esc, plain, rewriteHead, fillPlaceholder, template, htmlResponse, SITE } from "./_lib/seo.mts";
import { areaLabel } from "./_lib/aio.mts";

interface Cat {
  label: string;
  icon: string;
  title: string;
  description: string;
  og: string;
}

const pexels = (id: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=1200&h=630&fit=crop`;

// Keep in step with CATEGORIES in directory/category.html.
const CATEGORIES: Record<string, Cat> = {
  accommodation: {
    label: "Accommodation",
    icon: "🏨",
    title: "Zanzibar Accommodation: Hotels & Guesthouses | ZanziBiz",
    description: "Hotels, resorts, villas, guesthouses and beach bungalows in Zanzibar.",
    og: pexels(261102),
  },
  activities: {
    label: "Tours & Activities",
    icon: "🤿",
    title: "Zanzibar Tour Operators & Activities | ZanziBiz",
    description: "Snorkelling, diving, dhow cruises, spice tours, safaris and more in Zanzibar.",
    og: pexels(1001682),
  },
  automotive: {
    label: "Automotive & Transport",
    icon: "🚗",
    title: "Zanzibar Car Hire, Taxis & Transport | ZanziBiz",
    description: "Car hire, scooter rental, tuk-tuks, taxis and airport transfers in Zanzibar.",
    og: pexels(2116475),
  },
  business: {
    label: "Local Services",
    icon: "🏪",
    title: "Local Services & Businesses in Zanzibar | ZanziBiz",
    description: "Tradespeople, professionals, shops and everyday local businesses in Zanzibar.",
    og: pexels(3184291),
  },
  events: {
    label: "Events",
    icon: "🎉",
    title: "Events in Zanzibar: Festivals & What's On | ZanziBiz",
    description: "Festivals, cultural events, markets and things happening in Zanzibar.",
    og: pexels(1190297),
  },
  jobs: {
    label: "Jobs",
    icon: "💼",
    title: "Jobs in Zanzibar: Vacancies & Careers | ZanziBiz",
    description: "Job listings, vacancies and career opportunities in Zanzibar.",
    og: pexels(3184465),
  },
  "useful-info": {
    label: "Useful Info",
    icon: "ℹ️",
    title: "Useful Info for Zanzibar | ZanziBiz",
    description: "Essential information, tips and resources for living and working in Zanzibar.",
    og: pexels(3601425),
  },
};

function metaDescription(c: Cat, n: number) {
  return n > 0
    ? `${c.description} Compare ${n} local listing${n !== 1 ? "s" : ""} and contact them directly.`
    : `${c.description} Browse local listings on ZanziBiz.`;
}

function card(l: any) {
  const img = Array.isArray(l.images) ? l.images.find(Boolean) : "";
  const initials = String(l.title || "?").split(/\s+/).filter(Boolean).slice(0, 2).map((w: string) => w[0]).join("").toUpperCase();
  return `
            <a href="/business/${esc(encodeURIComponent(l.slug || l.id))}" class="listing-card bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 block">
                ${
                  img
                    ? `<img src="${esc(img)}" alt="${esc(l.title)}" width="600" height="352" loading="lazy" decoding="async" class="w-full h-44 object-cover">`
                    : `<div class="h-44 bg-[#FFF4D1] flex items-center justify-center"><span class="text-4xl font-extrabold text-[#1D2427]/70" aria-hidden="true">${esc(initials)}</span></div>`
                }
                <div class="p-5">
                    <h3 class="font-heading font-bold text-[#1D2427] text-base line-clamp-1">${esc(l.title)}</h3>
                    ${areaLabel(l.location) ? `<p class="text-xs text-gray-400 mt-1">${esc(areaLabel(l.location))}</p>` : ""}
                    ${l.description ? `<p class="text-sm text-gray-500 mt-2 line-clamp-2">${esc(plain(l.description, 140))}</p>` : ""}
                    ${l.business_profiles?.verified ? `<p class="text-xs text-green-700 mt-3">Verified</p>` : ""}
                </div>
            </a>`;
}

// Fill the elements the page script would otherwise fill after loading.
function setText(html: string, id: string, text: string) {
  const re = new RegExp(`(<([a-z0-9]+)\\b[^>]*\\bid="${id}"[^>]*>)[\\s\\S]*?(</\\2>)`, "i");
  return html.replace(re, (_m, open, _tag, close) => `${open}${esc(text)}${close}`);
}

export default async (req: Request, context: Context) => {
  const raw = decodeURIComponent(context.params.category || "");
  const key = raw.toLowerCase();
  // /directory/Accommodation -> /directory/accommodation
  if (key !== raw && CATEGORIES[key]) {
    return new Response(null, { status: 301, headers: { location: `/directory/${key}` } });
  }
  const page = await template(req, "/directory/category.html");
  const cat = CATEGORIES[key];
  const canonical = `${SITE}/directory/${encodeURIComponent(key)}`;
  if (!cat) {
    return htmlResponse(
      rewriteHead(page, {
        ldId: "pageSchema",
        title: "Category not found | ZanziBiz",
        description: "This directory category is not on ZanziBiz. Browse all categories.",
        canonical,
        noindex: true,
      }),
      404,
    );
  }

  let rows: any[] = [];
  try {
    rows = await db(
      `listings?select=id,title,slug,description,location,images,status,business_profiles(verified)` +
        `&category=eq.${encodeURIComponent(key)}&status=in.(active,boosted,featured)` +
        `&order=status.desc,created_at.desc&limit=60`,
    );
  } catch (err) {
    console.error("directory render:", err);
    return htmlResponse(page, 200, 60); // fall back to the client-side page
  }

  const n = rows.length;
  const description = metaDescription(cat, n);
  const heading = `${cat.label} in Zanzibar`;
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
          { "@type": "ListItem", position: 2, name: "Directory", item: `${SITE}/directory` },
          { "@type": "ListItem", position: 3, name: cat.label, item: canonical },
        ],
      },
      {
        "@type": "CollectionPage",
        "@id": canonical,
        url: canonical,
        name: heading,
        description,
        isPartOf: { "@id": `${SITE}/#website` },
        mainEntity: {
          "@type": "ItemList",
          name: heading,
          numberOfItems: n,
          itemListElement: rows.map((l, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: `${SITE}/business/${encodeURIComponent(l.slug || l.id)}`,
            name: l.title,
          })),
        },
      },
    ],
  };

  const body = n
    ? rows.map(card).join("")
    : `
            <div class="col-span-full text-center py-16">
                <h2 class="font-heading text-xl font-bold text-[#1D2427] mb-2">No listings yet</h2>
                <p class="text-gray-500 text-sm mb-5">Be the first to list your business in this category.</p>
                <a href="/auth/signup.html" class="inline-block bg-[#FFC72C] text-[#1D2427] px-5 py-2.5 rounded-xl font-semibold text-sm">List your business</a>
            </div>`;

  let html = rewriteHead(page, {
    ssr: true,
    ldId: "pageSchema",
    // An empty category is a thin page: keep it out of the index (links are
    // still followed) until it has a listing. The sitemap leaves it out too.
    noindex: n === 0,
    title: cat.title,
    description,
    canonical,
    image: cat.og,
    jsonLd: [ld],
  });
  html = fillPlaceholder(html, body);
  html = setText(html, "pageHeading", heading);
  html = setText(html, "categoryIcon", cat.icon);
  html = setText(html, "breadcrumbCategory", cat.label);
  html = setText(html, "pageSubheading", `${n} listing${n !== 1 ? "s" : ""} — ${cat.description}`);
  return htmlResponse(html);
};

export const config: Config = {
  path: "/directory/:category",
  // The page template itself (fetched above) and any other static file there.
  excludedPath: ["/directory/*.html"],
};
