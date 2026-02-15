// ============================================
// Supabase Edge Function: invite-user
// ============================================
// Invite a user by email (admin only). Caller must be logged in as admin.
// Required secrets: ADMIN_EMAIL (allowed admin email).
// Config: verify_jwt = true so only authenticated admins can call.
// ============================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    const token = authHeader.slice(7);
    const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") || "";
    if (!ADMIN_EMAIL) {
      return new Response(JSON.stringify({ error: "Server misconfiguration" }), {
        status: 500,
        headers: corsHeaders,
      });
    }

    // JWT already verified by Supabase when verify_jwt = true; decode payload for caller email
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const callerEmail = payload.email as string | undefined;
      if (!callerEmail || callerEmail.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
        return new Response(JSON.stringify({ error: "Forbidden: admin only" }), {
          status: 403,
          headers: corsHeaders,
        });
      }
    } catch {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    const body = await req.json();
    const email = typeof body.email === "string" ? body.email.trim() : "";
    if (!email) {
      return new Response(JSON.stringify({ error: "Email is required" }), {
        status: 400,
        headers: corsHeaders,
      });
    }
    // Redirect after accepting invite (app origin + /dashboard). Set in Dashboard Auth URL config or pass from client.
    const redirectTo =
      typeof body.redirectTo === "string" && body.redirectTo
        ? body.redirectTo
        : Deno.env.get("SITE_URL")
          ? `${Deno.env.get("SITE_URL")}/dashboard`
          : undefined;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      ...(redirectTo && { redirectTo }),
    });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    return new Response(JSON.stringify({ ok: true, user: data?.user?.id }), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
