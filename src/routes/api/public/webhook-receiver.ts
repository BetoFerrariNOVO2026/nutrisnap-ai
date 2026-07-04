import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

// Public webhook receiver for payment platforms (Lowify, etc.)
// URL example:
//   POST /api/public/webhook-receiver?platform=lowify&token=YOUR_SECRET_TOKEN
//
// Always returns HTTP 200 with a JSON body so external senders never mark the
// endpoint as down. The "status" field on the response indicates what we did.

export const Route = createFileRoute("/api/public/webhook-receiver")({
  server: {
    handlers: {
      OPTIONS: async () =>
        new Response(null, {
          status: 204,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
          },
        }),

      GET: async ({ request }) => {
        // Health-check / verification ping
        const url = new URL(request.url);
        return Response.json({
          ok: true,
          message: "CaloriaX AI webhook receiver is alive",
          platform: url.searchParams.get("platform") || null,
        });
      },

      POST: async ({ request }) => {
        const corsHeaders = {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        };
        const respond = (body: unknown, status = 200) =>
          new Response(JSON.stringify(body), { status, headers: corsHeaders });

        try {
          const url = new URL(request.url);
          const platform = (url.searchParams.get("platform") || "unknown").toLowerCase();
          const token = url.searchParams.get("token") || "";

          // Optional shared secret protection
          const expectedToken = process.env.WEBHOOK_TOKEN || "";
          if (expectedToken && token !== expectedToken) {
            return respond({ ok: false, error: "Invalid token" }, 200);
          }

          const contentType = request.headers.get("content-type") || "";
          const rawText = await request.text();
          let body: any = {};
          if (contentType.includes("application/json")) {
            try {
              body = JSON.parse(rawText);
            } catch {
              body = {};
            }
          } else if (contentType.includes("application/x-www-form-urlencoded")) {
            body = Object.fromEntries(new URLSearchParams(rawText).entries());
          } else {
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

          console.log("[webhook-receiver]", platform, "payload:", rawText.slice(0, 2000));

          const pickString = (...values: unknown[]) => {
            for (const v of values) {
              if (typeof v === "string" && v.trim()) return v.trim();
              if (typeof v === "number" && Number.isFinite(v)) return String(v);
            }
            return undefined;
          };

          // Email — try MANY possible locations
          const customer_email = pickString(
            body.customer_email,
            body.email,
            body.customerEmail,
            body.customer?.email,
            body.cliente?.email,
            body.client?.email,
            body.buyer?.email,
            body.buyer?.contact?.email,
            body.user?.email,
            body.payer?.email,
            body.data?.customer_email,
            body.data?.email,
            body.data?.customer?.email,
            body.data?.cliente?.email,
            body.data?.client?.email,
            body.data?.buyer?.email,
            body.data?.payer?.email,
            body.payload?.customer?.email,
            body.payload?.cliente?.email,
            body.payment?.customer?.email,
          );

          // Plan / product name
          let planRaw = pickString(
            body.plan,
            body.product,
            body.product_name,
            body.plan_name,
            body.offer_name,
            body.item_name,
            body.campaign_name,
            body.campaignName,
            typeof body.product === "object" ? body.product?.name : undefined,
            typeof body.offer === "object" ? body.offer?.name : undefined,
            typeof body.item === "object" ? body.item?.name : undefined,
            body.data?.plan,
            body.data?.product,
            body.data?.product_name,
            body.data?.plan_name,
            body.data?.offer_name,
            body.data?.item_name,
            body.data?.campaign_name,
            typeof body.data?.product === "object" ? body.data?.product?.name : undefined,
            typeof body.data?.offer === "object" ? body.data?.offer?.name : undefined,
            body.produto?.nome,
            body.oferta?.nome,
          );

          const external_id = pickString(
            body.external_id,
            body.transaction_id,
            body.transactionId,
            body.id,
            body.order_id,
            body.orderId,
            body.identificador,
            body.identifier,
            body.payment?.id,
            body.payment?.identifier,
            body.data?.id,
            body.data?.transaction_id,
            body.data?.identificador,
          );

          const paymentStatus = pickString(
            body.event,
            body.status,
            body.type,
            body.payment_status,
            body.paymentStatus,
            body.payment?.status,
            body.data?.event,
            body.data?.status,
            body.data?.type,
            body.data?.payment_status,
          )?.toLowerCase();

          const fullPayloadText = JSON.stringify(body || {}).toLowerCase();

          // 1) Explicit override via URL query param, e.g. ?plan=pro
          const planOverride = (url.searchParams.get("plan") || "").toLowerCase().trim();

          // 2) Infer plan from product name keywords
          if (!planRaw) {
            if (/premium/.test(fullPayloadText)) planRaw = "premium";
            else if (/\bpro\b/.test(fullPayloadText)) planRaw = "pro";
            else if (/\bstart\b/.test(fullPayloadText)) planRaw = "start";
          }
          let plan: string | undefined;
          if (planOverride && ["start", "pro", "premium"].includes(planOverride)) {
            plan = planOverride;
          } else if (planRaw) {
            const p = planRaw.toLowerCase();
            if (p.includes("premium")) plan = "premium";
            else if (p.includes("pro")) plan = "pro";
            else if (p.includes("start")) plan = "start";
            // If product is just "CaloriaX AI" (no tier keyword), default to "pro"
            else if (p.includes("caloria")) plan = "pro";
            else plan = planRaw;
          }

          const isApprovedEvent =
            !paymentStatus ||
            ["approved", "paid", "completed", "complete", "success", "succeeded", "finalizado", "aprovado", "pago"]
              .some((kw) => paymentStatus.includes(kw));

          // Always log the event
          const logRow: any = {
            external_id: external_id || null,
            customer_email: customer_email || null,
            plan: plan || planRaw || "unknown",
            status: "pending",
            raw_payload: { __platform: platform, __plan_override: planOverride || null, ...body },
          };

          if (!customer_email || !plan || !["start", "pro", "premium"].includes(plan)) {
            logRow.status = !customer_email
              ? "ignored_missing_email"
              : !plan
                ? "ignored_missing_plan"
                : "ignored_invalid_plan";
            await supabaseAdmin.from("payment_webhooks").insert(logRow);
            return respond({
              ok: true,
              ignored: true,
              reason: logRow.status,
              received_keys: Object.keys(body || {}),
            });
          }

          if (!isApprovedEvent) {
            logRow.status = "ignored_unpaid_event";
            await supabaseAdmin.from("payment_webhooks").insert(logRow);
            return respond({ ok: true, ignored: true, reason: "Not an approved event", paymentStatus });
          }

          // Insert pending log
          const { data: insertedLog } = await supabaseAdmin
            .from("payment_webhooks")
            .insert(logRow)
            .select("id")
            .single();
          const logId = insertedLog?.id;

          // Find user
          const { data: authUsers, error: listErr } = await supabaseAdmin.auth.admin.listUsers({
            page: 1,
            perPage: 1000,
          });
          if (listErr) {
            console.error("[webhook-receiver] listUsers error:", listErr);
            if (logId) {
              await supabaseAdmin
                .from("payment_webhooks")
                .update({ status: "error_listing_users", processed_at: new Date().toISOString() })
                .eq("id", logId);
            }
            return respond({ ok: true, queued: true, reason: "Internal listing error" });
          }
          const matchedUser = authUsers?.users?.find(
            (u) => u.email?.toLowerCase() === customer_email.toLowerCase()
          );

          if (!matchedUser) {
            if (logId) {
              await supabaseAdmin
                .from("payment_webhooks")
                .update({ status: "user_not_found", processed_at: new Date().toISOString() })
                .eq("id", logId);
            }
            return respond({ ok: true, queued: true, reason: "User not found", customer_email });
          }

          const { error: updErr } = await supabaseAdmin
            .from("profiles")
            .update({ subscription_plan: plan })
            .eq("user_id", matchedUser.id);

          if (updErr) {
            if (logId) {
              await supabaseAdmin
                .from("payment_webhooks")
                .update({ status: "error_updating_plan", processed_at: new Date().toISOString() })
                .eq("id", logId);
            }
            return respond({ ok: true, queued: true, reason: "Error updating plan" });
          }

          if (logId) {
            await supabaseAdmin
              .from("payment_webhooks")
              .update({ status: "processed", processed_at: new Date().toISOString() })
              .eq("id", logId);
          }

          return respond({ ok: true, plan, customer_email });
        } catch (err: any) {
          console.error("[webhook-receiver] handler error:", err);
          // Always return 200 so the platform doesn't disable the webhook
          return respond({ ok: false, fallback: true, error: err?.message || "Internal error" });
        }
      },
    },
  },
});
