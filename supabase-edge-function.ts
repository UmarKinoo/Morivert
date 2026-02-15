// ============================================
// Supabase Edge Function: notify-new-quote
// ============================================
//
// Deploy this as a Supabase Edge Function, then set up a
// Database Webhook in Supabase to call it on INSERT to the quotes table.
//
// Required secrets (set via Supabase dashboard > Edge Functions > Secrets):
//   RESEND_API_KEY  — your Resend API key
//   ADMIN_EMAIL     — the email address to notify (e.g. umar@morivert.io)
//
// To deploy:
//   supabase functions new notify-new-quote
//   (paste this file as index.ts inside supabase/functions/notify-new-quote/)
//   supabase functions deploy notify-new-quote
//
// Then in Supabase Dashboard > Database > Webhooks:
//   - Table: quotes
//   - Events: INSERT
//   - Type: Supabase Edge Function
//   - Function: notify-new-quote
// ============================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// ── Config ────────────────────────────────────────────────
// Change this if your verified Resend domain is morivert.com instead of morivert.io
const FROM_ADDRESS = "Morivert <noreply@morivert.io>";

interface LineItem {
  label: string;
  qty: number;
  line_total: number;
}

// ── Helpers ───────────────────────────────────────────────
function buildItemsHtml(items: LineItem[]): string {
  if (!items.length) return "<p style='color:#71717a;font-size:13px;'>No items</p>";
  return items
    .map(
      (li) =>
        `<tr>
          <td style="padding:6px 0;font-size:13px;color:#3f3f46;">${li.label}</td>
          <td style="padding:6px 0;font-size:13px;text-align:center;color:#71717a;">×${li.qty}</td>
          <td style="padding:6px 0;font-size:13px;text-align:right;font-weight:500;">Rs ${li.line_total.toLocaleString()}</td>
        </tr>`
    )
    .join("");
}

// ── Admin notification email ──────────────────────────────
function adminEmailHtml(record: any, items: LineItem[]): string {
  return `
    <div style="font-family:'Inter',system-ui,sans-serif;max-width:560px;margin:0 auto;color:#18181b;">
      <div style="background:#09090b;padding:32px;border-radius:16px;color:#fafafa;margin-bottom:24px;">
        <h1 style="font-size:20px;font-weight:500;margin:0 0 4px;">New Quote Request</h1>
        <p style="font-size:13px;color:#71717a;margin:0;">Morivert Admin Notification</p>
      </div>

      <table style="width:100%;font-size:14px;border-collapse:collapse;">
        <tr><td style="padding:8px 0;color:#71717a;">Name</td><td style="padding:8px 0;text-align:right;font-weight:500;">${record.contact_name}</td></tr>
        <tr><td style="padding:8px 0;color:#71717a;">Company</td><td style="padding:8px 0;text-align:right;">${record.company_name || "—"}</td></tr>
        <tr><td style="padding:8px 0;color:#71717a;">Email</td><td style="padding:8px 0;text-align:right;">${record.email}</td></tr>
        <tr><td style="padding:8px 0;color:#71717a;">Phone</td><td style="padding:8px 0;text-align:right;">${record.phone || "—"}</td></tr>
        <tr><td style="padding:8px 0;color:#71717a;">Market</td><td style="padding:8px 0;text-align:right;">${record.market}</td></tr>
      </table>

      <table style="width:100%;border-collapse:collapse;margin:20px 0;padding:16px;background:#f4f4f5;border-radius:12px;">
        ${buildItemsHtml(items)}
      </table>

      <div style="font-size:24px;font-weight:300;text-align:right;margin:16px 0;">
        Rs ${(record.total || 0).toLocaleString()}
      </div>

      <div style="font-size:12px;color:#a1a1aa;margin-top:16px;">
        🌱 ${record.seeds} seeds · ☁️ ${record.co2_saved} kg CO₂ · ~${record.estimated_timeline} days
      </div>

      ${record.message ? `<div style="margin-top:20px;padding:16px;background:#fafafa;border-radius:12px;font-size:13px;color:#52525b;"><strong>Message:</strong><br/>${record.message}</div>` : ""}
    </div>
  `;
}

