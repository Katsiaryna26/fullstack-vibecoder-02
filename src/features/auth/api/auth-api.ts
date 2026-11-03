import { supabase } from "@/shared/api/supabase";

export async function signInWithPassword(email: string, password: string): Promise<void> {
  if (!supabase) {
    throw new Error("Supabase is not configured for this environment.");
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    throw error;
  }
}

export async function signOut(): Promise<void> {
  if (!supabase) {
    throw new Error("Supabase is not configured for this environment.");
  }

  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}
