// Answer-first helpers for the server-rendered pages: plain-language
// summaries, key-fact lists and FAQs built ONLY from fields the business or
// editor actually filled in. Nothing here invents a fact: if a field is
// empty, the sentence, fact or question about it is left out.
import { esc } from "./seo.mts";

// Owner-written text is plain text (the page shows it with textContent), so
// collapse whitespace and cut on a word boundary without stripping "<…>".
export const clean = (text: unknown, max = 160) => {
  const t = String(text ?? "").replace(/\s+/g, " ").trim();
  return t.length > max ? t.slice(0, max - 1).replace(/\s+\S*$/, "") + "…" : t;
};

export const ORG_ID = "https://zanzibiz.com/#organization";

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const DAY_SHORT: Record<string, string> = {
  monday: "Mon", tuesday: "Tue", wednesday: "Wed", thursday: "Thu", friday: "Fri", saturday: "Sat", sunday: "Sun",
};
const DAY_SCHEMA: Record<string, string> = {
  monday: "Monday", tuesday: "Tuesday", wednesday: "Wednesday", thursday: "Thursday",
  friday: "Friday", saturday: "Saturday", sunday: "Sunday",
};

// What kind of thing a listing is, as a noun phrase for "X is a … in Y".
const KIND: Record<string, string> = {
  business: "local business",
  activities: "tour and activity provider",
  accommodation: "place to stay",
  automotive: "automotive business",
  jobs: "job listing",
  events: "event",
  "useful-info": "local information listing",
};

const titleCase = (s: string) => s.replace(/\b\p{L}/gu, (c) => c.toUpperCase());

// "stone-town" -> "Stone Town"; "other"/empty -> "" (caller falls back to Zanzibar).
export function areaLabel(location: unknown): string {
  const s = String(location ?? "").trim().replace(/[-_]+/g, " ").replace(/\s+/g, " ");
  if (!s || /^other$/i.test(s) || /^zanzibar$/i.test(s)) return "";
  return titleCase(s.toLowerCase());
}

export const subLabel = (sub: unknown) => {
  const s = String(sub ?? "").trim().replace(/[-_]+/g, " ");
  return s ? titleCase(s.toLowerCase()) : "";
};

export interface DayHours { day: string; value: string }

// business_hours is stored as {"monday": "11:00-22:00", ...}.
export function hoursOf(h: unknown): DayHours[] {
  if (!h || typeof h !== "object" || Array.isArray(h)) return [];
  const o = h as Record<string, unknown>;
  return DAYS.filter((d) => o[d] != null && String(o[d]).trim() !== "").map((d) => ({ day: d, value: String(o[d]).trim() }));
}

// Group consecutive days with the same hours: "Mon–Fri 08:00–17:00; Sat–Sun Closed".
export function compactHours(hours: DayHours[]): string {
  const groups: { from: string; to: string; value: string }[] = [];
  for (const h of hours) {
    const last = groups[groups.length - 1];
    if (last && last.value === h.value && DAYS.indexOf(h.day) === DAYS.indexOf(last.to) + 1) last.to = h.day;
    else groups.push({ from: h.day, to: h.day, value: h.value });
  }
  return groups
    .map((g) => {
      const days = g.from === g.to ? DAY_SHORT[g.from] : `${DAY_SHORT[g.from]}–${DAY_SHORT[g.to]}`;
      return `${days} ${g.value.replace(/\s*-\s*/, "–")}`;
    })
    .join("; ");
}

// schema.org OpeningHoursSpecification for days written as "HH:MM-HH:MM".
// Free-text values ("by appointment", "Closed") are left out, never guessed.
export function openingHoursSpec(hours: DayHours[]) {
  const spec = hours
    .map((h) => {
      const m = h.value.match(/^(\d{1,2}[:.]\d{2})\s*[-–]\s*(\d{1,2}[:.]\d{2})$/);
      if (!m) return null;
      const t = (x: string) => x.replace(".", ":").padStart(5, "0");
      return { "@type": "OpeningHoursSpecification", dayOfWeek: `https://schema.org/${DAY_SCHEMA[h.day]}`, opens: t(m[1]), closes: t(m[2]) };
    })
    .filter(Boolean);
  return spec.length ? spec : undefined;
}

