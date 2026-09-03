"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useCurrentUser } from "./auth-context";
import { useStories } from "./stories-store";
import { createClient } from "./supabase/client";
import { mapNotificationRow } from "./supabase/mappers";
import type { NotificationRow } from "./supabase/types";
import type { DeadlineReminder, Notification } from "./types";

export type NotificationActionResult = { ok: true } | { ok: false; error: string };

interface NotificationsContextValue {
  notifications: Notification[];
  unreadCount: number;
  dueTomorrowReminders: DeadlineReminder[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  markRead: (id: string) => Promise<NotificationActionResult>;
  markAllRead: () => Promise<NotificationActionResult>;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

/** Tomorrow's calendar date as "YYYY-MM-DD", compared directly against `deadline` strings to avoid UTC drift. */
function getTomorrowDateString() {
  const now = new Date();
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const year = tomorrow.getFullYear();
  const month = String(tomorrow.getMonth() + 1).padStart(2, "0");
  const day = String(tomorrow.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const currentUser = useCurrentUser();
  const { stories } = useStories();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pendingIdsRef = useRef<Set<string>>(new Set());
  const isMarkingAllRef = useRef(false);

  const fetchNotifications = useCallback(async () => {
    const supabase = createClient();
    // RLS already restricts rows to the caller's own, active-only notifications —
    // no manual user_id filter here.
    const { data, error: fetchError } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .overrideTypes<NotificationRow[]>();
    if (fetchError) {
      return { ok: false as const, error: fetchError.message };
    }
    return { ok: true as const, notifications: (data ?? []).map(mapNotificationRow) };
  }, []);

  const refresh = useCallback(async () => {
    setError(null);
    const result = await fetchNotifications();
    if (!result.ok) {
      setError(result.error);
      setIsLoading(false);
      return;
    }
    setNotifications(result.notifications);
    setIsLoading(false);
  }, [fetchNotifications]);

  useEffect(() => {
    let ignore = false;

    fetchNotifications().then((result) => {
      if (ignore) return;
      if (!result.ok) {
        setError(result.error);
        setIsLoading(false);
        return;
      }
      setNotifications(result.notifications);
      setIsLoading(false);
    });

    return () => {
      ignore = true;
    };
  }, [fetchNotifications]);

  // Lightweight polling instead of Realtime: refresh every 60s while the tab is visible.
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        refresh();
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [refresh]);

  const dueTomorrowReminders = useMemo<DeadlineReminder[]>(() => {
    const tomorrow = getTomorrowDateString();
    return stories
      .filter(
        (story) =>
          story.writerId === currentUser.id &&
          story.status !== "Published" &&
          story.dueDate === tomorrow
      )
      .map((story) => ({
        id: `reminder-${story.id}`,
        storyId: story.id,
        title: "Deadline tomorrow",
        message: `${story.title} is due tomorrow.`,
      }));
  }, [stories, currentUser.id]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.readAt).length,
    [notifications]
  );

  const value = useMemo<NotificationsContextValue>(
    () => ({
      notifications,
      unreadCount,
      dueTomorrowReminders,
      isLoading,
      error,
      refresh,
      markRead: async (id) => {
        if (pendingIdsRef.current.has(id)) {
          return { ok: false, error: "Already in progress." };
        }
        pendingIdsRef.current.add(id);
        const supabase = createClient();
        const { error: rpcError } = await supabase.rpc("mark_notification_read", {
          p_notification_id: id,
        });
        pendingIdsRef.current.delete(id);
        if (rpcError) {
          return { ok: false, error: rpcError.message };
        }
        const readAt = new Date().toISOString();
        setNotifications((prev) =>
          prev.map((n) => (n.id === id && !n.readAt ? { ...n, readAt } : n))
        );
        return { ok: true };
      },
      markAllRead: async () => {
        if (isMarkingAllRef.current) {
          return { ok: false, error: "Already in progress." };
        }
        isMarkingAllRef.current = true;
        const supabase = createClient();
        const { error: rpcError } = await supabase.rpc("mark_all_notifications_read");
        isMarkingAllRef.current = false;
        if (rpcError) {
          return { ok: false, error: rpcError.message };
        }
        const readAt = new Date().toISOString();
        setNotifications((prev) => prev.map((n) => (n.readAt ? n : { ...n, readAt })));
        return { ok: true };
      },
    }),
    [notifications, unreadCount, dueTomorrowReminders, isLoading, error, refresh]
  );

  return (
    <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationsProvider");
  }
  return context;
}
