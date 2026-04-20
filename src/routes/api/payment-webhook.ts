import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const Route = createFileRoute("/api/payment-webhook")({
  server: {
    handlers: {
      OPTIONS: async () => {
        return new Response(null, {
          status: 204,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
          },
        });
      },
      POST: async ({ request }) => {
        const corsHeaders = {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        };

        let body: any = {};
        try {
          const contentType = request.headers.get("content-type") || "";
          const rawText = await request.text();
          console.log("[payment-webhook] content-type:", contentType);
          console.log("[payment-webhook] raw body:", rawText);

          if (contentType.includes("application/json")) {
            try { body = JSON.parse(rawText); } catch { body = {}; }
          } else if (contentType.includes("application/x-www-form-urlencoded")) {
            const params = new URLSearchParams(rawText);
            body = Object.fromEntries(params.entries());
          } else {
            // Try JSON first, fall back to form
            try {
              body = JSON.parse(rawText);
            } catch {
              try {
                body = Object.fromEntries(new URLSearchParams(rawText).entries());
              } catch {
                body = {};
              }
            }
          }
        } catch (e) {
          console.error("[payment-webhook] parse error:", e);
        }

        try {
          // Accept multiple field name variations from different payment providers
          const customer_email: string | undefined =
            body.customer_email ||
            body.email ||
            body.customer?.email ||
            body.buyer?.email ||
            body.data?.customer_email ||
            body.data?.email;

          let plan: string | undefined =
            body.plan ||
            body.product ||
            body.product_name ||
            body.plan_name ||
            body.data?.plan ||
            body.data?.product;

          const external_id: string | undefined =
            body.external_id ||
            body.transaction_id ||
            body.id ||
            body.order_id ||
            body.data?.id;

          // Normalize plan name (e.g., "CALORIAX AI PRO" -> "pro")
          if (plan) {
            const p = String(plan).toLowerCase();
            if (p.includes("premium")) plan = "premium";
            else if (p.includes("pro")) plan = "pro";
          }

          if (!customer_email || !plan) {
            console.warn("[payment-webhook] missing fields", { customer_email, plan, body });
            return new Response(
              JSON.stringify({
                error: "Missing customer_email or plan",
                received_keys: Object.keys(body || {}),
                hint: "Send JSON with 'customer_email' and 'plan' (pro|premium)",
              }),
              { status: 400, headers: corsHeaders }
            );
          }

          if (!["pro", "premium"].includes(plan)) {
            return new Response(
              JSON.stringify({ error: "Invalid plan. Use 'pro' or 'premium'", received: plan }),
              { status: 400, headers: corsHeaders }
            );
          }

          // Log the webhook
          await supabaseAdmin.from("payment_webhooks").insert({
            external_id: external_id || null,
            customer_email,
            plan,
            status: "pending",
            raw_payload: body,
          });

          // Find the user profile by matching display_name (which is set to email on signup)
          // or by querying auth.users
          const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers();
          const matchedUser = authUsers?.users?.find(
            (u) => u.email?.toLowerCase() === customer_email.toLowerCase()
          );

          if (!matchedUser) {
            // Update webhook status
            await supabaseAdmin
              .from("payment_webhooks")
              .update({ status: "user_not_found", processed_at: new Date().toISOString() })
              .eq("customer_email", customer_email)
              .eq("status", "pending");

            return new Response(
              JSON.stringify({ error: "User not found", customer_email }),
              { status: 404, headers: corsHeaders }
            );
          }

          // Update user plan
          const { error: updateError } = await supabaseAdmin
            .from("profiles")
            .update({ subscription_plan: plan })
            .eq("user_id", matchedUser.id);

          if (updateError) {
            await supabaseAdmin
              .from("payment_webhooks")
              .update({ status: "error", processed_at: new Date().toISOString() })
              .eq("customer_email", customer_email)
              .eq("status", "pending");

            return new Response(
              JSON.stringify({ error: "Failed to update plan" }),
              { status: 500, headers: corsHeaders }
            );
          }

          // Mark as processed
          await supabaseAdmin
            .from("payment_webhooks")
            .update({ status: "processed", processed_at: new Date().toISOString() })
            .eq("customer_email", customer_email)
            .eq("status", "pending");

          return new Response(
            JSON.stringify({ success: true, plan, customer_email }),
            { status: 200, headers: corsHeaders }
          );
        } catch (err: any) {
          return new Response(
            JSON.stringify({ error: "Invalid request body" }),
            { status: 400, headers: corsHeaders }
          );
        }
      },
    },
  },
});
