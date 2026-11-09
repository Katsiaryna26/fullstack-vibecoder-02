import readline from "node:readline";
import { getModelResponse } from "./openai-adapter.js";
import {
  addMessage,
  getMemory,
  loadMemory,
  removeLastMessage,
} from "./memory-repository.js";

await loadMemory();
console.log(`Memory загружена: ${getMemory().length} сообщений.`);

const chat = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "Вы: ",
});

console.log('LLM-чат запущен. Напишите сообщение или "выход" для завершения.');
chat.prompt();

chat.on("line", async (message) => {
  if (message.trim().toLowerCase() === "выход") {
    chat.close();
    return;
  }

  if (!message.trim()) {
    chat.prompt();
    return;
  }

  chat.pause();
  let userMessageSaved = false;

  try {
    await addMessage("user", message);
    userMessageSaved = true;

    const response = await getModelResponse(getMemory());
    await addMessage("assistant", response);
    console.log(`Модель: ${response}`);
  } catch (error) {
    if (userMessageSaved) {
      // Не оставляем в Memory сообщение без ответа, если запрос не удался.
      try {
        await removeLastMessage();
      } catch (memoryError) {
        console.error(
          `Не удалось обновить Memory после ошибки: ${memoryError instanceof Error ? memoryError.message : memoryError}`,
        );
      }
    }

    console.error(
      `Не удалось получить ответ от модели: ${error instanceof Error ? error.message : error}`,
    );
  } finally {
    chat.resume();
    chat.prompt();
  }
});

chat.on("close", () => {
  console.log("До встречи!");
});
