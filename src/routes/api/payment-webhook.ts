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
          const pickString = (...values: unknown[]) => {
            for (const value of values) {
              if (typeof value === "string" && value.trim()) return value.trim();
              if (typeof value === "number" && Number.isFinite(value)) return String(value);
            }
            return undefined;
          };

          const payloadText = JSON.stringify(body || {}).toLowerCase();

          const customer_email = pickString(
            body.customer_email,
            body.email,
            body.customerEmail,
            body.customer?.email,
            body.buyer?.email,
            body.client?.email,
            body.data?.customer_email,
            body.data?.email,
            body.data?.customerEmail,
            body.data?.customer?.email,
            body.data?.buyer?.email,
            body.data?.client?.email,
          );

          let plan = pickString(
            body.plan,
            body.product,
            body.product_name,
            body.plan_name,
            body.offer_name,
            body.item_name,
            typeof body.product === "object" ? body.product?.name : undefined,
            typeof body.offer === "object" ? body.offer?.name : undefined,
            typeof body.item === "object" ? body.item?.name : undefined,
            body.data?.plan,
            body.data?.product,
            body.data?.product_name,
            body.data?.plan_name,
            body.data?.offer_name,
            body.data?.item_name,
            typeof body.data?.product === "object" ? body.data?.product?.name : undefined,
            typeof body.data?.offer === "object" ? body.data?.offer?.name : undefined,
            typeof body.data?.item === "object" ? body.data?.item?.name : undefined,
          );

          const external_id = pickString(
            body.external_id,
            body.transaction_id,
            body.transactionId,
            body.id,
            body.order_id,
            body.orderId,
            body.data?.id,
            body.data?.transaction_id,
            body.data?.transactionId,
            body.data?.order_id,
            body.data?.orderId,
          );

          const paymentState = pickString(
            body.event,
            body.status,
            body.type,
            body.data?.event,
            body.data?.status,
            body.data?.type,
          )?.toLowerCase();

          if (!plan) {
            if (payloadText.includes("premium")) plan = "premium";
            else if (/\bpro\b/.test(payloadText)) plan = "pro";
          }

          if (plan) {
            const p = String(plan).toLowerCase();
            if (p.includes("premium")) plan = "premium";
            else if (p.includes("pro")) plan = "pro";
          }

          const isApprovedEvent =
            !paymentState ||
            ["approved", "paid", "completed", "complete", "success", "succeeded", "finalizado", "aprovado"]
              .some((keyword) => paymentState.includes(keyword));

          if (!customer_email || !plan) {
            console.warn("[payment-webhook] missing fields", { customer_email, plan, body });
            await supabaseAdmin.from("payment_webhooks").insert({
              external_id: external_id || null,
              customer_email: customer_email || null,
              plan: plan || "unknown",
              status: "ignored_missing_fields",
              raw_payload: body,
            });

            return new Response(
              JSON.stringify({
                success: true,
                ignored: true,
                reason: "Missing customer_email or plan",
                received_keys: Object.keys(body || {}),
              }),
              { status: 200, headers: corsHeaders }
            );
          }

          if (!["pro", "premium"].includes(plan)) {
            await supabaseAdmin.from("payment_webhooks").insert({
              external_id: external_id || null,
              customer_email,
              plan,
              status: "ignored_invalid_plan",
              raw_payload: body,
            });

            return new Response(
              JSON.stringify({ success: true, ignored: true, reason: "Invalid plan", received: plan }),
              { status: 200, headers: corsHeaders }
            );
          }

          if (!isApprovedEvent) {
            await supabaseAdmin.from("payment_webhooks").insert({
              external_id: external_id || null,
              customer_email,
              plan,
              status: "ignored_unpaid_event",
              raw_payload: body,
            });

            return new Response(
              JSON.stringify({ success: true, ignored: true, reason: "Event is not approved", paymentState }),
              { status: 200, headers: corsHeaders }
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
          const { data: authUsers, error: listUsersError } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
          if (listUsersError) throw listUsersError;
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
              JSON.stringify({ success: true, queued: true, reason: "User not found", customer_email }),
              { status: 200, headers: corsHeaders }
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
          console.error("[payment-webhook] handler error:", err);
          return new Response(
            JSON.stringify({ error: "Internal error", message: err?.message }),
            { status: 500, headers: corsHeaders }
          );
        }
      },
    },
  },
});
