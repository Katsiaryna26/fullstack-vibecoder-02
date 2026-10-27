import { createClient } from "@supabase/supabase-js";
import { runtimeConfig } from "@/shared/config/env";

export const supabase =
  runtimeConfig.supabaseUrl && runtimeConfig.anonKey
    ? createClient(runtimeConfig.supabaseUrl, runtimeConfig.anonKey)
    : null;
