import OpenAI from "openai";

const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
let client;

function getClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set");
  }

  client ??= new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return client;
}

export async function getModelResponse(conversation) {
  if (!Array.isArray(conversation) || conversation.length === 0) {
    throw new TypeError("Conversation must contain at least one message");
  }

  const response = await getClient().responses.create({
    model,
    input: conversation,
  });

  return response.output_text;
}
