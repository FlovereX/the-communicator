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
import { mapCalendarEventRow } from "./supabase/mappers";
import { AVATAR_BUCKET, SIGNED_URL_TTL_SECONDS } from "./supabase/storage";
import type {
  CalendarEventAssigneeRow,
  CalendarEventRow,
  CalendarEventType,
  CoverageStatus,
  ProfileRow,
} from "./supabase/types";
import type { CalendarEvent, CalendarEventAssignee } from "./types";

export interface CalendarEventInput {
  title: string;
  description: string | null;
  eventType: CalendarEventType;
  startAt: string;
  endAt: string | null;
  location: string | null;
  /** Omit to leave coverage assignment/status untouched (e.g. editing a newsroom event). */
  coverageStatus?: CoverageStatus;
  assigneeIds?: string[];
}

export type CalendarEventActionResult = { ok: true } | { ok: false; error: string };

interface CalendarEventsContextValue {
  events: CalendarEvent[];
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  refresh: () => Promise<void>;
  createEvent: (input: CalendarEventInput) => Promise<CalendarEventActionResult>;
  updateEvent: (id: string, input: CalendarEventInput) => Promise<CalendarEventActionResult>;
  deleteEvent: (id: string) => Promise<CalendarEventActionResult>;
}

const CalendarEventsContext = createContext<CalendarEventsContextValue | null>(null);

export function CalendarEventsProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    const supabase = createClient();
    // RLS already restricts reads to active newsroom users only.
    const [
      { data: eventRows, error: eventsError },
      { data: assigneeRows, error: assigneesError },
      { data: profileRows, error: profilesError },
    ] = await Promise.all([
      supabase
        .from("calendar_events")
        .select("*")
        .order("start_at", { ascending: true })
        .overrideTypes<CalendarEventRow[]>(),
      supabase.from("calendar_event_assignees").select("*").overrideTypes<CalendarEventAssigneeRow[]>(),
      supabase.from("profiles").select("*").overrideTypes<ProfileRow[]>(),
    ]);
    const firstError = eventsError || assigneesError || profilesError;
    if (firstError) {
      return { ok: false as const, error: firstError.message };
    }

    const profilesById = new Map((profileRows ?? []).map((p) => [p.id, p]));
    const assigneeList = assigneeRows ?? [];

    // Only sign avatars for profiles actually assigned to a coverage event.
    const avatarPaths = [...new Set(assigneeList.map((a) => profilesById.get(a.user_id)?.avatar_url).filter((path): path is string => Boolean(path)))];
    let avatarUrlByPath = new Map<string, string>();
    if (avatarPaths.length > 0) {
      const { data: signedUrls } = await supabase.storage
        .from(AVATAR_BUCKET)
        .createSignedUrls(avatarPaths, SIGNED_URL_TTL_SECONDS);
      avatarUrlByPath = new Map(
        (signedUrls ?? [])
          .filter((entry): entry is typeof entry & { path: string; signedUrl: string } =>
            Boolean(!entry.error && entry.path && entry.signedUrl)
          )
          .map((entry) => [entry.path, entry.signedUrl])
      );
    }

    const assigneesByEvent = new Map<string, CalendarEventAssignee[]>();
    for (const row of assigneeList) {
      const profile = profilesById.get(row.user_id);
      // A deactivated/deleted profile shouldn't still read as an active assignee.
      if (!profile || profile.status !== "active") continue;
      const list = assigneesByEvent.get(row.event_id) ?? [];
      list.push({
        id: profile.id,
        name: profile.full_name,
        avatarUrl: profile.avatar_url ? (avatarUrlByPath.get(profile.avatar_url) ?? null) : null,
      });
      assigneesByEvent.set(row.event_id, list);
    }

    return {
      ok: true as const,
      events: (eventRows ?? []).map((row) =>
        mapCalendarEventRow(row, assigneesByEvent.get(row.id) ?? [])
      ),
    };
  }, []);

  const refresh = useCallback(async () => {
    setError(null);
    const result = await fetchEvents();
    if (!result.ok) {
      setError(result.error);
      setIsLoading(false);
      return;
    }
    setEvents(result.events);
    setIsLoading(false);
  }, [fetchEvents]);

  useEffect(() => {
    let ignore = false;

    fetchEvents().then((result) => {
      if (ignore) return;
      if (!result.ok) {
        setError(result.error);
        setIsLoading(false);
        return;
      }
      setEvents(result.events);
      setIsLoading(false);
    });

    return () => {
      ignore = true;
    };
  }, [fetchEvents]);

  const value = useMemo<CalendarEventsContextValue>(
    () => ({
      events,
      isLoading,
      error,
      clearError: () => setError(null),
      refresh,
      createEvent: async (input) => {
        const supabase = createClient();
        const { data: newId, error: rpcError } = await supabase.rpc("create_calendar_event", {
          p_title: input.title,
          p_description: input.description,
          p_event_type: input.eventType,
          p_start_at: input.startAt,
          p_end_at: input.endAt,
          p_location: input.location,
        });
        if (rpcError) {
          return { ok: false, error: rpcError.message };
        }
        if (input.coverageStatus !== undefined && newId) {
          const { error: coverageError } = await supabase.rpc("set_calendar_event_coverage", {
            p_event_id: newId,
            p_coverage_status: input.coverageStatus,
            p_assignee_ids: input.assigneeIds ?? [],
          });
          if (coverageError) {
            return { ok: false, error: coverageError.message };
          }
        }
        await refresh();
        return { ok: true };
      },
      updateEvent: async (id, input) => {
        const supabase = createClient();
        const { error: rpcError } = await supabase.rpc("update_calendar_event", {
          p_event_id: id,
          p_title: input.title,
          p_description: input.description,
          p_event_type: input.eventType,
          p_start_at: input.startAt,
          p_end_at: input.endAt,
          p_location: input.location,
        });
        if (rpcError) {
          return { ok: false, error: rpcError.message };
        }
        if (input.coverageStatus !== undefined) {
          const { error: coverageError } = await supabase.rpc("set_calendar_event_coverage", {
            p_event_id: id,
            p_coverage_status: input.coverageStatus,
            p_assignee_ids: input.assigneeIds ?? [],
          });
          if (coverageError) {
            return { ok: false, error: coverageError.message };
          }
        }
        await refresh();
        return { ok: true };
      },
      deleteEvent: async (id) => {
        const supabase = createClient();
        const { error: rpcError } = await supabase.rpc("delete_calendar_event", {
          p_event_id: id,
        });
        if (rpcError) {
          return { ok: false, error: rpcError.message };
        }
        await refresh();
        return { ok: true };
      },
    }),
    [events, isLoading, error, refresh]
  );

  return (
    <CalendarEventsContext.Provider value={value}>{children}</CalendarEventsContext.Provider>
  );
}

export function useCalendarEvents() {
  const context = useContext(CalendarEventsContext);
  if (!context) {
    throw new Error("useCalendarEvents must be used within a CalendarEventsProvider");
  }
  return context;
}
