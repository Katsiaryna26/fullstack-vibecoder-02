import assert from "node:assert/strict";
import { readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { getModelResponse } from "./openai-adapter.js";
import { executeToolCall } from "./tools.js";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

test("create_file создает новый файл, а read_file возвращает его содержимое", async () => {
  const relativePath = `tool-test-${Date.now()}-${Math.random().toString(16).slice(2)}.txt`;
  const absolutePath = path.join(projectRoot, relativePath);

  try {
    const created = await executeToolCall("create_file", {
      path: relativePath,
      content: "Привет из инструмента",
    });
    const read = await executeToolCall("read_file", { path: relativePath });

    assert.equal(created.path, relativePath);
    assert.equal(read.content, "Привет из инструмента");
    assert.equal(await readFile(absolutePath, "utf8"), "Привет из инструмента");
  } finally {
    await rm(absolutePath, { force: true });
  }
});

test("инструменты не позволяют выйти из рабочей директории", async () => {
  await assert.rejects(
    executeToolCall("read_file", { path: "../outside.txt" }),
    /внутри рабочей директории|относительные пути/i,
  );
});

test("create_file не перезаписывает существующий файл", async () => {
  const relativePath = `tool-test-existing-${Date.now()}-${Math.random().toString(16).slice(2)}.txt`;
  const absolutePath = path.join(projectRoot, relativePath);

  try {
    await writeFile(absolutePath, "исходное содержимое", "utf8");

    await assert.rejects(
      executeToolCall("create_file", {
        path: relativePath,
        content: "новое содержимое",
      }),
      /уже существует/i,
    );
    assert.equal(await readFile(absolutePath, "utf8"), "исходное содержимое");
  } finally {
    await rm(absolutePath, { force: true });
  }
});

test("адаптер выполняет function call и передает результат модели", async () => {
  const relativePath = `tool-test-adapter-${Date.now()}-${Math.random().toString(16).slice(2)}.txt`;
  const absolutePath = path.join(projectRoot, relativePath);
  const requests = [];
  let requestNumber = 0;
  const client = {
    responses: {
      create: async (request) => {
        requests.push(request);
        requestNumber += 1;

        if (requestNumber === 1) {
          return {
            output: [
              {
                type: "function_call",
                name: "create_file",
                call_id: "call-create-file",
                arguments: JSON.stringify({
                  path: relativePath,
                  content: "создано через function calling",
                }),
              },
            ],
            output_text: "",
          };
        }

        return {
          output: [{ type: "message" }],
          output_text: "Файл создан.",
        };
      },
    },
  };

  try {
    const response = await getModelResponse(
      [{ role: "user", content: "Создай файл" }],
      { client },
    );

    assert.equal(response, "Файл создан.");
    assert.equal(requests.length, 2);
    assert.equal(requests[0].tools.length, 2);
    assert.deepEqual(requests[1].input.at(-1), {
      type: "function_call_output",
      call_id: "call-create-file",
      output: JSON.stringify({
        ok: true,
        result: {
          path: relativePath,
          bytes: Buffer.byteLength("создано через function calling", "utf8"),
        },
      }),
    });
  } finally {
    await rm(absolutePath, { force: true });
  }
});

