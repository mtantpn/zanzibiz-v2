import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function generateOrderReference(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ZB-${ts}-${rand}`;
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

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("user_type")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError || !profile || profile.user_type !== "business") {
      return new Response(
        JSON.stringify({ error: "Business account required to purchase tokens" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: business, error: bizError } = await supabase
      .from("business_profiles")
      .select("id, business_name, token_balance")
      .eq("user_id", user.id)
      .maybeSingle();

    if (bizError || !business) {
      return new Response(
        JSON.stringify({ error: "Business profile not found. Please complete your business setup first." }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const orderReference = generateOrderReference();

    const serviceSupabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { error: topupInsertError } = await serviceSupabase
      .from("token_topups")
      .insert({
        business_id: business.id,
        client_id: business.id,
        business_name_snapshot: business.business_name,
        package_name: "300 tokens",
        token_amount: 300,
        amount_tzs: 1500,
        currency: "TZS",
        topup_reference: orderReference,
        status: "PENDING_PAYMENT",
      });

    if (topupInsertError) {
      console.error("topup-create token_topups insert error:", topupInsertError);
      return new Response(
        JSON.stringify({ error: "Failed to create top-up order. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { error: orderInsertError } = await serviceSupabase
      .from("orders")
      .insert({
        order_reference: orderReference,
        user_id: user.id,
        business_id: business.id,
        amount: 1500,
        token_amount: 300,
        status: "PENDING",
      });

    if (orderInsertError) {
      console.error("topup-create orders insert error:", orderInsertError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        topup_reference: orderReference,
        order_reference: orderReference,
        client_id: business.id,
        business_name: business.business_name,
        current_balance: business.token_balance,
        token_amount: 300,
        amount_tzs: 1500,
        currency: "TZS",
        status: "PENDING_PAYMENT",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("topup-create unexpected error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
