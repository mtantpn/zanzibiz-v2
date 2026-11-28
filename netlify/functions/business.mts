// Server-renders /business/:slug so search engines and AI crawlers get the
// listing's real title, description, contact details and structured data in
// the first HTML response, and unknown slugs get a real 404.
import type { Config, Context } from "@netlify/functions";
import { db, esc, plain, rewriteHead, fillPlaceholder, template, htmlResponse, SITE } from "./_lib/seo.mts";

const LABELS: Record<string, string> = {
  business: "Business & Services",
  activities: "Activities & Tours",
  accommodation: "Accommodation",
  automotive: "Automotive",
  jobs: "Jobs",
  events: "Events",
  "useful-info": "Useful Info",
};

const SCHEMA_TYPE: Record<string, string> = {
  accommodation: "LodgingBusiness",
  activities: "TouristAttraction",
  automotive: "AutomotiveBusiness",
  events: "Event",
};

export default async (req: Request, context: Context) => {
  const slug = decodeURIComponent(context.params.slug || "");
  const page = await template(req, "/business/listing.html");
  let rows: any[] = [];
  try {
    rows = await db(
      `listings?select=id,title,slug,description,category,subcategory,location,address,phone,email,website,whatsapp,images,business_hours,price,updated_at,business_profiles(business_name,verified)` +
        `&slug=eq.${encodeURIComponent(slug)}&status=in.(active,boosted,featured)&limit=1`,
    );
  } catch (err) {
    console.error("business render:", err);
    return htmlResponse(page, 200, 60); // fall back to the client-side page
  }
  const l = rows[0];
  if (!l) {
    return htmlResponse(
      rewriteHead(page, {
        ldId: "structured-data",
        title: "Listing not found | ZanziBiz",
        description: "This listing is no longer on ZanziBiz.",
        canonical: `${SITE}/business/${encodeURIComponent(slug)}`,
        noindex: true,
      }),
      404,
    );
  }

  const cat = LABELS[l.category] || l.category || "Business";
  const area = String(l.location || "Zanzibar").replace(/\b\p{L}/gu, (c) => c.toUpperCase());
  const url = `${SITE}/business/${l.slug}`;
  const images: string[] = Array.isArray(l.images) ? l.images.filter(Boolean) : [];
  const description = plain(l.description, 155) || `${l.title}: ${cat} in ${area}, Zanzibar.`;
  const wa = String(l.whatsapp || l.phone || "").replace(/\D/g, "");

  const ld: any = {
    "@context": "https://schema.org",
    "@type": SCHEMA_TYPE[l.category] === "Event" ? "LocalBusiness" : SCHEMA_TYPE[l.category] || "LocalBusiness",
    "@id": url,
    name: l.title,
    url,
    description: plain(l.description, 500),
    image: images.slice(0, 5),
    telephone: l.phone || undefined,
    email: l.email || undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: l.address || undefined,
      addressLocality: area,
      addressRegion: "Zanzibar",
      addressCountry: "TZ",
    },
    sameAs: l.website ? [l.website] : undefined,
  };
  const crumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
      { "@type": "ListItem", position: 2, name: cat, item: `${SITE}/directory/${l.category}` },
      { "@type": "ListItem", position: 3, name: l.title, item: url },
    ],
  };

  const body = `
      <article class="text-left">
        <nav class="text-sm text-gray-500 mb-4"><a href="/">Home</a> › <a href="/directory/${esc(l.category)}">${esc(cat)}</a> › ${esc(l.title)}</nav>
        ${images[0] ? `<img src="${esc(images[0])}" alt="${esc(l.title)}" class="w-full max-h-[420px] object-cover rounded-2xl mb-6" loading="eager">` : ""}
        <h1 class="text-3xl md:text-4xl mb-2">${esc(l.title)}</h1>
        <p class="text-gray-600 mb-4">${esc(cat)} · ${esc(area)}${l.business_profiles?.verified ? " · Verified" : ""}</p>
        <div class="flex flex-wrap gap-3 mb-6">
          ${wa ? `<a class="px-5 py-3 rounded-full bg-[#1A7F45] text-white font-semibold" href="https://wa.me/${wa}">WhatsApp</a>` : ""}
          ${l.phone ? `<a class="px-5 py-3 rounded-full border border-gray-300 font-semibold" href="tel:${esc(l.phone)}">Call ${esc(l.phone)}</a>` : ""}
          ${l.website ? `<a class="px-5 py-3 rounded-full border border-gray-300 font-semibold" href="${esc(l.website)}" rel="nofollow noopener">Website</a>` : ""}
        </div>
        <div class="prose max-w-none">${esc(l.description || "").replace(/\n/g, "<br>")}</div>
        ${l.address ? `<p class="mt-4 text-gray-600">Address: ${esc(l.address)}</p>` : ""}
      </article>`;

  let html = rewriteHead(page, {
        ldId: "structured-data",
    title: `${l.title} – ${cat} in ${area} | ZanziBiz`,
    description,
    canonical: url,
    image: images[0],
    type: "business.business",
    jsonLd: [ld, crumbs],
  });
  html = fillPlaceholder(html, body);
  return htmlResponse(html);
};

export const config: Config = {
  path: "/business/:slug",
  excludedPath: ["/business/*.html"],
};
