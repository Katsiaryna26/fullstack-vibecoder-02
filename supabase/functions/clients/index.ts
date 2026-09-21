import "@supabase/functions-js/edge-runtime.d.ts";
import {
  createSupabaseClient,
  jsonResponse,
  optionsResponse,
} from "../_shared/supabase.ts";

const clientColumns = [
  "id",
  "created_at",
  "user_telegram_id",
  "first_name",
  "last_name",
  "last_message_at",
].join(", ");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return optionsResponse();
  }

  if (req.method !== "GET") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
      .from("clients")
      .select(clientColumns)
      .order("last_message_at", { ascending: false })
      .order("id", { ascending: false });

    if (error) {
      console.error("Failed to retrieve clients:", error);
      return jsonResponse({ error: "Failed to retrieve clients" }, 500);
    }

    return jsonResponse(data);
  } catch (error) {
    console.error("clients function failed:", error);
    return jsonResponse({ error: "Unable to retrieve clients" }, 500);
  }
});
