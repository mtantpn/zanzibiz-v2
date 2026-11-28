import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { getJWT, previewUssd, queryPaymentStatus } from "../_shared/clickpesa.ts";

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
    const url = new URL(req.url);
    const action = url.searchParams.get("action") || "auth";

    const results: Record<string, unknown> = {
      timestamp: new Date().toISOString(),
      action,
    };

    console.log("=== CLICKPESA DIAGNOSTIC TEST ===");
    console.log("Action:", action);

    if (action === "auth" || action === "all") {
      console.log("\n--- Testing Authentication ---");
      try {
        const jwt = await getJWT();
        results.auth = {
          success: true,
          token_length: jwt.length,
          token_preview: jwt.substring(0, 20) + "...",
        };
        console.log("✓ Auth successful, token length:", jwt.length);
      } catch (err) {
        results.auth = {
          success: false,
          error: err instanceof Error ? err.message : String(err),
        };
        console.error("✗ Auth failed:", err);
      }
    }

    if (action === "preview" || action === "all") {
      console.log("\n--- Testing Preview USSD ---");
      const testPhone = url.searchParams.get("phone") || "255712345678";
      const testAmount = url.searchParams.get("amount") || "1500";
      const testRef = `TEST-${Date.now()}`;

      try {
        const previewRes = await previewUssd({
          orderReference: testRef,
          amount: testAmount,
          phoneNumber: testPhone,
        });
        results.preview = {
          success: previewRes.ok,
          status: previewRes.status,
          data: previewRes.data,
        };
        console.log("Preview response:", JSON.stringify(previewRes, null, 2));
      } catch (err) {
        results.preview = {
          success: false,
          error: err instanceof Error ? err.message : String(err),
        };
        console.error("✗ Preview failed:", err);
      }
    }

    if (action === "query") {
      console.log("\n--- Testing Payment Status Query ---");
      const ref = url.searchParams.get("ref");
      if (!ref) {
        results.query = { error: "ref parameter required" };
      } else {
        try {
          const queryRes = await queryPaymentStatus(ref);
          results.query = {
            success: queryRes.ok,
            status: queryRes.status,
            data: queryRes.data,
          };
          console.log("Query response:", JSON.stringify(queryRes, null, 2));
        } catch (err) {
          results.query = {
            success: false,
            error: err instanceof Error ? err.message : String(err),
          };
          console.error("✗ Query failed:", err);
        }
      }
    }

    console.log("\n=== TEST COMPLETE ===");

    return new Response(JSON.stringify(results, null, 2), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Test error:", err);
    return new Response(
      JSON.stringify({
        error: "Test failed",
        details: err instanceof Error ? err.message : String(err),
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
