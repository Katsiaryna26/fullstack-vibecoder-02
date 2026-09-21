import "@supabase/functions-js/edge-runtime.d.ts";
import {
  createSupabaseClient,
  jsonResponse,
  optionsResponse,
} from "../_shared/supabase.ts";

const messageColumns = [
  "id",
  "created_at",
  "author",
  "body",
  "messenger_user_id",
  "messenger_type",
  "client_id",
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
      .from("messages")
      .select(messageColumns)
      .order("created_at", { ascending: false })
      .order("id", { ascending: false });

    if (error) {
      console.error("Failed to retrieve messages:", error);
      return jsonResponse({ error: "Failed to retrieve messages" }, 500);
    }

    return jsonResponse(data);
  } catch (error) {
    console.error("Messages function failed:", error);
    return jsonResponse({ error: "Unable to retrieve messages" }, 500);
  }
});
