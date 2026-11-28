import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { queryPaymentStatus } from "../_shared/clickpesa.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function isSuccessStatus(status: string): boolean {
  return ["SUCCESS", "SETTLED", "COMPLETED", "SUCCESSFUL"].includes((status || "").toUpperCase());
}

function isFailedStatus(status: string): boolean {
  return ["FAILED", "FAILURE", "DECLINED", "ON_HOLD", "REFUNDED", "REVERSED"].includes((status || "").toUpperCase());
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired session" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const { topup_reference } = body as { topup_reference: string };

    if (!topup_reference) {
      return new Response(
        JSON.stringify({ error: "topup_reference is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const serviceSupabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: topup, error: topupError } = await serviceSupabase
      .from("token_topups")
      .select("id, business_id, topup_reference, status, credited, token_amount, amount_tzs, clickpesa_order_reference")
      .eq("topup_reference", topup_reference)
      .maybeSingle();

    if (topupError || !topup) {
      return new Response(
        JSON.stringify({ error: "Top-up order not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: business } = await serviceSupabase
      .from("business_profiles")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!business || business.id !== topup.business_id) {
      return new Response(
        JSON.stringify({ error: "This top-up does not belong to your account" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
          verified: true,
          status: topup.status,
          already_credited: true,
          tokens_added: topup.token_amount,
          new_balance: biz?.token_balance ?? null,
          topup_reference,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let resolvedStatus = topup.status;
    let queryResponseData: Record<string, unknown> | null = null;

    try {
      const lookupRef = topup.clickpesa_order_reference || topup_reference;
      const cpRes = await queryPaymentStatus(lookupRef);
      queryResponseData = cpRes.data;

      const cpStatus = (
        cpRes.data?.status ||
        cpRes.data?.payment_status ||
        cpRes.data?.transactionStatus ||
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
      }
    } catch (queryErr) {
      console.error("topup-verify ClickPesa query error:", queryErr);
    }

    if (isSuccessStatus(resolvedStatus)) {
      const { data: creditResult, error: creditError } = await serviceSupabase.rpc(
        "finalize_topup_credit",
        { p_topup_reference: topup_reference }
      );

      if (creditError) {
        console.error("topup-verify finalize error:", creditError);
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
          message: "Payment verified! Tokens have been added to your account.",
          tokens_added: topup.token_amount,
          new_balance: biz?.token_balance ?? null,
          topup_reference,
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
          message: "Payment was not successful. No tokens were added.",
          topup_reference,
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
        topup_reference,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("topup-verify unexpected error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: err instanceof Error ? err.message : String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
