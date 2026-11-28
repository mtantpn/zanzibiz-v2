import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { initiateUssd, maskPhone } from "../_shared/clickpesa.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

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
    const { topup_reference, payer_phone } = body as {
      topup_reference: string;
      payer_phone: string;
    };

    if (!topup_reference || !payer_phone) {
      return new Response(
        JSON.stringify({ error: "topup_reference and payer_phone are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const digits = payer_phone.replace(/\D/g, "");
    if (digits.length < 9 || digits.length > 15) {
      return new Response(
        JSON.stringify({ error: "Invalid phone number — use international format without '+', e.g. 255712345678" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const serviceSupabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: topup, error: topupError } = await serviceSupabase
      .from("token_topups")
      .select("id, business_id, topup_reference, status, credited, amount_tzs, token_amount")
      .eq("topup_reference", topup_reference)
      .maybeSingle();

    if (topupError) {
      console.error("topup lookup error:", topupError);
      return new Response(
        JSON.stringify({ error: "Database error looking up order" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!topup) {
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
      return new Response(
        JSON.stringify({ success: true, status: "SUCCESS", message: "Tokens already credited." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const callbackUrl = `${supabaseUrl}/functions/v1/clickpesa-webhook`;

    let cpOk = false;
    let cpData: Record<string, unknown> = {};
    let cpError: string | null = null;

    try {
      console.log("=== USSD INITIATION START ===");
      console.log("Reference:", topup_reference);
      console.log("Phone (masked):", maskPhone(digits));
      console.log("Phone (length):", digits.length, "digits");
      console.log("Amount:", topup.amount_tzs, "TZS");
      console.log("Callback URL:", callbackUrl);

      const cpRes = await initiateUssd(
        {
          orderReference: topup_reference,
          amount: String(topup.amount_tzs),
          phoneNumber: digits,
        },
        callbackUrl
      );

      cpOk = cpRes.ok;
      cpData = cpRes.data;

      console.log("=== CLICKPESA RESPONSE ===");
      console.log("Status:", cpRes.status);
      console.log("Success:", cpOk);
      console.log("Response Data:", JSON.stringify(cpData, null, 2));

      if (!cpOk) {
        cpError = `ClickPesa returned ${cpRes.status}: ${JSON.stringify(cpData)}`;
        console.error("ERROR:", cpError);
      } else {
        console.log("✓ ClickPesa accepted the request");
        console.log("Response message:", cpData.message || cpData.status || "No message");
      }
    } catch (cpErr) {
      cpError = cpErr instanceof Error ? cpErr.message : String(cpErr);
      console.error("EXCEPTION during USSD initiation:", cpError);
    }

    const newStatus = cpOk ? "PROCESSING" : topup.status;
    const cpOrderRef = (
      cpData.orderReference ||
      cpData.order_reference ||
      cpData.transactionId ||
      cpData.data?.orderReference ||
      null
    ) as string | null;

    const masked = maskPhone(payer_phone);

    await serviceSupabase
      .from("token_topups")
      .update({
        payer_phone: masked,
        status: newStatus,
        clickpesa_order_reference: cpOrderRef,
        raw_initiate_response: cpData,
        payment_channel: "ussd_push",
        updated_at: new Date().toISOString(),
      })
      .eq("topup_reference", topup_reference);

    await serviceSupabase
      .from("orders")
      .update({
        status: cpOk ? "PROCESSING" : "PENDING",
        payer_phone: masked,
        clickpesa_order_reference: cpOrderRef,
        updated_at: new Date().toISOString(),
      })
      .eq("order_reference", topup_reference);

    if (!cpOk) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Could not initiate USSD push. Please try again.",
          details: cpError,
          clickpesa_response: cpData,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        status: "PROCESSING",
        message: "USSD prompt sent. Enter your M-Pesa PIN to complete the payment.",
        topup_reference,
        order_reference: cpOrderRef || topup_reference,
        callback_url: callbackUrl,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("topup-initiate unexpected error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: err instanceof Error ? err.message : String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
