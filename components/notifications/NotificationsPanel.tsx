"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatNotificationTimestamp } from "@/lib/format";
import { useNotifications } from "@/lib/notifications-store";
import { cn } from "@/lib/utils";
import type { DeadlineReminder, Notification } from "@/lib/types";

export function NotificationsPanel({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const { notifications, unreadCount, dueTomorrowReminders, markRead, markAllRead } =
    useNotifications();
  const [error, setError] = useState<string | null>(null);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  async function handleItemClick(notification: Notification) {
    setError(null);
    if (!notification.readAt) {
      const result = await markRead(notification.id);
      if (!result.ok) {
        setError(result.error);
      }
    }
    // Never block navigation on a failed mark-read.
    onClose();
    if (notification.storyId) {
      router.push(`/stories/${notification.storyId}`);
    } else if (notification.pitchId) {
      router.push("/pitches");
    }
  }

  function handleReminderClick(reminder: DeadlineReminder) {
    onClose();
    router.push(`/stories/${reminder.storyId}`);
  }

  async function handleMarkAllRead() {
    setError(null);
    setIsMarkingAll(true);
    const result = await markAllRead();
    setIsMarkingAll(false);
    if (!result.ok) {
      setError(result.error);
    }
  }

  const isEmpty = notifications.length === 0 && dueTomorrowReminders.length === 0;

  return (
    <div
      role="dialog"
      aria-label="Notifications"
      className="absolute right-0 top-full z-40 mt-2 w-80 max-w-[90vw] rounded-xl border border-border bg-surface shadow-xl"
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <p className="font-serif text-sm font-semibold text-foreground">Notifications</p>
        {unreadCount > 0 ? (
          <button
            type="button"
            onClick={handleMarkAllRead}
            disabled={isMarkingAll}
            className="text-xs font-medium text-navy hover:underline disabled:opacity-50"
          >
            {isMarkingAll ? "Marking…" : "Mark all as read"}
          </button>
        ) : null}
      </div>

      {error ? (
        <p className="border-b border-border bg-red-50 px-4 py-2 text-xs text-red-700">{error}</p>
      ) : null}

      <div className="max-h-96 overflow-y-auto">
        {isEmpty ? (
          <p className="px-4 py-6 text-center text-sm text-foreground/50">
            No new notifications.
          </p>
        ) : (
          <>
            {dueTomorrowReminders.length > 0 ? (
              <div className="border-b border-border">
                <p className="px-4 pt-3 text-[11px] font-semibold uppercase tracking-wide text-foreground/40">
                  Due Tomorrow
                </p>
                <ul>
                  {dueTomorrowReminders.map((reminder) => (
                    <li key={reminder.id}>
                      <button
                        type="button"
                        onClick={() => handleReminderClick(reminder)}
                        className="flex w-full flex-col gap-0.5 px-4 py-3 text-left hover:bg-background/60"
                      >
                        <span className="text-sm font-medium text-foreground">
                          {reminder.title}
                        </span>
                        <span className="text-xs text-foreground/60">{reminder.message}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {notifications.length > 0 ? (
              <div>
                <p className="px-4 pt-3 text-[11px] font-semibold uppercase tracking-wide text-foreground/40">
                  Recent
                </p>
                <ul>
                  {notifications.map((notification) => (
                    <li key={notification.id}>
                      <button
                        type="button"
                        onClick={() => handleItemClick(notification)}
                        className={cn(
                          "flex w-full items-start gap-2 px-4 py-3 text-left hover:bg-background/60",
                          !notification.readAt && "bg-navy/5"
                        )}
                      >
                        <span
                          aria-hidden="true"
                          className={cn(
                            "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                            !notification.readAt && "bg-navy"
                          )}
                        />
                        <span className="flex min-w-0 flex-col gap-0.5">
                          <span className="text-sm font-medium text-foreground">
                            {notification.title}
                          </span>
                          <span className="text-xs text-foreground/60">
                            {notification.message}
                          </span>
                          <span className="text-[11px] text-foreground/40">
                            {formatNotificationTimestamp(notification.createdAt)}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
