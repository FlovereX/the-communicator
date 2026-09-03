"use client";

import { useState } from "react";
import { Button } from "@/components/shared/Button";
import { Label, Select, TextArea, TextInput } from "@/components/shared/FormControls";
import { Modal } from "@/components/shared/Modal";
import { splitTimestamptz, toTimestamptz } from "@/lib/calendar";
import { useAnnouncements, type AnnouncementInput } from "@/lib/announcements-store";
import type { AnnouncementPriority } from "@/lib/supabase/types";
import type { Announcement } from "@/lib/types";

const PRIORITY_OPTIONS: { value: AnnouncementPriority; label: string }[] = [
  { value: "normal", label: "Normal" },
  { value: "important", label: "Important" },
  { value: "urgent", label: "Urgent" },
];

/** Expiring at end-of-day when only a date is given matches how people mean "expires that day". */
const END_OF_DAY_TIME = "23:59";

export function AnnouncementModal({
  announcement,
  onClose,
}: {
  announcement?: Announcement;
  onClose: () => void;
}) {
  const { createAnnouncement, updateAnnouncement } = useAnnouncements();
  const isEditing = Boolean(announcement);
  const initialExpires = announcement?.expiresAt ? splitTimestamptz(announcement.expiresAt) : null;

  const [title, setTitle] = useState(announcement?.title ?? "");
  const [body, setBody] = useState(announcement?.body ?? "");
  const [priority, setPriority] = useState<AnnouncementPriority>(
    announcement?.priority ?? "normal"
  );
  const [expiresDate, setExpiresDate] = useState(initialExpires?.date ?? "");
  const [expiresTime, setExpiresTime] = useState(initialExpires?.time ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const isValid = Boolean(title.trim() && body.trim() && priority);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || isSubmitting) return;
    setIsSubmitting(true);
    setFormError(null);

    const input: AnnouncementInput = {
      title: title.trim(),
      body: body.trim(),
      priority,
      expiresAt: expiresDate ? toTimestamptz(expiresDate, expiresTime || END_OF_DAY_TIME) : null,
    };

    const result = announcement
      ? await updateAnnouncement(announcement.id, input)
      : await createAnnouncement(input);

    setIsSubmitting(false);
    if (!result.ok) {
      setFormError(result.error);
      return;
    }
    onClose();
  }

  return (
    <Modal title={isEditing ? "Edit Announcement" : "New Announcement"} onClose={onClose}>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="announcement-title">Title</Label>
          <TextInput
            id="announcement-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="announcement-body">Message</Label>
          <TextArea
            id="announcement-body"
            rows={4}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="announcement-priority">Priority</Label>
          <Select
            id="announcement-priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as AnnouncementPriority)}
            required
          >
            {PRIORITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="announcement-expires-date">Expires (optional)</Label>
            <TextInput
              id="announcement-expires-date"
              type="date"
              value={expiresDate}
              onChange={(e) => setExpiresDate(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="announcement-expires-time">Expiration time</Label>
            <TextInput
              id="announcement-expires-time"
              type="time"
              value={expiresTime}
              onChange={(e) => setExpiresTime(e.target.value)}
              disabled={!expiresDate}
              placeholder={END_OF_DAY_TIME}
            />
          </div>
        </div>
        {formError ? <p className="text-sm text-red-700 dark:text-red-400">{formError}</p> : null}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={!isValid || isSubmitting}>
            {isSubmitting ? "Saving…" : isEditing ? "Save Changes" : "Post Announcement"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
