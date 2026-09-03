"use client";

import { useState } from "react";
import { Button } from "@/components/shared/Button";
import { TextArea } from "@/components/shared/FormControls";
import { ApprovePitchModal } from "./ApprovePitchModal";
import { usePitches } from "@/lib/pitches-store";
import type { Pitch } from "@/lib/types";

function ReviewItem({ pitch }: { pitch: Pitch }) {
  const { rejectPitch } = usePitches();
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [isSubmittingReject, setIsSubmittingReject] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleReject() {
    if (!feedback.trim()) return;
    setIsSubmittingReject(true);
    setError(null);
    const result = await rejectPitch(pitch.id, feedback.trim());
    setIsSubmittingReject(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setFeedback("");
    setIsRejecting(false);
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
      <div>
        <p className="font-serif text-base font-semibold text-foreground">{pitch.title}</p>
        <p className="mt-0.5 text-xs text-foreground/50">
          {pitch.section} &middot; Pitched by {pitch.submittedBy}
        </p>
      </div>
      <div className="mt-3 flex flex-col gap-2 text-sm text-foreground/70">
        <p>
          <span className="font-medium text-foreground">Summary: </span>
          {pitch.summary}
        </p>
        <p>
          <span className="font-medium text-foreground">Why now: </span>
          {pitch.whyItMatters}
        </p>
        {pitch.possibleSources ? (
          <p>
            <span className="font-medium text-foreground">Possible sources: </span>
            {pitch.possibleSources}
          </p>
        ) : null}
      </div>
      {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button variant="primary" onClick={() => setIsApproving(true)}>
          Approve
        </Button>
        <Button variant="danger" onClick={() => setIsRejecting((v) => !v)}>
          Reject
        </Button>
      </div>
      {isRejecting ? (
        <div className="mt-3 flex flex-col gap-2 rounded-lg border border-border bg-background/60 p-3">
          <TextArea
            rows={3}
            autoFocus
            placeholder="What's missing, or why isn't this a fit right now?"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setIsRejecting(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleReject}
              disabled={!feedback.trim() || isSubmittingReject}
            >
              {isSubmittingReject ? "Sending…" : "Send Rejection"}
            </Button>
          </div>
        </div>
      ) : null}
      {isApproving ? (
        <ApprovePitchModal pitch={pitch} onClose={() => setIsApproving(false)} />
      ) : null}
    </div>
  );
}

export function PitchReviewQueue({ pitches }: { pitches: Pitch[] }) {
  if (pitches.length === 0) {
    return <p className="text-sm text-foreground/50">No pitches awaiting review.</p>;
  }
  return (
    <div className="flex flex-col gap-4">
      {pitches.map((pitch) => (
        <ReviewItem key={pitch.id} pitch={pitch} />
      ))}
    </div>
  );
}
