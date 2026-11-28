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

// The page scripts look up some head tags by id (pageTitle, ogTitle…).
// Remember each replaced tag's id so the new tag keeps it.
function headIds(html: string): Record<string, string> {
  const ids: Record<string, string> = {};
  const head = html.slice(0, html.search(/<\/head>/i));
  for (const m of head.matchAll(/<(title|meta|link)\b[^>]*>/gi)) {
    const tag = m[0];
    const id = tag.match(/\bid=["']([^"']+)["']/)?.[1];
    if (!id) continue;
    const key =
      m[1].toLowerCase() === "title"
        ? "title"
        : tag.match(/\b(?:name|property)=["']([^"']+)["']/)?.[1] ||
          (/rel=["']canonical["']/i.test(tag) ? "canonical" : "");
    if (key) ids[key] = id;
  }
  return ids;
}

export function rewriteHead(html: string, h: Head): string {
  const ids = headIds(html);
  const idAttr = (key: string) => (ids[key] ? ` id="${ids[key]}"` : "");
  let out = html
    .replace(/<title[^>]*>[\s\S]*?<\/title>/i, "")
    .replace(/<meta\s+[^>]*(name|property)=["'](description|robots|og:[^"']+|twitter:[^"']+)["'][^>]*>\s*/gi, "")
    .replace(/<link\s+[^>]*rel=["']canonical["'][^>]*>\s*/gi, "")
    // Template placeholders; the page's script adds its own after loading.
    .replace(/<script type="application\/ld\+json" id="(structured-data|blogPostingSchema)">[\s\S]*?<\/script>\s*/gi, "");
  const img = h.image || DEFAULT_IMAGE;
  const meta = (attr: string, key: string, value: string) =>
    `<meta ${attr}="${key}"${idAttr(key)} content="${esc(value)}">`;
  const tags = [
    `<title${idAttr("title")}>${esc(h.title)}</title>`,
    meta("name", "description", h.description),
    `<link rel="canonical"${idAttr("canonical")} href="${esc(h.canonical)}">`,
    h.noindex ? `<meta name="robots" content="noindex">` : "",
    meta("property", "og:site_name", "ZanziBiz"),
    meta("property", "og:type", h.type || "website"),
    meta("property", "og:title", h.title),
    meta("property", "og:description", h.description),
    meta("property", "og:url", h.canonical),
    meta("property", "og:image", img),
    meta("name", "twitter:card", "summary_large_image"),
    meta("name", "twitter:title", h.title),
    meta("name", "twitter:description", h.description),
    meta("name", "twitter:image", img),
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
