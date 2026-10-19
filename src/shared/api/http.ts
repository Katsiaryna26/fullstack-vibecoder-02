import { runtimeConfig } from "@/shared/config/env";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  const headers: HeadersInit = { Accept: "application/json" };

  if (runtimeConfig.anonKey) {
    headers.apikey = runtimeConfig.anonKey;
  }

  const response = await fetch(`${runtimeConfig.functionsUrl}/${path}`, {
    method: "GET",
    headers,
    signal,
  });

  if (!response.ok) {
    throw new ApiError(
      `Request failed with status ${response.status}`,
      response.status,
    );
  }

  return (await response.json()) as T;
}