export const waDisplay = (digits: string) => (digits ? `+${digits}` : "");

export const usd = (n: unknown) => {
  const v = Number(n);
  return Number.isFinite(v) && v > 0 ? `US$${v.toLocaleString("en-US", { maximumFractionDigits: 2 })}` : "";
};

export const isoDate = (d: unknown) => {
  const s = String(d ?? "");
  return /^\d{4}-\d{2}-\d{2}/.test(s) ? s.slice(0, 10) : "";
};

export const longDate = (d: unknown) => {
  const s = isoDate(d);
  if (!s) return "";
  return new Date(`${s}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
};

const article = (noun: string) => (/^[aeiou]/i.test(noun) ? "an" : "a");

// First sentence of the owner's description, as plain text.
export function firstSentence(text: unknown, max = 220): string {
  const t = clean(text, 2000);
  if (!t) return "";
  const m = t.match(/^(.{10,}?[.!?])(\s|$)/);
  const s = m ? m[1] : t;
  const out = s.length > max ? clean(s, max) : s;
  return /[.!?…]$/.test(out) ? out : `${out}.`;
}

export interface ListingFacts {
  title: string;
  category: string; // label, e.g. "Accommodation"
  kind: string; // noun phrase, e.g. "place to stay"
  sub: string;
  area: string; // "" when unknown
  place: string; // "Stone Town, Zanzibar" or "Zanzibar"
  address: string;
  phone: string;
  whatsapp: string; // display form, only when the listing has a WhatsApp number
  email: string;
  website: string;
  what3words: string;
  hours: DayHours[];
  price: string;
  features: string[];
  verified: boolean;
  updated: string; // ISO date
}

export function listingFacts(l: any, categoryLabel: string): ListingFacts {
  const area = areaLabel(l.location);
  return {
    title: String(l.title || ""),
    category: categoryLabel,
    kind: KIND[l.category] || "local business",
    sub: subLabel(l.subcategory),
    area,
    place: area ? `${area}, Zanzibar` : "Zanzibar",
    address: String(l.address || "").trim(),
    phone: String(l.phone || "").trim(),
    whatsapp: waDisplay(String(l.whatsapp || "").replace(/\D/g, "")),
    email: String(l.email || "").trim(),
    website: String(l.website || "").trim(),
    what3words: String(l.what3words || "").trim().replace(/^\/+/, ""),
    hours: hoursOf(l.business_hours),
    price: usd(l.price),
    features: Array.isArray(l.features) ? l.features.map((f: unknown) => String(f).trim()).filter(Boolean).slice(0, 12) : [],
    verified: !!l.business_profiles?.verified,
    updated: isoDate(l.updated_at || l.created_at),
  };
}

// One paragraph that answers "what is X, where is it, how do I reach it".
export function listingSummary(f: ListingFacts, description: unknown): string {
  const parts: string[] = [];
  const what = f.sub ? `${f.kind} (${f.sub})` : f.kind;
  parts.push(`${f.title} is ${article(what)} ${what} in ${f.place}, Tanzania, listed in the ZanziBiz ${f.category} directory.`);
  const first = firstSentence(description);
  if (first && first.toLowerCase() !== f.title.toLowerCase()) parts.push(first);
  const contact: string[] = [];
  if (f.whatsapp) contact.push(`WhatsApp on ${f.whatsapp}`);
  if (f.phone && f.phone.replace(/\D/g, "") !== f.whatsapp.replace(/\D/g, "")) contact.push(`phone on ${f.phone}`);
  if (f.email) contact.push(`email at ${f.email}`);
  if (contact.length) parts.push(`You can contact ${f.title} by ${joinOr(contact)}.`);
  if (f.hours.length) parts.push(`Listed opening hours: ${compactHours(f.hours)}.`);
  if (f.price) parts.push(`Listed starting price: ${f.price}.`);
  return parts.join(" ");
}

function joinOr(a: string[]) {
  return a.length <= 1 ? a.join("") : `${a.slice(0, -1).join(", ")} or ${a[a.length - 1]}`;
}

const extUrl = (u: string) => (/^https?:\/\//i.test(u) ? u : `https://${u}`);

// Key facts as a <dl>. Every value is escaped.
export function factsHtml(f: ListingFacts): string {
  const rows: [string, string][] = [];
  rows.push(["Category", esc(f.sub ? `${f.category} · ${f.sub}` : f.category)]);
  rows.push(["Area", esc(f.place)]);
  if (f.address) rows.push(["Address", esc(f.address)]);
  if (f.what3words)
    rows.push(["what3words", `<a href="https://what3words.com/${esc(encodeURI(f.what3words))}" rel="nofollow noopener">///${esc(f.what3words)}</a>`]);
  if (f.whatsapp) rows.push(["WhatsApp", `<a href="https://wa.me/${esc(f.whatsapp.replace(/\D/g, ""))}">${esc(f.whatsapp)}</a>`]);
  if (f.phone) rows.push(["Phone", `<a href="tel:${esc(f.phone.replace(/[^\d+]/g, ""))}">${esc(f.phone)}</a>`]);
  if (f.email) rows.push(["Email", `<a href="mailto:${esc(f.email)}">${esc(f.email)}</a>`]);
  if (f.website) rows.push(["Website", `<a href="${esc(extUrl(f.website))}" rel="nofollow noopener">${esc(f.website.replace(/^https?:\/\//i, "").replace(/\/$/, ""))}</a>`]);
  if (f.hours.length)
    rows.push([
      "Opening hours",
      `<ul class="list-none p-0 m-0">${f.hours.map((h) => `<li><span class="capitalize">${esc(h.day)}</span>: ${esc(h.value)}</li>`).join("")}</ul>`,
    ]);
  if (f.price) rows.push(["Starting price", esc(f.price)]);
  if (f.features.length) rows.push(["Features", esc(f.features.join(", "))]);
  rows.push(["Verified by ZanziBiz", f.verified ? "Yes" : "No, details are supplied by the business"]);
  if (f.updated) rows.push(["Listing last updated", `<time datetime="${f.updated}">${esc(longDate(f.updated))}</time>`]);
  return `<dl class="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-x-6 gap-y-2 text-sm">${rows
    .map(([k, v]) => `<dt class="font-semibold text-[#1D2427]">${k}</dt><dd class="text-gray-700 m-0">${v}</dd>`)
    .join("")}</dl>`;
}

// Short FAQs, each answered from a filled-in field only.
export function listingFaqs(f: ListingFacts): { q: string; a: string }[] {
  const out: { q: string; a: string }[] = [];
  out.push({
    q: `Where is ${f.title}?`,
    a: `${f.title} is in ${f.place}, Tanzania${f.address ? `. The listed address is ${f.address}` : ""}${f.what3words ? ` (what3words: ///${f.what3words})` : ""}.`,
  });
  const ways: string[] = [];
  if (f.whatsapp) ways.push(`WhatsApp ${f.whatsapp}`);
  if (f.phone) ways.push(`call ${f.phone}`);
  if (f.email) ways.push(`email ${f.email}`);
  if (f.website) ways.push(`visit ${f.website.replace(/^https?:\/\//i, "").replace(/\/$/, "")}`);
  if (ways.length) out.push({ q: `How do I contact ${f.title}?`, a: `${joinOr(ways).replace(/^./, (c) => c.toUpperCase())}.` });
  if (f.hours.length) out.push({ q: `What are the opening hours of ${f.title}?`, a: `The listed hours are ${compactHours(f.hours)}. Hours can change, so check with the business before you go.` });
  if (f.price) out.push({ q: `How much does ${f.title} cost?`, a: `The listed starting price is ${f.price}. Ask the business for current prices.` });
  if (f.verified) out.push({ q: `Is ${f.title} verified on ZanziBiz?`, a: `Yes. The ZanziBiz team has marked this business profile as verified.` });
  return out;
}

export function faqHtml(faqs: { q: string; a: string }[], heading: string): string {
  if (!faqs.length) return "";
  return `<section class="mt-8" aria-labelledby="faq-heading"><h2 id="faq-heading" class="text-xl font-semibold mb-3">${esc(heading)}</h2>${faqs
    .map((x) => `<h3 class="font-semibold mt-4 mb-1 text-base">${esc(x.q)}</h3><p class="text-gray-700">${esc(x.a)}</p>`)
    .join("")}</section>`;
}
