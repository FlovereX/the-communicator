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
import type { CalendarEventRow, CalendarEventType } from "./supabase/types";
import type { CalendarEvent } from "./types";

export interface CalendarEventInput {
  title: string;
  description: string | null;
  eventType: CalendarEventType;
  startAt: string;
  endAt: string | null;
  location: string | null;
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
    const { data, error: fetchError } = await supabase
      .from("calendar_events")
      .select("*")
      .order("start_at", { ascending: true })
      .overrideTypes<CalendarEventRow[]>();
    if (fetchError) {
      return { ok: false as const, error: fetchError.message };
    }
    return { ok: true as const, events: (data ?? []).map(mapCalendarEventRow) };
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
        const { error: rpcError } = await supabase.rpc("create_calendar_event", {
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
