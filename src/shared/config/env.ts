const functionsUrl = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL;
const configuredSupabaseUrl = import.meta.env.VITE_SUPABASE_URL;

function getSupabaseUrl(): string | undefined {
  if (configuredSupabaseUrl) {
    return configuredSupabaseUrl.replace(/\/$/, "");
  }

  if (!functionsUrl) return undefined;

  return functionsUrl.replace(/\/functions\/v1\/?$/, "").replace(/\/$/, "");
}

const supabaseUrl = getSupabaseUrl();

export const runtimeConfig = {
  functionsUrl: (
    functionsUrl ??
    (supabaseUrl ? `${supabaseUrl.replace(/\/$/, "")}/functions/v1` : "/functions/v1")
  ).replace(/\/$/, ""),
  supabaseUrl,
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || undefined,
};
