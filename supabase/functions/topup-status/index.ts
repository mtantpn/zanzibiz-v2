import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { queryPaymentStatus } from "../_shared/clickpesa.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const PENDING_STATUSES = ["CREATED", "PENDING_PAYMENT", "PROCESSING", "PENDING"];

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const ref = url.searchParams.get("ref");
    if (!ref) {
      return new Response(
        JSON.stringify({ error: "ref query parameter is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const serviceSupabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: topup, error: topupError } = await serviceSupabase
      .from("token_topups")
      .select("id, business_id, topup_reference, status, credited, credited_at, token_amount, amount_tzs, business_name_snapshot, clickpesa_order_reference, created_at, updated_at")
      .eq("topup_reference", ref)
      .maybeSingle();

    if (topupError || !topup) {
      return new Response(
        JSON.stringify({ error: "Top-up order not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    function mapClickPesaStatus(cpStatus: string): string {
      const statusMap: Record<string, string> = {
        "UP": "PROCESSING",
        "PENDING": "PROCESSING",
        "PROCESSING": "PROCESSING",
        "SUCCESS": "SUCCESS",
        "SUCCESSFUL": "SUCCESS",
        "COMPLETED": "SUCCESS",
        "SETTLED": "SETTLED",
        "FAILED": "FAILED",
        "FAILURE": "FAILED",
        "DECLINED": "FAILED",
        "EXPIRED": "EXPIRED",
        "TIMEOUT": "EXPIRED",
        "REFUNDED": "REFUNDED",
        "REVERSED": "REVERSED",
      };
      return statusMap[cpStatus.toUpperCase()] || cpStatus;
    }

    let currentStatus: string = topup.status;
    let newBalance: number | null = null;

    if (topup.credited) {
      const { data: biz } = await serviceSupabase
        .from("business_profiles")
        .select("token_balance")
        .eq("id", topup.business_id)
        .maybeSingle();
      newBalance = biz?.token_balance ?? null;
    } else if (PENDING_STATUSES.includes(currentStatus)) {
      try {
        const lookupRef = topup.clickpesa_order_reference || ref;
        console.log("Querying ClickPesa status for:", lookupRef);

        const cpRes = await queryPaymentStatus(lookupRef);
        const cpData = cpRes.data;

        console.log("ClickPesa status response:", JSON.stringify(cpData, null, 2));

        if (cpRes.ok && cpData) {
          const rawCpStatus = (
            (cpData.status || cpData.payment_status || cpData.transactionStatus || "") as string
          ).toUpperCase();

          const mappedStatus = mapClickPesaStatus(rawCpStatus);
          console.log(`Mapped ClickPesa status "${rawCpStatus}" -> "${mappedStatus}"`);

          if (mappedStatus && mappedStatus !== currentStatus) {
            currentStatus = mappedStatus;
            const { error: updateError } = await serviceSupabase
              .from("token_topups")
              .update({ status: mappedStatus, raw_query_response: cpData, updated_at: new Date().toISOString() })
              .eq("topup_reference", ref);

            if (updateError) {
              console.error("Failed to update topup status:", updateError);
            }

            if (["SUCCESS", "SETTLED"].includes(mappedStatus)) {
              const dbStatus = "SUCCESS";
              await serviceSupabase
                .from("orders")
                .update({ status: dbStatus, updated_at: new Date().toISOString() })
                .eq("order_reference", ref);

              await serviceSupabase.rpc("finalize_topup_credit", { p_topup_reference: ref });

              const { data: biz } = await serviceSupabase
                .from("business_profiles")
                .select("token_balance")
                .eq("id", topup.business_id)
                .maybeSingle();
              newBalance = biz?.token_balance ?? null;
            } else if (["FAILED", "EXPIRED", "REFUNDED", "REVERSED"].includes(mappedStatus)) {
              await serviceSupabase
                .from("orders")
                .update({ status: "FAILED", updated_at: new Date().toISOString() })
                .eq("order_reference", ref);
            }
          }
        }
      } catch (queryErr) {
        console.warn("topup-status live query skipped:", queryErr instanceof Error ? queryErr.message : queryErr);
      }
    }

    return new Response(
      JSON.stringify({
        topup_reference: topup.topup_reference,
        status: currentStatus,
        credited: topup.credited,
        credited_at: topup.credited_at,
        tokens: topup.token_amount,
        amount_tzs: topup.amount_tzs,
        business_name: topup.business_name_snapshot,
        new_balance: newBalance,
        created_at: topup.created_at,
        updated_at: topup.updated_at,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("topup-status error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: err instanceof Error ? err.message : String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
