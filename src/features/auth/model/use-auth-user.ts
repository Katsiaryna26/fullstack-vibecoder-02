import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/shared/api/supabase";

export function useAuthUser() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const client = supabase;

    if (!client) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    void client.auth
      .getSession()
      .then(({ data }) => {
        if (!isMounted) return;

        setUser(data.session?.user ?? null);
        setIsLoading(false);
      })
      .catch(() => {
        if (!isMounted) return;

        setUser(null);
        setIsLoading(false);
      });

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;

      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { user, isLoading };
}

export function getUserDisplayName(user: User): string {
  const metadataName = [user.user_metadata?.full_name, user.user_metadata?.name]
    .find((value): value is string => typeof value === "string" && value.trim().length > 0)
    ?.trim();

  return metadataName || user.email || "Account";
}

export function getUserInitials(user: User | null): string {
  if (!user) return "GU";

  const name = getUserDisplayName(user);
  const initials = name
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return initials || "AC";
}
