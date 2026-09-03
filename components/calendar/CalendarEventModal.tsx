"use client";

import { useState } from "react";
import { Button } from "@/components/shared/Button";
import { Label, Select, TextArea, TextInput } from "@/components/shared/FormControls";
import { Modal } from "@/components/shared/Modal";
import { splitTimestamptz, toTimestamptz } from "@/lib/calendar";
import { useCalendarEvents, type CalendarEventInput } from "@/lib/calendar-events-store";
import type { CalendarEventType, CoverageStatus } from "@/lib/supabase/types";
import type { CalendarEvent } from "@/lib/types";
import { useStories } from "@/lib/stories-store";
import { capitalize, disambiguateNames } from "@/lib/utils";

const EVENT_TYPE_OPTIONS: { value: CalendarEventType; label: string }[] = [
  { value: "coverage", label: "Coverage" },
  { value: "newsroom", label: "Newsroom" },
];

const COVERAGE_STATUS_OPTIONS: { value: CoverageStatus; label: string }[] = [
  { value: "unassigned", label: "Unassigned" },
  { value: "assigned", label: "Assigned" },
  { value: "covered", label: "Covered" },
];

export function CalendarEventModal({
  event,
  defaultDate,
  onClose,
}: {
  event?: CalendarEvent;
  defaultDate?: string;
  onClose: () => void;
}) {
  const { createEvent, updateEvent, deleteEvent } = useCalendarEvents();
  const { writers } = useStories();
  const isEditing = Boolean(event);
  const initialStart = event ? splitTimestamptz(event.startAt) : null;
  const initialEnd = event?.endAt ? splitTimestamptz(event.endAt) : null;

  const [title, setTitle] = useState(event?.title ?? "");
  const [eventType, setEventType] = useState<CalendarEventType>(event?.eventType ?? "coverage");
  const [date, setDate] = useState(initialStart?.date ?? defaultDate ?? "");
  const [startTime, setStartTime] = useState(initialStart?.time ?? "");
  const [endTime, setEndTime] = useState(initialEnd?.time ?? "");
  const [location, setLocation] = useState(event?.location ?? "");
  const [description, setDescription] = useState(event?.description ?? "");
  const [coverageStatus, setCoverageStatus] = useState<CoverageStatus>(
    event?.coverageStatus ?? "unassigned"
  );
  const [assigneeIds, setAssigneeIds] = useState<string[]>(
    event?.assignees.map((a) => a.id) ?? []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const isValid = Boolean(title.trim() && eventType && date && startTime);
  // `writers` is already active-profile-only; drop any previously-selected id that's
  // no longer valid (e.g. the profile was disabled while this modal was open) instead
  // of trusting stale state.
  const validAssigneeIds = assigneeIds.filter((id) => writers.some((w) => w.id === id));
  const assigneeLabels = disambiguateNames(writers);

  function toggleAssignee(userId: string) {
    const nextAssigneeIds = validAssigneeIds.includes(userId)
      ? validAssigneeIds.filter((id) => id !== userId)
      : [...validAssigneeIds, userId];
    setAssigneeIds(nextAssigneeIds);
    if (nextAssigneeIds.length > 0 && coverageStatus === "unassigned") {
      setCoverageStatus("assigned");
    } else if (nextAssigneeIds.length === 0 && coverageStatus !== "covered") {
      setCoverageStatus("unassigned");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    setIsSubmitting(true);
    setFormError(null);

    const input: CalendarEventInput = {
      title: title.trim(),
      description: description.trim() || null,
      eventType,
      startAt: toTimestamptz(date, startTime),
      endAt: endTime ? toTimestamptz(date, endTime) : null,
      location: location.trim() || null,
    };
    if (eventType === "coverage") {
      input.coverageStatus = coverageStatus;
      input.assigneeIds = validAssigneeIds;
    } else if (event?.eventType === "coverage") {
      // Switched away from coverage — clear any prior assignment state.
      input.coverageStatus = "unassigned";
      input.assigneeIds = [];
    }

    const result = event ? await updateEvent(event.id, input) : await createEvent(input);

    setIsSubmitting(false);
    if (!result.ok) {
      setFormError(result.error);
      return;
    }
    onClose();
  }


  async function handleDelete() {
    if (!event) return;
    setIsDeleting(true);
    setFormError(null);
    const result = await deleteEvent(event.id);
    setIsDeleting(false);
    if (!result.ok) {
      setFormError(result.error);
      return;
    }
    onClose();
  }

  return (
    <Modal title={isEditing ? "Edit Event" : "Add Event"} onClose={onClose}>
      {confirmingDelete ? (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-foreground">
            Delete &ldquo;{event?.title}&rdquo;? This cannot be undone.
          </p>
          {formError ? <p className="text-sm text-red-700 dark:text-red-400">{formError}</p> : null}
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
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="calendar-event-title">Title</Label>
            <TextInput
              id="calendar-event-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="calendar-event-type">Type</Label>
              <Select
                id="calendar-event-type"
                value={eventType}
                onChange={(e) => setEventType(e.target.value as CalendarEventType)}
                required
              >
                {EVENT_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="calendar-event-date">Date</Label>
              <TextInput
                id="calendar-event-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="calendar-event-start">Start Time</Label>
              <TextInput
                id="calendar-event-start"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="calendar-event-end">End Time</Label>
              <TextInput
                id="calendar-event-end"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="calendar-event-location">Location</Label>
            <TextInput
              id="calendar-event-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="calendar-event-description">
              {eventType === "coverage" ? "Coverage Notes" : "Description"}
            </Label>
            <TextArea
              id="calendar-event-description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          {eventType === "coverage" ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="calendar-event-coverage-status">Coverage Status</Label>
                <Select
                  id="calendar-event-coverage-status"
                  value={coverageStatus}
                  onChange={(e) => setCoverageStatus(e.target.value as CoverageStatus)}
                >
                  {COVERAGE_STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Assigned To</Label>
                {writers.length === 0 ? (
                  <p className="text-xs text-foreground/50">No active newsroom users available.</p>
                ) : (
                  <div className="flex max-h-32 flex-col gap-0.5 overflow-y-auto rounded-lg border border-border p-1.5">
                    {writers.map((user) => (
                      <label
                        key={user.id}
                        className="flex items-center gap-2 rounded px-1.5 py-1 text-sm text-foreground hover:bg-background/60"
                      >
                        <input
                          type="checkbox"
                          checked={validAssigneeIds.includes(user.id)}
                          onChange={() => toggleAssignee(user.id)}
                          className="h-4 w-4 rounded border-border text-navy focus:ring-navy"
                        />
                        <span className="truncate">{assigneeLabels.get(user.id)}</span>
                        <span className="text-xs text-foreground/40">({capitalize(user.role)})</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : null}
          {formError ? <p className="text-sm text-red-700 dark:text-red-400">{formError}</p> : null}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div>
              {isEditing ? (
                <Button type="button" variant="danger" onClick={() => setConfirmingDelete(true)}>
                  Delete
                </Button>
              ) : null}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={!isValid || isSubmitting}>
                {isSubmitting ? "Saving…" : isEditing ? "Save Changes" : "Add Event"}
              </Button>
            </div>
          </div>
        </form>
      )}
    </Modal>
  );
}