// ── Customer confirmation email ───────────────────────────
function customerEmailHtml(record: any, items: LineItem[]): string {
  const firstName = (record.contact_name || "").split(" ")[0] || "there";
  return `
    <div style="font-family:'Inter',system-ui,sans-serif;max-width:560px;margin:0 auto;color:#18181b;">
      <!-- Header -->
      <div style="background:#09090b;padding:32px 32px 28px;border-radius:16px 16px 0 0;text-align:center;">
        <h1 style="font-size:22px;font-weight:300;letter-spacing:-0.02em;color:#fafafa;margin:0;">MORIVERT</h1>
        <p style="font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#71717a;margin:8px 0 0;">Write. Plant. Grow.</p>
      </div>

      <!-- Body -->
      <div style="padding:32px;background:#ffffff;border:1px solid #e4e4e7;border-top:none;border-radius:0 0 16px 16px;">
        <h2 style="font-size:18px;font-weight:500;margin:0 0 8px;color:#18181b;">Thank you, ${firstName}!</h2>
        <p style="font-size:14px;color:#52525b;line-height:1.6;margin:0 0 24px;">
          We've received your quote request and our team will review it within <strong>24 hours</strong>. Here's a summary of what you requested:
        </p>

        <!-- Items table -->
        <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
          <tr style="border-bottom:1px solid #e4e4e7;">
            <td style="padding:8px 0;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#a1a1aa;">Item</td>
            <td style="padding:8px 0;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#a1a1aa;text-align:center;">Qty</td>
            <td style="padding:8px 0;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#a1a1aa;text-align:right;">Total</td>
          </tr>
          ${buildItemsHtml(items)}
        </table>

        <!-- Total -->
        <div style="border-top:2px solid #18181b;padding-top:12px;margin-bottom:24px;text-align:right;">
          <span style="font-size:12px;color:#71717a;text-transform:uppercase;letter-spacing:0.1em;">Estimated Total</span>
          <div style="font-size:28px;font-weight:300;letter-spacing:-0.02em;color:#18181b;">Rs ${(record.total || 0).toLocaleString()}</div>
        </div>

        <!-- Impact -->
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px;margin-bottom:24px;">
          <p style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:#16a34a;margin:0 0 8px;">Your Impact</p>
          <table style="width:100%;font-size:13px;color:#166534;">
            <tr>
              <td style="padding:2px 0;">🌱 ${record.seeds} plants from seeds</td>
              <td style="padding:2px 0;text-align:right;">☁️ ${record.co2_saved} kg CO₂ saved</td>
            </tr>
            <tr>
              <td colspan="2" style="padding:2px 0;">📅 Estimated delivery: ~${record.estimated_timeline} days</td>
            </tr>
          </table>
        </div>

        <!-- What happens next -->
        <div style="margin-bottom:24px;">
          <p style="font-size:13px;font-weight:600;color:#18181b;margin:0 0 8px;">What happens next?</p>
          <ol style="font-size:13px;color:#52525b;line-height:1.8;margin:0;padding-left:20px;">
            <li>Our team reviews your request and confirms availability</li>
            <li>We send you a final quote with exact pricing</li>
            <li>Upon approval, production begins — handcrafted in Mauritius</li>
          </ol>
        </div>

        <!-- CTA -->
        <div style="text-align:center;margin-top:24px;">
          <a href="https://morivert.io/dashboard" style="display:inline-block;background:#18181b;color:#fafafa;text-decoration:none;padding:12px 32px;border-radius:999px;font-size:12px;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;">
            View My Quotes
          </a>
        </div>
      </div>

      <!-- Footer -->
      <div style="text-align:center;padding:24px;font-size:11px;color:#a1a1aa;">
        <p style="margin:0 0 4px;">Morivert Co Ltd · Port Louis, Mauritius</p>
        <p style="margin:0;">Sustainability is not a choice, it is a design.</p>
      </div>
    </div>
  `;
}

// ── Main handler ──────────────────────────────────────────
serve(async (req) => {
  try {
    const { record } = await req.json();

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") || "admin@morivert.io";

    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: "Missing RESEND_API_KEY" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const items = (record.line_items || []) as LineItem[];

    // 1. Send admin notification
    const adminRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: [ADMIN_EMAIL],
        subject: `New Quote: ${record.contact_name} — Rs ${(record.total || 0).toLocaleString()}`,
        html: adminEmailHtml(record, items),
      }),
    });

    // 2. Send customer confirmation (if email provided)
    let customerResult = null;
    if (record.email) {
      const customerRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: FROM_ADDRESS,
          to: [record.email],
          subject: `Your Morivert Quote — Rs ${(record.total || 0).toLocaleString()}`,
          html: customerEmailHtml(record, items),
        }),
      });
      customerResult = await customerRes.json();
    }

    const adminResult = await adminRes.json();

    return new Response(
      JSON.stringify({ admin: adminResult, customer: customerResult }),
      {
        status: adminRes.ok ? 200 : 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
