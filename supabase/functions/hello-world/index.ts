import "@supabase/functions-js/edge-runtime.d.ts";
import { createSupabaseClient } from "../_shared/supabase.ts";

const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");

Deno.serve(async (req) => {
  if (req.method === "GET") {
    return Response.json({
      message: "hello, it-incubator",
      studentId: "#5122",
    });
  }

  if (req.method !== "POST") {
    return Response.json(
      { error: "Method not allowed" },
      { status: 405 },
    );
  }

  if (!botToken) {
    return Response.json(
      { error: "TELEGRAM_BOT_TOKEN is not set" },
      { status: 500 },
    );
  }

  let update;

  try {
    update = await req.json();
  } catch {
    return Response.json(
      { error: "Request body must contain valid JSON" },
      { status: 400 },
    );
  }

  const message = update?.message;
  const chatId = message?.chat?.id;
  const telegramUserId = message?.from?.id ?? chatId;
  const text = typeof message?.text === "string" ? message.text : null;
  const caption = typeof message?.caption === "string" ? message.caption : null;
  const body = text ?? caption ?? "[non-text Telegram message]";
  const messageDate = typeof message?.date === "number"
    ? new Date(message.date * 1000).toISOString()
    : new Date().toISOString();
  const author = [
    message?.from?.first_name,
    message?.from?.last_name,
  ]
    .filter((part): part is string =>
      typeof part === "string" && part.length > 0
    )
    .join(" ") ||
    message?.from?.username || String(telegramUserId ?? "Unknown");

  console.log(
    JSON.stringify({
      chatId,
      telegramUserId,
      username: message?.from?.username,
      text,
    }),
  );

  if (chatId === undefined || telegramUserId === undefined) {
    return Response.json({ ok: true });
  }

  try {
    const supabase = createSupabaseClient();
    const { data: client, error: clientError } = await supabase
      .from("clients")
      .upsert(
        {
          user_telegram_id: String(telegramUserId),
          first_name: message?.from?.first_name ?? null,
          last_name: message?.from?.last_name ?? null,
          last_message_at: messageDate,
        },
        { onConflict: "user_telegram_id" },
      )
      .select("id")
      .single();

    if (clientError || !client) {
      console.error("Failed to save Telegram client:", clientError);
      return Response.json(
        { error: "Failed to save Telegram client" },
        { status: 500 },
      );
    }

    const { error: messageError } = await supabase
      .from("messages")
      .insert({
        author,
        body,
        messenger_user_id: String(telegramUserId),
        messenger_type: "telegram",
        client_id: client.id,
        created_at: messageDate,
      });

    if (messageError) {
      console.error("Failed to save Telegram message:", messageError);
      return Response.json(
        { error: "Failed to save Telegram message" },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Supabase persistence failed:", error);
    return Response.json(
      { error: "Failed to save Telegram update" },
      { status: 500 },
    );
  }

  if (text) {
    try {
      const telegramResponse = await fetch(
        `https://api.telegram.org/bot${botToken}/sendMessage`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chat_id: chatId,
            text:
              `\u042f \u043f\u043e\u043b\u0443\u0447\u0438\u043b\u0430 \u0432\u0430\u0448\u0435 \u0441\u043e\u043e\u0431\u0449\u0435\u043d\u0438\u0435: ${text}`,
          }),
        },
      );

      if (!telegramResponse.ok) {
        console.error(
          "Telegram API error:",
          await telegramResponse.text(),
        );
        return Response.json(
          { error: "Telegram API request failed" },
          { status: 502 },
        );
      }
    } catch (error) {
      console.error(
        "Telegram API request failed:",
        error,
      );
      return Response.json(
        { error: "Unable to reach Telegram API" },
        { status: 502 },
      );
    }
  }

  return Response.json({ ok: true });
});
