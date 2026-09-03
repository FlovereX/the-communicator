"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/shared/Button";
import { Label, TextInput } from "@/components/shared/FormControls";
import { Modal } from "@/components/shared/Modal";
import { useStories } from "@/lib/stories-store";
import type { Story } from "@/lib/types";

export function DeleteStoryModal({ story, onClose }: { story: Story; onClose: () => void }) {
  const router = useRouter();
  const { adminDeleteStory } = useStories();
  const [typedHeadline, setTypedHeadline] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isConfirmed = typedHeadline === story.title;

  async function handleDelete() {
    if (!isConfirmed || isDeleting) return;
    setIsDeleting(true);
    setError(null);
    const result = await adminDeleteStory(story.id);
    if (!result.ok) {
      setIsDeleting(false);
      setError(result.error);
      return;
    }
    const params = new URLSearchParams({ deleted: "1" });
    if (result.storageCleanupWarnings?.length) {
      params.set("storage_warning", "1");
    }
    router.push(`/stories?${params.toString()}`);
  }

  return (
    <Modal title="Delete Story" onClose={onClose}>
      <div className="flex flex-col gap-4">
        <p className="text-sm text-foreground">
          This permanently deletes this story and its newsroom data. This action cannot be undone.
        </p>
        <ul className="list-disc space-y-1 pl-5 text-sm text-foreground/70">
          <li>Drafts / versions</li>
          <li>Editor feedback</li>
          <li>Sources</li>
          <li>Notifications associated with this story</li>
          <li>Uploaded newsroom media</li>
        </ul>
        {story.status === "Published" ? (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            This only removes the newsroom record. It does not delete the published article from
            WordPress.
          </p>
        ) : null}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="delete-story-confirm">
            Type <span className="font-semibold text-foreground">{story.title}</span> to confirm
          </Label>
          <TextInput
            id="delete-story-confirm"
            value={typedHeadline}
            onChange={(e) => setTypedHeadline(e.target.value)}
            disabled={isDeleting}
            autoComplete="off"
          />
        </div>
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={handleDelete}
            disabled={!isConfirmed || isDeleting}
          >
            {isDeleting ? "Deleting…" : "Delete permanently"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
