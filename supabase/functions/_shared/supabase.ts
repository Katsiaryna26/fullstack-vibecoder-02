import { createClient } from "@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

export function createSupabaseClient() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const rawSecretKeys = Deno.env.get("SUPABASE_SECRET_KEYS");

  if (!supabaseUrl || !rawSecretKeys) {
    throw new Error("Supabase secret keys are not configured");
  }

  let secretKeys: Record<string, unknown>;

  try {
    secretKeys = JSON.parse(rawSecretKeys);
  } catch {
    throw new Error("SUPABASE_SECRET_KEYS must contain valid JSON");
  }

  const supabaseKey = secretKeys.default;

  if (typeof supabaseKey !== "string" || !supabaseKey) {
    throw new Error("Default Supabase secret key is not configured");
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
}

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

export function optionsResponse(): Response {
  return new Response("", { status: 204, headers: corsHeaders });
}
