import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const CLICKPESA_BASE_URL = Deno.env.get("CLICKPESA_BASE_URL") || "https://api.clickpesa.com";

let cachedJWT: { token: string; expiresAt: number } | null = null;

async function getClickPesaJWT(): Promise<string> {
  if (cachedJWT && Date.now() < cachedJWT.expiresAt) return cachedJWT.token;
  const res = await fetch(`${CLICKPESA_BASE_URL}/third-parties/generate-token`, {
    method: "POST",
    headers: {
      "client-id": Deno.env.get("CLICKPESA_CLIENT_ID")!,
      "api-key": Deno.env.get("CLICKPESA_API_KEY")!,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) throw new Error(`ClickPesa auth failed: ${res.status}`);
  const data = await res.json();
  const token: string = data.token || data.access_token || data.jwt;
  cachedJWT = { token, expiresAt: Date.now() + 55 * 60 * 1000 };
  return token;
}

async function queryClickPesaPayment(
  jwt: string,
  reference: string
): Promise<{ ok: boolean; data: Record<string, unknown> }> {
  const res = await fetch(
    `${CLICKPESA_BASE_URL}/third-parties/payments/${encodeURIComponent(reference)}`,
    { headers: { "Authorization": `Bearer ${jwt}`, "Content-Type": "application/json" } }
  );
  const data = await res.json();
  return { ok: res.ok, data };
}

function isSuccessStatus(status: string): boolean {
  return ["SUCCESS", "SETTLED"].includes((status || "").toUpperCase());
}

function isFailedStatus(status: string): boolean {
  return ["FAILED", "ON_HOLD", "REFUNDED", "REVERSED"].includes((status || "").toUpperCase());
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { client_id, topup_reference, confirmation_id } = body as {
      client_id: string;
      topup_reference: string;
      confirmation_id: string;
    };

    if (!client_id || !topup_reference || !confirmation_id) {
      return new Response(
        JSON.stringify({ error: "client_id, topup_reference, and confirmation_id are all required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const serviceSupabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: topup, error: topupError } = await serviceSupabase
      .from("token_topups")
      .select("*")
      .eq("topup_reference", topup_reference)
      .eq("client_id", client_id)
      .maybeSingle();

    if (topupError || !topup) {
      console.error("topup-confirm lookup failed:", topupError);
      return new Response(
        JSON.stringify({ error: "No top-up order found for the provided Client ID and Top-up Reference. Please check your details." }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (topup.credited) {
      const { data: biz } = await serviceSupabase
        .from("business_profiles")
        .select("token_balance")
        .eq("id", topup.business_id)
        .maybeSingle();
      return new Response(
        JSON.stringify({
          success: true,
          already_credited: true,
          status: topup.status,
          message: "Tokens were already credited to your account.",
          tokens_added: topup.token_amount,
          new_balance: biz?.token_balance ?? null,
          topup_reference: topup_reference,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    await serviceSupabase
      .from("token_topups")
      .update({ submitted_confirmation_id: confirmation_id, updated_at: new Date().toISOString() })
      .eq("topup_reference", topup_reference);

    await serviceSupabase.from("payment_events").insert({
      provider: "clickpesa",
      topup_reference: topup_reference,
      event_type: "confirmation_submitted",
      payload_json: { confirmation_id, client_id, submitted_at: new Date().toISOString() },
    });

    let resolvedStatus = topup.status;
    let queryResponseData: Record<string, unknown> | null = null;

    const webhookAlreadySuccess =
      topup.raw_webhook_payload &&
      isSuccessStatus((topup.raw_webhook_payload as Record<string, unknown>)?.status as string || "");

    if (webhookAlreadySuccess) {
      resolvedStatus = (topup.raw_webhook_payload as Record<string, unknown>).status as string;
    } else {
      try {
        const jwt = await getClickPesaJWT();
        const lookupRef = topup.clickpesa_order_reference || topup_reference;
        const queryResult = await queryClickPesaPayment(jwt, lookupRef);
        queryResponseData = queryResult.data;

        const cpStatus: string = (
          queryResult.data?.status ||
          queryResult.data?.payment_status ||
          queryResult.data?.transactionStatus ||
          ""
        ) as string;

        if (cpStatus) {
          resolvedStatus = cpStatus.toUpperCase();
          await serviceSupabase
            .from("token_topups")
            .update({
              status: resolvedStatus,
              raw_query_response: queryResponseData,
              updated_at: new Date().toISOString(),
            })
            .eq("topup_reference", topup_reference);

          await serviceSupabase.from("payment_events").insert({
            provider: "clickpesa",
            topup_reference: topup_reference,
            event_type: "status_query_response",
            payload_json: queryResponseData,
          });
        }
      } catch (queryErr) {
        console.error("topup-confirm ClickPesa query error:", queryErr);
      }
    }

    if (isSuccessStatus(resolvedStatus)) {
      await serviceSupabase
        .from("token_topups")
        .update({ status: resolvedStatus, updated_at: new Date().toISOString() })
        .eq("topup_reference", topup_reference);

      const { data: creditResult, error: creditError } = await serviceSupabase.rpc(
        "finalize_topup_credit",
        { p_topup_reference: topup_reference }
      );

      if (creditError) {
        console.error("topup-confirm finalize error:", creditError);
        return new Response(
          JSON.stringify({ error: "Payment verified but token crediting failed. Please contact support.", topup_reference }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: biz } = await serviceSupabase
        .from("business_profiles")
        .select("token_balance")
        .eq("id", topup.business_id)
        .maybeSingle();

      return new Response(
        JSON.stringify({
          success: true,
          verified: true,
          status: resolvedStatus,
          message: "Payment verified! 300 tokens have been added to your account.",
          tokens_added: 300,
          new_balance: biz?.token_balance ?? null,
          topup_reference: topup_reference,
          already_credited: (creditResult as Record<string, unknown>)?.already_credited ?? false,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (isFailedStatus(resolvedStatus)) {
      return new Response(
        JSON.stringify({
          success: false,
          verified: false,
          status: resolvedStatus,
          message: "Payment was not successful. No tokens were added. Please try again or contact support.",
          topup_reference: topup_reference,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: false,
        verified: false,
        status: resolvedStatus,
        message: "Payment is still being processed. Please wait a few minutes and check again.",
        topup_reference: topup_reference,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("topup-confirm unexpected error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
