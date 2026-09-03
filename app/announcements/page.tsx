"use client";

import { useState } from "react";
import { AnnouncementCard } from "@/components/announcements/AnnouncementCard";
import { AnnouncementModal } from "@/components/announcements/AnnouncementModal";
import { DeleteAnnouncementModal } from "@/components/announcements/DeleteAnnouncementModal";
import { PlusIcon } from "@/components/icons";
import { Button } from "@/components/shared/Button";
import { PageHeader } from "@/components/shared/PageHeader";
import { Tabs } from "@/components/shared/Tabs";
import { useAnnouncements } from "@/lib/announcements-store";
import { useCurrentUser } from "@/lib/auth-context";
import type { Announcement } from "@/lib/types";

function AnnouncementList({
  announcements,
  emptyLabel,
  isStaff,
  onEdit,
  onDelete,
}: {
  announcements: Announcement[];
  emptyLabel: string;
  isStaff: boolean;
  onEdit: (announcement: Announcement) => void;
  onDelete: (announcement: Announcement) => void;
}) {
  if (announcements.length === 0) {
    return <p className="text-sm text-foreground/50">{emptyLabel}</p>;
  }
  return (
    <div className="flex flex-col gap-4">
      {announcements.map((announcement) => (
        <AnnouncementCard
          key={announcement.id}
          announcement={announcement}
          onEdit={isStaff ? () => onEdit(announcement) : undefined}
          onDelete={isStaff ? () => onDelete(announcement) : undefined}
        />
      ))}
    </div>
  );
}

export default function AnnouncementsPage() {
  const currentUser = useCurrentUser();
  const isStaff = currentUser.role === "editor" || currentUser.role === "admin";
  const { currentAnnouncements, expiredAnnouncements, isLoading, error, clearError } =
    useAnnouncements();
  const [isCreating, setIsCreating] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [deletingAnnouncement, setDeletingAnnouncement] = useState<Announcement | null>(null);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Announcements"
        description="Newsroom-wide messages for everyone on staff."
        action={
          isStaff ? (
            <Button variant="primary" onClick={() => setIsCreating(true)}>
              <PlusIcon className="h-4 w-4" />
              New Announcement
            </Button>
          ) : undefined
        }
      />
      {error ? (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-400">
          <span>Couldn&apos;t load announcements: {error}</span>
          <button type="button" onClick={clearError} className="font-medium underline">
            Dismiss
          </button>
        </div>
      ) : null}
      {isLoading ? (
        <p className="text-sm text-foreground/50">Loading announcements…</p>
      ) : isStaff ? (
        <Tabs
          tabs={[
            {
              id: "current",
              label: "Current",
              content: (
                <AnnouncementList
                  announcements={currentAnnouncements}
                  emptyLabel="No announcements right now."
                  isStaff={isStaff}
                  onEdit={setEditingAnnouncement}
                  onDelete={setDeletingAnnouncement}
                />
              ),
            },
            {
              id: "expired",
              label: "Expired",
              content: (
                <AnnouncementList
                  announcements={expiredAnnouncements}
                  emptyLabel="No expired announcements."
                  isStaff={isStaff}
                  onEdit={setEditingAnnouncement}
                  onDelete={setDeletingAnnouncement}
                />
              ),
            },
          ]}
        />
      ) : (
        <AnnouncementList
          announcements={currentAnnouncements}
          emptyLabel="No announcements right now."
          isStaff={false}
          onEdit={setEditingAnnouncement}
          onDelete={setDeletingAnnouncement}
        />
      )}
      {isCreating ? <AnnouncementModal onClose={() => setIsCreating(false)} /> : null}
      {editingAnnouncement ? (
        <AnnouncementModal
          announcement={editingAnnouncement}
          onClose={() => setEditingAnnouncement(null)}
        />
      ) : null}
      {deletingAnnouncement ? (
        <DeleteAnnouncementModal
          announcement={deletingAnnouncement}
          onClose={() => setDeletingAnnouncement(null)}
        />
      ) : null}
    </div>
  );
}
