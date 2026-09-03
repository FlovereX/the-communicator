"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createClient } from "./supabase/client";
import { mapAnnouncementRow } from "./supabase/mappers";
import type { AnnouncementRow, AnnouncementPriority } from "./supabase/types";
import type { Announcement } from "./types";

export interface AnnouncementInput {
  title: string;
  body: string;
  priority: AnnouncementPriority;
  expiresAt: string | null;
}

export type AnnouncementActionResult = { ok: true } | { ok: false; error: string };

interface AnnouncementsContextValue {
  announcements: Announcement[];
  currentAnnouncements: Announcement[];
  expiredAnnouncements: Announcement[];
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  refresh: () => Promise<void>;
  createAnnouncement: (input: AnnouncementInput) => Promise<AnnouncementActionResult>;
  updateAnnouncement: (id: string, input: AnnouncementInput) => Promise<AnnouncementActionResult>;
  deleteAnnouncement: (id: string) => Promise<AnnouncementActionResult>;
}

const AnnouncementsContext = createContext<AnnouncementsContextValue | null>(null);

export function AnnouncementsProvider({ children }: { children: ReactNode }) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Recomputes current/expired classification every minute without refetching from Supabase.
  const [now, setNow] = useState(() => new Date().getTime());

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(new Date().getTime());
    }, 60_000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  const fetchAnnouncements = useCallback(async () => {
    const supabase = createClient();
    // Read-only table access — RLS already scopes rows to what this user may see
    // (writers never receive expired rows; editors/admins receive both for management).
    const { data, error: fetchError } = await supabase
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false })
      .overrideTypes<AnnouncementRow[]>();
    if (fetchError) {
      return { ok: false as const, error: fetchError.message };
    }
    return { ok: true as const, announcements: (data ?? []).map(mapAnnouncementRow) };
  }, []);

  const refresh = useCallback(async () => {
    setError(null);
    const result = await fetchAnnouncements();
    if (!result.ok) {
      setError(result.error);
      setIsLoading(false);
      return;
    }
    setAnnouncements(result.announcements);
    setIsLoading(false);
  }, [fetchAnnouncements]);

  useEffect(() => {
    let ignore = false;

    fetchAnnouncements().then((result) => {
      if (ignore) return;
      if (!result.ok) {
        setError(result.error);
        setIsLoading(false);
        return;
      }
      setAnnouncements(result.announcements);
      setIsLoading(false);
    });

    return () => {
      ignore = true;
    };
  }, [fetchAnnouncements]);

  const currentAnnouncements = useMemo(
    () =>
      announcements.filter((a) => a.expiresAt === null || new Date(a.expiresAt).getTime() > now),
    [announcements, now]
  );
  const expiredAnnouncements = useMemo(
    () =>
      announcements.filter((a) => a.expiresAt !== null && new Date(a.expiresAt).getTime() <= now),
    [announcements, now]
  );

  const value = useMemo<AnnouncementsContextValue>(
    () => ({
      announcements,
      currentAnnouncements,
      expiredAnnouncements,
      isLoading,
      error,
      clearError: () => setError(null),
      refresh,
      createAnnouncement: async (input) => {
        const supabase = createClient();
        const { data, error: rpcError } = await supabase.rpc("create_announcement", {
          p_title: input.title,
          p_body: input.body,
          p_priority: input.priority,
          p_expires_at: input.expiresAt,
        });
        if (rpcError || !data) {
          return { ok: false, error: rpcError?.message ?? "Could not create the announcement." };
        }
        await refresh();
        return { ok: true };
      },
      updateAnnouncement: async (id, input) => {
        const supabase = createClient();
        const { error: rpcError } = await supabase.rpc("update_announcement", {
          p_announcement_id: id,
          p_title: input.title,
          p_body: input.body,
          p_priority: input.priority,
          p_expires_at: input.expiresAt,
        });
        if (rpcError) {
          return { ok: false, error: rpcError.message };
        }
        await refresh();
        return { ok: true };
      },
      deleteAnnouncement: async (id) => {
        const supabase = createClient();
        const { error: rpcError } = await supabase.rpc("delete_announcement", {
          p_announcement_id: id,
        });
        if (rpcError) {
          return { ok: false, error: rpcError.message };
        }
        await refresh();
        return { ok: true };
      },
    }),
    [announcements, currentAnnouncements, expiredAnnouncements, isLoading, error, refresh]
  );

  return (
    <AnnouncementsContext.Provider value={value}>{children}</AnnouncementsContext.Provider>
  );
}

export function useAnnouncements() {
  const context = useContext(AnnouncementsContext);
  if (!context) {
    throw new Error("useAnnouncements must be used within an AnnouncementsProvider");
  }
  return context;
}
