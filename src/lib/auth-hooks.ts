// src/lib/auth-hooks.ts
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-client";

export type AppUser = {
  id: string;
  phone: string;
  email?: string | null;
  full_name?: string | null;
  is_admin: boolean;
};

export function useAuth() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await apiFetch<{ user: AppUser | null }>("/api/auth/me");
        if (!cancelled) setUser(data.user);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { user, session, loading };
}

export function useIsAdmin() {
  const { user, loading } = useAuth();
  return { isAdmin: !!user?.is_admin, checking: loading, user };
}
