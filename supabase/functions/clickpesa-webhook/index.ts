import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function timingSafeEqual(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const ab = enc.encode(a);
  const bb = enc.encode(b);
  if (ab.length !== bb.length) return false;
  let r = 0;
  for (let i = 0; i < ab.length; i++) r |= ab[i] ^ bb[i];
  return r === 0;
}

async function verifySignature(rawBody: string, provided: string): Promise<boolean> {
  const secret = Deno.env.get("CLICKPESA_CHECKSUM_SECRET");
  if (!secret) return true;
  if (!provided) return false;
  try {
    const parsed = JSON.parse(rawBody);
    const sorted = Object.keys(parsed).sort().reduce((acc: Record<string, unknown>, k) => {
      acc[k] = parsed[k]; return acc;
    }, {});
    const computed = await hmacSha256Hex(secret, JSON.stringify(sorted));
    return timingSafeEqual(computed, provided.toLowerCase());
  } catch {
    return false;
  }
}

function resolveOrderRef(p: Record<string, unknown>): string {
  return ((p.orderReference || p.order_reference || p.externalId || p.external_id || p.reference || "") as string);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const rawBody = await req.text();

    const sigHeader = req.headers.get("x-clickpesa-signature") || req.headers.get("x-signature") || "";
    if (sigHeader) {
      const valid = await verifySignature(rawBody, sigHeader);
      if (!valid) {
        console.error("clickpesa-webhook: invalid signature");
        return new Response(
          JSON.stringify({ error: "Invalid webhook signature" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("clickpesa-webhook received:", JSON.stringify(payload));

    const serviceSupabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const event = ((payload.event || payload.eventType || payload.type || "") as string).trim();
    const orderRef = resolveOrderRef(payload);
    const rawStatus = ((payload.status || payload.payment_status || payload.transactionStatus || "") as string).toUpperCase().trim();

    let cpStatus = rawStatus;
    if (!cpStatus) {
      if (event === "PAYMENT RECEIVED") cpStatus = "SUCCESS";
      else if (event === "PAYMENT FAILED") cpStatus = "FAILED";
    }

    await serviceSupabase.from("payment_events").insert({
      provider: "clickpesa",
      topup_reference: orderRef || null,
      event_type: event || "payment_update",
      payload_json: payload,
    }).then(({ error }) => {
      if (error) console.warn("payment_events insert error:", error.message);
    });

    if (!orderRef) {
      console.warn("clickpesa-webhook: no order reference in payload");
      return new Response(JSON.stringify({ received: true }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: topup } = await serviceSupabase
      .from("token_topups")
      .select("*")
      .eq("topup_reference", orderRef)
      .maybeSingle();

    let resolvedTopup = topup;
    if (!resolvedTopup) {
      const cpRef = ((payload.orderReference || payload.order_reference || "") as string);
      if (cpRef && cpRef !== orderRef) {
        const { data: byRef } = await serviceSupabase
          .from("token_topups")
          .select("*")
          .eq("clickpesa_order_reference", cpRef)
          .maybeSingle();
        resolvedTopup = byRef;
      }
    }

    if (!resolvedTopup) {
      console.error("clickpesa-webhook: order not found:", orderRef);
      return new Response(JSON.stringify({ received: true }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (resolvedTopup.credited) {
      return new Response(JSON.stringify({ received: true, already_credited: true }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const topupRef: string = resolvedTopup.topup_reference;
    const updateFields: Record<string, unknown> = {
      raw_webhook_payload: payload,
      updated_at: new Date().toISOString(),
    };
    if (cpStatus) updateFields.status = cpStatus;
    const cpTxId = payload.transactionId || payload.transaction_id || payload.mpesaTransactionId;
    if (cpTxId) updateFields.clickpesa_transaction_id = cpTxId as string;

    await serviceSupabase.from("token_topups").update(updateFields).eq("topup_reference", topupRef);

    const isSuccess = ["SUCCESS", "SETTLED"].includes(cpStatus) || event === "PAYMENT RECEIVED";
    const isFailed = ["FAILED", "EXPIRED", "REFUNDED", "REVERSED"].includes(cpStatus) || event === "PAYMENT FAILED";
    const ordersStatus = isSuccess ? "SUCCESS" : isFailed ? "FAILED" : "PROCESSING";

    await serviceSupabase
      .from("orders")
      .update({ status: ordersStatus, updated_at: new Date().toISOString() })
      .eq("order_reference", topupRef);

    if (isSuccess) {
      if (!["SUCCESS", "SETTLED"].includes(cpStatus)) {
        await serviceSupabase
          .from("token_topups")
          .update({ status: "SUCCESS", updated_at: new Date().toISOString() })
          .eq("topup_reference", topupRef);
      }
      const { data: creditResult, error: creditError } = await serviceSupabase.rpc(
        "finalize_topup_credit",
        { p_topup_reference: topupRef }
      );
      if (creditError) {
        console.error("finalize_topup_credit error:", creditError.message);
      } else {
        console.log("finalize_topup_credit result:", JSON.stringify(creditResult));
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("clickpesa-webhook unexpected error:", err);
    return new Response(JSON.stringify({ received: true }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
