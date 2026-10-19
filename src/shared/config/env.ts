const functionsUrl = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL;
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

export const runtimeConfig = {
  functionsUrl: (
    functionsUrl ??
    (supabaseUrl ? `${supabaseUrl.replace(/\/$/, "")}/functions/v1` : "/functions/v1")
  ).replace(/\/$/, ""),
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
};
