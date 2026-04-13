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

        try {
          const body = await request.json();
          const { event, customer_email, plan, external_id } = body as {
            event?: string;
            customer_email?: string;
            plan?: string;
            external_id?: string;
          };

          if (!customer_email || !plan) {
            return new Response(
              JSON.stringify({ error: "Missing customer_email or plan" }),
              { status: 400, headers: corsHeaders }
            );
          }

          if (!["pro", "premium"].includes(plan)) {
            return new Response(
              JSON.stringify({ error: "Invalid plan. Use 'pro' or 'premium'" }),
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
