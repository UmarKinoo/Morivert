// ============================================
// Supabase Edge Function: notify-quote-status
// ============================================
//
// Called from the admin dashboard when a quote status changes.
// Sends an email to the customer notifying them of the update.
//
// Required secrets (set via Supabase dashboard > Edge Functions > Secrets):
//   RESEND_API_KEY  — your Resend API key
//
// Deploy:
//   supabase functions deploy notify-quote-status
// ============================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const FROM_ADDRESS = "Morivert <noreply@morivert.io>";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

const STATUS_LABELS: Record<string, string> = {
  new: "New",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

function statusEmailHtml(contactName: string, status: string, quoteId: string): string {
  const label = STATUS_LABELS[status] || status;
  const isCompleted = status === "completed";
  const isCancelled = status === "cancelled";

  const statusColor = isCompleted ? "#10b981" : isCancelled ? "#71717a" : "#f59e0b";

  return `
    <div style="font-family:'Inter',system-ui,sans-serif;max-width:520px;margin:0 auto;color:#18181b;">
      <div style="background:#09090b;padding:32px;border-radius:16px;color:#fafafa;margin-bottom:24px;">
        <h1 style="font-size:20px;font-weight:500;margin:0 0 4px;">Quote Status Update</h1>
        <p style="font-size:13px;color:#71717a;margin:0;">Morivert</p>
      </div>

      <p style="font-size:14px;line-height:1.6;">
        Hi ${contactName || "there"},
      </p>
      <p style="font-size:14px;line-height:1.6;">
        Your quote <strong>#${quoteId.slice(0, 8)}</strong> has been updated to:
      </p>
      <div style="text-align:center;margin:24px 0;">
        <span style="display:inline-block;padding:10px 28px;border-radius:12px;font-size:16px;font-weight:600;color:#fff;background:${statusColor};">
          ${label}
        </span>
      </div>
      ${isCompleted ? `<p style="font-size:14px;line-height:1.6;color:#10b981;">Your order is ready! We will be in touch with delivery details shortly.</p>` : ""}
      ${isCancelled ? `<p style="font-size:14px;line-height:1.6;color:#71717a;">If you have questions about this, feel free to reply to this email.</p>` : ""}
      <p style="font-size:14px;line-height:1.6;">
        You can check your quotes anytime by visiting your <a href="https://morivert.io/dashboard" style="color:#10b981;">dashboard</a>.
      </p>

      <hr style="border:none;border-top:1px solid #e4e4e7;margin:32px 0 16px;" />
      <p style="font-size:11px;color:#a1a1aa;text-align:center;">Morivert — The Living Pencil</p>
    </div>
  `;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: "RESEND_API_KEY not configured" }), {
        status: 500,
        headers: corsHeaders,
      });
    }

    const body = await req.json();
    const { email, contact_name, status, id } = body;

    if (!email || !status || !id) {
      return new Response(JSON.stringify({ error: "Missing email, status, or id" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Don't email on draft status
    if (status === "draft") {
      return new Response(JSON.stringify({ skipped: true }), { status: 200, headers: corsHeaders });
    }

    const label = STATUS_LABELS[status] || status;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: [email],
        subject: `Your Morivert quote is now: ${label}`,
        html: statusEmailHtml(contact_name || "", status, id),
      }),
    });

    const result = await res.json();
    return new Response(JSON.stringify(result), {
      status: res.ok ? 200 : 500,
      headers: corsHeaders,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
