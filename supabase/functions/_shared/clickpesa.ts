import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const CLICKPESA_BASE_URL =
  Deno.env.get("CLICKPESA_BASE_URL") || "https://api.clickpesa.com";

interface CachedJWT {
  token: string;
  expiresAt: number;
}

let cachedToken: CachedJWT | null = null;

export async function getJWT(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }
  const res = await fetch(
    `${CLICKPESA_BASE_URL}/third-parties/generate-token`,
    {
      method: "POST",
      headers: {
        "client-id": Deno.env.get("CLICKPESA_CLIENT_ID")!,
        "api-key": Deno.env.get("CLICKPESA_API_KEY")!,
        "Content-Type": "application/json",
      },
    }
  );
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`ClickPesa auth failed ${res.status}: ${body}`);
  }
  const data = await res.json();
  const token: string = data.token || data.access_token || data.jwt;
  cachedToken = { token, expiresAt: Date.now() + 55 * 60 * 1000 };
  return token;
}

async function computeHmacSha256(
  secret: string,
  message: string
): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(message);
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, messageData);
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function sortedCanonical(obj: Record<string, unknown>): string {
  const sorted = Object.keys(obj)
    .sort()
    .reduce((acc: Record<string, unknown>, k) => {
      acc[k] = obj[k];
      return acc;
    }, {});
  return JSON.stringify(sorted);
}

async function addChecksum(
  payload: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const secret = Deno.env.get("CLICKPESA_CHECKSUM_SECRET");
  if (!secret) return payload;
  const checksum = await computeHmacSha256(secret, sortedCanonical(payload));
  return { ...payload, checksum };
}

export interface UssdPayload {
  orderReference: string;
  amount: string;
  phoneNumber: string;
}

export interface ClickPesaResponse {
  ok: boolean;
  status: number;
  data: Record<string, unknown>;
}

export async function previewUssd(
  payload: UssdPayload
): Promise<ClickPesaResponse> {
  const jwt = await getJWT();
  const body = await addChecksum({
    amount: payload.amount,
    currency: "TZS",
    orderReference: payload.orderReference,
    phoneNumber: payload.phoneNumber,
  });
  const res = await fetch(
    `${CLICKPESA_BASE_URL}/third-parties/payments/preview-ussd-push-request`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwt}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );
  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}

export async function initiateUssd(
  payload: UssdPayload,
  callbackUrl: string
): Promise<ClickPesaResponse> {
  const jwt = await getJWT();
  const body = await addChecksum({
    amount: payload.amount,
    callbackUrl,
    currency: "TZS",
    orderReference: payload.orderReference,
    phoneNumber: payload.phoneNumber,
  });
  const res = await fetch(
    `${CLICKPESA_BASE_URL}/third-parties/payments/initiate-ussd-push-request`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwt}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );
  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}

export async function queryPaymentStatus(
  orderReference: string
): Promise<ClickPesaResponse> {
  const jwt = await getJWT();
  const res = await fetch(
    `${CLICKPESA_BASE_URL}/third-parties/payments/${encodeURIComponent(
      orderReference
    )}`,
    {
      headers: { Authorization: `Bearer ${jwt}` },
    }
  );
  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}

function timingSafeEqual(a: string, b: string): boolean {
  const encoder = new TextEncoder();
  const aBytes = encoder.encode(a);
  const bBytes = encoder.encode(b);
  if (aBytes.length !== bBytes.length) return false;
  let result = 0;
  for (let i = 0; i < aBytes.length; i++) {
    result |= aBytes[i] ^ bBytes[i];
  }
  return result === 0;
}

export async function verifyWebhookChecksum(
  rawBody: string,
  providedChecksum: string
): Promise<boolean> {
  const secret = Deno.env.get("CLICKPESA_CHECKSUM_SECRET");
  if (!secret) {
    console.warn("CLICKPESA_CHECKSUM_SECRET not set — skipping verification");
    return true;
  }
  if (!providedChecksum) return false;
  try {
    const parsed = JSON.parse(rawBody);
    const canonical = sortedCanonical(parsed);
    const computed = await computeHmacSha256(secret, canonical);
    return timingSafeEqual(computed, providedChecksum.toLowerCase());
  } catch {
    return false;
  }
}

export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length >= 9) {
    return digits.slice(0, 3) + "****" + digits.slice(-3);
  }
  return "***masked***";
}
