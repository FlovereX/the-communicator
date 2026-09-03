"use client";

import { useState } from "react";
import { Button } from "@/components/shared/Button";
import { DeleteStoryModal } from "@/components/stories/DeleteStoryModal";
import { useCurrentUser } from "@/lib/auth-context";
import type { Story } from "@/lib/types";

export function DangerZoneSection({ story }: { story: Story }) {
  const currentUser = useCurrentUser();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  if (currentUser.role !== "admin") return null;

  return (
    <div className="rounded-xl border border-red-200 bg-red-50/40 p-4 shadow-sm dark:border-red-900/60 dark:bg-red-950/20">
      <p className="text-xs font-semibold uppercase tracking-wide text-red-700 dark:text-red-400">Danger Zone</p>
      <p className="mt-1 text-sm text-foreground/70">
        Permanently delete this story and all of its newsroom data.
      </p>
      <div className="mt-3">
        <Button type="button" variant="danger" onClick={() => setIsDeleteOpen(true)}>
          Delete Story
        </Button>
      </div>
      {isDeleteOpen ? (
        <DeleteStoryModal story={story} onClose={() => setIsDeleteOpen(false)} />
      ) : null}
    </div>
  );
}
