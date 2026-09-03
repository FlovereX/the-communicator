"use client";

import { useState } from "react";
import { Avatar } from "@/components/shared/Avatar";
import { Button } from "@/components/shared/Button";
import { Modal } from "@/components/shared/Modal";
import { useCalendarEvents } from "@/lib/calendar-events-store";
import type { CoverageStatus } from "@/lib/supabase/types";
import type { CalendarEvent } from "@/lib/types";
import { cn } from "@/lib/utils";

const EVENT_TYPE_LABELS: Record<CalendarEvent["eventType"], string> = {
  coverage: "Coverage",
  newsroom: "Newsroom",
};

const EVENT_TYPE_STYLES: Record<CalendarEvent["eventType"], string> = {
  coverage: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
  newsroom: "bg-navy/5 text-navy",
};

const COVERAGE_STATUS_LABELS: Record<CoverageStatus, string> = {
  unassigned: "Unassigned",
  assigned: "Assigned",
  covered: "Covered",
};

const COVERAGE_STATUS_STYLES: Record<CoverageStatus, string> = {
  unassigned: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  assigned: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
  covered: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
};

const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
});
const TIME_FORMATTER = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" });

function formatEventTime(startAt: string, endAt: string | null) {
  const start = TIME_FORMATTER.format(new Date(startAt));
  if (!endAt) return start;
  return `${start} \u2013 ${TIME_FORMATTER.format(new Date(endAt))}`;
}

export function EventDetailsModal({
  event,
  canEdit,
  onClose,
  onEdit,
}: {
  event: CalendarEvent;
  canEdit: boolean;
  onClose: () => void;
  onEdit: () => void;
}) {
  const { deleteEvent } = useCalendarEvents();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setIsDeleting(true);
    setError(null);
    const result = await deleteEvent(event.id);
    setIsDeleting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onClose();
  }

  return (
    <Modal title="Event Details" onClose={onClose}>
      {confirmingDelete ? (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-foreground">
            Delete &ldquo;{event.title}&rdquo;? This cannot be undone.
          </p>
          {error ? <p className="text-sm text-red-700 dark:text-red-400">{error}</p> : null}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setConfirmingDelete(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button type="button" variant="danger" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting…" : "Delete Event"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h3 className="font-serif text-lg font-semibold break-words text-foreground">
              {event.title}
            </h3>
            <span
              className={cn(
                "inline-flex shrink-0 items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium",
                EVENT_TYPE_STYLES[event.eventType]
              )}
            >
              {EVENT_TYPE_LABELS[event.eventType]}
            </span>
          </div>
          <dl className="flex flex-col gap-3 text-sm">
            <div className="flex flex-col gap-0.5">
              <dt className="text-[11px] font-semibold uppercase tracking-wide text-foreground/40">
                Date
              </dt>
              <dd className="text-foreground">{DATE_FORMATTER.format(new Date(event.startAt))}</dd>
            </div>
            <div className="flex flex-col gap-0.5">
              <dt className="text-[11px] font-semibold uppercase tracking-wide text-foreground/40">
                Time
              </dt>
              <dd className="text-foreground">{formatEventTime(event.startAt, event.endAt)}</dd>
            </div>
            <div className="flex flex-col gap-0.5">
              <dt className="text-[11px] font-semibold uppercase tracking-wide text-foreground/40">
                Location
              </dt>
              <dd className="text-foreground">{event.location || "No location set"}</dd>
            </div>
            {event.eventType === "coverage" ? (
              <>
                <div className="flex flex-col gap-0.5">
                  <dt className="text-[11px] font-semibold uppercase tracking-wide text-foreground/40">
                    Coverage Status
                  </dt>
                  <dd>
                    <span
                      className={cn(
                        "inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium",
                        COVERAGE_STATUS_STYLES[event.coverageStatus]
                      )}
                    >
                      {COVERAGE_STATUS_LABELS[event.coverageStatus]}
                    </span>
                  </dd>
                </div>
                <div className="flex flex-col gap-1">
                  <dt className="text-[11px] font-semibold uppercase tracking-wide text-foreground/40">
                    Assigned To
                  </dt>
                  <dd>
                    {event.assignees.length === 0 ? (
                      <span className="text-foreground/60">No one assigned yet</span>
                    ) : (
                      <ul className="flex flex-col gap-2">
                        {event.assignees.map((assignee) => (
                          <li key={assignee.id} className="flex items-center gap-2">
                            <Avatar name={assignee.name} avatarUrl={assignee.avatarUrl} size={24} />
                            <span className="text-foreground">{assignee.name}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </dd>
                </div>
              </>
            ) : null}
            <div className="flex flex-col gap-0.5">
              <dt className="text-[11px] font-semibold uppercase tracking-wide text-foreground/40">
                {event.eventType === "coverage" ? "Coverage Notes" : "Description"}
              </dt>
              <dd className="whitespace-pre-wrap text-foreground/80">
                {event.description || "No description provided."}
              </dd>
            </div>
          </dl>
          {error ? <p className="text-sm text-red-700 dark:text-red-400">{error}</p> : null}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div>
              {canEdit ? (
                <Button type="button" variant="danger" onClick={() => setConfirmingDelete(true)}>
                  Delete
                </Button>
              ) : null}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="secondary" onClick={onClose}>
                Close
              </Button>
              {canEdit ? (
                <Button type="button" variant="primary" onClick={onEdit}>
                  Edit
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
