import "@supabase/functions-js/edge-runtime.d.ts";

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
  const text = message?.text;

  console.log(
    JSON.stringify({
      chatId,
      username: message?.from?.username,
      text,
    }),
  );

  if (chatId !== undefined && text) {
    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: `\u042f \u043f\u043e\u043b\u0443\u0447\u0438\u043b\u0430 \u0432\u0430\u0448\u0435 \u0441\u043e\u043e\u0431\u0449\u0435\u043d\u0438\u0435: ${text}`,
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
  }

  return Response.json({ ok: true });
});
