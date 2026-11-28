// Shared helpers for the server-rendered pages: Supabase REST reads with the
// public anon key, HTML escaping, and <head> rewriting.

export const SITE = "https://zanzibiz.com";
export const DEFAULT_IMAGE =
  "https://images.pexels.com/photos/3601425/pexels-photo-3601425.jpeg?auto=compress&cs=tinysrgb&w=1200&h=630&fit=crop";

export async function db<T = any>(path: string): Promise<T> {
  const url = Netlify.env.get("VITE_SUPABASE_URL");
  const key = Netlify.env.get("VITE_SUPABASE_ANON_KEY");
  if (!url || !key) throw new Error("Supabase env vars missing");
  const res = await fetch(`${url}/rest/v1/${path}`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${await res.text()}`);
  return res.json();
}

export const esc = (s: unknown) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export const plain = (html: unknown, max = 160) => {
  const t = String(html ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  return t.length > max ? t.slice(0, max - 1).replace(/\s+\S*$/, "") + "…" : t;
};

// Admin-written article HTML: keep the markup, drop anything executable.
export const safeHtml = (html: unknown) =>
  String(html ?? "")
    .replace(/<\s*(script|style|iframe|object|embed)[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/(href|src)\s*=\s*(["'])\s*javascript:[^"']*\2/gi, "$1=$2#$2");

export interface Head {
  title: string;
  description: string;
  canonical: string;
  image?: string;
  type?: string;
  jsonLd?: unknown[];
  noindex?: boolean;
  // id the page's own script expects on its JSON-LD tag (it overwrites it)
  ldId?: string;
}

export function rewriteHead(html: string, h: Head): string {
  let out = html
    .replace(/<title[^>]*>[\s\S]*?<\/title>/i, "")
    .replace(/<meta\s+[^>]*(name|property)=["'](description|robots|og:[^"']+|twitter:[^"']+)["'][^>]*>\s*/gi, "")
    .replace(/<link\s+[^>]*rel=["']canonical["'][^>]*>\s*/gi, "")
    // Template placeholders; the page's script adds its own after loading.
    .replace(/<script type="application\/ld\+json" id="(structured-data|blogPostingSchema)">[\s\S]*?<\/script>\s*/gi, "");
  const img = h.image || DEFAULT_IMAGE;
  const tags = [
    `<title>${esc(h.title)}</title>`,
    `<meta name="description" content="${esc(h.description)}">`,
    `<link rel="canonical" href="${esc(h.canonical)}">`,
    h.noindex ? `<meta name="robots" content="noindex">` : "",
    `<meta property="og:site_name" content="ZanziBiz">`,
    `<meta property="og:type" content="${esc(h.type || "website")}">`,
    `<meta property="og:title" content="${esc(h.title)}">`,
    `<meta property="og:description" content="${esc(h.description)}">`,
    `<meta property="og:url" content="${esc(h.canonical)}">`,
    `<meta property="og:image" content="${esc(img)}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${esc(h.title)}">`,
    `<meta name="twitter:description" content="${esc(h.description)}">`,
    `<meta name="twitter:image" content="${esc(img)}">`,
    ...(h.jsonLd || []).map(
      (j, i) =>
        `<script type="application/ld+json"${i === 0 && h.ldId ? ` id="${h.ldId}"` : ""}>${JSON.stringify(j).replace(/</g, "\\u003c")}</script>`,
    ),
    // Keep the id the page script writes to, even on 404s.
    h.ldId && !(h.jsonLd || []).length ? `<script type="application/ld+json" id="${h.ldId}">{}</script>` : "",
  ].filter(Boolean);
  return out.replace(/<head([^>]*)>/i, `<head$1>\n    ${tags.join("\n    ")}`);
}

// Replace the page's loading placeholder (between <!--ssr:start--> and
// <!--ssr:end-->) with server-rendered content. The page's own script still
// runs and swaps it for the interactive view.
export function fillPlaceholder(html: string, inner: string): string {
  return html.replace(/<!--ssr:start-->[\s\S]*?<!--ssr:end-->/, inner);
}

export async function template(req: Request, path: string): Promise<string> {
  const res = await fetch(new URL(path, req.url));
  return res.text();
}

export function htmlResponse(body: string, status = 200, maxAge = 300) {
  return new Response(body, {
    status,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=0, must-revalidate",
      "netlify-cdn-cache-control": `public, s-maxage=${maxAge}, stale-while-revalidate=86400`,
    },
  });
}
