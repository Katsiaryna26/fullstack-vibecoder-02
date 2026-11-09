import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const memoryPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "memory.json",
);

let messages = [];

function isMessage(value) {
  return (
    value &&
    (value.role === "user" || value.role === "assistant") &&
    typeof value.content === "string" &&
    value.content.trim() !== ""
  );
}

async function saveMemory() {
  await writeFile(memoryPath, `${JSON.stringify(messages, null, 2)}\n`, "utf8");
}

export async function loadMemory() {
  try {
    const file = await readFile(memoryPath, "utf8");
    const savedMessages = JSON.parse(file);

    if (!Array.isArray(savedMessages) || !savedMessages.every(isMessage)) {
      throw new Error("Memory file must contain an array of chat messages");
    }

    messages = savedMessages;
  } catch (error) {
    if (error?.code === "ENOENT") {
      messages = [];
      return;
    }

    throw new Error(
      `Could not load Memory: ${error instanceof Error ? error.message : error}`,
    );
  }
}

export function getMemory() {
  return messages.map((message) => ({ ...message }));
}

export async function addMessage(role, content) {
  if (
    (role !== "user" && role !== "assistant") ||
    typeof content !== "string" ||
    !content.trim()
  ) {
    throw new TypeError("A chat message must have a valid role and content");
  }

  messages.push({ role, content: content.trim() });
  await saveMemory();
}

export async function removeLastMessage() {
  messages.pop();
  await saveMemory();
}
