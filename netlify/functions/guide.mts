// Server-renders travel guide articles at /travel-guide/:slug (old /blog/:slug
// links 301 here, see public/_redirects) with the full article
// text and Article structured data. Unknown slugs get a real 404.
import type { Config, Context } from "@netlify/functions";
import { db, esc, plain, safeHtml, rewriteHead, fillPlaceholder, template, htmlResponse, SITE } from "./_lib/seo.mts";

export default async (req: Request, context: Context) => {
  const slug = decodeURIComponent(context.params.slug || "");
  const page = await template(req, "/blog-post.html");
  let rows: any[] = [];
  try {
    rows = await db(
      `blog_posts?select=id,title,slug,category,excerpt,content,featured_image,tags,created_at,updated_at` +
        `&slug=eq.${encodeURIComponent(slug)}&status=eq.published&limit=1`,
    );
  } catch (err) {
    console.error("guide render:", err);
    return htmlResponse(page, 200, 60);
  }
  const p = rows[0];
  if (!p) {
    return htmlResponse(
      rewriteHead(page, {
        ldId: "blogPostingSchema",
        title: "Guide not found | ZanziBiz",
        description: "This guide is no longer on ZanziBiz.",
        canonical: `${SITE}/travel-guide/${encodeURIComponent(slug)}`,
        noindex: true,
      }),
      404,
    );
  }
  const url = `${SITE}/travel-guide/${p.slug}`;
  const description = plain(p.excerpt || p.content, 155);
  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: p.title,
    description,
    image: p.featured_image ? [p.featured_image] : undefined,
    datePublished: p.created_at,
    dateModified: p.updated_at || p.created_at,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    author: { "@type": "Organization", name: "ZanziBiz", url: SITE },
    publisher: { "@type": "Organization", name: "ZanziBiz", url: SITE, logo: { "@type": "ImageObject", url: `${SITE}/untitled_design.png` } },
    keywords: Array.isArray(p.tags) ? p.tags.join(", ") : undefined,
  };
  const crumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
      { "@type": "ListItem", position: 2, name: "Travel guide", item: `${SITE}/travel-guide` },
      { "@type": "ListItem", position: 3, name: p.title, item: url },
    ],
  };
  const body = `
      <article class="text-left">
        <nav class="text-sm text-gray-500 mb-4"><a href="/">Home</a> › <a href="/travel-guide">Travel guide</a> › ${esc(p.title)}</nav>
        <h1 class="text-3xl md:text-5xl mb-4">${esc(p.title)}</h1>
        ${p.excerpt ? `<p class="text-lg text-gray-600 mb-6">${esc(p.excerpt)}</p>` : ""}
        ${p.featured_image ? `<img src="${esc(p.featured_image)}" alt="${esc(p.title)}" class="w-full max-h-[460px] object-cover rounded-2xl mb-8" loading="eager">` : ""}
        <div class="prose prose-lg max-w-none">${safeHtml(p.content).replace(/\n{2,}/g, "</p><p>").replace(/^(?!<)/, "<p>")}</div>
      </article>`;
  let html = rewriteHead(page, {
        ldId: "blogPostingSchema",
    title: `${p.title} | ZanziBiz Travel Guide`,
    description,
    canonical: url,
    image: p.featured_image,
    type: "article",
    jsonLd: [article, crumbs],
  });
  html = fillPlaceholder(html, body);
  return htmlResponse(html);
};

export const config: Config = {
  path: "/travel-guide/:slug",
  excludedPath: [
    "/travel-guide/*.html",
    "/travel-guide/flights-to-zanzibar",
    "/travel-guide/where-to-stay",
    "/travel-guide/hotels",
    "/travel-guide/tours",
    "/travel-guide/airport-transfers",
  ],
};
