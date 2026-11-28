// Server-renders /business/:slug so search engines and AI crawlers get the
// listing's real title, description, contact details and structured data in
// the first HTML response, and unknown slugs get a real 404.
import type { Config, Context } from "@netlify/functions";
import { db, esc, plain, rewriteHead, fillPlaceholder, template, htmlResponse, SITE } from "./_lib/seo.mts";
import { listingFacts, listingSummary, factsHtml, listingFaqs, faqHtml, openingHoursSpec, longDate, areaLabel, ORG_ID } from "./_lib/aio.mts";

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
      `listings?select=id,title,slug,description,category,subcategory,location,address,phone,email,website,whatsapp,what3words,images,features,business_hours,price,created_at,updated_at,business_profiles(business_name,verified)` +
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
  const facts = listingFacts(l, cat);
  // "stone-town" -> "Stone Town"; "other" or empty -> "Zanzibar"
  const area = facts.area || "Zanzibar";
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
    sameAs: l.website ? [/^https?:\/\//i.test(l.website) ? l.website : `https://${l.website}`] : undefined,
    openingHoursSpecification: openingHoursSpec(facts.hours),
    amenityFeature: facts.features.length
      ? facts.features.map((name) => ({ "@type": "LocationFeatureSpecification", name, value: true }))
      : undefined,
    // This page is ZanziBiz's directory entry for the business.
    subjectOf: { "@type": "WebPage", "@id": `${url}#page`, url, publisher: { "@id": ORG_ID } },
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

  // Plain links to other listings in the same category, so crawlers that do
  // not run JavaScript can move between listings (not only via the sitemap).
  const related: any[] = await db<any[]>(
    `listings?select=title,slug,location&category=eq.${encodeURIComponent(l.category)}` +
      `&status=in.(active,boosted,featured)&slug=not.is.null&slug=neq.${encodeURIComponent(l.slug)}` +
      `&order=status.desc,updated_at.desc&limit=6`,
  ).catch(() => []);
  const relatedHtml = related.length
    ? `<nav class="mt-10" aria-labelledby="related-heading">
          <h2 id="related-heading" class="text-xl font-semibold mb-3">More ${esc(cat)} in Zanzibar</h2>
          <ul class="grid sm:grid-cols-2 gap-2">${related
            .map((r) => {
              const a = areaLabel(r.location);
              return `<li><a class="text-[#0A6A94] font-medium" href="/business/${esc(encodeURIComponent(r.slug))}">${esc(r.title)}</a>${a ? ` <span class="text-gray-500 text-sm">· ${esc(a)}</span>` : ""}</li>`;
            })
            .join("")}</ul>
          <p class="mt-3"><a class="text-[#0A6A94] font-semibold" href="/directory/${esc(l.category)}">See all ${esc(cat)} listings</a></p>
        </nav>`
    : "";

  const summary = listingSummary(facts, l.description);
  const faqs = listingFaqs(facts);
  const body = `
      <article class="text-left" data-ssr>
        <nav class="text-sm text-gray-500 mb-4"><a href="/">Home</a> › <a href="/directory/${esc(l.category)}">${esc(cat)}</a> › ${esc(l.title)}</nav>
        ${images[0] ? `<img src="${esc(images[0])}" alt="${esc(l.title)}" class="w-full max-h-[420px] object-cover rounded-2xl mb-6" loading="eager" fetchpriority="high" decoding="async">` : ""}
        <h1 class="text-3xl md:text-4xl mb-2">${esc(l.title)}</h1>
        <p class="text-gray-600 mb-4">${esc(cat)} · ${esc(area)}${facts.verified ? " · Verified" : ""}</p>
        <p class="text-lg text-[#1D2427] mb-6" data-summary="listing">${esc(summary)}</p>
        <div class="flex flex-wrap gap-3 mb-6">
          ${wa ? `<a class="px-5 py-3 rounded-full bg-[#1A7F45] text-white font-semibold" href="https://wa.me/${wa}">WhatsApp</a>` : ""}
          ${l.phone ? `<a class="px-5 py-3 rounded-full border border-gray-300 font-semibold" href="tel:${esc(l.phone)}">Call ${esc(l.phone)}</a>` : ""}
          ${l.website ? `<a class="px-5 py-3 rounded-full border border-gray-300 font-semibold" href="${esc(/^https?:\/\//i.test(l.website) ? l.website : `https://${l.website}`)}" rel="nofollow noopener">Website</a>` : ""}
        </div>
        ${l.description ? `<h2 class="text-xl font-semibold mb-2">About ${esc(l.title)}</h2>
        <div class="prose max-w-none mb-8">${esc(l.description).replace(/\n/g, "<br>")}</div>` : ""}
        <section class="mb-8" aria-labelledby="facts-heading">
          <h2 id="facts-heading" class="text-xl font-semibold mb-3">Key facts</h2>
          ${factsHtml(facts)}
        </section>
        ${faqHtml(faqs, `Questions about ${l.title}`)}
        ${relatedHtml}
        <p class="mt-8 text-xs text-gray-500">Details on this page are supplied by the business${facts.verified ? " and the profile has been verified by the ZanziBiz team" : ""}${facts.updated ? `; last updated ${esc(longDate(facts.updated))}` : ""}. Check prices and hours with the business before you travel. Source: <a class="text-[#0A6A94]" href="${esc(url)}">ZanziBiz, the Zanzibar business directory</a>. <a class="text-[#0A6A94]" href="/about#listings">How listings work</a>.</p>
      </article>`;

  let html = rewriteHead(page, {
    ssr: true,
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
  // The page templates, and the private pages if someone drops ".html".
  excludedPath: ["/business/*.html", "/business/dashboard", "/business/topup"],
};
