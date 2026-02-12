// ============================================
// Supabase Edge Function: notify-new-quote
// ============================================
//
// Deploy this as a Supabase Edge Function, then set up a
// Database Webhook in Supabase to call it on INSERT to the quotes table.
//
// Required secrets (set via Supabase dashboard > Edge Functions > Secrets):
//   RESEND_API_KEY  — your Resend API key
//   ADMIN_EMAIL     — the email address to notify (e.g. you@morivert.com)
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

interface LineItem {
  label: string;
  qty: number;
  line_total: number;
}

serve(async (req) => {
  try {
    const { record } = await req.json();

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") || "admin@morivert.com";

    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: "Missing RESEND_API_KEY" }), { status: 500 });
    }

    const items = (record.line_items || []) as LineItem[];
    const itemsList = items
      .map((li) => `• ${li.label} × ${li.qty} — Rs ${li.line_total.toLocaleString()}`)
      .join("\n");

    const emailHtml = `
      <div style="font-family: 'Inter', system-ui, sans-serif; max-width: 560px; margin: 0 auto; color: #18181b;">
        <div style="background: #09090b; padding: 32px; border-radius: 16px; color: #fafafa; margin-bottom: 24px;">
          <h1 style="font-size: 20px; font-weight: 500; margin: 0 0 4px;">New Quote Request</h1>
          <p style="font-size: 13px; color: #71717a; margin: 0;">Morivert Admin Notification</p>
        </div>

        <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #71717a;">Name</td><td style="padding: 8px 0; text-align: right; font-weight: 500;">${record.contact_name}</td></tr>
          <tr><td style="padding: 8px 0; color: #71717a;">Company</td><td style="padding: 8px 0; text-align: right;">${record.company_name || "—"}</td></tr>
          <tr><td style="padding: 8px 0; color: #71717a;">Email</td><td style="padding: 8px 0; text-align: right;">${record.email}</td></tr>
          <tr><td style="padding: 8px 0; color: #71717a;">Phone</td><td style="padding: 8px 0; text-align: right;">${record.phone || "—"}</td></tr>
          <tr><td style="padding: 8px 0; color: #71717a;">Market</td><td style="padding: 8px 0; text-align: right;">${record.market}</td></tr>
        </table>

        <div style="margin: 20px 0; padding: 16px; background: #f4f4f5; border-radius: 12px; font-size: 13px; white-space: pre-line;">
${itemsList}
        </div>

        <div style="font-size: 24px; font-weight: 300; text-align: right; margin: 16px 0;">
          Rs ${(record.total || 0).toLocaleString()}
        </div>

        <div style="font-size: 12px; color: #a1a1aa; margin-top: 16px;">
          🌱 ${record.seeds} seeds · ☁️ ${record.co2_saved} kg CO₂ · ~${record.estimated_timeline} days
        </div>

        ${record.message ? `<div style="margin-top: 20px; padding: 16px; background: #fafafa; border-radius: 12px; font-size: 13px; color: #52525b;"><strong>Message:</strong><br/>${record.message}</div>` : ""}
      </div>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Morivert <noreply@morivert.com>",
        to: [ADMIN_EMAIL],
        subject: `New Quote: ${record.contact_name} — Rs ${(record.total || 0).toLocaleString()}`,
        html: emailHtml,
      }),
    });

    const result = await res.json();
    return new Response(JSON.stringify(result), { status: res.ok ? 200 : 500 });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});
