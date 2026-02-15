// ============================================
// Supabase Auth: Send Email Hook
// ============================================
// Replaces built-in auth email sending. All auth emails (confirm signup, magic link,
// reset password, invite, change email) are sent from this function via Resend.
//
// Required: Configure in Dashboard → Authentication → Hooks → Send Email Hook
//   Hook URL: https://<project-ref>.supabase.co/functions/v1/send-auth-email
// Secrets: RESEND_API_KEY, SEND_EMAIL_HOOK_SECRET (from Dashboard → Auth → Hooks)
//
// Deploy: supabase functions deploy send-auth-email --no-verify-jwt
// ============================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";
import { Resend } from "npm:resend@4.0.0";

const FROM = "Morivert <noreply@morivert.io>";

interface EmailData {
  token: string;
  token_hash: string;
  redirect_to: string;
  email_action_type: string;
  site_url: string;
  token_new?: string;
  token_hash_new?: string;
  old_email?: string;
}

interface HookUser {
  email: string;
  email_new?: string;
}

function buildVerifyUrl(supabaseUrl: string, tokenHash: string, actionType: string, redirectTo: string): string {
  const type = actionType === "magiclink" ? "magiclink" : "email";
  const params = new URLSearchParams({
    token: tokenHash,
    type,
    redirect_to: redirectTo || "",
  });
  return `${supabaseUrl}/auth/v1/verify?${params.toString()}`;
}

