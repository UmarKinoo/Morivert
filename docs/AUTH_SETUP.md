# Auth setup (Supabase)

This app implements the following auth flows. Emails are sent by Supabase Auth (or your configured SMTP).

## Implemented features

| Feature | Description |
|--------|-------------|
| **Confirm sign up** | New users must confirm their email before signing in. Config: `[auth.email] enable_confirmations = true`. |
| **Invite user** | Admins can invite users by email from the Admin Dashboard. Invited users receive an email to sign up. Edge Function: `invite-user` (requires `ADMIN_EMAIL` secret). |
| **Magic link** | Users can sign in via a one-time link sent to their email (no password). Login page: “Sign in with magic link”. |
| **Change email** | Logged-in users can change their email from Dashboard → Account & email. Supabase sends verification to the new address (`double_confirm_changes` in config). |
| **Reset password** | “Forgot password?” on login sends a reset link. User sets a new password on `/reset-password`. |

## Production configuration (Supabase Dashboard)

1. **Authentication → URL Configuration**
   - **Site URL**: your app URL (e.g. `https://morivert.io`)
   - **Redirect URLs**: add `https://morivert.io/**`, `https://morivert.io/dashboard`, `https://morivert.io/reset-password`, etc., as needed.

2. **Authentication → Providers → Email**
   - Confirm “Confirm email” is enabled if you want sign-up confirmation.
   - (Optional) **Custom SMTP**: for production, configure SMTP (e.g. Resend, SendGrid) so auth emails are delivered reliably and not rate-limited.

3. **Email templates — all in code (Send Email Hook)**  
   Auth emails are sent by the **send-auth-email** Edge Function via Resend. Templates and copy live in `supabase/functions/send-auth-email/index.ts`. No Dashboard template editing needed.
   - **Setup:** Dashboard → **Authentication → Hooks** → **Send Email Hook** → enable and set URL to  
     `https://<project-ref>.supabase.co/functions/v1/send-auth-email`  
   - **Secrets:** `RESEND_API_KEY` (already used for quotes), `SEND_EMAIL_HOOK_SECRET` (generate in Dashboard → Auth → Hooks).
   - **Deploy:** `supabase functions deploy send-auth-email --no-verify-jwt`
   - **Local:** With Supabase running locally, point the hook at your local function URL or use Inbucket (no hook) for testing.

4. **Send Email Hook (auth emails in code)**
   - Deploy: `supabase functions deploy send-auth-email --no-verify-jwt`
   - Set secrets: `RESEND_API_KEY`, `SEND_EMAIL_HOOK_SECRET` (create in Dashboard → Authentication → Hooks; copy the secret value).
   - In Dashboard → **Authentication → Hooks** → **Send Email Hook**: enable and set URL to  
     `https://<project-ref>.supabase.co/functions/v1/send-auth-email`  
   - To change copy or layout, edit `supabase/functions/send-auth-email/index.ts` and redeploy.

5. **Edge Function `invite-user`**
   - Deploy: `supabase functions deploy invite-user`
   - Set secret: `ADMIN_EMAIL` = the admin email allowed to send invites (same as your admin login).
   - Optional: `SITE_URL` for invite redirect (e.g. `https://morivert.io`); otherwise the app sends `redirectTo` from the client.

## Local development

- `supabase/config.toml` has `enable_confirmations = true`. For local testing, either use the Send Email Hook (point it at your deployed or local function URL) or let Inbucket capture auth emails when the hook is not set.
- **Repo templates**: `supabase/templates/*.html` are still wired in config for **local** Supabase when the Send Email Hook is not configured. With the hook enabled (hosted), all emails come from `send-auth-email` and those HTML files are not used.
- Add your production redirect URLs to `additional_redirect_urls` when testing against hosted Supabase.
