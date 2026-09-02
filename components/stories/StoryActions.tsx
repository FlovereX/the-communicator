"use client";

import { useState } from "react";
import { Button } from "@/components/shared/Button";
import { TextArea } from "@/components/shared/FormControls";
import { useStories } from "@/lib/stories-store";
import type { Story } from "@/lib/types";

const WRITER_EDITABLE_STATUSES: Story["status"][] = ["Writing", "Needs Revision"];

export function StoryActions({
  story,
  isEditing,
  onToggleEdit,
  onSaveDraft,
}: {
  story: Story;
  isEditing: boolean;
  onToggleEdit: () => void;
  onSaveDraft: () => void;
}) {
  const {
    startWriting,
    submitForReview,
    resubmit,
    startEditing,
    requestRevision,
    approveStory,
    markPublished,
  } = useStories();
  const [isRequestingRevision, setIsRequestingRevision] = useState(false);
  const [revisionMessage, setRevisionMessage] = useState("");

  const canStartWriting = story.status === "Idea" || story.status === "Assigned";
  const canWrite = WRITER_EDITABLE_STATUSES.includes(story.status);
  const canSubmit = story.status === "Writing";
  const canResubmit = story.status === "Needs Revision";
  const isAwaitingReview = story.status === "Submitted";
  const canStartEditing = story.status === "Submitted";
  const canRequestRevision = story.status === "Editing";
  const canApprove = story.status === "Editing";
  const canMarkPublished = story.status === "Approved";

  const hasWriterActions = canStartWriting || canWrite || canSubmit || canResubmit || isAwaitingReview;
  const hasEditorActions = canStartEditing || canRequestRevision || canApprove || canMarkPublished;

  function handleSendRevision() {
    if (!revisionMessage.trim()) return;
    requestRevision(story.id, revisionMessage.trim());
    setRevisionMessage("");
    setIsRequestingRevision(false);
  }

  if (!hasWriterActions && !hasEditorActions) {
    return (
      <div className="rounded-xl border border-border bg-surface px-5 py-4 text-sm text-foreground/50 shadow-sm">
        No further action is needed on this story right now.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        {hasWriterActions ? (
          <>
            <span className="text-xs font-semibold uppercase tracking-wide text-foreground/40">
              Writer
            </span>
            {isAwaitingReview ? (
              <span className="text-sm text-foreground/60">
                Your story has been submitted and is awaiting review.
              </span>
            ) : null}
            {canStartWriting ? (
              <Button variant="primary" onClick={() => startWriting(story.id)}>
                Start Writing
              </Button>
            ) : null}
            {canWrite ? (
              <Button variant={isEditing ? "primary" : "secondary"} onClick={onToggleEdit}>
                {isEditing ? "Done Editing" : "Edit Story"}
              </Button>
            ) : null}
            {canWrite ? (
              <Button variant="secondary" onClick={onSaveDraft}>
                Save Draft
              </Button>
            ) : null}
            {canSubmit ? (
              <Button variant="primary" onClick={() => submitForReview(story.id)}>
                Submit for Review
              </Button>
            ) : null}
            {canResubmit ? (
              <Button variant="primary" onClick={() => resubmit(story.id)}>
                Resubmit
              </Button>
            ) : null}
          </>
        ) : null}
        {hasEditorActions ? (
          <>
            <span
              className={hasWriterActions ? "ml-2 text-xs font-semibold uppercase tracking-wide text-foreground/40" : "text-xs font-semibold uppercase tracking-wide text-foreground/40"}
            >
              Editor
            </span>
            {canStartEditing ? (
              <Button variant="secondary" onClick={() => startEditing(story.id)}>
                Start Editing
              </Button>
            ) : null}
            {canRequestRevision ? (
              <Button
                variant="secondary"
                onClick={() => setIsRequestingRevision((v) => !v)}
              >
                Request Revision
              </Button>
            ) : null}
            {canApprove ? (
              <Button variant="primary" onClick={() => approveStory(story.id)}>
                Approve Story
              </Button>
            ) : null}
            {canMarkPublished ? (
              <Button variant="primary" onClick={() => markPublished(story.id)}>
                Mark Published
              </Button>
            ) : null}
          </>
        ) : null}
      </div>

      {isRequestingRevision ? (
        <div className="flex flex-col gap-2 rounded-lg border border-border bg-background/60 p-3">
          <TextArea
            rows={3}
            autoFocus
            placeholder="What needs to change before this can be approved?"
            value={revisionMessage}
            onChange={(e) => setRevisionMessage(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setIsRequestingRevision(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleSendRevision} disabled={!revisionMessage.trim()}>
              Send to Writer
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
