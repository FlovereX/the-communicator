"use client";

import { useState } from "react";
import { Button } from "@/components/shared/Button";
import { Modal } from "@/components/shared/Modal";
import { useAnnouncements } from "@/lib/announcements-store";
import type { Announcement } from "@/lib/types";

export function DeleteAnnouncementModal({
  announcement,
  onClose,
}: {
  announcement: Announcement;
  onClose: () => void;
}) {
  const { deleteAnnouncement } = useAnnouncements();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setIsDeleting(true);
    setError(null);
    const result = await deleteAnnouncement(announcement.id);
    setIsDeleting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onClose();
  }

  return (
    <Modal title="Delete Announcement" onClose={onClose}>
      <div className="flex flex-col gap-4">
        <p className="text-sm text-foreground">Delete this announcement?</p>
        <p className="text-sm text-foreground/70">This removes it from the newsroom for everyone.</p>
        {error ? <p className="text-sm text-red-700 dark:text-red-400">{error}</p> : null}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button type="button" variant="danger" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? "Deleting…" : "Delete Announcement"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
