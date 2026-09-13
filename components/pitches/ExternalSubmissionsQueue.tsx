"use client";

import { useState } from "react";
import { Button } from "@/components/shared/Button";
import { usePitches } from "@/lib/pitches-store";
import type { Pitch } from "@/lib/types";

function SubmissionItem({ pitch }: { pitch: Pitch }) {
  const { convertExternalSubmission, dismissExternalSubmission } = usePitches();
  const [isConverting, setIsConverting] = useState(false);
  const [isDismissing, setIsDismissing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConvert() {
    setIsConverting(true);
    setError(null);
    const result = await convertExternalSubmission(pitch.id);
    setIsConverting(false);
    if (!result.ok) {
      setError(result.error);
    }
  }

  async function handleDismiss() {
    setIsDismissing(true);
    setError(null);
    const result = await dismissExternalSubmission(pitch.id);
    setIsDismissing(false);
    if (!result.ok) {
      setError(result.error);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
      <div>
        <p className="font-serif text-base font-semibold text-foreground">{pitch.title}</p>
        <p className="mt-0.5 text-xs text-foreground/50">
          {pitch.section} &middot; Submitted by {pitch.submittedBy}
          {pitch.externalOrganization ? ` (${pitch.externalOrganization})` : ""}
        </p>
        {pitch.externalEmail ? (
          <p className="mt-0.5 text-xs text-foreground/50">Contact: {pitch.externalEmail}</p>
        ) : null}
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
      {error ? <p className="mt-3 text-sm text-red-700 dark:text-red-400">{error}</p> : null}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button variant="primary" onClick={handleConvert} disabled={isConverting || isDismissing}>
          {isConverting ? "Converting…" : "Convert to Pitch"}
        </Button>
        <Button variant="danger" onClick={handleDismiss} disabled={isConverting || isDismissing}>
          {isDismissing ? "Dismissing…" : "Dismiss"}
        </Button>
      </div>
    </div>
  );
}

export function ExternalSubmissionsQueue({ pitches }: { pitches: Pitch[] }) {
  if (pitches.length === 0) {
    return <p className="text-sm text-foreground/50">No new external submissions.</p>;
  }
  return (
    <div className="flex flex-col gap-4">
      {pitches.map((pitch) => (
        <SubmissionItem key={pitch.id} pitch={pitch} />
      ))}
    </div>
  );
}
