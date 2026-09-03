"use client";

import { useEffect, useRef, useState } from "react";
import { BellIcon } from "@/components/icons";
import { useNotifications } from "@/lib/notifications-store";
import { cn } from "@/lib/utils";
import { NotificationsPanel } from "./NotificationsPanel";

export function NotificationBell() {
  const { unreadCount, refresh } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  function openPanel() {
    setIsOpen(true);
    refresh();
  }

  function closePanel() {
    setIsOpen(false);
  }

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        closePanel();
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closePanel();
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const badgeLabel = unreadCount > 9 ? "9+" : String(unreadCount);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => (isOpen ? closePanel() : openPanel())}
        aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
        aria-haspopup="true"
        aria-expanded={isOpen}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-border text-foreground/70 hover:bg-navy/5 hover:text-foreground"
      >
        <BellIcon className="h-5 w-5" />
        {unreadCount > 0 ? (
          <span
            aria-hidden="true"
            className={cn(
              "absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold leading-none text-white"
            )}
          >
            {badgeLabel}
          </span>
        ) : null}
      </button>
      {isOpen ? <NotificationsPanel onClose={closePanel} /> : null}
    </div>
  );
}
