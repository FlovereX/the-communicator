"use client";

import { useState } from "react";
import { Button } from "@/components/shared/Button";
import { Label, Select, TextArea, TextInput } from "@/components/shared/FormControls";
import { Modal } from "@/components/shared/Modal";
import { splitTimestamptz, toTimestamptz } from "@/lib/calendar";
import { useCalendarEvents } from "@/lib/calendar-events-store";
import type { CalendarEventType } from "@/lib/supabase/types";
import type { CalendarEvent } from "@/lib/types";

const EVENT_TYPE_OPTIONS: { value: CalendarEventType; label: string }[] = [
  { value: "coverage", label: "Coverage" },
  { value: "newsroom", label: "Newsroom" },
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const isValid = Boolean(title.trim() && eventType && date && startTime);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    setIsSubmitting(true);
    setFormError(null);

    const input = {
      title: title.trim(),
      description: description.trim() || null,
      eventType,
      startAt: toTimestamptz(date, startTime),
      endAt: endTime ? toTimestamptz(date, endTime) : null,
      location: location.trim() || null,
    };

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
            <Label htmlFor="calendar-event-description">Description</Label>
            <TextArea
              id="calendar-event-description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
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
