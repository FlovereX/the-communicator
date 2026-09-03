"use client";

import { useState } from "react";
import { Button } from "@/components/shared/Button";
import { PageHeader } from "@/components/shared/PageHeader";
import { PlusIcon } from "@/components/icons";
import { NewPitchModal } from "@/components/pitches/NewPitchModal";
import { PitchCard } from "@/components/pitches/PitchCard";
import { PitchReviewQueue } from "@/components/pitches/PitchReviewQueue";
import { useCurrentUser } from "@/lib/auth-context";
import { usePitches } from "@/lib/pitches-store";

export default function PitchesPage() {
  const currentUser = useCurrentUser();
  const { myPitches, reviewQueue, isLoading, error, clearError } = usePitches();
  const [isNewPitchOpen, setIsNewPitchOpen] = useState(false);
  const isStaff = currentUser.role === "editor" || currentUser.role === "admin";

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Pitches"
        description="Story ideas submitted by the newsroom, awaiting a decision."
        action={
          <Button variant="primary" onClick={() => setIsNewPitchOpen(true)}>
            <PlusIcon className="h-4 w-4" />
            New Pitch
          </Button>
        }
      />
      {error ? (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-400">
          <span>Couldn&apos;t load pitches: {error}</span>
          <button type="button" onClick={clearError} className="font-medium underline">
            Dismiss
          </button>
        </div>
      ) : null}
      {isLoading ? (
        <p className="text-sm text-foreground/50">Loading pitches…</p>
      ) : (
        <>
          {isStaff ? (
            <div className="flex flex-col gap-3">
              <h2 className="font-serif text-lg font-semibold text-foreground">
                Pitch Review Queue
              </h2>
              <PitchReviewQueue pitches={reviewQueue} />
            </div>
          ) : null}
          <div className="flex flex-col gap-3">
            <h2 className="font-serif text-lg font-semibold text-foreground">My Pitches</h2>
            <div className="flex flex-col gap-4">
              {myPitches.map((pitch) => (
                <PitchCard key={pitch.id} pitch={pitch} />
              ))}
              {myPitches.length === 0 ? (
                <p className="text-sm text-foreground/50">
                  You haven&apos;t submitted any pitches yet.
                </p>
              ) : null}
            </div>
          </div>
        </>
      )}
      {isNewPitchOpen ? <NewPitchModal onClose={() => setIsNewPitchOpen(false)} /> : null}
    </div>
  );
}
