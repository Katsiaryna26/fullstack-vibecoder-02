import { getJson } from "@/shared/api/http";
import type { Client, Message } from "../model/types";

export async function getClients(signal?: AbortSignal): Promise<Client[]> {
  const clients = await getJson<unknown>("clients", signal);

  if (!Array.isArray(clients)) {
    throw new Error("The clients function returned an invalid response");
  }

  return clients as Client[];
}

export async function getMessages(
  clientId: number,
  signal?: AbortSignal,
): Promise<Message[]> {
  const messages = await getJson<unknown>(
    `Messages?client_id=${encodeURIComponent(clientId)}`,
    signal,
  );

  if (!Array.isArray(messages)) {
    throw new Error("The Messages function returned an invalid response");
  }

  return messages as Message[];
}
