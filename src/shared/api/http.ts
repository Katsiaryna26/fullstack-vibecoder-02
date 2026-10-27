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
  const response = await fetch(`${runtimeConfig.functionsUrl}/${path}`, {
    method: "GET",
    // The read-only edge functions are public (verify_jwt = false). Keeping
    // this request to safelisted headers avoids a browser CORS preflight.
    // The deployed project currently fails OPTIONS requests, which otherwise
    // prevents clients and messages from loading in the frontend.
    headers: { Accept: "application/json" },
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
