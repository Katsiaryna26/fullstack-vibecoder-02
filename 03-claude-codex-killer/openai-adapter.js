import OpenAI from "openai";
import { executeToolCall, toolDefinitions } from "./tools.js";

const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
const maxToolRounds = 8;
const toolInstructions =
  "Для работы с файлами используй доступные инструменты. Пути к файлам должны быть относительными к рабочей директории проекта. Не утверждай, что файл создан или прочитан, пока инструмент не вернул успешный результат.";
let client;

function getClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set");
  }

  client ??= new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return client;
}

export async function getModelResponse(conversation, options = {}) {
  if (!Array.isArray(conversation) || conversation.length === 0) {
    throw new TypeError("Conversation must contain at least one message");
  }

  const apiClient = options.client ?? getClient();
  let input = conversation.map((message) => ({ ...message }));

  for (let round = 0; round < maxToolRounds; round += 1) {
    const response = await apiClient.responses.create({
      model,
      instructions: toolInstructions,
      input,
      tools: toolDefinitions,
      parallel_tool_calls: false,
    });

    const toolCalls = (response.output ?? []).filter(
      (item) => item.type === "function_call",
    );

    if (toolCalls.length === 0) {
      return response.output_text;
    }

    input = [...input, ...response.output];

    for (const toolCall of toolCalls) {
      let toolOutput;

      try {
        const argumentsObject = JSON.parse(toolCall.arguments);
        toolOutput = {
          ok: true,
          result: await executeToolCall(toolCall.name, argumentsObject),
        };
      } catch (error) {
        toolOutput = {
          ok: false,
          error: error instanceof Error ? error.message : String(error),
        };
      }

      input.push({
        type: "function_call_output",
        call_id: toolCall.call_id,
        output: JSON.stringify(toolOutput),
      });
    }
  }

  throw new Error(`Превышено максимальное количество последовательных вызовов инструментов: ${maxToolRounds}`);
}