function htmlCard(title: string, body: string, buttonText: string, url: string, footer: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="font-family:system-ui,-apple-system,sans-serif;background:#09090b;color:#fafafa;margin:0;padding:24px;line-height:1.6">
  <div style="max-width:480px;margin:0 auto">
    <div style="font-size:18px;font-weight:600;margin-bottom:4px">MORIVERT</div>
    <div style="font-size:12px;color:#71717a;margin-bottom:24px">Write. Plant. Grow.</div>
    <div style="background:#18181b;border:1px solid #27272a;border-radius:12px;padding:24px;margin-bottom:24px">
      <h1 style="font-size:18px;font-weight:600;margin:0 0 12px">${title}</h1>
      <p style="margin:0 0 16px;font-size:14px;color:#a1a1aa">${body}</p>
      <a href="${url}" style="display:inline-block;background:#10b981;color:#000;font-weight:600;text-decoration:none;padding:12px 20px;border-radius:8px;font-size:14px;margin-top:8px">${buttonText}</a>
      <p style="margin-top:20px;font-size:12px">Or copy: <a href="${url}" style="color:#10b981;word-break:break-all">${url}</a></p>
    </div>
    <div style="font-size:12px;color:#52525b">${footer}</div>
  </div>
</body>
</html>`;
}

function getSubjectAndBody(
  actionType: string,
  confirmationUrl: string,
  email: string,
  newEmail?: string
): { subject: string; title: string; body: string; buttonText: string; footer: string } {
  switch (actionType) {
    case "signup":
      return {
        subject: "Confirm your Morivert signup",
        title: "Confirm your signup",
        body: "Thanks for signing up. Click the button below to confirm your email address.",
        buttonText: "Confirm email",
        footer: "If you didn't create an account, you can ignore this email.",
      };
    case "recovery":
      return {
        subject: "Reset your Morivert password",
        title: "Reset your password",
        body: `A password reset was requested for ${email}. Click the button below to set a new password.`,
        buttonText: "Set new password",
        footer: "If you didn't request this, you can ignore this email.",
      };
    case "magiclink":
      return {
        subject: "Your Morivert sign-in link",
        title: "Your sign-in link",
        body: "Use the button below to sign in to your account. This link works once and expires soon.",
        buttonText: "Sign in to Morivert",
        footer: "If you didn't request this, you can ignore this email.",
      };
    case "invite":
      return {
        subject: "You're invited to Morivert",
        title: "You're invited",
        body: "You've been invited to join Morivert. Click the button below to accept and create your account.",
        buttonText: "Accept invite",
        footer: "If you weren't expecting this invite, you can ignore this email.",
      };
    case "email_change":
      return {
        subject: "Confirm your new email for Morivert",
        title: "Confirm your new email",
        body: newEmail
          ? `You requested to change your email to ${newEmail}. Click the button below to confirm.`
          : "You requested to change your email. Click the button below to confirm.",
        buttonText: "Confirm new email",
        footer: "If you didn't request this change, you can ignore this email.",
      };
    default:
      return {
        subject: "Confirm your action",
        title: "Confirm",
        body: "Click the button below to continue.",
        buttonText: "Continue",
        footer: "If you didn't request this, you can ignore this email.",
      };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, svix-id, svix-timestamp, svix-signature",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const resendKey = Deno.env.get("RESEND_API_KEY");
  const hookSecretRaw = Deno.env.get("SEND_EMAIL_HOOK_SECRET");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");

  if (!resendKey || !hookSecretRaw || !supabaseUrl) {
    return new Response(
      JSON.stringify({ error: "Missing RESEND_API_KEY, SEND_EMAIL_HOOK_SECRET, or SUPABASE_URL" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const hookSecret = hookSecretRaw.replace(/^v1,whsec_/, "");
  const payload = await req.text();
  const headers = Object.fromEntries(req.headers.entries());
  const resendClient = new Resend(resendKey);

  let user: HookUser;
  let email_data: EmailData;

  try {
    const wh = new Webhook(hookSecret);
    const verified = wh.verify(payload, headers) as { user: HookUser; email_data: EmailData };
    user = verified.user;
    email_data = verified.email_data;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid webhook signature" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const actionType = email_data.email_action_type || "signup";
  const redirectTo = email_data.redirect_to || "";

  // email_change with double confirm: two emails (to new and to current)
  if (actionType === "email_change" && email_data.token_hash_new && user.email_new) {
    const urlNew = buildVerifyUrl(
      supabaseUrl,
      email_data.token_hash,
      actionType,
      redirectTo
    );
    const urlOld = buildVerifyUrl(
      supabaseUrl,
      email_data.token_hash_new,
      actionType,
      redirectTo
    );
    const contentNew = getSubjectAndBody(actionType, urlNew, user.email, user.email_new);
    const contentOld = {
      subject: "Confirm email change (current address)",
      title: "Confirm email change",
      body: `You requested to change your email to ${user.email_new}. Confirm from this email to proceed.`,
      buttonText: "Confirm change",
      footer: "If you didn't request this, you can ignore this email.",
    };

    const [resNew, resOld] = await Promise.all([
      resendClient.emails.send({
        from: FROM,
        to: [user.email_new],
        subject: contentNew.subject,
        html: htmlCard(
          contentNew.title,
          contentNew.body,
          contentNew.buttonText,
          urlNew,
          contentNew.footer
        ),
      }),
      resendClient.emails.send({
        from: FROM,
        to: [user.email],
        subject: contentOld.subject,
        html: htmlCard(
          contentOld.title,
          contentOld.body,
          contentOld.buttonText,
          urlOld,
          contentOld.footer
        ),
      }),
    ]);

    if (resNew.error || resOld.error) {
      return new Response(
        JSON.stringify({ error: resNew.error?.message || resOld.error?.message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    return new Response(JSON.stringify({}), { status: 200, headers: { "Content-Type": "application/json" } });
  }

  // Single email: recipient is user.email (or user.email_new only for email_change)
  const toEmail = actionType === "email_change" && user.email_new ? user.email_new : user.email;
  const tokenHash = email_data.token_hash;
  const url = buildVerifyUrl(supabaseUrl, tokenHash, actionType, redirectTo);
  const content = getSubjectAndBody(actionType, url, user.email, user.email_new);

  const { error } = await resendClient.emails.send({
    from: FROM,
    to: [toEmail],
    subject: content.subject,
    html: htmlCard(content.title, content.body, content.buttonText, url, content.footer),
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({}), { status: 200, headers: { "Content-Type": "application/json" } });
});
