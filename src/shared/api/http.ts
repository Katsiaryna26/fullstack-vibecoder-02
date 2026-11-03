import { supabase } from "@/shared/api/supabase";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  if (!supabase) {
    throw new ApiError("Authentication is not configured", 401);
  }

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session?.access_token) {
    throw new ApiError("Authentication is required", 401);
  }

  const { data, error } = await supabase.functions.invoke<T>(path, {
    method: "GET",
    signal,
  });

  if (error) {
    const status = error.context instanceof Response ? error.context.status : 500;
    throw new ApiError(`Request failed with status ${status}`, status);
  }

  return data as T;
}
