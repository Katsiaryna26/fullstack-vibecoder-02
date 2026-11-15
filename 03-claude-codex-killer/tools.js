import { access, readFile, realpath, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const workspaceRoot = path.dirname(fileURLToPath(import.meta.url));
const MAX_FILE_SIZE = 1_000_000;

export const toolDefinitions = [
  {
    type: "function",
    name: "read_file",
    description:
      "Прочитать текстовый файл из рабочей директории проекта. Путь должен быть относительным к рабочей директории.",
    parameters: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "Относительный путь к текстовому файлу, например notes/today.txt",
        },
      },
      required: ["path"],
      additionalProperties: false,
    },
    strict: true,
  },
  {
    type: "function",
    name: "create_file",
    description:
      "Создать новый текстовый файл в рабочей директории проекта. Инструмент не перезаписывает существующие файлы.",
    parameters: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "Относительный путь нового файла, например notes/today.txt",
        },
        content: {
          type: "string",
          description: "Текст, который нужно записать в новый файл",
        },
      },
      required: ["path", "content"],
      additionalProperties: false,
    },
    strict: true,
  },
];

function isInsideWorkspace(candidatePath, allowWorkspaceRoot = false) {
  const relativePath = path.relative(workspaceRoot, candidatePath);

  return (
    (allowWorkspaceRoot || relativePath !== "") &&
    !relativePath.startsWith(`..${path.sep}`) &&
    relativePath !== ".." &&
    !path.isAbsolute(relativePath)
  );
}

function resolveWorkspacePath(relativePath) {
  if (typeof relativePath !== "string" || !relativePath.trim()) {
    throw new TypeError("Путь к файлу должен быть непустой строкой");
  }

  if (path.isAbsolute(relativePath)) {
    throw new Error("Можно использовать только относительные пути к файлам");
  }

  const filePath = path.resolve(workspaceRoot, relativePath);

  if (!isInsideWorkspace(filePath)) {
    throw new Error("Путь к файлу должен находиться внутри рабочей директории проекта");
  }

  return filePath;
}

async function assertExistingPathIsInsideWorkspace(filePath, allowWorkspaceRoot = false) {
  const realFilePath = await realpath(filePath);

  if (!isInsideWorkspace(realFilePath, allowWorkspaceRoot)) {
    throw new Error("Нельзя обращаться к файлам за пределами рабочей директории проекта");
  }

  return realFilePath;
}

async function readProjectFile({ path: relativePath }) {
  const filePath = resolveWorkspacePath(relativePath);
  const realFilePath = await assertExistingPathIsInsideWorkspace(filePath);
  const fileStats = await stat(realFilePath);

  if (!fileStats.isFile()) {
    throw new Error("Указанный путь не является файлом");
  }

  if (fileStats.size > MAX_FILE_SIZE) {
    throw new Error(`Файл слишком большой: максимум ${MAX_FILE_SIZE} байт`);
  }

  return {
    path: path.relative(workspaceRoot, realFilePath),
    content: await readFile(realFilePath, "utf8"),
  };
}

async function createProjectFile({ path: relativePath, content }) {
  const filePath = resolveWorkspacePath(relativePath);

  if (typeof content !== "string") {
    throw new TypeError("Содержимое файла должно быть строкой");
  }

  if (Buffer.byteLength(content, "utf8") > MAX_FILE_SIZE) {
    throw new Error(`Файл слишком большой: максимум ${MAX_FILE_SIZE} байт`);
  }

  const parentPath = path.dirname(filePath);
  const realParentPath = await assertExistingPathIsInsideWorkspace(parentPath, true);
  const parentStats = await stat(realParentPath);

  if (!parentStats.isDirectory()) {
    throw new Error("Родительский путь не является директорией");
  }

  try {
    await access(filePath);
    throw new Error("Файл уже существует; create_file не перезаписывает файлы");
  } catch (error) {
    if (error?.code !== "ENOENT") {
      throw error;
    }
  }

  await writeFile(filePath, content, { encoding: "utf8", flag: "wx" });

  return {
    path: path.relative(workspaceRoot, filePath),
    bytes: Buffer.byteLength(content, "utf8"),
  };
}

const handlers = {
  read_file: readProjectFile,
  create_file: createProjectFile,
};

export async function executeToolCall(name, argumentsObject) {
  const handler = handlers[name];

  if (!handler) {
    throw new Error(`Неизвестный инструмент: ${name}`);
  }

  if (!argumentsObject || typeof argumentsObject !== "object" || Array.isArray(argumentsObject)) {
    throw new TypeError("Аргументы инструмента должны быть объектом");
  }

  return handler(argumentsObject);
}
